import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase/client';
import { Flashcard } from '@/data/starterDeck';

export function useDeleteFlashcard() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const { error } = await supabase.from('flashcards').delete().eq('id', id);
            if (error) throw new Error(error.message);
        },
        onMutate: async (deletedId) => {
            await queryClient.cancelQueries({ queryKey: ['flashcards'] });
            const previousCards = queryClient.getQueryData<Flashcard[]>(['flashcards']);

            if (previousCards) {
                queryClient.setQueryData<Flashcard[]>(
                    ['flashcards'],
                    previousCards.filter((card) => card.id !== deletedId)
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
