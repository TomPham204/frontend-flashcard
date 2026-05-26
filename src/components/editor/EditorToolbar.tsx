import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import CodeIcon from '@mui/icons-material/Code';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import LinkIcon from '@mui/icons-material/Link';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

type MarkdownAction = 'bold' | 'italic' | 'code' | 'codeblock' | 'link' | 'list';

interface EditorToolbarProps {
    onFormat: (action: MarkdownAction) => void;
}

export const EditorToolbar = React.memo(({ onFormat }: EditorToolbarProps) => {
    return (
        <Box sx={{ display: 'flex', gap: 0.5, p: 0.5, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Tooltip title="Bold (Ctrl+B)">
                <IconButton size="small" onClick={() => onFormat('bold')}><FormatBoldIcon fontSize="small" /></IconButton>
            </Tooltip>
            <Tooltip title="Italic (Ctrl+I)">
                <IconButton size="small" onClick={() => onFormat('italic')}><FormatItalicIcon fontSize="small" /></IconButton>
            </Tooltip>
            <Tooltip title="Inline Code">
                <IconButton size="small" onClick={() => onFormat('code')}><CodeIcon fontSize="small" /></IconButton>
            </Tooltip>
            <Tooltip title="Code Block">
                <IconButton size="small" onClick={() => onFormat('codeblock')}><IntegrationInstructionsIcon fontSize="small" /></IconButton>
            </Tooltip>
            <Tooltip title="Link">
                <IconButton size="small" onClick={() => onFormat('link')}><LinkIcon fontSize="small" /></IconButton>
            </Tooltip>
            <Tooltip title="Bullet List">
                <IconButton size="small" onClick={() => onFormat('list')}><FormatListBulletedIcon fontSize="small" /></IconButton>
            </Tooltip>
        </Box>
    );
});

EditorToolbar.displayName = 'EditorToolbar';
