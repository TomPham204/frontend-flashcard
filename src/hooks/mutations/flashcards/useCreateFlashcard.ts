import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase/client';
import { Flashcard } from '@/data/starterDeck';

export interface CreateFlashcardData extends Omit<Flashcard, 'id' | 'created_at' | 'updated_at' | 'difficulty' | 'due_date' | 'interval_days' | 'ease_factor' | 'review_count' | 'lapse_count'> {
    id: string; // Let the client generate the ID for perfect optimistic UI
}

export function useCreateFlashcard() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (cardData: CreateFlashcardData) => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const { error, data } = await supabase
                .from('flashcards')
                .insert([{ ...cardData, user_id: session.user.id }])
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data;
        },
        // Optimistic UI magic happens here
        onMutate: async (newCard: CreateFlashcardData) => {
            await queryClient.cancelQueries({ queryKey: ['flashcards'] });

            // Snapshot the previous value
            const previousCards = queryClient.getQueryData<Flashcard[]>(['flashcards']);

            // Optimistically update to the new value
            if (previousCards) {
                const optimisticCard: Flashcard = {
                    ...newCard,
                    difficulty: 'New',
                    due_date: null,
                    interval_days: 0,
                    ease_factor: 2.5,
                    review_count: 0,
                    lapse_count: 0,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };

                // Add to the front of the cached array
                queryClient.setQueryData<Flashcard[]>(['flashcards'], [optimisticCard, ...previousCards]);
            }

            // Return context containing previous state for rollback
            return { previousCards };
        },
        // If mutation fails, use the context to rollback
        onError: (err, newCard, context) => {
            if (context?.previousCards) {
                queryClient.setQueryData(['flashcards'], context.previousCards);
            }
        },
        // Always refetch after error or success to sync with server
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['flashcards'] });
        },
    });
}
