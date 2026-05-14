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

export default function Dashboard() {
  const { cards, loadStarterDeck, migrateIfNeeded, loading } = useFlashcardStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    migrateIfNeeded();
  }, [migrateIfNeeded]);

  if (!mounted || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  // Calculate statistics
  const categories = Array.from(new Set(cards.map(c => c.category)));
  const totalCards = cards.length;
  const masteredCards = cards.filter(c => c.difficulty === 'Easy' || c.difficulty === 'Good').length;

  // Calculate today's due cards (simplified)
  const now = new Date();
  const dueCards = cards.filter(c => !c.next_review_at || new Date(c.next_review_at) <= now).length;

  const handleLoadStarter = () => {
    loadStarterDeck();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Welcome back!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You have {dueCards} cards due for review today.
          </Typography>
        </Box>
        {totalCards === 0 && (
          <Button variant="contained" color="primary" onClick={handleLoadStarter}>
            Load Starter Deck
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3, mb: 6 }}>
        <Box>
          <Card sx={{ bgcolor: 'primary.dark', color: 'primary.contrastText', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ opacity: 0.8 }}>Total Cards</Typography>
              <Typography variant="h3">{totalCards}</Typography>
            </CardContent>
          </Card>
        </Box>
        <Box>
          <Card sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ opacity: 0.8 }}>Mastered</Typography>
              <Typography variant="h3">{masteredCards}</Typography>
            </CardContent>
          </Card>
        </Box>
        <Box>
          <Card sx={{ bgcolor: 'background.paper', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="text.secondary">Overall Progress</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress variant="determinate" value={totalCards ? (masteredCards / totalCards) * 100 : 0} sx={{ height: 10, borderRadius: 5 }} />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" color="text.secondary">{totalCards ? Math.round((masteredCards / totalCards) * 100) : 0}%</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Study Categories
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
        {categories.length === 0 ? (
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Typography color="text.secondary">No categories found. Create cards or load the starter deck.</Typography>
          </Box>
        ) : (
          categories.map(category => {
            const categoryCards = cards.filter(c => c.category === category);
            const categoryMastered = categoryCards.filter(c => c.difficulty === 'Easy' || c.difficulty === 'Good').length;
            const progress = (categoryMastered / categoryCards.length) * 100;
            const categoryDue = categoryCards.filter(c => !c.next_review_at || new Date(c.next_review_at) <= now).length;

            return (
              <Box key={category}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>{category}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">{categoryCards.length} cards</Typography>
                      <Typography variant="body2" color={categoryDue > 0 ? 'warning.main' : 'text.secondary'}>
                        {categoryDue} due
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={progress} sx={{ mt: 2, mb: 1, height: 6, borderRadius: 3 }} />
                    <Typography variant="caption" color="text.secondary">{Math.round(progress)}% mastered</Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" component={Link} href={`/study/${encodeURIComponent(category)}`}>
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
