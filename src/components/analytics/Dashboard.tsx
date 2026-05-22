'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import {
    Trophy,
    Calendar,
    Layers,
    CheckCircle,
    Flame,
    TrendingUp,
    Clock
} from 'lucide-react';
import MetricCard from '@/components/analytics/MetricCard';
import { DailyReviewChart, CategoryDistributionChart } from '@/components/analytics/StudyCharts';
import RecentActivity from '@/components/analytics/RecentActivity';
import { getAnalyticsData } from '@/utils/analytics';
import Skeleton from '@mui/material/Skeleton';

export default function Dashboard() {
    const [data, setData] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        async function load() {
            try {
                const result = await getAnalyticsData();
                setData(result);
            } catch (error) {
                console.error('Failed to load analytics:', error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Skeleton variant="text" width={200} height={40} />
                    <Skeleton variant="text" width={300} height={20} />
                </Box>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                    gap: 3
                }}>
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} variant="rectangular" height={140} sx={{ borderRadius: '24px' }} />
                    ))}
                </Box>
            </Container>
        );
    }

    if (!data) return null;

    const { stats, dailyCounts, categoryDistribution, recentActivity } = data;

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ mb: 6 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.04em', mb: 1 }}>
                    Your Progress
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Tracking your learning journey and study performance.
                </Typography>
            </Box>

            {/* Highlights */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                gap: 3,
                mb: 4
            }}>
                <MetricCard
                    title="Study Streak"
                    value={`${stats.streak} Days`}
                    subtitle="Keep going!"
                    icon={Flame}
                    color="#ef4444"
                />
                <MetricCard
                    title="Reviewed Today"
                    value={stats.reviewsToday}
                    subtitle={`${stats.reviewsThisWeek} this week`}
                    icon={CheckCircle}
                    color="#10b981"
                />
                <MetricCard
                    title="Mastered Cards"
                    value={stats.masteredCards}
                    subtitle={`${((stats.masteredCards / (stats.totalCards || 1)) * 100).toFixed(0)}% of total`}
                    icon={Trophy}
                    color="#f59e0b"
                />
                <MetricCard
                    title="Success Rate"
                    value={`${stats.successRate.toFixed(1)}%`}
                    subtitle="Review accuracy"
                    icon={TrendingUp}
                    color="#6366f1"
                />
            </Box>

            {/* Main Charts area */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' },
                gap: 3
            }}>
                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 8' } }}>
                    <DailyReviewChart data={dailyCounts} />
                </Box>
                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
                    <CategoryDistributionChart data={categoryDistribution} />
                </Box>

                {/* secondary metrics */}
                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 3' } }}>
                    <MetricCard
                        title="Total Cards"
                        value={stats.totalCards}
                        icon={Layers}
                        color="#8b5cf6"
                    />
                </Box>
                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 3' } }}>
                    <MetricCard
                        title="Due Today"
                        value={stats.cardsDueToday}
                        icon={Clock}
                        color="#ec4899"
                    />
                </Box>

                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 6' } }}>
                    <RecentActivity activities={recentActivity} />
                </Box>
            </Box>
        </Container>
    );
}
