import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Flashcard, Difficulty, starterDeck } from '@/data/starterDeck';

interface FlashcardState {
  cards: Flashcard[];
  addCard: (card: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'nextReviewDate'>) => void;
  updateCard: (id: string, card: Partial<Flashcard>) => void;
  deleteCard: (id: string) => void;
  reviewCard: (id: string, rating: Difficulty) => void;
  loadStarterDeck: () => void;
  importDeck: (cards: Flashcard[]) => void;
  resetDeck: () => void;
}

const calculateNextReviewDate = (rating: Difficulty): string => {
  const now = new Date();
  switch (rating) {
    case 'Again':
      now.setMinutes(now.getMinutes() + 10); // 10 minutes
      break;
    case 'Hard':
      now.setHours(now.getHours() + 12); // 12 hours
      break;
    case 'Good':
      now.setDate(now.getDate() + 1); // 1 day
      break;
    case 'Easy':
      now.setDate(now.getDate() + 3); // 3 days
      break;
    case 'New':
    default:
      break;
  }
  return now.toISOString();
};

export const useFlashcardStore = create<FlashcardState>()(
  persist(
    (set) => ({
      cards: [],
      
      addCard: (cardData) => set((state) => {
        const newCard: Flashcard = {
          ...cardData,
          id: crypto.randomUUID(),
          status: 'New',
          nextReviewDate: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return { cards: [...state.cards, newCard] };
      }),

      updateCard: (id, cardData) => set((state) => ({
        cards: state.cards.map((c) => 
          c.id === id ? { ...c, ...cardData, updatedAt: new Date().toISOString() } : c
        )
      })),

      deleteCard: (id) => set((state) => ({
        cards: state.cards.filter((c) => c.id !== id)
      })),

      reviewCard: (id, rating) => set((state) => ({
        cards: state.cards.map((c) => {
          if (c.id === id) {
            return {
              ...c,
              status: rating,
              nextReviewDate: calculateNextReviewDate(rating),
              updatedAt: new Date().toISOString()
            };
          }
          return c;
        })
      })),

      loadStarterDeck: () => set((state) => {
        // Prevent duplicate loads if already populated
        const existingIds = new Set(state.cards.map(c => c.id));
        const newCards = starterDeck.filter(c => !existingIds.has(c.id));
        return { cards: [...state.cards, ...newCards] };
      }),

      importDeck: (cards) => set((state) => ({
        cards: [...state.cards, ...cards]
      })),

      resetDeck: () => set({ cards: [] })
    }),
    {
      name: 'flashcard-storage',
    }
  )
);
