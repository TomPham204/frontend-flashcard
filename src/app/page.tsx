'use client';

import * as React from 'react';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import { useFlashcardStore } from '@/store/useFlashcardStore';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Zap,
  CheckCircle2,
  Trophy,
  ArrowRight,
  BookOpen,
  Clock,
  Layers
} from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Dashboard() {
  const { cards, loadStarterDeck, migrateIfNeeded, loading } = useFlashcardStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    migrateIfNeeded();
  }, [migrateIfNeeded]);

  if (!mounted || loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 2 }}>
        <BookOpen className="animate-pulse text-indigo-500" size={48} />
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
          Loading your deck...
        </Typography>
      </Box>
    );
  }

  const categories = Array.from(new Set(cards.map(c => c.category)));
  const totalCards = cards.length;
  const masteredCards = cards.filter(c => c.difficulty === 'Easy' || c.difficulty === 'Good').length;

  const now = new Date();
  const dueCards = cards.filter(c => !c.due_date || new Date(c.due_date) <= now).length;

  const handleLoadStarter = () => {
    loadStarterDeck();
  };

  return (
    <Box component={motion.div} variants={container} initial="hidden" animate="show">
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.03em' }}>
          Welcome back!
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 0.5,
            borderRadius: '20px',
            bgcolor: 'rgba(99, 102, 241, 0.1)',
            color: 'primary.main',
            border: '1px solid rgba(99, 102, 241, 0.2)'
          }}>
            <Clock size={16} />
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {dueCards} cards due today
            </Typography>
          </Box>
          {totalCards === 0 && (
            <Button
              variant="contained"
              onClick={handleLoadStarter}
              startIcon={<Zap size={18} />}
              sx={{ borderRadius: '20px' }}
            >
              Get Started
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3, mb: 8 }}>
        <Box component={motion.div} variants={item}>
          <Card sx={{
            height: '100%',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.05) 100%)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ opacity: 0.6, fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>Total Cards</Typography>
                <Layers size={20} className="text-indigo-500 opacity-60" />
              </Box>
              <Typography variant="h2" sx={{ fontWeight: 800 }}>{totalCards}</Typography>
            </CardContent>
          </Card>
        </Box>

        <Box component={motion.div} variants={item}>
          <Card sx={{
            height: '100%',
            background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)',
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ opacity: 0.6, fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>Mastered</Typography>
                <Trophy size={20} className="text-teal-500 opacity-60" />
              </Box>
              <Typography variant="h2" sx={{ fontWeight: 800 }}>{masteredCards}</Typography>
            </CardContent>
          </Card>
        </Box>

        <Box component={motion.div} variants={item}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ opacity: 0.6, fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>Retention Rate</Typography>
                <CheckCircle2 size={20} className="text-indigo-500 opacity-60" />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, mb: 2 }}>
                <Typography variant="h2" sx={{ fontWeight: 800 }}>{totalCards ? Math.round((masteredCards / totalCards) * 100) : 0}</Typography>
                <Typography variant="h5" sx={{ opacity: 0.5, mb: 1, fontWeight: 700 }}>%</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={totalCards ? (masteredCards / totalCards) * 100 : 0}
                sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(255, 255, 255, 0.1)' }}
              />
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
          Study Categories
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
        {categories.length === 0 ? (
          <Box component={motion.div} variants={item} sx={{ gridColumn: '1 / -1', p: 8, textAlign: 'center', borderRadius: '32px', border: '2px dashed var(--glass-border)' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>No categories yet</Typography>
            <Typography variant="body2" sx={{ opacity: 0.6, mb: 4 }}>Load the starter deck or create your first card to begin.</Typography>
            <Button variant="outlined" onClick={handleLoadStarter} startIcon={<Zap size={18} />}>
              Load Starter Deck
            </Button>
          </Box>
        ) : (
          categories.map(category => {
            const categoryCards = cards.filter(c => c.category === category);
            const categoryMastered = categoryCards.filter(c => c.difficulty === 'Easy' || c.difficulty === 'Good').length;
            const progress = (categoryMastered / categoryCards.length) * 100;
            const categoryDue = categoryCards.filter(c => !c.due_date || new Date(c.due_date) <= now).length;

            return (
              <Box key={category} component={motion.div} variants={item}>
                <Card sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    '& .arrow-icon': { transform: 'translateX(4px)' }
                  }
                }}>
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>{category}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                      <Typography variant="body2" sx={{ opacity: 0.6, fontWeight: 600 }}>{categoryCards.length} cards</Typography>
                      {categoryDue > 0 && (
                        <Box sx={{ px: 1, py: 0.25, borderRadius: '6px', bgcolor: 'warning.main', color: 'warning.contrastText', fontSize: '0.7rem', fontWeight: 800 }}>
                          {categoryDue} DUE
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.5 }}>Mastery</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.5 }}>{Math.round(progress)}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      component={Link}
                      href={`/study/${encodeURIComponent(category)}`}
                      endIcon={<ArrowRight size={18} className="arrow-icon transition-transform" />}
                      sx={{
                        justifyContent: 'space-between',
                        px: 2,
                        py: 1.5,
                        borderRadius: '12px',
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--glass-border)',
                        '&:hover': {
                          bgcolor: 'primary.main',
                          color: 'white',
                          borderColor: 'primary.main',
                        }
                      }}
                    >
                      Study Now
                    </Button>
                  </CardActions>
                </Card>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
}
