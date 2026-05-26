import React, { memo } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import MarkdownRenderer from '../markdown/MarkdownRenderer';

interface LivePreviewProps {
    question: string;
    answer: string;
}

export const LivePreview = memo(({ question, answer }: LivePreviewProps) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', overflowY: 'auto', p: 2 }}>
            <Paper elevation={0} variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="overline" color="text.secondary" gutterBottom>
                    Front (Question)
                </Typography>
                <Box sx={{ mt: 1 }}>
                    <MarkdownRenderer content={question || '*No question content*'} />
                </Box>
            </Paper>

            <Paper elevation={0} variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="overline" color="text.secondary" gutterBottom>
                    Back (Answer)
                </Typography>
                <Box sx={{ mt: 1 }}>
                    <MarkdownRenderer content={answer || '*No answer content*'} />
                </Box>
            </Paper>
        </Box>
    );
});

LivePreview.displayName = 'LivePreview';
