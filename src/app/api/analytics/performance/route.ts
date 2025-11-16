import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "30");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all test attempts
    const attempts = await prisma.testAttempt.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: startDate },
      },
      include: {
        test: {
          select: {
            exam: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate overall statistics
    const totalTests = attempts.length;
    const totalQuestions = attempts.reduce((sum, a) => sum + a.total, 0);
    const totalCorrect = attempts.reduce((sum, a) => sum + a.score, 0);
    const avgAccuracy = totalTests > 0 
      ? attempts.reduce((sum, a) => sum + a.accuracy, 0) / totalTests 
      : 0;

    // Topic-wise breakdown
    const topicStats: Record<string, { correct: number; total: number; attempts: number }> = {};
    attempts.forEach((attempt) => {
      const details = attempt.details as any;
      if (details?.topicBreakdown) {
        Object.entries(details.topicBreakdown).forEach(([topic, stats]: [string, any]) => {
          if (!topicStats[topic]) {
            topicStats[topic] = { correct: 0, total: 0, attempts: 0 };
          }
          topicStats[topic].correct += stats.correct || 0;
          topicStats[topic].total += stats.total || 0;
          topicStats[topic].attempts += 1;
        });
      }
    });

    // Exam-wise breakdown
    const examStats: Record<string, { tests: number; avgAccuracy: number; totalQuestions: number }> = {};
    attempts.forEach((attempt) => {
      const exam = attempt.test.exam;
      if (!examStats[exam]) {
        examStats[exam] = { tests: 0, avgAccuracy: 0, totalQuestions: 0 };
      }
      examStats[exam].tests += 1;
      examStats[exam].totalQuestions += attempt.total;
      examStats[exam].avgAccuracy = 
        (examStats[exam].avgAccuracy * (examStats[exam].tests - 1) + attempt.accuracy) / examStats[exam].tests;
    });

    // Performance trend (last 7 days)
    const trendData: Array<{ date: string; accuracy: number; tests: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayAttempts = attempts.filter(
        (a) => a.createdAt >= date && a.createdAt < nextDate
      );

      const dayAccuracy = dayAttempts.length > 0
        ? dayAttempts.reduce((sum, a) => sum + a.accuracy, 0) / dayAttempts.length
        : 0;

      trendData.push({
        date: date.toISOString().split("T")[0],
        accuracy: dayAccuracy,
        tests: dayAttempts.length,
      });
    }

    // Weak topics (accuracy < 50%)
    const weakTopics = Object.entries(topicStats)
      .filter(([_, stats]) => (stats.correct / stats.total) * 100 < 50)
      .map(([topic, stats]) => ({
        topic,
        accuracy: (stats.correct / stats.total) * 100,
        attempts: stats.attempts,
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5);

    // Strong topics (accuracy > 80%)
    const strongTopics = Object.entries(topicStats)
      .filter(([_, stats]) => (stats.correct / stats.total) * 100 > 80)
      .map(([topic, stats]) => ({
        topic,
        accuracy: (stats.correct / stats.total) * 100,
        attempts: stats.attempts,
      }))
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 5);

    // Improvement calculation (comparing first half vs second half)
    const sortedAttempts = [...attempts].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
    const midPoint = Math.floor(sortedAttempts.length / 2);
    const firstHalf = sortedAttempts.slice(0, midPoint);
    const secondHalf = sortedAttempts.slice(midPoint);

    const firstHalfAvg = firstHalf.length > 0
      ? firstHalf.reduce((sum, a) => sum + a.accuracy, 0) / firstHalf.length
      : 0;
    const secondHalfAvg = secondHalf.length > 0
      ? secondHalf.reduce((sum, a) => sum + a.accuracy, 0) / secondHalf.length
      : 0;

    const improvement = secondHalfAvg - firstHalfAvg;

    return NextResponse.json({
      overview: {
        totalTests,
        totalQuestions,
        totalCorrect,
        avgAccuracy,
        improvement,
      },
      topicBreakdown: Object.entries(topicStats).map(([topic, stats]) => ({
        topic,
        accuracy: (stats.correct / stats.total) * 100,
        correct: stats.correct,
        total: stats.total,
        attempts: stats.attempts,
      })),
      examBreakdown: Object.entries(examStats).map(([exam, stats]) => ({
        exam,
        tests: stats.tests,
        avgAccuracy: stats.avgAccuracy,
        totalQuestions: stats.totalQuestions,
      })),
      trends: trendData,
      weakTopics,
      strongTopics,
    });
  } catch (error) {
    console.error("Error fetching performance analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

