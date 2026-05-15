'use client';

import * as React from 'react';
import { useFlashcardStore } from '@/store/useFlashcardStore';
import { Flashcard } from '@/data/starterDeck';
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

export default function ManageCards() {
  const { cards, addCard, updateCard, deleteCard } = useFlashcardStore();
  const [mounted, setMounted] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const [open, setOpen] = React.useState(false);
  const [editingCard, setEditingCard] = React.useState<Flashcard | null>(null);

  const [formData, setFormData] = React.useState({
    question: '',
    answer: '',
    category: '',
    code_snippet: '',
    tags: '',
  });
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    useFlashcardStore.getState().migrateIfNeeded();
  }, []);

  if (!mounted) return null;

  const filteredCards = cards.filter(c =>
    c.question.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase()) ||
    c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenNew = () => {
    setEditingCard(null);
    setFormData({ question: '', answer: '', category: '', code_snippet: '', tags: '' });
    setOpen(true);
  };

  const handleOpenEdit = (card: Flashcard) => {
    setEditingCard(card);
    setFormData({
      question: card.question,
      answer: card.answer,
      category: card.category,
      code_snippet: card.code_snippet || '',
      tags: card.tags.join(', '),
    });
    setOpen(true);
  };

  const handleSave = () => {
    const dataToSave = {
      question: formData.question,
      answer: formData.answer,
      category: formData.category,
      code_snippet: formData.code_snippet,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
    };

    if (editingCard) {
      updateCard(editingCard.id, dataToSave);
    } else {
      addCard(dataToSave);
    }
    setOpen(false);
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Manage Cards</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {selectedIds.size > 0 && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleBulkDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : `Delete Selected (${selectedIds.size})`}
            </Button>
          )}
          <Button variant="contained" onClick={handleOpenNew}>Create New Card</Button>
        </Box>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search questions, categories, or tags..."
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
              <TableCell>Category</TableCell>
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
                <TableCell>{card.category}</TableCell>
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
                <TableCell colSpan={5} align="center">No cards found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCard ? 'Edit Card' : 'Create New Card'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Category"
            fullWidth
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />
          <TextField
            label="Question"
            fullWidth
            multiline
            rows={2}
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
          />
          <TextField
            label="Answer"
            fullWidth
            multiline
            rows={3}
            value={formData.answer}
            onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
          />
          <TextField
            label="Code Snippet (optional)"
            fullWidth
            multiline
            rows={3}
            value={formData.code_snippet}
            onChange={(e) => setFormData({ ...formData, code_snippet: e.target.value })}
            sx={{ fontFamily: 'monospace' }}
          />
          <TextField
            label="Tags (comma separated)"
            fullWidth
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!formData.question || !formData.answer || !formData.category}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
