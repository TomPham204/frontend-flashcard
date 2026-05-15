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
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Chip from '@mui/material/Chip';
import Link from 'next/link';

import { useDeckStore } from '@/store/useDeckStore';
import { Deck } from '@/data/starterDeck';

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
        alert('Link copied to clipboard!');
        setShareLink(null);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4">My Decks</Typography>
                <Button variant="contained" onClick={handleOpenNew}>Create New Deck</Button>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                {decks.length === 0 ? (
                    <Typography color="text.secondary">You have no decks yet. Create one to get started!</Typography>
                ) : (
                    decks.map(deck => (
                        <Card key={deck.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="h6" noWrap>{deck.title}</Typography>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={deck.is_public}
                                                onChange={(e) => toggleVisibility(deck.id, e.target.checked)}
                                                size="small"
                                            />
                                        }
                                        label={<Typography variant="caption" color="text.secondary">{deck.is_public ? 'Public' : 'Private'}</Typography>}
                                        labelPlacement="start"
                                        sx={{ m: 0 }}
                                    />
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {deck.description || 'No description'}
                                </Typography>

                                {deck.tags.length > 0 && (
                                    <Box sx={{ mb: 2 }}>
                                        {deck.tags.map(t => <Chip key={t} label={t} size="small" sx={{ mr: 0.5, mb: 0.5 }} />)}
                                    </Box>
                                )}
                            </CardContent>
                            <CardActions sx={{ justifyContent: 'space-between', borderTop: '1px solid', borderColor: 'divider' }}>
                                <Box>
                                    <IconButton size="small" onClick={() => handleOpenEdit(deck)} title="Edit Details">
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => deleteDeck(deck.id)} color="error" title="Delete Deck">
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                    {deck.is_public && (
                                        <IconButton size="small" onClick={() => setShareLink(`${window.location.origin}/decks/shared/${deck.id}`)} color="primary" title="Share Link">
                                            <ShareIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                </Box>
                                <Button size="small" component={Link} href={`/decks/${deck.id}`}>
                                    Manage Cards
                                </Button>
                            </CardActions>
                        </Card>
                    ))
                )}
            </Box>

            {/* Share Modal */}
            <Dialog open={!!shareLink} onClose={() => setShareLink(null)} maxWidth="sm" fullWidth>
                <DialogTitle>Share Public Deck</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Anyone with this link can view and import your public deck.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            fullWidth
                            value={shareLink || ''}
                            slotProps={{ input: { readOnly: true } }}
                            size="small"
                        />
                        <Button variant="contained" aria-label="copy" onClick={() => shareLink && copyToClipboard(shareLink)}>
                            <ContentCopyIcon fontSize="small" />
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShareLink(null)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Create/Edit Modal */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingDeck ? 'Edit Deck' : 'Create New Deck'}</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField
                        label="Deck Title"
                        fullWidth
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                    <TextField
                        label="Description"
                        fullWidth
                        multiline
                        rows={2}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                    <TextField
                        label="Category"
                        fullWidth
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                    <Button variant="contained" onClick={handleSave} disabled={!formData.title}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
