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
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

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
            // 1. Fetch deck metadata and count
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

            // 2. Fetch a few preview cards
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
            // Redirect to login, maintaining return path if possible
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

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;
    if (!deck) return <Typography>Deck not found</Typography>;

    const totalCards = deck.flashcards && deck.flashcards[0] ? deck.flashcards[0].count : deck.preview_cards.length;

    return (
        <Box sx={{ maxWidth: 800, margin: '0 auto', pt: 4 }}>
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                            <Typography variant="h4" gutterBottom>{deck.title}</Typography>
                            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                {deck.description || 'No description provided.'}
                            </Typography>
                            {deck.tags && deck.tags.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    {deck.tags.map(t => <Chip key={t} label={t} size="small" sx={{ mr: 1 }} />)}
                                </Box>
                            )}
                        </Box>
                        <Button
                            variant="contained"
                            size="large"
                            color="primary"
                            startIcon={cloning ? <CircularProgress size={20} color="inherit" /> : <FileDownloadIcon />}
                            onClick={handleClone}
                            disabled={cloning}
                        >
                            Import Deck ({totalCards} Cards)
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                Preview Cards
            </Typography>

            {deck.preview_cards.length === 0 ? (
                <Typography color="text.secondary">This deck has no cards.</Typography>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {deck.preview_cards.map((card, idx) => (
                        <Card key={card.id || idx} variant="outlined" sx={{ bgcolor: 'background.default' }}>
                            <CardContent>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Question</Typography>
                                <Typography variant="body1" sx={{ mb: 2 }}>{card.question}</Typography>

                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Answer</Typography>
                                <Typography variant="body2">{card.answer}</Typography>
                            </CardContent>
                        </Card>
                    ))}
                    {totalCards > deck.preview_cards.length && (
                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Typography color="text.secondary" variant="body2">
                                ...and {totalCards - deck.preview_cards.length} more. Import to view entirely.
                            </Typography>
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
}
