import React from 'react';
import { Box, TextField, Typography, MenuItem, Paper } from '@mui/material';

interface EditorSidebarProps {
    tags: string;
    setTags: (t: string) => void;
}

export const EditorSidebar = React.memo(({ tags, setTags }: EditorSidebarProps) => {
    return (
        <Paper elevation={0} variant="outlined" sx={{ p: 2, height: '100%', bgcolor: 'background.default', borderRight: 0, borderTop: 0, borderBottom: 0, borderRadius: 0 }}>
            <Typography variant="overline" color="text.secondary" gutterBottom>
                Metadata
            </Typography>

            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                    label="Tags (comma separated)"
                    variant="outlined"
                    size="small"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    fullWidth
                    helperText="E.g. react, hooks, frontend"
                />

            </Box>
        </Paper>
    );
});

EditorSidebar.displayName = 'EditorSidebar';
