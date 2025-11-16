import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { callAI } from "@/lib/ai-orchestrator";
import { getSubscriptionLimits } from "@/lib/subscription-limits";
import { z } from "zod";

const analyzeSchema = z.object({
  exam: z.string().min(1),
  year: z.number().int().min(2000).max(new Date().getFullYear()),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { exam, year } = analyzeSchema.parse(body);

    // Get user subscription
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionStatus: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const limits = getSubscriptionLimits(user.subscriptionStatus);

    // Check if PYQ analysis is allowed
    if (!limits.pyqAnalysisAccess) {
      return NextResponse.json(
        { error: "PYQ analysis is only available in Pro and Topper plans. Please upgrade." },
        { status: 403 }
      );
    }

    // Get previous year questions for this exam and year
    const pyqs = await prisma.previousYearQuestion.findMany({
      where: {
        exam,
        year,
      },
    });

    if (pyqs.length === 0) {
      return NextResponse.json(
        { error: `No previous year questions found for ${exam} ${year}` },
        { status: 404 }
      );
    }

    // Get user's attempts on these questions
    const questionIds = pyqs.map((q) => q.id);
    const attempts = await prisma.questionAttempt.findMany({
      where: {
        userId: session.user.id,
        questionId: { in: questionIds },
      },
    });

    // Calculate topic breakdown
    const topicBreakdown: Record<string, { correct: number; total: number }> = {};
    const difficultyBreakdown: Record<string, { correct: number; total: number }> = {};

    attempts.forEach((attempt) => {
      const question = pyqs.find((q) => q.id === attempt.questionId);
      if (!question) return;

      const topic = question.topic || "Unknown";
      const difficulty = question.difficulty;

      if (!topicBreakdown[topic]) {
        topicBreakdown[topic] = { correct: 0, total: 0 };
      }
      topicBreakdown[topic].total++;
      if (attempt.isCorrect) {
        topicBreakdown[topic].correct++;
      }

      if (!difficultyBreakdown[difficulty]) {
        difficultyBreakdown[difficulty] = { correct: 0, total: 0 };
      }
      difficultyBreakdown[difficulty].total++;
      if (attempt.isCorrect) {
        difficultyBreakdown[difficulty].correct++;
      }
    });

    // Identify weak and strong areas
    const weakAreas: string[] = [];
    const strongAreas: string[] = [];

    Object.entries(topicBreakdown).forEach(([topic, stats]) => {
      const accuracy = (stats.correct / stats.total) * 100;
      if (accuracy < 50) {
        weakAreas.push(topic);
      } else if (accuracy >= 80) {
        strongAreas.push(topic);
      }
    });

    // Generate AI recommendations
    const recommendationsPrompt = `Based on the following PYQ analysis for ${exam} ${year}:

Topic Performance:
${Object.entries(topicBreakdown).map(([topic, stats]) => 
  `- ${topic}: ${stats.correct}/${stats.total} (${((stats.correct / stats.total) * 100).toFixed(1)}%)`
).join("\n")}

Weak Areas: ${weakAreas.join(", ") || "None"}
Strong Areas: ${strongAreas.join(", ") || "None"}

Provide personalized recommendations for improvement, focusing on weak areas and how to maintain strength in strong areas. Keep it concise and actionable.`;

    const aiResult = await callAI({
      featureCode: "DOUBT_CHAT",
      prompt: recommendationsPrompt,
      temperature: 0.7,
    });

    const recommendations = aiResult.success ? aiResult.content : null;

    // Save or update analysis
    const analysis = await prisma.pyqAnalysis.upsert({
      where: {
        userId_exam_year: {
          userId: session.user.id,
          exam,
          year,
        },
      },
      create: {
        userId: session.user.id,
        exam,
        year,
        topicBreakdown,
        difficultyBreakdown,
        weakAreas,
        strongAreas,
        recommendations: recommendations ? { text: recommendations } : null,
      },
      update: {
        topicBreakdown,
        difficultyBreakdown,
        weakAreas,
        strongAreas,
        recommendations: recommendations ? { text: recommendations } : null,
      },
    });

    return NextResponse.json({
      success: true,
      analysis: {
        exam: analysis.exam,
        year: analysis.year,
        topicBreakdown,
        difficultyBreakdown,
        weakAreas,
        strongAreas,
        recommendations: recommendations,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error analyzing PYQ:", error);
    return NextResponse.json(
      { error: "Failed to analyze PYQ" },
      { status: 500 }
    );
  }
}

