'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFlashcardStore } from '@/store/useFlashcardStore';
import { Difficulty } from '@/data/starterDeck';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function StudyPage() {
  const params = useParams();
  const router = useRouter();
  const category = decodeURIComponent(params.category as string);
  const { cards, reviewCard, migrateIfNeeded, loading } = useFlashcardStore();

  const [mounted, setMounted] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isFlipped, setIsFlipped] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    migrateIfNeeded();
  }, [migrateIfNeeded]);

  const now = new Date();
  const dueCards = React.useMemo(() => {
    if (!mounted) return [];
    return cards.filter(
      c => c.category === category && (!c.next_review_at || new Date(c.next_review_at) <= now)
    );
  }, [cards, category, mounted]);

  const currentCard = dueCards[currentIndex];

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentCard) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (isFlipped) {
        if (e.key === '1') handleRating('Again');
        if (e.key === '2') handleRating('Hard');
        if (e.key === '3') handleRating('Good');
        if (e.key === '4') handleRating('Easy');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentCard, isFlipped]);

  if (!mounted) return null;

  if (dueCards.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h5" gutterBottom>You're all caught up!</Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          No more cards due for {category} today.
        </Typography>
        <Button variant="contained" onClick={() => router.push('/')}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  const handleRating = (rating: Difficulty) => {
    reviewCard(currentCard.id, rating);
    setIsFlipped(false);
    // Since the card's next_review_at is updated, it might drop out of dueCards on next render.
    // If it doesn't, we can advance currentIndex manually, but our dueCards uses useMemo which re-evaluates.
    // However, if we don't advance the index and dueCards updates, the next card will automatically slide into currentIndex 0.
    // We should keep currentIndex at 0 and let the list shrink.
    setCurrentIndex(0);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => router.push('/')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          Studying: {category}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {dueCards.length} cards remaining
        </Typography>
      </Box>

      {currentCard && (
        <Box sx={{ perspective: '1000px', height: 400, mb: 4 }}>
          <Box
            sx={{
              width: '100%',
              height: '100%',
              position: 'relative',
              transition: 'transform 0.6s',
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              cursor: 'pointer',
            }}
            onClick={() => !isFlipped && setIsFlipped(true)}
          >
            {/* Front */}
            <Paper
              elevation={3}
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p: 4,
                textAlign: 'center',
                bgcolor: 'background.paper',
              }}
            >
              <Typography variant="h4">{currentCard.question}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ position: 'absolute', bottom: 16 }}>
                Click or press Space to reveal answer
              </Typography>
            </Paper>

            {/* Back */}
            <Paper
              elevation={3}
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p: 4,
                textAlign: 'center',
                transform: 'rotateY(180deg)',
                bgcolor: 'background.paper',
                overflowY: 'auto'
              }}
            >
              <Typography variant="body1" sx={{ mb: 2, fontSize: '1.25rem' }}>{currentCard.answer}</Typography>
              {currentCard.code_snippet && (
                <Box sx={{ width: '100%', bgcolor: 'rgba(0,0,0,0.2)', p: 2, borderRadius: 1, textAlign: 'left', overflowX: 'auto', mt: 2 }}>
                  <pre style={{ margin: 0 }}>
                    <code>{currentCard.code_snippet}</code>
                  </pre>
                </Box>
              )}
            </Paper>
          </Box>
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        {!isFlipped ? (
          <Button variant="contained" size="large" onClick={() => setIsFlipped(true)} sx={{ minWidth: 200 }}>
            Show Answer
          </Button>
        ) : (
          <>
            <Button variant="outlined" color="error" onClick={() => handleRating('Again')}>
              Again (1)
            </Button>
            <Button variant="outlined" color="warning" onClick={() => handleRating('Hard')}>
              Hard (2)
            </Button>
            <Button variant="outlined" color="info" onClick={() => handleRating('Good')}>
              Good (3)
            </Button>
            <Button variant="outlined" color="success" onClick={() => handleRating('Easy')}>
              Easy (4)
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
}
