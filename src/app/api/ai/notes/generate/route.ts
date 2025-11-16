import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { callAI } from "@/lib/ai-orchestrator";
import { aiRateLimiter } from "@/lib/rate-limit";
import { checkUsageLimit, incrementUsage, getSubscriptionLimits } from "@/lib/subscription-limits";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const notesSchema = z.object({
  topic: z.string().min(1),
  exam: z.string().min(1),
  type: z.enum(["short", "long"]).default("short"),
  includeFormulas: z.boolean().default(false),
  includeExamples: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await aiRateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { topic, exam, type, includeFormulas, includeExamples } = notesSchema.parse(body);

    // Get user subscription
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionStatus: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const limits = getSubscriptionLimits(user.subscriptionStatus);

    // Check if long notes are allowed (only for Topper plan)
    if (type === "long" && !limits.longNotes) {
      return NextResponse.json(
        { error: "Long notes are only available in Topper plan. Please upgrade." },
        { status: 403 }
      );
    }

    // Check usage limits
    const usageCheck = await checkUsageLimit(session.user.id, "notes", user.subscriptionStatus);
    if (!usageCheck.allowed) {
      return NextResponse.json(
        { 
          error: "Monthly notes limit reached",
          limit: usageCheck.limit,
          remaining: usageCheck.remaining,
        },
        { status: 403 }
      );
    }

    // Generate notes
    const prompt = `Generate ${type === "long" ? "comprehensive long-form" : "concise short"} study notes for the topic "${topic}" relevant to ${exam} exam preparation.

Requirements:
- ${type === "long" ? "Detailed explanation with multiple sections, examples, and practice questions" : "Concise summary with key points"}
- ${includeFormulas ? "Include all relevant formulas and equations" : "Focus on conceptual understanding"}
- ${includeExamples ? "Include practical examples and solved problems" : "Focus on theory"}
- Use clear headings and bullet points
- Make it exam-focused and aligned with ${exam} syllabus
- Include important tips and tricks for exam preparation

Format the notes in Markdown.`;

    const result = await callAI({
      featureCode: "NOTES_GENERATOR",
      prompt,
      temperature: 0.7,
      maxTokens: type === "long" ? 4000 : 2000,
    });

    if (!result.success || !result.content) {
      throw new Error(result.error || "Failed to generate notes");
    }

    // Increment usage
    await incrementUsage(session.user.id, "notes");

    // Save notes to database
    const note = await prisma.note.create({
      data: {
        userId: session.user.id,
        type: "general",
        title: `${topic} - ${exam} Notes`,
        content: result.content,
        tags: [topic, exam, type],
      },
    });

    return NextResponse.json({
      success: true,
      notes: result.content,
      noteId: note.id,
      type,
      usage: {
        remaining: usageCheck.remaining - 1,
        limit: usageCheck.limit,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error generating notes:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate notes" },
      { status: 500 }
    );
  }
}

