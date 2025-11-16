/**
 * Spaced Repetition Algorithm (SM-2 inspired)
 * Calculates next review date based on performance
 */

export interface FlashcardReviewResult {
  nextReview: Date;
  difficulty: number; // 0-5
  reviewCount: number;
  correctCount: number;
}

export function calculateNextReview(
  currentDifficulty: number,
  currentReviewCount: number,
  currentCorrectCount: number,
  result: "correct" | "incorrect" | "hard"
): FlashcardReviewResult {
  let newDifficulty = currentDifficulty;
  let newReviewCount = currentReviewCount + 1;
  let newCorrectCount = currentCorrectCount;

  // Update based on result
  if (result === "correct") {
    newCorrectCount += 1;
    // Increase difficulty (easier to remember)
    newDifficulty = Math.min(5, newDifficulty + 1);
  } else if (result === "incorrect") {
    // Decrease difficulty (harder to remember)
    newDifficulty = Math.max(0, newDifficulty - 2);
  } else if (result === "hard") {
    // Slight decrease
    newDifficulty = Math.max(0, newDifficulty - 1);
  }

  // Calculate interval in days based on difficulty
  // Higher difficulty = longer interval
  const intervals = [1, 2, 4, 7, 14, 30]; // Days for difficulty 0-5
  const intervalDays = intervals[Math.min(newDifficulty, intervals.length - 1)];

  // Adjust based on review count (more reviews = longer intervals)
  const adjustedInterval = intervalDays * Math.pow(1.5, Math.floor(newReviewCount / 5));

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + Math.floor(adjustedInterval));

  return {
    nextReview,
    difficulty: newDifficulty,
    reviewCount: newReviewCount,
    correctCount: newCorrectCount,
  };
}

export function getDueCardsCount(
  totalCards: number,
  difficultyDistribution: Record<number, number>
): number {
  // Estimate how many cards are due for review
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // This is a simplified calculation
  // In production, query database for cards where nextReview <= today
  return Math.floor(totalCards * 0.2); // Estimate 20% are due
}

