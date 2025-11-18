import DataLoader from "dataloader";
import { prismaRead } from "./prisma";

/**
 * DataLoader for batch loading users
 */
export const userLoader = new DataLoader(async (userIds: string[]) => {
  const users = await prismaRead.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      subscriptionStatus: true,
    },
  });

  const userMap = new Map(users.map((u) => [u.id, u]));
  return userIds.map((id) => userMap.get(id) || null);
});

/**
 * DataLoader for batch loading tests
 */
export const testLoader = new DataLoader(async (testIds: string[]) => {
  const tests = await prismaRead.test.findMany({
    where: { id: { in: testIds } },
    include: {
      questions: true,
    },
  });

  const testMap = new Map(tests.map((t) => [t.id, t]));
  return testIds.map((id) => testMap.get(id) || null);
});

/**
 * DataLoader for batch loading test attempts
 */
export const testAttemptLoader = new DataLoader(async (attemptIds: string[]) => {
  const attempts = await prismaRead.testAttempt.findMany({
    where: { id: { in: attemptIds } },
    include: {
      test: {
        include: {
          questions: true,
        },
      },
    },
  });

  const attemptMap = new Map(attempts.map((a) => [a.id, a]));
  return attemptIds.map((id) => attemptMap.get(id) || null);
});

/**
 * DataLoader for batch loading study plans
 */
export const studyPlanLoader = new DataLoader(async (planIds: string[]) => {
  const plans = await prismaRead.studyPlan.findMany({
    where: { id: { in: planIds } },
  });

  const planMap = new Map(plans.map((p) => [p.id, p]));
  return planIds.map((id) => planMap.get(id) || null);
});

/**
 * DataLoader for batch loading flashcards
 */
export const flashcardLoader = new DataLoader(async (flashcardIds: string[]) => {
  const flashcards = await prismaRead.flashcard.findMany({
    where: { id: { in: flashcardIds } },
  });

  const flashcardMap = new Map(flashcards.map((f) => [f.id, f]));
  return flashcardIds.map((id) => flashcardMap.get(id) || null);
});

/**
 * Clear all loaders (useful for testing)
 */
export function clearAllLoaders() {
  userLoader.clearAll();
  testLoader.clearAll();
  testAttemptLoader.clearAll();
  studyPlanLoader.clearAll();
  flashcardLoader.clearAll();
}

