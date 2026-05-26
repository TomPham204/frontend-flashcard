import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase/client';
import { Flashcard, Difficulty } from '@/data/starterDeck';
import { calculateReviewState } from '@/utils/srs';

export function useReviewFlashcard() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, rating }: { id: string; rating: Difficulty }) => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const cards = queryClient.getQueryData<Flashcard[]>(['flashcards']);
            const card = cards?.find(c => c.id === id);
            if (!card) return;

            const srsUpdates = calculateReviewState(card, rating);
            const updatedFields = {
                ...srsUpdates,
                updated_at: new Date().toISOString(),
            };

            const { error: updateError } = await supabase
                .from('flashcards')
                .update(updatedFields)
                .eq('id', id);

            if (updateError) throw new Error(updateError.message);

            const { error: historyError } = await supabase
                .from('review_history')
                .insert({
                    card_id: id,
                    user_id: session.user.id,
                    rating,
                    ease_factor: updatedFields.ease_factor,
                    interval_days: updatedFields.interval_days,
                    reviewed_at: updatedFields.updated_at,
                });

            if (historyError) throw new Error(historyError.message);
        },
        onMutate: async ({ id, rating }) => {
            await queryClient.cancelQueries({ queryKey: ['flashcards'] });
            const previousCards = queryClient.getQueryData<Flashcard[]>(['flashcards']);

            if (previousCards) {
                queryClient.setQueryData<Flashcard[]>(
                    ['flashcards'],
                    previousCards.map((card) => {
                        if (card.id === id) {
                            const srsUpdates = calculateReviewState(card, rating);
                            return { ...card, ...srsUpdates, updated_at: new Date().toISOString() };
                        }
                        return card;
                    })
                );
            }
            return { previousCards };
        },
        onError: (err, variables, context) => {
            if (context?.previousCards) {
                queryClient.setQueryData(['flashcards'], context.previousCards);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['flashcards'] });
        },
    });
}
