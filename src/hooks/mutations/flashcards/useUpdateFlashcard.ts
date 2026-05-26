import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase/client';
import { Flashcard } from '@/data/starterDeck';

export function useUpdateFlashcard() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...updates }: { id: string } & Partial<Flashcard>) => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const { error } = await supabase
                .from('flashcards')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw new Error(error.message);
        },
        onMutate: async (updatedCard) => {
            await queryClient.cancelQueries({ queryKey: ['flashcards'] });
            const previousCards = queryClient.getQueryData<Flashcard[]>(['flashcards']);

            if (previousCards) {
                queryClient.setQueryData<Flashcard[]>(
                    ['flashcards'],
                    previousCards.map((card) =>
                        card.id === updatedCard.id ? { ...card, ...updatedCard, updated_at: new Date().toISOString() } : card
                    )
                );
            }
            return { previousCards };
        },
        onError: (err, newCard, context) => {
            if (context?.previousCards) {
                queryClient.setQueryData(['flashcards'], context.previousCards);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['flashcards'] });
        },
    });
}
