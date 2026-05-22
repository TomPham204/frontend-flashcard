'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import { CheckCircle2, XCircle, AlertCircle, Sparkles } from 'lucide-react';

interface Activity {
    id: string;
    rating: string;
    reviewed_at: string;
    card?: {
        question: string;
    };
}

interface RecentActivityProps {
    activities: Activity[];
}

const RATING_ICONS: Record<string, any> = {
    Again: { icon: XCircle, color: '#ef4444' },
    Hard: { icon: AlertCircle, color: '#f59e0b' },
    Good: { icon: CheckCircle2, color: '#10b981' },
    Easy: { icon: Sparkles, color: '#6366f1' },
};

export default function RecentActivity({ activities }: RecentActivityProps) {
    if (activities.length === 0) {
        return (
            <Card sx={{ p: 4, textAlign: 'center', borderRadius: '24px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}>
                <Typography color="text.secondary">No recent study activity.</Typography>
            </Card>
        );
    }

    return (
        <Card sx={{ borderRadius: '24px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid var(--glass-border)' }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Recent Activity</Typography>
            </Box>
            <Box>
                {activities.map((activity, index) => {
                    const { icon: Icon, color } = RATING_ICONS[activity.rating] || { icon: CheckCircle2, color: '#ccc' };
                    return (
                        <Box
                            key={activity.id}
                            sx={{
                                p: 2.5,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                borderBottom: index === activities.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' }
                            }}
                        >
                            <Avatar sx={{ bgcolor: `${color}15`, color: color }}>
                                <Icon size={18} />
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                    Reviewed card
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', opacity: 0.7 }}>
                                    {new Date(activity.reviewed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {activity.rating}
                                </Typography>
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        </Card>
    );
}
