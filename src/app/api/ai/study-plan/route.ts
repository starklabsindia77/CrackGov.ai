import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { callAI } from "@/lib/ai-orchestrator";
import { z } from "zod";

const studyPlanSchema = z.object({
  exam: z.string().min(1),
  targetDate: z.string(),
  hoursPerDay: z.number().min(1).max(12),
  weakTopics: z.array(z.string()),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { exam, targetDate, hoursPerDay, weakTopics } =
      studyPlanSchema.parse(body);

    const weakTopicsText =
      weakTopics.length > 0
        ? `Focus especially on these weak areas: ${weakTopics.join(", ")}.`
        : "";

    const prompt = `You are an expert exam preparation coach. Create a detailed, day-by-day study plan for ${exam} exam preparation.

Target exam date: ${targetDate}
Available hours per day: ${hoursPerDay}
${weakTopicsText}

Generate a structured study plan that:
1. Covers all important topics for ${exam}
2. Allocates time based on difficulty and importance
3. Includes daily tasks and practice exercises
4. Progresses from basics to advanced topics
5. Includes revision days

Return the response as a valid JSON object with this exact structure:
{
  "weeks": [
    {
      "week": 1,
      "days": [
        {
          "day": 1,
          "week": 1,
          "topics": ["topic1", "topic2"],
          "tasks": ["task1", "task2"],
          "hours": ${hoursPerDay}
        }
      ]
    }
  ]
}

Generate a plan for at least 4-8 weeks depending on the exam difficulty. Make it practical and achievable.`;

    const result = await callAI({
      featureCode: "STUDY_PLAN",
      messages: [
        {
          role: "system",
          content:
            "You are an expert exam preparation coach. Return a valid JSON object with a 'weeks' array. Each week should have a 'days' array with day objects containing: day, week, topics (array), tasks (array), and hours.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      responseFormat: { type: "json_object" },
    });

    if (!result.success || !result.content) {
      throw new Error(result.error || "Failed to generate study plan");
    }

    const parsed = JSON.parse(result.content);
    const plan = parsed.weeks ? parsed : { weeks: parsed };

    return NextResponse.json({ plan });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Study plan generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate study plan" },
      { status: 500 }
    );
  }
}

