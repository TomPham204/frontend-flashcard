'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFlashcardStore } from '@/store/useFlashcardStore';
import { Difficulty } from '@/data/starterDeck';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import {
  ArrowLeft,
  Sparkles,
  RotateCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MarkdownRenderer from '@/components/markdown/MarkdownRenderer';

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
      c => c.category === category && (!c.due_date || new Date(c.due_date) <= now)
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

  if (!mounted || loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 2 }}>
        <BookOpen className="animate-pulse text-indigo-500" size={48} />
      </Box>
    );
  }

  if (dueCards.length === 0) {
    return (
      <Box
        component={motion.div}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        sx={{ textAlign: 'center', mt: 8, p: 6, borderRadius: '32px', bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}
      >
        <Sparkles className="text-yellow-500 mb-4 mx-auto" size={48} />
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>You're all caught up!</Typography>
        <Typography color="text.secondary" sx={{ mb: 4, fontWeight: 500 }}>
          No more cards due for {category} today. Great job!
        </Typography>
        <Button
          variant="contained"
          onClick={() => router.push('/')}
          startIcon={<ArrowLeft size={18} />}
          sx={{ py: 1.5, px: 4 }}
        >
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  const handleRating = (rating: Difficulty) => {
    reviewCard(currentCard.id, rating);
    setIsFlipped(false);
    setCurrentIndex(0);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 6, justifyContent: 'space-between' }}>
        <IconButton onClick={() => router.push('/')} sx={{ bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}>
          <ArrowLeft size={20} />
        </IconButton>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            {category}
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.5, textTransform: 'uppercase' }}>
            Study Session
          </Typography>
        </Box>
        <Box sx={{ px: 2, py: 0.5, borderRadius: '20px', bgcolor: 'primary.main', color: 'white', fontWeight: 700, fontSize: '0.8rem' }}>
          {dueCards.length}
        </Box>
      </Box>

      <Box sx={{ position: 'relative', height: 450, mb: 6 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id + isFlipped}
            initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            style={{ width: '100%', height: '100%', perspective: '1000px' }}
          >
            <Card
              onClick={() => !isFlipped && setIsFlipped(true)}
              sx={{
                width: '100%',
                height: '100%',
                cursor: !isFlipped ? 'pointer' : 'default',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p: 4,
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': !isFlipped ? {
                  transform: 'scale(1.01)',
                  borderColor: 'primary.main',
                } : {}
              }}
            >
              <CardContent>
                <Box sx={{
                  width: '100%',
                  maxHeight: '350px',
                  overflowY: 'auto',
                  px: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center', // Center content horizontally
                  justifyContent: 'center', // Center content vertically
                  flex: 1
                }}>
                  {isFlipped ? (
                    <Box sx={{ width: '100%', p: 1, '& .markdown-body': { textAlign: 'left', fontSize: '1.2rem' } }}>
                      <MarkdownRenderer content={currentCard.answer} />
                      {currentCard.code_snippet && (
                        <Box sx={{ mt: 3, width: '100%' }}>
                          <MarkdownRenderer content={`\`\`\`\n${currentCard.code_snippet}\n\`\`\``} />
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Box sx={{ width: '100%', textAlign: 'center', '& .markdown-body': { textAlign: 'center', fontSize: '2rem' } }}>
                      <MarkdownRenderer content={currentCard.question} />
                    </Box>
                  )}
                </Box>
              </CardContent>

              {!isFlipped && (
                <Box sx={{
                  position: 'absolute',
                  bottom: 32,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  opacity: 0.4,
                  fontWeight: 700
                }}>
                  <RotateCw size={16} />
                  <Typography variant="caption">Tap or Space to Flip</Typography>
                </Box>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>
      </Box>

      <AnimatePresence>
        {!isFlipped ? (
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            sx={{ display: 'flex', justifyContent: 'center' }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => setIsFlipped(true)}
              endIcon={<Sparkles size={20} />}
              sx={{
                minWidth: 260,
                py: 2,
                borderRadius: '16px',
                fontSize: '1.1rem',
                boxShadow: '0 20px 40px -12px rgba(99, 102, 241, 0.5)'
              }}
            >
              Reveal Answer
            </Button>
          </Box>
        ) : (
          <Box
            component={motion.div}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 2,
              p: 2,
              borderRadius: '24px',
              bgcolor: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--glass-border)'
            }}
          >
            <RatingButton
              label="Again"
              sub="1"
              color="error.main"
              icon={<XCircle size={20} />}
              onClick={() => handleRating('Again')}
            />
            <RatingButton
              label="Hard"
              sub="2"
              color="warning.main"
              icon={<AlertCircle size={20} />}
              onClick={() => handleRating('Hard')}
            />
            <RatingButton
              label="Good"
              sub="3"
              color="info.main"
              icon={<CheckCircle2 size={20} />}
              onClick={() => handleRating('Good')}
            />
            <RatingButton
              label="Easy"
              sub="4"
              color="success.main"
              icon={<Sparkles size={20} />}
              onClick={() => handleRating('Easy')}
            />
          </Box>
        )}
      </AnimatePresence>
    </Box>
  );
}

function RatingButton({ label, sub, color, icon, onClick }: any) {
  return (
    <Button
      fullWidth
      onClick={onClick}
      sx={{
        flexDirection: 'column',
        py: 2,
        gap: 1,
        borderRadius: '16px',
        border: '1px solid transparent',
        transition: 'all 0.2s',
        '&:hover': {
          bgcolor: 'rgba(255,255,255,0.05)',
          borderColor: color,
          '& .icon': { color: color }
        }
      }}
    >
      <Box className="icon" sx={{ opacity: 0.8, transition: 'color 0.2s' }}>{icon}</Box>
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 800, display: 'block', lineHeight: 1 }}>{label}</Typography>
        <Typography variant="caption" sx={{ opacity: 0.4, fontWeight: 700 }}>{sub}</Typography>
      </Box>
    </Button>
  );
}
