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
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';
import InputAdornment from '@mui/material/InputAdornment';
import {
  Search,
  Plus,
  Trash2,
  Edit3,
  Filter,
  MoreHorizontal,
  Code2,
  Tag,
  Layers,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}>Manage Cards</Typography>
          <Typography variant="body2" sx={{ opacity: 0.6, fontWeight: 600 }}>Total: {filteredCards.length} cards</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <AnimatePresence>
            {selectedIds.size > 0 && (
              <Button
                component={motion.button}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                variant="outlined"
                color="error"
                startIcon={<Trash2 size={18} />}
                onClick={handleBulkDelete}
                disabled={isDeleting}
                sx={{ borderRadius: '12px', fontWeight: 700 }}
              >
                {isDeleting ? 'Deleting...' : `Delete (${selectedIds.size})`}
              </Button>
            )}
          </AnimatePresence>
          <Button
            variant="contained"
            onClick={handleOpenNew}
            startIcon={<Plus size={18} />}
            sx={{ borderRadius: '12px', px: 3, fontWeight: 700 }}
          >
            Create New Card
          </Button>
        </Box>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search questions, categories, or tags..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 4 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} className="opacity-40" />
              </InputAdornment>
            ),
            sx: { borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.03)' }
          }
        }}
      />

      <TableContainer sx={{
        bgcolor: 'transparent',
        border: '1px solid var(--glass-border)',
        borderRadius: '24px',
        overflow: 'hidden',
        backdropFilter: 'blur(10px)'
      }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.03)' }}>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedIds.size > 0 && selectedIds.size < filteredCards.length}
                  checked={filteredCards.length > 0 && selectedIds.size === filteredCards.length}
                  onChange={handleToggleAll}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 800, opacity: 0.6 }}>Question</TableCell>
              <TableCell sx={{ fontWeight: 800, opacity: 0.6 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 800, opacity: 0.6 }}>Tags</TableCell>
              <TableCell sx={{ fontWeight: 800, opacity: 0.6 }}>Progress</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, opacity: 0.6 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCards.map((card) => (
              <TableRow
                key={card.id}
                selected={selectedIds.has(card.id)}
                sx={{
                  '&.Mui-selected': { bgcolor: 'rgba(99, 102, 241, 0.08)' },
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' }
                }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedIds.has(card.id)}
                    onChange={() => handleToggleOne(card.id)}
                  />
                </TableCell>
                <TableCell sx={{ maxWidth: 300 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                    {card.question}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={card.category}
                    size="small"
                    icon={<Layers size={14} />}
                    sx={{ fontWeight: 600, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {card.tags.slice(0, 2).map(t => (
                      <Chip key={t} label={t} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
                    ))}
                    {card.tags.length > 2 && (
                      <Typography variant="caption" sx={{ opacity: 0.4 }}>+{card.tags.length - 2}</Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" sx={{
                    bgcolor: card.difficulty === 'Easy' ? 'success.main' : 'warning.main',
                    color: 'white',
                    px: 1, py: 0.2,
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '0.6rem'
                  }}>
                    {card.difficulty || 'New'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpenEdit(card)} size="small" sx={{ color: 'primary.main' }}>
                    <Edit3 size={18} />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteIndividual(card.id)} size="small" sx={{ color: 'error.main', opacity: 0.6 }}>
                    <Trash2 size={18} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filteredCards.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8, opacity: 0.5 }}>
                  No cards found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '32px',
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(24px)',
              border: '1px solid var(--glass-border)',
              p: 2
            }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', pb: 1 }}>
          {editingCard ? 'Edit Card' : 'Create New Card'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          <TextField
            label="Category"
            fullWidth
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            slotProps={{ input: { sx: { borderRadius: '12px' } } }}
          />
          <TextField
            label="Question"
            fullWidth
            required
            multiline
            rows={2}
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            slotProps={{ input: { sx: { borderRadius: '12px' } } }}
          />
          <TextField
            label="Answer"
            fullWidth
            required
            multiline
            rows={3}
            value={formData.answer}
            onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
            slotProps={{ input: { sx: { borderRadius: '12px' } } }}
          />
          <TextField
            label="Code Snippet (optional)"
            fullWidth
            multiline
            rows={4}
            value={formData.code_snippet}
            onChange={(e) => setFormData({ ...formData, code_snippet: e.target.value })}
            slotProps={{
              input: {
                sx: { borderRadius: '12px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' },
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                    <Code2 size={18} className="opacity-40" />
                  </InputAdornment>
                )
              }
            }}
          />
          <TextField
            label="Tags"
            placeholder="javascript, react, hooks"
            fullWidth
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            slotProps={{
              input: {
                sx: { borderRadius: '12px' },
                startAdornment: (
                  <InputAdornment position="start">
                    <Tag size={18} className="opacity-40" />
                  </InputAdornment>
                )
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setOpen(false)} sx={{ fontWeight: 700 }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!formData.question || !formData.answer || !formData.category}
            sx={{ borderRadius: '12px', px: 4, py: 1, fontWeight: 700 }}
          >
            Save Card
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
