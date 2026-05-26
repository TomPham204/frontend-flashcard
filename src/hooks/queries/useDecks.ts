import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase/client';
import { Deck } from '@/data/starterDeck';

export function useDecks() {
    return useQuery({
        queryKey: ['decks'],
        queryFn: async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return [];

            const { data, error } = await supabase
                .from('decks')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(error.message);
            }
            return data as Deck[];
        },
    });
}
