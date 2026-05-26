'use client';

import * as React from 'react';
import { useFlashcardStore } from '@/store/useFlashcardStore';
import { Flashcard } from '@/data/starterDeck';
import { useDeckStore } from '@/store/useDeckStore';
import { supabase } from '@/utils/supabase/client';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CardEditor, CardDraft } from '@/components/editor/CardEditor';
export default function DeckEditorPage({ params }: { params: Promise<{ deckId: string }> }) {
    const { deckId } = React.use(params);
    const router = useRouter();

    const { decks, fetchDecks } = useDeckStore();
    const deck = decks.find(d => d.id === deckId);
    const { cards, addCard, updateCard, deleteCard } = useFlashcardStore();

    const [mounted, setMounted] = React.useState(false);
    const [search, setSearch] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const [editingCard, setEditingCard] = React.useState<Flashcard | null>(null);

    const [formData, setFormData] = React.useState({
        question: '',
        answer: '',
        code_snippet: '',
        tags: '',
    });

    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
    const [isDeleting, setIsDeleting] = React.useState(false);

    // Add Existing Cards state
    const [addExistingOpen, setAddExistingOpen] = React.useState(false);
    const [existingSearch, setExistingSearch] = React.useState('');
    const [existingSelectedIds, setExistingSelectedIds] = React.useState<Set<string>>(new Set());

    React.useEffect(() => {
        setMounted(true);
        fetchDecks();
        useFlashcardStore.getState().fetchCards();
    }, [fetchDecks]);

    if (!mounted) return null;

    if (!deck) {
        return <Typography>Deck not found or loading...</Typography>;
    }

    // Filter only cards belonging to this deck
    const deckCards = cards.filter(c => c.deck_id === deckId);

    const filteredCards = deckCards.filter(c =>
        (c.question || '').toLowerCase().includes(search.toLowerCase()) ||
        (thisTags(c.tags)).some(t => t.toLowerCase().includes(search.toLowerCase()))
    );

    // Cards not in this deck
    const nonDeckCards = cards.filter(c => c.deck_id !== deckId);

    // Helper mapper to safely handle DB arrays / nulls
    function thisTags(tags: any): string[] {
        return Array.isArray(tags) ? tags : [];
    }

    const searchedNonDeckCards = nonDeckCards.filter(c =>
        (c.question || '').toLowerCase().includes(existingSearch.toLowerCase()) ||
        thisTags(c.tags).some(t => t.toLowerCase().includes(existingSearch.toLowerCase()))
    );

    const handleOpenAddExisting = () => {
        setExistingSelectedIds(new Set());
        setExistingSearch('');
        setAddExistingOpen(true);
    };

    const handleSaveExisting = async () => {
        const idsToAdd = Array.from(existingSelectedIds);
        for (const cid of idsToAdd) {
            await updateCard(cid, { deck_id: deckId });
        }
        setAddExistingOpen(false);
    };

    const handleToggleExistingOne = (id: string) => {
        const newSelected = new Set(existingSelectedIds);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setExistingSelectedIds(newSelected);
    };


    const handleOpenNew = () => {
        setEditingCard(null);
        setFormData({ question: '', answer: '', code_snippet: '', tags: '' });
        setOpen(true);
    };

    const handleOpenEdit = (card: Flashcard) => {
        setEditingCard(card);
        setFormData({
            question: card.question,
            answer: card.answer,
            code_snippet: card.code_snippet || '',
            tags: card.tags.join(', '),
        });
        setOpen(true);
    };

    const handleSave = async (draft: CardDraft) => {
        const dataToSave = {
            deck_id: deckId,
            question: draft.question,
            answer: draft.answer,
            category: deck.category || 'Uncategorized',
            tags: draft.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
        };

        if (editingCard) {
            await updateCard(editingCard.id, dataToSave);
        } else {
            await addCard(dataToSave as any);
        }
    };

    const handleBulkDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${selectedIds.size} cards?`)) {
            setIsDeleting(true);
            const idsToDelete = Array.from(selectedIds);
            for (const id of idsToDelete) {
                await deleteCard(id);
            }
            setSelectedIds(new Set());
            setIsDeleting(false);
        }
    };

    const handleDeleteIndividual = (id: string) => {
        deleteCard(id);
        if (selectedIds.has(id)) {
            const newSelected = new Set(selectedIds);
            newSelected.delete(id);
            setSelectedIds(newSelected);
        }
    };

    const handleToggleOne = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleToggleAll = () => {
        if (selectedIds.size === filteredCards.length && filteredCards.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredCards.map(c => c.id)));
        }
    };

    return (
        <Box>
            <Breadcrumbs sx={{ mb: 2 }}>
                <Link href="/decks" style={{ textDecoration: 'none', color: 'inherit' }}>
                    Decks
                </Link>
                <Typography color="text.primary">{deck.title}</Typography>
            </Breadcrumbs>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4">Manage Cards for {deck.title}</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {selectedIds.size > 0 && (
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={handleBulkDelete}
                            disabled={isDeleting}
                        >
                            Bulk Delete
                        </Button>
                    )}
                    <Button variant="outlined" onClick={handleOpenAddExisting}>Add Existing Cards</Button>
                    <Button variant="contained" onClick={handleOpenNew}>Create New Card</Button>
                </Box>
            </Box>

            <TextField
                fullWidth
                variant="outlined"
                placeholder="Search questions or tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ mb: 4 }}
            />

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    indeterminate={selectedIds.size > 0 && selectedIds.size < filteredCards.length}
                                    checked={filteredCards.length > 0 && selectedIds.size === filteredCards.length}
                                    onChange={handleToggleAll}
                                />
                            </TableCell>
                            <TableCell>Question</TableCell>
                            <TableCell>Tags</TableCell>
                            <TableCell>Difficulty</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredCards.map((card) => (
                            <TableRow key={card.id} selected={selectedIds.has(card.id)}>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={selectedIds.has(card.id)}
                                        onChange={() => handleToggleOne(card.id)}
                                    />
                                </TableCell>
                                <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {card.question}
                                </TableCell>
                                <TableCell>
                                    {card.tags.map(t => <Chip key={t} label={t} size="small" sx={{ mr: 0.5 }} />)}
                                </TableCell>
                                <TableCell>{card.difficulty}</TableCell>
                                <TableCell align="right">
                                    <IconButton onClick={() => handleOpenEdit(card)} size="small" color="primary">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDeleteIndividual(card.id)} size="small" color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredCards.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">No cards in this deck yet.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" fullWidth sx={{ '& .MuiDialog-paper': { m: 2, height: '90vh', maxHeight: 'none' } }}>
                {open && (
                    <CardEditor
                        initialData={
                            editingCard
                                ? {
                                    question: editingCard.question,
                                    answer: editingCard.answer,
                                    tags: editingCard.tags.join(', ')
                                }
                                : { question: '', answer: '', tags: '' }
                        }
                        onSave={handleSave}
                        onClose={() => setOpen(false)}
                    />
                )}
            </Dialog>

            {/* Add Existing Cards Dialog */}
            <Dialog open={addExistingOpen} onClose={() => setAddExistingOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Add Existing Cards</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField
                        placeholder="Search your library..."
                        fullWidth
                        size="small"
                        value={existingSearch}
                        onChange={(e) => setExistingSearch(e.target.value)}
                        variant="outlined"
                        sx={{ mb: 1 }}
                    />

                    <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            indeterminate={existingSelectedIds.size > 0 && existingSelectedIds.size < searchedNonDeckCards.length}
                                            checked={searchedNonDeckCards.length > 0 && existingSelectedIds.size === searchedNonDeckCards.length}
                                            onChange={() => {
                                                if (existingSelectedIds.size === searchedNonDeckCards.length) setExistingSelectedIds(new Set());
                                                else setExistingSelectedIds(new Set(searchedNonDeckCards.map(c => c.id)));
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>Question</TableCell>
                                    <TableCell>Category</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {searchedNonDeckCards.map(card => (
                                    <TableRow key={card.id}>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={existingSelectedIds.has(card.id)}
                                                onChange={() => handleToggleExistingOne(card.id)}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {card.question}
                                        </TableCell>
                                        <TableCell>{card.category}</TableCell>
                                    </TableRow>
                                ))}
                                {searchedNonDeckCards.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center">No available cards found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddExistingOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveExisting}
                        disabled={existingSelectedIds.size === 0}
                    >
                        Add {existingSelectedIds.size > 0 ? `(${existingSelectedIds.size})` : ''} Cards
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}
