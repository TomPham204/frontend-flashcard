import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    color: string;
}

export default function MetricCard({ title, value, subtitle, icon: Icon, color }: MetricCardProps) {
    return (
        <Card sx={{
            p: 3,
            height: '100%',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--glass-border)',
            borderRadius: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            transition: 'transform 0.2s ease-in-out, border-color 0.2s',
            '&:hover': {
                transform: 'translateY(-4px)',
                borderColor: color
            }
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: '0.1em' }}>
                    {title}
                </Typography>
                <Box sx={{
                    p: 1,
                    borderRadius: '12px',
                    bgcolor: `${color}15`,
                    color: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Icon size={20} />
                </Box>
            </Box>

            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: 'text.primary' }}>
                {value}
            </Typography>

            {subtitle && (
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', opacity: 0.8 }}>
                    {subtitle}
                </Typography>
            )}
        </Card>
    );
}
