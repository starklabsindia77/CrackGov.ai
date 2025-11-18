/**
 * Enhanced search functionality
 * Full-text search utilities
 */

import { prismaRead } from "./prisma";

export interface SearchOptions {
  query: string;
  type?: "question" | "test" | "study_plan" | "all";
  exam?: string;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  type: string;
  id: string;
  title: string;
  excerpt: string;
  relevance: number;
  metadata?: Record<string, any>;
}

/**
 * Search questions
 */
export async function searchQuestions(
  query: string,
  exam?: string,
  limit: number = 20
): Promise<SearchResult[]> {
  const where: any = {
    OR: [
      { question: { contains: query, mode: "insensitive" } },
      { topic: { contains: query, mode: "insensitive" } },
      { subject: { contains: query, mode: "insensitive" } },
      { explanation: { contains: query, mode: "insensitive" } },
    ],
  };

  if (exam) {
    where.exam = exam;
  }

  const questions = await prismaRead.questionBank.findMany({
    where,
    take: limit,
    orderBy: { usageCount: "desc" },
  });

  return questions.map((q) => ({
    type: "question",
    id: q.id,
    title: q.question.substring(0, 100),
    excerpt: q.explanation || q.question.substring(0, 200),
    relevance: 1,
    metadata: {
      exam: q.exam,
      topic: q.topic,
      difficulty: q.difficulty,
    },
  }));
}

/**
 * Search tests
 */
export async function searchTests(
  query: string,
  userId: string,
  limit: number = 20
): Promise<SearchResult[]> {
  const tests = await prismaRead.test.findMany({
    where: {
      userId,
      OR: [
        { exam: { contains: query, mode: "insensitive" } },
        { title: { contains: query, mode: "insensitive" } },
      ],
    },
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  return tests.map((t) => ({
    type: "test",
    id: t.id,
    title: t.title || t.exam,
    excerpt: `Exam: ${t.exam}`,
    relevance: 1,
    metadata: {
      exam: t.exam,
      createdAt: t.createdAt,
    },
  }));
}

/**
 * Universal search
 */
export async function universalSearch(
  options: SearchOptions
): Promise<SearchResult[]> {
  const { query, type = "all", exam, limit = 20 } = options;

  const results: SearchResult[] = [];

  if (type === "all" || type === "question") {
    const questions = await searchQuestions(query, exam, limit);
    results.push(...questions);
  }

  // Add more search types as needed
  // if (type === "all" || type === "test") {
  //   const tests = await searchTests(query, userId, limit);
  //   results.push(...tests);
  // }

  // Sort by relevance
  return results.sort((a, b) => b.relevance - a.relevance).slice(0, limit);
}

/**
 * Highlight search terms in text
 */
export function highlightSearchTerms(text: string, query: string): string {
  const regex = new RegExp(`(${query})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}

