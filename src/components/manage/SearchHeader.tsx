'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { Search, X, Filter, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchFilters } from '@/utils/search';

interface SearchHeaderProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    filters: SearchFilters;
    onFilterChange: (filters: Partial<SearchFilters>) => void;
    onClear: () => void;
    categories: string[];
    totalResults: number;
}

export default function SearchHeader({
    searchQuery,
    onSearchChange,
    filters,
    onFilterChange,
    onClear,
    categories,
    totalResults,
}: SearchHeaderProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Keyboard shortcut listener
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                e.preventDefault();
                inputRef.current?.focus();
            }
            if (e.key === 'Escape') {
                onClear();
                inputRef.current?.blur();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClear]);

    const handleFilterToggle = (key: keyof SearchFilters, value: any) => {
        if (filters[key] === value) {
            onFilterChange({ [key]: null });
        } else {
            onFilterChange({ [key]: value });
        }
    };

    const isAnyFilterActive = searchQuery || filters.category || filters.difficulty || filters.mastered !== null || filters.dueToday;

    return (
        <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ position: 'relative' }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search questions, answers, tags..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    inputRef={inputRef}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search size={20} className="text-primary-main opacity-60" />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    {!searchQuery ? (
                                        <Box
                                            sx={{
                                                px: 1,
                                                py: 0.5,
                                                borderRadius: '6px',
                                                bgcolor: 'action.hover',
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                opacity: 0.5,
                                                display: { xs: 'none', sm: 'flex' },
                                                alignItems: 'center',
                                                gap: 0.5,
                                            }}
                                        >
                                            <Typography variant="caption" sx={{ fontWeight: 700 }}>/</Typography>
                                        </Box>
                                    ) : (
                                        <IconButton size="small" onClick={() => onSearchChange('')}>
                                            <X size={16} />
                                        </IconButton>
                                    )}
                                </InputAdornment>
                            ),
                            sx: {
                                borderRadius: '16px',
                                bgcolor: 'rgba(255,255,255,0.03)',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.05)',
                                },
                                '&.Mui-focused': {
                                    bgcolor: 'rgba(255,255,255,0.07)',
                                    boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.2)',
                                },
                            }
                        }
                    }}
                />
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ opacity: 0.5, fontWeight: 700, mr: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Filter size={14} /> FILTER BY:
                </Typography>

                {/* Due Today Filter */}
                <Chip
                    label="Due Today"
                    size="small"
                    onClick={() => onFilterChange({ dueToday: !filters.dueToday })}
                    icon={<Clock size={14} />}
                    variant={filters.dueToday ? 'filled' : 'outlined'}
                    color={filters.dueToday ? 'primary' : 'default'}
                    sx={{ borderRadius: '8px', fontWeight: 600 }}
                />

                {/* Difficulty Selectors */}
                {['Again', 'Hard', 'Good', 'Easy'].map((diff) => (
                    <Chip
                        key={diff}
                        label={diff}
                        size="small"
                        onClick={() => handleFilterToggle('difficulty', diff)}
                        variant={filters.difficulty === diff ? 'filled' : 'outlined'}
                        color={filters.difficulty === diff ? 'secondary' : 'default'}
                        sx={{ borderRadius: '8px', fontWeight: 600 }}
                    />
                ))}

                {/* Mastered/Unmastered */}
                <Chip
                    label="Mastered"
                    size="small"
                    onClick={() => handleFilterToggle('mastered', true)}
                    icon={<CheckCircle size={14} />}
                    variant={filters.mastered === true ? 'filled' : 'outlined'}
                    color={filters.mastered === true ? 'success' : 'default'}
                    sx={{ borderRadius: '8px', fontWeight: 600 }}
                />

                {isAnyFilterActive && (
                    <Button
                        size="small"
                        onClick={onClear}
                        sx={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.7, '&:hover': { opacity: 1 } }}
                    >
                        Clear All
                    </Button>
                )}

                <Box sx={{ flexGrow: 1 }} />

                <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700 }}>
                    {totalResults} {totalResults === 1 ? 'card' : 'cards'} found
                </Typography>
            </Box>

            {/* Category Selection Carousel/Scroll */}
            <Box sx={{
                display: 'flex',
                gap: 1,
                overflowX: 'auto',
                pb: 1,
                '&::-webkit-scrollbar': { height: '4px' },
                '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '4px' }
            }}>
                {categories.map((cat) => (
                    <Chip
                        key={cat}
                        label={cat}
                        size="small"
                        onClick={() => handleFilterToggle('category', cat)}
                        variant={filters.category === cat ? 'filled' : 'outlined'}
                        sx={{
                            borderRadius: '8px',
                            fontWeight: 600,
                            bgcolor: filters.category === cat ? 'primary.main' : 'transparent',
                            borderColor: filters.category === cat ? 'primary.main' : 'rgba(255,255,255,0.1)',
                        }}
                    />
                ))}
            </Box>
        </Box>
    );
}
