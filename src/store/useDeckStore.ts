import { create } from 'zustand';
import { supabase } from '@/utils/supabase/client';
import { Deck } from '@/data/starterDeck';

interface DeckState {
    decks: Deck[];
    loading: boolean;
    error: string | null;

    fetchDecks: () => Promise<void>;
    createDeck: (deck: Omit<Deck, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<Deck | null>;
    updateDeck: (id: string, updates: Partial<Deck>) => Promise<void>;
    deleteDeck: (id: string) => Promise<void>;
    toggleVisibility: (id: string, is_public: boolean) => Promise<void>;
    cloneDeck: (sourceDeckId: string) => Promise<string | null>;
}

export const useDeckStore = create<DeckState>((set, get) => ({
    decks: [],
    loading: false,
    error: null,

    fetchDecks: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        set({ loading: true, error: null });
        const { data, error } = await supabase
            .from('decks')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            set({ error: error.message, loading: false });
        } else {
            set({ decks: data as Deck[], loading: false });
        }
    },

    createDeck: async (deckData) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return null;

        const optimisticId = crypto.randomUUID();
        const newDeck = {
            ...deckData,
            id: optimisticId,
            is_public: deckData.is_public ?? false,
            user_id: session.user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const previousDecks = get().decks;
        // Optimistic UI Update
        set((state) => ({ decks: [newDeck as Deck, ...state.decks] }));

        const { data, error } = await supabase
            .from('decks')
            .insert([{ ...newDeck, id: undefined }]) // let Supabase generate the real ID if it's a serial, or use the UUID
            .select()
            .single();

        if (error) {
            console.error("Optimistic createDeck failed", error);
            set({ error: error.message, decks: previousDecks }); // Rollback
            return null;
        }

        // Reconcile: Replace optimistic deck with server verified deck (which has real ID and timestamps)
        set((state) => ({
            decks: state.decks.map((d) => (d.id === optimisticId ? (data as Deck) : d)),
        }));

        return data as Deck;
    },

    updateDeck: async (id, updates) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const previousDecks = get().decks;
        // Optimistic UI Update
        set((state) => ({
            decks: state.decks.map((d) => (d.id === id ? { ...d, ...updates, updated_at: new Date().toISOString() } : d)),
        }));

        const { error } = await supabase
            .from('decks')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error("Optimistic updateDeck failed", error);
            set({ error: error.message, decks: previousDecks }); // Rollback
        }
    },

    deleteDeck: async (id) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const previousDecks = get().decks;
        // Optimistic UI Update
        set((state) => ({
            decks: state.decks.filter((d) => d.id !== id),
        }));

        const { error } = await supabase.from('decks').delete().eq('id', id);
        if (error) {
            console.error("Optimistic deleteDeck failed", error);
            set({ error: error.message, decks: previousDecks }); // Rollback
        }
    },

    toggleVisibility: async (id, is_public) => {
        await get().updateDeck(id, { is_public });
    },

    cloneDeck: async (sourceDeckId) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return null;

        set({ loading: true });

        // 1. Fetch Source Deck
        const { data: sourceDeck, error: deckErr } = await supabase
            .from('decks')
            .select('*')
            .eq('id', sourceDeckId)
            .single();

        if (deckErr || !sourceDeck) {
            set({ error: deckErr?.message || 'Deck not found', loading: false });
            return null;
        }

        // 2. Fetch Source Cards
        const { data: sourceCards, error: cardsErr } = await supabase
            .from('flashcards')
            .select('*')
            .eq('deck_id', sourceDeckId);

        if (cardsErr) {
            set({ error: cardsErr.message, loading: false });
            return null;
        }

        // 3. Create new Deck for the Cloner
        const newDeck = {
            title: `${sourceDeck.title} (Clone)`,
            description: sourceDeck.description,
            category: sourceDeck.category,
            tags: sourceDeck.tags,
            is_public: false,
            user_id: session.user.id,
        };

        const { data: createdDeck, error: createDeckErr } = await supabase
            .from('decks')
            .insert([newDeck])
            .select()
            .single();

        if (createDeckErr || !createdDeck) {
            set({ error: createDeckErr?.message || 'Failed to create deck', loading: false });
            return null;
        }

        // 4. Insert Cloned Cards
        if (sourceCards && sourceCards.length > 0) {
            const clonedCards = sourceCards.map(card => {
                const { id, created_at, updated_at, ...rest } = card;
                return {
                    ...rest,
                    deck_id: createdDeck.id,
                    user_id: session.user.id,
                    difficulty: 'New',
                    due_date: null,
                    interval_days: 0,
                    ease_factor: 2.5,
                    review_count: 0,
                    lapse_count: 0,
                };
            });

            const { error: insertCardsErr } = await supabase
                .from('flashcards')
                .insert(clonedCards);

            if (insertCardsErr) {
                set({ error: insertCardsErr.message, loading: false });
                return null;
            }
        }

        set((state) => ({ decks: [createdDeck as Deck, ...state.decks], loading: false }));
        return createdDeck.id;
    },
}));
