import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { universalSearch } from "@/lib/search";
import { z } from "zod";

const searchSchema = z.object({
  query: z.string().min(1).max(200),
  type: z.enum(["question", "test", "study_plan", "all"]).optional(),
  exam: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query");
    const type = searchParams.get("type") as any;
    const exam = searchParams.get("exam") || undefined;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : undefined;

    const validated = searchSchema.parse({
      query,
      type,
      exam,
      limit,
    });

    const results = await universalSearch({
      query: validated.query,
      type: validated.type,
      exam: validated.exam,
      limit: validated.limit,
    });

    return NextResponse.json({
      results,
      query: validated.query,
      total: results.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid search parameters", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    );
  }
}

