import { prisma } from "@/lib/prisma";

export interface SubscriptionLimits {
  aiStudyPlansPerMonth: number;
  mockTestsPerMonth: number;
  aiDoubtsPerMonth: number;
  aiDoubtsPerDay?: number;
  notesPerMonth?: number;
  flashcardsPerMonth?: number;
  pyqAnalysisAccess: boolean;
  fullLengthTests: boolean;
  sectionWiseTests: boolean;
  imageDoubtSolving: boolean;
  longNotes: boolean;
  videoExplainers: boolean;
  multipleExams: boolean;
  priorityAI: boolean;
}

const PLAN_LIMITS: Record<string, SubscriptionLimits> = {
  free: {
    aiStudyPlansPerMonth: 1,
    mockTestsPerMonth: 2, // 1 every 15 days
    aiDoubtsPerMonth: 5,
    pyqAnalysisAccess: false,
    fullLengthTests: false,
    sectionWiseTests: false,
    imageDoubtSolving: false,
    longNotes: false,
    videoExplainers: false,
    multipleExams: false,
    priorityAI: false,
  },
  pro: {
    aiStudyPlansPerMonth: -1, // unlimited
    mockTestsPerMonth: -1, // unlimited
    aiDoubtsPerMonth: -1, // unlimited
    aiDoubtsPerDay: 100,
    notesPerMonth: -1,
    flashcardsPerMonth: -1,
    pyqAnalysisAccess: true,
    fullLengthTests: true,
    sectionWiseTests: true,
    imageDoubtSolving: true,
    longNotes: false,
    videoExplainers: false,
    multipleExams: false,
    priorityAI: true,
  },
  topper: {
    aiStudyPlansPerMonth: -1,
    mockTestsPerMonth: -1,
    aiDoubtsPerMonth: -1,
    aiDoubtsPerDay: -1, // unlimited
    notesPerMonth: -1,
    flashcardsPerMonth: -1,
    pyqAnalysisAccess: true,
    fullLengthTests: true,
    sectionWiseTests: true,
    imageDoubtSolving: true,
    longNotes: true,
    videoExplainers: true,
    multipleExams: true,
    priorityAI: true,
  },
};

export function getSubscriptionLimits(plan: string): SubscriptionLimits {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

export async function checkUsageLimit(
  userId: string,
  feature: "aiStudyPlans" | "mockTests" | "aiDoubts" | "notes" | "flashcards",
  subscriptionStatus: string
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const limits = getSubscriptionLimits(subscriptionStatus);
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  // Get or create usage record
  let usage = await prisma.subscriptionUsage.findUnique({
    where: {
      userId_month_year: {
        userId,
        month,
        year,
      },
    },
  });

  if (!usage) {
    usage = await prisma.subscriptionUsage.create({
      data: {
        userId,
        month,
        year,
      },
    });
  }

  // Get current count
  let currentCount = 0;
  let limit = 0;

  switch (feature) {
    case "aiStudyPlans":
      currentCount = usage.studyPlansCount;
      limit = limits.aiStudyPlansPerMonth;
      break;
    case "mockTests":
      currentCount = usage.mockTestsCount;
      limit = limits.mockTestsPerMonth;
      break;
    case "aiDoubts":
      currentCount = usage.doubtsCount;
      limit = limits.aiDoubtsPerMonth;
      break;
    case "notes":
      currentCount = usage.notesGenerated;
      limit = limits.notesPerMonth || 0;
      break;
    case "flashcards":
      currentCount = usage.flashcardsGenerated;
      limit = limits.flashcardsPerMonth || 0;
      break;
  }

  // -1 means unlimited
  if (limit === -1) {
    return { allowed: true, remaining: -1, limit: -1 };
  }

  const remaining = Math.max(0, limit - currentCount);
  return {
    allowed: currentCount < limit,
    remaining,
    limit,
  };
}

export async function incrementUsage(
  userId: string,
  feature: "aiStudyPlans" | "mockTests" | "aiDoubts" | "notes" | "flashcards"
): Promise<void> {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const updateData: any = {};
  switch (feature) {
    case "aiStudyPlans":
      updateData.studyPlansCount = { increment: 1 };
      break;
    case "mockTests":
      updateData.mockTestsCount = { increment: 1 };
      break;
    case "aiDoubts":
      updateData.doubtsCount = { increment: 1 };
      break;
    case "notes":
      updateData.notesGenerated = { increment: 1 };
      break;
    case "flashcards":
      updateData.flashcardsGenerated = { increment: 1 };
      break;
  }

  await prisma.subscriptionUsage.upsert({
    where: {
      userId_month_year: {
        userId,
        month,
        year,
      },
    },
    create: {
      userId,
      month,
      year,
      ...updateData,
    },
    update: updateData,
  });
}

export async function checkDailyDoubtLimit(
  userId: string,
  subscriptionStatus: string
): Promise<{ allowed: boolean; remaining: number }> {
  const limits = getSubscriptionLimits(subscriptionStatus);
  
  if (!limits.aiDoubtsPerDay || limits.aiDoubtsPerDay === -1) {
    return { allowed: true, remaining: -1 };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Count doubts today
  const doubtsToday = await prisma.subscriptionUsage.findFirst({
    where: {
      userId,
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  const count = doubtsToday?.doubtsCount || 0;
  const remaining = Math.max(0, limits.aiDoubtsPerDay - count);

  return {
    allowed: count < limits.aiDoubtsPerDay,
    remaining,
  };
}

