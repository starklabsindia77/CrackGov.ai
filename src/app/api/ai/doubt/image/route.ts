import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { callAI } from "@/lib/ai-orchestrator";
import { aiRateLimiter } from "@/lib/rate-limit-redis";
import { checkDailyDoubtLimit, incrementUsage, getSubscriptionLimits } from "@/lib/subscription-limits";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await aiRateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const image = formData.get("image") as File;
    const questionText = formData.get("questionText") as string;
    const exam = formData.get("exam") as string;

    if (!image || !exam) {
      return NextResponse.json(
        { error: "Image and exam are required" },
        { status: 400 }
      );
    }

    // Get user subscription
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionStatus: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const limits = getSubscriptionLimits(user.subscriptionStatus);

    // Check if image-based doubt solving is allowed
    if (!limits.imageDoubtSolving) {
      return NextResponse.json(
        { error: "Image-based doubt solving is only available in Pro and Topper plans. Please upgrade." },
        { status: 403 }
      );
    }

    // Check daily doubt limit
    const dailyLimit = await checkDailyDoubtLimit(session.user.id, user.subscriptionStatus);
    if (!dailyLimit.allowed) {
      return NextResponse.json(
        { 
          error: "Daily doubt limit reached",
          remaining: dailyLimit.remaining,
        },
        { status: 403 }
      );
    }

    // Convert image to base64
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");
    const mimeType = image.type;

    // Generate prompt
    const prompt = questionText 
      ? `The student has asked: "${questionText}"\n\nPlease analyze the attached image and provide a step-by-step solution.`
      : "Please analyze the attached image and provide a detailed explanation with step-by-step solution.";

    // Call AI with image (using vision-capable model)
    const result = await callAI({
      featureCode: "DOUBT_CHAT",
      prompt,
      messages: [
        {
          role: "system",
          content: "You are an expert tutor. Analyze images of questions/problems and provide clear, step-by-step solutions. Explain concepts thoroughly and help students understand the methodology.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      temperature: 0.7,
      maxTokens: 2000,
    });

    if (!result.success || !result.content) {
      throw new Error(result.error || "Failed to get answer");
    }

    // Increment usage
    await incrementUsage(session.user.id, "aiDoubts");

    return NextResponse.json({
      success: true,
      answer: result.content,
      usage: {
        remaining: dailyLimit.remaining - 1,
      },
    });
  } catch (error) {
    console.error("Error solving image-based doubt:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to solve doubt" },
      { status: 500 }
    );
  }
}

