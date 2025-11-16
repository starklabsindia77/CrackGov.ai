import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { callAI } from "@/lib/ai-orchestrator";
import { z } from "zod";

const doubtSchema = z.object({
  questionText: z.string().min(1),
  exam: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { questionText, exam } = doubtSchema.parse(body);

    const prompt = `You are an expert tutor helping a student prepare for ${exam} exam. 

The student has asked: "${questionText}"

Provide a clear, step-by-step explanation that:
1. Directly answers the question
2. Is relevant to ${exam} exam preparation
3. Uses simple language and examples
4. Includes key concepts and formulas if applicable
5. Helps the student understand the concept deeply

Keep the answer concise but comprehensive (2-4 paragraphs).`;

    const result = await callAI({
      featureCode: "DOUBT_CHAT",
      messages: [
        {
          role: "system",
          content:
            "You are a patient and knowledgeable exam preparation tutor. Provide clear, step-by-step explanations that help students understand concepts deeply.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    if (!result.success || !result.content) {
      throw new Error(result.error || "Failed to get answer");
    }

    const answer = result.content;

    return NextResponse.json({ answer });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Doubt answering error:", error);
    return NextResponse.json(
      { error: "Failed to get answer" },
      { status: 500 }
    );
  }
}

