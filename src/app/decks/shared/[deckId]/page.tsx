'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import {
    Download,
    Copy,
    Globe,
    Tag,
    BookOpen,
    Layers,
    ArrowLeft,
    Calendar,
    Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { supabase } from '@/utils/supabase/client';
import { useDeckStore } from '@/store/useDeckStore';
import { PublicDeckPreview } from '@/data/starterDeck';
import { useRouter } from 'next/navigation';

export default function SharedDeckPage({ params }: { params: Promise<{ deckId: string }> }) {
    const { deckId } = React.use(params);
    const router = useRouter();
    const { cloneDeck } = useDeckStore();

    const [deck, setDeck] = React.useState<PublicDeckPreview | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [cloning, setCloning] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        async function loadPublicDeck() {
            const { data, error } = await supabase
                .from('decks')
                .select(`
          *,
          flashcards (count)
        `)
                .eq('id', deckId)
                .eq('is_public', true)
                .single();

            if (error || !data) {
                setError('This deck is not public or does not exist.');
                setLoading(false);
                return;
            }

            const { data: previewCards } = await supabase
                .from('flashcards')
                .select('id, question, answer')
                .eq('deck_id', deckId)
                .limit(5);

            setDeck({
                ...(data as any),
                preview_cards: previewCards || [],
            });
            setLoading(false);
        }

        loadPublicDeck();
    }, [deckId]);

    const handleClone = async () => {
        setCloning(true);
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            router.push(`/login?returnUrl=/decks/shared/${deckId}`);
            return;
        }

        const newDeckId = await cloneDeck(deckId);
        if (newDeckId) {
            router.push(`/decks/${newDeckId}`);
        } else {
            setError('Failed to import deck. Please try again.');
            setCloning(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 2 }}>
                <CircularProgress size={40} thickness={4} />
                <Typography variant="body2" sx={{ fontWeight: 600, opacity: 0.6 }}>Fetching deck details...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ maxWidth: 500, mx: 'auto', mt: 10, textAlign: 'center' }}>
                <Alert severity="error" sx={{ borderRadius: '16px', mb: 3 }}>{error}</Alert>
                <Button variant="outlined" onClick={() => router.push('/')} startIcon={<ArrowLeft size={18} />}>
                    Back to Home
                </Button>
            </Box>
        );
    }

    if (!deck) return <Typography>Deck not found</Typography>;

    const totalCards = deck.flashcards && deck.flashcards[0] ? (deck.flashcards[0] as any).count : deck.preview_cards.length;

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{ maxWidth: 800, margin: '0 auto', pt: 4 }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4, cursor: 'pointer', opacity: 0.6, '&:hover': { opacity: 1 } }} onClick={() => router.back()}>
                <ArrowLeft size={18} />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Back</Typography>
            </Box>

            <Card sx={{ mb: 6, p: 2 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 3 }}>
                        <Box sx={{ flex: 1, minWidth: 300 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, opacity: 0.6 }}>
                                <Globe size={14} />
                                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Public Deck</Typography>
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 2 }}>{deck.title}</Typography>
                            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, mb: 3, lineHeight: 1.6 }}>
                                {deck.description || 'No description provided.'}
                            </Typography>
                            {deck.tags && deck.tags.length > 0 && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {deck.tags.map(t => (
                                        <Chip
                                            key={t}
                                            label={t}
                                            size="small"
                                            icon={<Tag size={12} />}
                                            sx={{ bgcolor: 'rgba(255,255,255,0.05)', fontWeight: 600 }}
                                        />
                                    ))}
                                </Box>
                            )}
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 200 }}>
                            <Box sx={{ p: 3, borderRadius: '24px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
                                <Typography variant="h4" sx={{ fontWeight: 800 }}>{totalCards}</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.5 }}>TOTAL CARDS</Typography>
                            </Box>
                            <Button
                                variant="contained"
                                size="large"
                                fullWidth
                                startIcon={cloning ? <CircularProgress size={20} color="inherit" /> : <Download size={20} />}
                                onClick={handleClone}
                                disabled={cloning}
                                sx={{ py: 2, borderRadius: '16px', fontWeight: 800, fontSize: '1rem' }}
                            >
                                {cloning ? 'Importing...' : 'Import Deck'}
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Zap size={24} className="text-yellow-500" />
                <Typography variant="h5" sx={{ fontWeight: 800 }}>Preview Cards</Typography>
            </Box>

            {deck.preview_cards.length === 0 ? (
                <Box sx={{ p: 6, textAlign: 'center', borderRadius: '24px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}>
                    <Typography color="text.secondary" sx={{ fontWeight: 600 }}>This deck has no cards items yet.</Typography>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {deck.preview_cards.map((card, idx) => (
                        <Card
                            key={card.id || idx}
                            sx={{
                                p: 1,
                                '&:hover': { transform: 'scale(1.01)', borderColor: 'primary.main' }
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', gap: 4 }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.4, display: 'block', mb: 1 }}>QUESTION</Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 700 }}>{card.question}</Typography>
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.4, display: 'block', mb: 1 }}>ANSWER</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500, opacity: 0.8 }}>{card.answer.length > 150 ? card.answer.substring(0, 150) + '...' : card.answer}</Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                    {totalCards > deck.preview_cards.length && (
                        <Box sx={{ textAlign: 'center', mt: 2, p: 3, borderRadius: '20px', bgcolor: 'rgba(255,255,255,0.02)' }}>
                            <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 600 }}>
                                ...and {totalCards - deck.preview_cards.length} more cards. Import the deck to see all!
                            </Typography>
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
}
