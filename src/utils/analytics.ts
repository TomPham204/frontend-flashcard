import { supabase } from './supabase/client';

export interface ReviewRecord {
    id: string;
    card_id: string;
    user_id: string;
    rating: 'Again' | 'Hard' | 'Good' | 'Easy';
    ease_factor: number;
    interval_days: number;
    reviewed_at: string;
}

export interface AnalyticsStats {
    totalCards: number;
    masteredCards: number;
    reviewsToday: number;
    reviewsThisWeek: number;
    cardsDueToday: number;
    streak: number;
    successRate: number;
}

export interface DailyReviewCount {
    date: string;
    count: number;
}

export interface AccuracyTrend {
    date: string;
    accuracy: number;
}

export interface CategoryDistribution {
    name: string;
    value: number;
}

/**
 * Calculates the current study streak based on review history.
 */
export function calculateStreak(reviewDates: string[]): number {
    if (reviewDates.length === 0) return 0;

    // Normalize dates to YYYY-MM-DD in local time
    const uniqueDates = Array.from(
        new Set(reviewDates.map(d => new Date(d).toISOString().split('T')[0]))
    ).sort((a, b) => b.localeCompare(a));

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // If the most recent review isn't today or yesterday, streak is broken
    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0;

    let streak = 0;
    let currentDate = new Date(uniqueDates[0]);

    for (let i = 0; i < uniqueDates.length; i++) {
        const dateStr = uniqueDates[i];
        const expectedDateStr = currentDate.toISOString().split('T')[0];

        if (dateStr === expectedDateStr) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            break;
        }
    }

    return streak;
}

/**
 * Fetches and aggregates analytics data from Supabase.
 */
export async function getAnalyticsData() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const userId = session.user.id;
    const now = new Date().toISOString();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    // 1. Fetch total cards and mastered cards (interval > 21 days is a common heuristic for 'mastered')
    const { data: cards, error: cardsError } = await supabase
        .from('flashcards')
        .select('id, interval_days, category, due_date')
        .eq('user_id', userId);

    if (cardsError) throw cardsError;

    const totalCards = cards.length;
    const masteredCards = cards.filter(c => c.interval_days > 21).length;
    const cardsDueToday = cards.filter(c => !c.due_date || new Date(c.due_date) <= new Date()).length;

    // 2. Fetch recent review history
    const { data: history, error: historyError } = await supabase
        .from('review_history')
        .select('*')
        .eq('user_id', userId)
        .order('reviewed_at', { ascending: false });

    if (historyError) throw historyError;

    const reviewsToday = history.filter(h => new Date(h.reviewed_at) >= todayStart).length;
    const reviewsThisWeek = history.filter(h => new Date(h.reviewed_at) >= weekStart).length;

    const streak = calculateStreak(history.map(h => h.reviewed_at));

    // 3. Calculate success rate (Good + Easy / Total)
    const successfulReviews = history.filter(h => h.rating === 'Good' || h.rating === 'Easy').length;
    const successRate = history.length > 0 ? (successfulReviews / history.length) * 100 : 0;

    // 4. Aggregate Daily Review Count (last 7 days)
    const dailyCounts: DailyReviewCount[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dStr = d.toISOString().split('T')[0];
        const count = history.filter(h => h.reviewed_at.startsWith(dStr)).length;
        dailyCounts.push({ date: dStr, count });
    }

    // 5. Category Distribution
    const categoryMap: Record<string, number> = {};
    cards.forEach(c => {
        const cat = c.category || 'Uncategorized';
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    const categoryDistribution: CategoryDistribution[] = Object.entries(categoryMap).map(([name, value]) => ({
        name,
        value
    }));

    return {
        stats: {
            totalCards,
            masteredCards,
            reviewsToday,
            reviewsThisWeek,
            cardsDueToday,
            streak,
            successRate
        },
        dailyCounts,
        categoryDistribution,
        recentActivity: history.slice(0, 5)
    };
}
