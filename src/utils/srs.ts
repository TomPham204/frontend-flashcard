import { Flashcard, Difficulty } from '@/data/starterDeck';

export interface SRSUpdates {
    difficulty: Difficulty;
    due_date: string | null;
    interval_days: number;
    ease_factor: number;
    review_count: number;
    lapse_count: number;
}

/**
 * Calculates the next state of a flashcard based on the Simplified SM-2 algorithm.
 */
export const calculateReviewState = (card: Flashcard, rating: Difficulty): SRSUpdates => {
    const now = new Date();

    // Defensive defaults for missing/old data
    const currentIntervalDays = card.interval_days ?? 0;
    const currentEaseFactor = card.ease_factor ?? 2.5;
    const currentReviewCount = card.review_count ?? 0;
    const currentLapseCount = card.lapse_count ?? 0;

    let newIntervalDays = currentIntervalDays;
    let newEaseFactor = currentEaseFactor;
    let newLapseCount = currentLapseCount;

    // Initial Review
    if (currentReviewCount === 0) {
        if (rating === 'Again') {
            newIntervalDays = 0;
        } else if (rating === 'Hard') {
            newIntervalDays = 1;
        } else if (rating === 'Good') {
            newIntervalDays = 3;
        } else if (rating === 'Easy') {
            newIntervalDays = 5;
        }
    }
    // Subsequent Reviews
    else {
        if (rating === 'Again') {
            newIntervalDays = Math.max(1, Math.round(newIntervalDays * 0.2));
            newEaseFactor = Math.max(1.3, newEaseFactor - 0.2);
            newLapseCount += 1;
        } else if (rating === 'Hard') {
            newIntervalDays = Math.max(1, Math.round(newIntervalDays * 1.2));
            newEaseFactor = Math.max(1.3, newEaseFactor - 0.15);
        } else if (rating === 'Good') {
            newIntervalDays = Math.max(1, Math.round(newIntervalDays * newEaseFactor));
            // Ease Factor stays the same
        } else if (rating === 'Easy') {
            newIntervalDays = Math.max(1, Math.round(newIntervalDays * newEaseFactor * 1.3));
            newEaseFactor += 0.15;
        }
    }

    // Calculate new due date by adding interval_days to "now"
    if (rating === 'Again' && currentReviewCount === 0) {
        // If it's a completely new card and they hit Again, due immediately (within 1 min)
        now.setMinutes(now.getMinutes() + 1);
    } else {
        // Safety check for NaN or extreme values
        const delta = isNaN(newIntervalDays) ? 1 : newIntervalDays;
        now.setDate(now.getDate() + delta);
    }

    // Final safety check for Invalid Date
    const dueDate = isNaN(now.getTime()) ? new Date().toISOString() : now.toISOString();

    return {
        difficulty: rating,
        due_date: dueDate,
        interval_days: isNaN(newIntervalDays) ? 1 : newIntervalDays,
        ease_factor: Number(newEaseFactor.toFixed(2)),
        review_count: currentReviewCount + 1,
        lapse_count: newLapseCount,
    };
};
