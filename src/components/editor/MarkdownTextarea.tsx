import React, { forwardRef, KeyboardEvent } from 'react';
import { TextField, Box, Typography } from '@mui/material';

interface MarkdownTextareaProps {
    label: string;
    value: string;
    onChange: (val: string) => void;
    onSave?: () => void;
}

export const MarkdownTextarea = forwardRef<HTMLTextAreaElement, MarkdownTextareaProps>(
    ({ label, value, onChange, onSave }, ref) => {
        const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
            // Save Shortcut
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                onSave?.();
                return;
            }

            // Tab handling
            if (e.key === 'Tab') {
                e.preventDefault();
                const textarea = e.target as HTMLTextAreaElement;
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const newValue = value.substring(0, start) + '  ' + value.substring(end);
                onChange(newValue);

                setTimeout(() => {
                    textarea.setSelectionRange(start + 2, start + 2);
                }, 0);
            }
        };

        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Typography variant="overline" color="text.secondary" sx={{ px: 2, pt: 1 }}>
                    {label}
                </Typography>
                <TextField
                    inputRef={ref}
                    multiline
                    fullWidth
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    slotProps={{
                        input: {
                            disableUnderline: true,
                            style: { alignItems: 'flex-start', fontFamily: 'monospace', fontSize: '0.9rem' }
                        }
                    }}
                    sx={{
                        flexGrow: 1,
                        '& .MuiInputBase-root': { height: '100%', padding: 2 },
                        '& .MuiInputBase-input': { height: '100% !important', overflowY: 'auto !important' },
                        '& fieldset': { border: 'none' }
                    }}
                />
            </Box>
        );
    }
);

MarkdownTextarea.displayName = 'MarkdownTextarea';
