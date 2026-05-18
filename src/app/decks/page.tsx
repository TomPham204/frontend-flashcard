'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Link from 'next/link';
import {
    Plus,
    Settings2,
    Trash2,
    Share2,
    Copy,
    ExternalLink,
    Lock,
    Globe,
    Tag,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useDeckStore } from '@/store/useDeckStore';
import { Deck } from '@/data/starterDeck';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.05 }
    }
};

const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
};

export default function DecksPage() {
    const { decks, fetchDecks, createDeck, updateDeck, deleteDeck, toggleVisibility } = useDeckStore();
    const [mounted, setMounted] = React.useState(false);
    const [open, setOpen] = React.useState(false);
    const [editingDeck, setEditingDeck] = React.useState<Deck | null>(null);

    const [formData, setFormData] = React.useState({
        title: '',
        description: '',
        category: '',
        tags: '',
    });

    const [shareLink, setShareLink] = React.useState<string | null>(null);

    React.useEffect(() => {
        setMounted(true);
        fetchDecks();
    }, [fetchDecks]);

    if (!mounted) return null;

    const handleOpenNew = () => {
        setEditingDeck(null);
        setFormData({ title: '', description: '', category: '', tags: '' });
        setOpen(true);
    };

    const handleOpenEdit = (deck: Deck) => {
        setEditingDeck(deck);
        setFormData({
            title: deck.title,
            description: deck.description || '',
            category: deck.category || '',
            tags: deck.tags.join(', '),
        });
        setOpen(true);
    };

    const handleSave = () => {
        const dataToSave = {
            title: formData.title,
            description: formData.description,
            category: formData.category,
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        };

        if (editingDeck) {
            updateDeck(editingDeck.id, dataToSave);
        } else {
            createDeck(dataToSave as any);
        }
        setOpen(false);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setShareLink(null);
    };

    return (
        <Box component={motion.div} variants={container} initial="hidden" animate="show">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}>My Decks</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.6, fontWeight: 600 }}>Create and organize your collections</Typography>
                </Box>
                <Button
                    variant="contained"
                    onClick={handleOpenNew}
                    startIcon={<Plus size={20} />}
                    sx={{ borderRadius: '16px', py: 1.5, px: 3 }}
                >
                    Create New
                </Button>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                {decks.length === 0 ? (
                    <Box sx={{ gridColumn: '1 / -1', p: 8, textAlign: 'center', borderRadius: '32px', border: '2px dashed var(--glass-border)' }}>
                        <Typography color="text.secondary" sx={{ fontWeight: 600 }}>You have no decks yet. Create one to get started!</Typography>
                    </Box>
                ) : (
                    decks.map(deck => (
                        <Box key={deck.id} component={motion.div} variants={item}>
                            <Card sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    borderColor: 'primary.main',
                                }
                            }}>
                                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }} noWrap>{deck.title}</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.6 }}>
                                            {deck.is_public ? <Globe size={14} /> : <Lock size={14} />}
                                            <Switch
                                                checked={deck.is_public}
                                                onChange={(e) => toggleVisibility(deck.id, e.target.checked)}
                                                size="small"
                                                sx={{ ml: -1 }}
                                            />
                                        </Box>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: '3em', opacity: 0.8, fontWeight: 500 }}>
                                        {deck.description || 'No description provided.'}
                                    </Typography>

                                    {deck.tags.length > 0 && (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {deck.tags.map(t => (
                                                <Chip
                                                    key={t}
                                                    label={t}
                                                    size="small"
                                                    icon={<Tag size={12} />}
                                                    sx={{
                                                        bgcolor: 'rgba(255,255,255,0.05)',
                                                        border: '1px solid var(--glass-border)',
                                                        fontWeight: 600,
                                                        fontSize: '0.7rem'
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    )}
                                </CardContent>
                                <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        <IconButton size="small" onClick={() => handleOpenEdit(deck)} sx={{ color: 'text.secondary' }}>
                                            <Settings2 size={18} />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => deleteDeck(deck.id)} color="error" sx={{ opacity: 0.6 }}>
                                            <Trash2 size={18} />
                                        </IconButton>
                                        {deck.is_public && (
                                            <IconButton size="small" onClick={() => setShareLink(`${window.location.origin}/decks/shared/${deck.id}`)} color="primary">
                                                <Share2 size={18} />
                                            </IconButton>
                                        )}
                                    </Box>
                                    <Button
                                        size="small"
                                        component={Link}
                                        href={`/decks/${deck.id}`}
                                        endIcon={<ExternalLink size={14} />}
                                        sx={{ fontWeight: 700 }}
                                    >
                                        Manage
                                    </Button>
                                </CardActions>
                            </Card>
                        </Box>
                    ))
                )}
            </Box>

            {/* Share Modal */}
            <Dialog
                open={!!shareLink}
                onClose={() => setShareLink(null)}
                maxWidth="xs"
                fullWidth
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: '28px',
                            bgcolor: 'rgba(30, 41, 59, 0.8)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid var(--glass-border)',
                            p: 1
                        }
                    }
                }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800 }}>
                    Share Deck
                    <IconButton onClick={() => setShareLink(null)} size="small">
                        <X size={20} />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 3, opacity: 0.7, fontWeight: 500 }}>
                        Anyone with this link can view and import your public deck.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <TextField
                            fullWidth
                            value={shareLink || ''}
                            slotProps={{ input: { readOnly: true, sx: { fontWeight: 600, fontSize: '0.9rem' } } }}
                            size="small"
                        />
                        <Button
                            variant="contained"
                            onClick={() => shareLink && copyToClipboard(shareLink)}
                            sx={{ minWidth: 'auto', p: 1.5, borderRadius: '12px' }}
                        >
                            <Copy size={18} />
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Create/Edit Modal */}
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                maxWidth="sm"
                fullWidth
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: '32px',
                            bgcolor: (theme: any) => theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(24px)',
                            border: '1px solid var(--glass-border)',
                        }
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800, pt: 3, px: 4 }}>
                    {editingDeck ? 'Edit Deck' : 'Create New Deck'}
                </DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2, px: 4 }}>
                    <TextField
                        label="Deck Title"
                        fullWidth
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        variant="outlined"
                        slotProps={{ input: { sx: { borderRadius: '16px' } } }}
                    />
                    <TextField
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        slotProps={{ input: { sx: { borderRadius: '16px' } } }}
                    />
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        <TextField
                            label="Category"
                            fullWidth
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            slotProps={{ input: { sx: { borderRadius: '16px' } } }}
                        />
                        <TextField
                            label="Tags"
                            placeholder="tag1, tag2"
                            fullWidth
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            slotProps={{ input: { sx: { borderRadius: '16px' } } }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 4, pt: 2 }}>
                    <Button onClick={() => setOpen(false)} sx={{ fontWeight: 700 }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={!formData.title}
                        sx={{ borderRadius: '14px', px: 4, py: 1 }}
                    >
                        Save Deck
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
