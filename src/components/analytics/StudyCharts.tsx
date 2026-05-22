'use client';

import * as React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
} from 'recharts';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface DailyChartProps {
    data: { date: string; count: number }[];
}

export function DailyReviewChart({ data }: DailyChartProps) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const tickColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
    const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    const cursorColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    const tooltipBg = isDark ? '#1e1e1e' : '#ffffff';
    const tooltipBorder = isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)';
    const tooltipColor = isDark ? '#fff' : '#000';

    return (
        <Card sx={{ p: 3, borderRadius: '24px', bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: '1px solid var(--glass-border)', height: 350, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Daily Activity</Typography>
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: tickColor, fontSize: 12 }}
                            tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { weekday: 'short' })}
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 12 }} />
                        <Tooltip
                            cursor={{ fill: cursorColor }}
                            contentStyle={{
                                backgroundColor: tooltipBg,
                                border: tooltipBorder,
                                borderRadius: '12px',
                                color: tooltipColor,
                            }}
                        />
                        <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </Card>
    );
}

interface DistributionChartProps {
    data: { name: string; value: number }[];
}

export function CategoryDistributionChart({ data }: DistributionChartProps) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const tooltipBg = isDark ? '#1e1e1e' : '#ffffff';
    const tooltipBorder = isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)';
    const tooltipColor = isDark ? '#fff' : '#000';

    return (
        <Card sx={{ p: 3, borderRadius: '24px', bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: '1px solid var(--glass-border)', height: 350, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Mastery by Category</Typography>
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.1)" />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: tooltipBg,
                                border: tooltipBorder,
                                borderRadius: '12px',
                                color: tooltipColor,
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center', mt: 2, maxHeight: '80px', overflowY: 'auto' }}>
                {data.map((entry, index) => (
                    <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS[index % COLORS.length], flexShrink: 0 }} />
                        <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.6, whiteSpace: 'nowrap' }}>{entry.name}</Typography>
                    </Box>
                ))}
            </Box>
        </Card>
    );
}
