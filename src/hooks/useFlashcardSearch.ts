import { useState, useMemo, useEffect } from 'react';
import Fuse from 'fuse.js';
import { Flashcard } from '@/data/starterDeck';
import { fuseOptions, filterCards, SearchFilters } from '@/utils/search';

export const useFlashcardSearch = (cards: Flashcard[]) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<SearchFilters>({
        category: null,
        difficulty: null,
        dueToday: false,
        mastered: null,
        deckName: null,
    });

    const fuse = useMemo(() => {
        return new Fuse(cards, fuseOptions);
    }, [cards]);

    const filteredAndSearchedCards = useMemo(() => {
        let results = cards;

        // Apply search query first (or filter first, doesn't matter much for client-side)
        if (searchQuery.trim()) {
            results = fuse.search(searchQuery).map((r) => r.item);
        }

        // Apply categorical filters
        results = filterCards(results, filters);

        return results;
    }, [cards, searchQuery, filters, fuse]);

    const updateFilter = (newFilters: Partial<SearchFilters>) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
    };

    const clearSearch = () => {
        setSearchQuery('');
        setFilters({
            category: null,
            difficulty: null,
            dueToday: false,
            mastered: null,
            deckName: null,
        });
    };

    return {
        searchQuery,
        setSearchQuery,
        filters,
        updateFilter,
        filteredAndSearchedCards,
        clearSearch,
    };
};
