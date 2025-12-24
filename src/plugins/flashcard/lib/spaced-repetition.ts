/**
 * Flashcard - Spaced Repetition Algorithm (SM-2)
 * 
 * Implements the SuperMemo 2 algorithm for optimal review scheduling
 */

interface ReviewResult {
    nextReviewDate: Date;
    easeFactor: number;
    interval: number;
    repetitions: number;
}

/**
 * Calculate next review date using SM-2 algorithm
 * 
 * @param quality - Quality of recall (0-5)
 *   5: Perfect response
 *   4: Correct response after hesitation
 *   3: Correct response with difficulty
 *   2: Incorrect response but remembered
 *   1: Incorrect response, barely remembered
 *   0: Complete blackout
 * @param easeFactor - Current ease factor (default: 2.5)
 * @param interval - Current interval in days (default: 0)
 * @param repetitions - Number of consecutive correct responses (default: 0)
 */
export function calculateNextReview(
    quality: number,
    easeFactor: number = 2.5,
    interval: number = 0,
    repetitions: number = 0
): ReviewResult {
    let newEaseFactor = easeFactor;
    let newInterval = interval;
    let newRepetitions = repetitions;

    // Update ease factor
    newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    // Minimum ease factor is 1.3
    if (newEaseFactor < 1.3) {
        newEaseFactor = 1.3;
    }

    // Calculate new interval
    if (quality < 3) {
        // Incorrect response - restart
        newRepetitions = 0;
        newInterval = 1;
    } else {
        // Correct response
        if (repetitions === 0) {
            newInterval = 1;
        } else if (repetitions === 1) {
            newInterval = 6;
        } else {
            newInterval = Math.round(interval * newEaseFactor);
        }
        newRepetitions = repetitions + 1;
    }

    // Calculate next review date
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    return {
        nextReviewDate,
        easeFactor: newEaseFactor,
        interval: newInterval,
        repetitions: newRepetitions,
    };
}

/**
 * Determine if a flashcard is due for review
 */
export function isDue(nextReviewDate: Date): boolean {
    return new Date() >= nextReviewDate;
}

/**
 * Get cards due for review
 */
export function filterDueCards<T extends { nextReviewDate: Date }>(
    cards: T[]
): T[] {
    return cards.filter((card) => isDue(card.nextReviewDate));
}
