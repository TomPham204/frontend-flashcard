import Fuse, { IFuseOptions } from 'fuse.js';
import { Flashcard } from '@/data/starterDeck';

export interface SearchFilters {
  category: string | null;
  difficulty: string | null;
  dueToday: boolean;
  mastered: boolean | null; // true for Easy/Good, false for Again/Hard, null for all
  deckName: string | null;
}

export const fuseOptions: IFuseOptions<Flashcard> = {
  keys: [
    { name: 'question', weight: 1.0 },
    { name: 'answer', weight: 0.7 },
    { name: 'tags', weight: 0.7 },
    { name: 'category', weight: 0.4 },
  ],
  threshold: 0.4,
  distance: 100,
  ignoreLocation: true,
  includeMatches: true,
  minMatchCharLength: 2,
};

export const filterCards = (cards: Flashcard[], filters: SearchFilters) => {
  return cards.filter((card) => {
    // Category filter
    if (filters.category && card.category !== filters.category) {
      return false;
    }

    // Difficulty filter
    if (filters.difficulty && card.difficulty !== filters.difficulty) {
      return false;
    }

    // Due Today filter
    if (filters.dueToday) {
      if (!card.due_date) return false;
      const today = new Date().toISOString().split('T')[0];
      const dueDate = card.due_date.split('T')[0];
      if (dueDate > today) return false;
    }

    // Mastered filter
    if (filters.mastered !== null) {
      const isMastered = ['Easy', 'Good'].includes(card.difficulty);
      if (filters.mastered && !isMastered) return false;
      if (!filters.mastered && isMastered) return false;
    }

    return true;
  });
};
