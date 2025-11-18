import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prismaRead, prisma } from "@/lib/prisma";
import { cache, CacheKeys } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const exam = searchParams.get("exam");
    const topic = searchParams.get("topic");
    const difficulty = searchParams.get("difficulty");
    const subject = searchParams.get("subject");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (exam) where.exam = exam;
    if (topic) where.topic = topic;
    if (difficulty) where.difficulty = difficulty;
    if (subject) where.subject = subject;
    if (search) {
      where.OR = [
        { question: { contains: search, mode: "insensitive" } },
        { topic: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
      ];
    }

    // Generate cache key
    const cacheKey = cache.generateKey("question-bank", {
      exam: exam || "",
      topic: topic || "",
      difficulty: difficulty || "",
      subject: subject || "",
      search: search || "",
      page,
      limit,
    });

    // Try cache first
    const cached = await cache.get<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Use read replica for queries
    const [questions, total] = await Promise.all([
      prismaRead.questionBank.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          exam: true,
          subject: true,
          topic: true,
          question: true,
          options: true,
          correctOption: true,
          explanation: true,
          difficulty: true,
          source: true,
          year: true,
          tags: true,
          usageCount: true,
          createdAt: true,
        },
      }),
      prismaRead.questionBank.count({ where }),
    ]);

    // Get available filters (cache these separately as they change less frequently)
    const filtersCacheKey = `question-bank-filters:${exam || "all"}`;
    const cachedFilters = await cache.get<any>(filtersCacheKey);
    
    let exams, topics, subjects, difficulties;
    if (cachedFilters) {
      ({ exams, topics, subjects, difficulties } = cachedFilters);
    } else {
      [exams, topics, subjects, difficulties] = await Promise.all([
        prismaRead.questionBank.findMany({
          select: { exam: true },
          distinct: ["exam"],
        }),
        prismaRead.questionBank.findMany({
          where: exam ? { exam } : undefined,
          select: { topic: true },
          distinct: ["topic"],
        }),
        prismaRead.questionBank.findMany({
          where: exam ? { exam } : undefined,
          select: { subject: true },
          distinct: ["subject"],
        }),
        prismaRead.questionBank.findMany({
          select: { difficulty: true },
          distinct: ["difficulty"],
        }),
      ]);
      
      // Cache filters for 1 hour
      await cache.set(
        filtersCacheKey,
        { exams, topics, subjects, difficulties },
        3600
      );
    }

    const response = {
      questions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        exams: exams.map((e: any) => e.exam).filter(Boolean),
        topics: topics.map((t: any) => t.topic).filter(Boolean),
        subjects: subjects.map((s: any) => s.subject).filter(Boolean),
        difficulties: difficulties.map((d: any) => d.difficulty).filter(Boolean),
      },
    };

    // Cache response for 5 minutes
    await cache.set(cacheKey, response, 300);

    return NextResponse.json({
      questions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        exams: exams.map((e) => e.exam).filter(Boolean),
        topics: topics.map((t) => t.topic).filter(Boolean),
        subjects: subjects.map((s) => s.subject).filter(Boolean),
        difficulties: difficulties.map((d) => d.difficulty).filter(Boolean),
      },
    });
  } catch (error) {
    console.error("Error fetching question bank:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

