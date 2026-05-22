import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Flashcard, Difficulty, starterDeck } from '@/data/starterDeck';
import { supabase } from '@/utils/supabase/client';
import { calculateReviewState } from '@/utils/srs';

interface FlashcardState {
  cards: Flashcard[];
  loading: boolean;
  error: string | null;
  isMigrated: boolean;

  // Actions
  fetchCards: () => Promise<void>;
  addCard: (card: Omit<Flashcard, 'id' | 'created_at' | 'updated_at' | 'difficulty' | 'due_date' | 'interval_days' | 'ease_factor' | 'review_count' | 'lapse_count'>) => Promise<void>;
  updateCard: (id: string, card: Partial<Flashcard>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  reviewCard: (id: string, rating: Difficulty) => Promise<void>;
  loadStarterDeck: () => Promise<void>;
  importDeck: (cards: Flashcard[]) => Promise<void>;
  resetDeck: () => Promise<void>;
  migrateIfNeeded: () => Promise<void>;
}



const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const useFlashcardStore = create<FlashcardState>()(
  persist(
    (set, get) => ({
      cards: [],
      loading: false,
      error: null,
      isMigrated: false,

      fetchCards: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        set({ loading: true, error: null });
        const { data, error } = await supabase
          .from('flashcards')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          set({ error: error.message, loading: false });
        } else {
          const cleanedCards = (data as any[]).map(card => ({
            ...card,
            difficulty: card.difficulty || 'New',
            due_date: card.due_date || null,
            interval_days: card.interval_days ?? 0,
            ease_factor: card.ease_factor ?? 2.5,
            review_count: card.review_count ?? 0,
            lapse_count: card.lapse_count ?? 0,
          }));
          set({ cards: cleanedCards as Flashcard[], loading: false });
        }
      },

      addCard: async (cardData) => {
        const { data: { session } } = await supabase.auth.getSession();
        const newCard: Partial<Flashcard> = {
          ...cardData,
          id: crypto.randomUUID(),
          difficulty: 'New',
          due_date: null,
          interval_days: 0,
          ease_factor: 2.5,
          review_count: 0,
          lapse_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        if (session) {
          const { error } = await supabase
            .from('flashcards')
            .insert([{ ...newCard, user_id: session.user.id }]);
          if (error) {
            set({ error: error.message });
            return;
          }
        }

        set((state) => ({ cards: [newCard as Flashcard, ...state.cards] }));
      },

      updateCard: async (id, cardData) => {
        const { data: { session } } = await supabase.auth.getSession();
        const updatedFields = { ...cardData, updated_at: new Date().toISOString() };

        if (session && isValidUUID(id)) {
          const { error } = await supabase
            .from('flashcards')
            .update(updatedFields)
            .eq('id', id);
          if (error) {
            set({ error: error.message });
            return;
          }
        }

        set((state) => ({
          cards: state.cards.map((c) => (c.id === id ? { ...c, ...updatedFields } : c)),
        }));
      },

      deleteCard: async (id) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && isValidUUID(id)) {
          const { error } = await supabase.from('flashcards').delete().eq('id', id);
          if (error) {
            set({ error: error.message });
            return;
          }
        }

        set((state) => ({
          cards: state.cards.filter((c) => c.id !== id),
        }));
      },

      reviewCard: async (id, rating) => {
        const state = get();
        const card = state.cards.find(c => c.id === id);
        if (!card) return;

        const { data: { session } } = await supabase.auth.getSession();

        const srsUpdates = calculateReviewState(card, rating);
        const updatedFields = {
          ...srsUpdates,
          updated_at: new Date().toISOString(),
        };

        if (session && isValidUUID(id)) {
          // Update card SRS data
          const { error: updateError } = await supabase
            .from('flashcards')
            .update(updatedFields)
            .eq('id', id);

          if (updateError) {
            set({ error: updateError.message });
            return;
          }

          // Record review history
          const { error: historyError } = await supabase
            .from('review_history')
            .insert({
              card_id: id,
              user_id: session.user.id,
              rating,
              ease_factor: updatedFields.ease_factor,
              interval_days: updatedFields.interval_days,
              reviewed_at: updatedFields.updated_at
            });

          if (historyError) {
            console.error('Failed to record review history:', historyError.message);
            // We don't block the user if history fails, but we log it
          }
        }

        set((state) => ({
          cards: state.cards.map((c) => (c.id === id ? { ...c, ...updatedFields } : c)),
        }));
      },

      loadStarterDeck: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const existingIds = new Set(get().cards.map((c) => c.id));
        const newCards = starterDeck.filter((c) => !existingIds.has(c.id));

        if (session) {
          const cardsToInsert = newCards.map(c => ({
            ...c,
            id: crypto.randomUUID(),
            user_id: session.user.id
          }));
          const { error } = await supabase.from('flashcards').insert(cardsToInsert);
          if (error) {
            set({ error: error.message });
            return;
          }
          // Use the cards with assigned UUIDs and user_id
          set((state) => ({ cards: [...state.cards, ...cardsToInsert as Flashcard[]] }));
        } else {
          set((state) => ({ cards: [...state.cards, ...newCards] }));
        }
      },

      migrateIfNeeded: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        if (get().isMigrated) {
          await get().fetchCards();
          return;
        }

        const { data: existingCloudCards } = await supabase
          .from('flashcards')
          .select('id')
          .limit(1);

        // If cloud is empty and we have local cards, migrate them
        if (existingCloudCards?.length === 0 && get().cards.length > 0) {
          const cardsToMigrate = get().cards.map(c => ({
            ...c,
            id: isValidUUID(c.id) ? c.id : crypto.randomUUID(),
            user_id: session.user.id
          }));

          const { error } = await supabase.from('flashcards').insert(cardsToMigrate);
          if (!error) {
            set({ cards: cardsToMigrate as Flashcard[], isMigrated: true });
            await get().fetchCards();
          } else {
            console.error('Migration failed:', error.message);
          }
        } else {
          // If cloud is not empty or no local cards, just mark as migrated and fetch
          set({ isMigrated: true });
          await get().fetchCards();
        }
      },

      importDeck: async (importedCards: Flashcard[]) => {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          const cardsWithUserId = importedCards.map(c => ({
            ...c,
            id: isValidUUID(c.id) ? c.id : crypto.randomUUID(),
            user_id: session.user.id
          }));
          const { error } = await supabase.from('flashcards').insert(cardsWithUserId);
          if (error) {
            set({ error: error.message });
            return;
          }
          set((state) => ({ cards: [...state.cards, ...cardsWithUserId as Flashcard[]] }));
        } else {
          set((state) => ({ cards: [...state.cards, ...importedCards] }));
        }
      },

      resetDeck: async () => {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          const { error } = await supabase
            .from('flashcards')
            .delete()
            .eq('user_id', session.user.id);

          if (error) {
            set({ error: error.message });
            return;
          }
        }

        set({ cards: [] });
      },
    }),
    {
      name: 'flashcard-storage',
      // Only persist cards and migration status
      partialize: (state) => ({ cards: state.cards, isMigrated: state.isMigrated }),
    }
  )
);
