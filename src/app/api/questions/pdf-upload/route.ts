import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { callAI } from "@/lib/ai-orchestrator";
import { z } from "zod";
import { aiRateLimiter } from "@/lib/rate-limit-redis";

// This is a simplified version - in production, you'd use a proper PDF parsing library
// like pdf-parse or pdfjs-dist

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
    const file = formData.get("file") as File;
    const exam = formData.get("exam") as string;
    const subject = formData.get("subject") as string | null;

    if (!file || !exam) {
      return NextResponse.json(
        { error: "File and exam are required" },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.name.endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    // Read file as text (simplified - in production use proper PDF parser)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // For now, we'll use AI to extract questions from PDF text
    // In production, use pdf-parse or similar to extract text first
    const pdfText = buffer.toString("utf-8").substring(0, 10000); // Limit for demo

    // Use AI to extract questions from PDF
    const extractionPrompt = `Extract all multiple-choice questions from the following PDF text content. 
    
For each question, identify:
- The question text
- All options (A, B, C, D, etc.)
- The correct answer
- The topic/subject if mentioned
- Any explanation or solution if provided

PDF Content:
${pdfText}

Return the questions as a JSON array with this structure:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctOption": "Option A",
    "explanation": "Explanation if available",
    "topic": "Topic name if available"
  }
]`;

    const result = await callAI({
      featureCode: "MOCK_TEST",
      prompt: extractionPrompt,
      temperature: 0.3,
      maxTokens: 4000,
      responseFormat: { type: "json_object" },
    });

    if (!result.success || !result.content) {
      throw new Error(result.error || "Failed to extract questions");
    }

    // Parse extracted questions
    const parsed = JSON.parse(result.content);
    const questions = parsed.questions || parsed.data || [];

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: "No questions found in PDF. Please ensure the PDF contains multiple-choice questions." },
        { status: 400 }
      );
    }

    // Save questions to question bank
    const savedQuestions = await Promise.all(
      questions.map((q: any) =>
        prisma.questionBank.create({
          data: {
            exam,
            subject: subject || q.topic || null,
            topic: q.topic || null,
            question: q.question,
            options: q.options,
            correctOption: q.correctOption,
            explanation: q.explanation || null,
            difficulty: "medium",
            source: "pdf_upload",
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: `Successfully extracted and saved ${savedQuestions.length} questions`,
      questions: savedQuestions.map((q) => ({
        id: q.id,
        question: q.question,
        topic: q.topic,
      })),
    });
  } catch (error) {
    console.error("Error processing PDF upload:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process PDF" },
      { status: 500 }
    );
  }
}

