import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase/client';
import { Flashcard } from '@/data/starterDeck';

export function useFlashcards() {
    return useQuery({
        queryKey: ['flashcards'],
        queryFn: async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return [];

            const { data, error } = await supabase
                .from('flashcards')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw new Error(error.message);

            return (data as any[]).map(card => ({
                ...card,
                difficulty: card.difficulty || 'New',
                due_date: card.due_date || null,
                interval_days: card.interval_days ?? 0,
                ease_factor: card.ease_factor ?? 2.5,
                review_count: card.review_count ?? 0,
                lapse_count: card.lapse_count ?? 0,
            })) as Flashcard[];
        },
    });
}
