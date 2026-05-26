import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Box, Button, Paper, Divider, Typography, Tab, Tabs } from '@mui/material';
import { EditorToolbar } from './EditorToolbar';
import { MarkdownTextarea } from './MarkdownTextarea';
import { LivePreview } from './LivePreview';
import { EditorSidebar } from './EditorSidebar';
import { useAutosave } from '@/hooks/useAutosave';
import { useMarkdownFormatter } from '@/hooks/useMarkdownFormatter';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircularProgress from '@mui/material/CircularProgress';
import ErrorIcon from '@mui/icons-material/Error';

export interface CardDraft {
    question: string;
    answer: string;
    tags: string;
}

interface CardEditorProps {
    initialData: CardDraft;
    onSave: (data: CardDraft) => Promise<void>;
    onClose: () => void;
}

export const CardEditor = ({ initialData, onSave, onClose }: CardEditorProps) => {
    const [draft, setDraft] = useState<CardDraft>(initialData);
    const [activeTab, setActiveTab] = useState<'question' | 'answer'>('question');
    const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit');

    const questionRef = useRef<HTMLTextAreaElement>(null);
    const answerRef = useRef<HTMLTextAreaElement>(null);

    const activeRef = activeTab === 'question' ? questionRef : answerRef;

    const { applyFormatting } = useMarkdownFormatter(activeRef, (newVal) => {
        setDraft((prev) => ({ ...prev, [activeTab]: newVal }));
    });

    const { saveStatus, forceSave } = useAutosave(
        draft,
        initialData,
        onSave,
        (a, b) => JSON.stringify(a) === JSON.stringify(b),
        2000
    );

    const handleSaveAndClose = async () => {
        await forceSave();
        onClose();
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '80vh', minHeight: 600 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h6">Edit Flashcard</Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', fontSize: '0.875rem' }}>
                        {saveStatus === 'saving' && <><CircularProgress size={16} /> Saving...</>}
                        {saveStatus === 'saved' && <><CheckCircleIcon fontSize="small" color="success" /> Saved</>}
                        {saveStatus === 'error' && <><ErrorIcon fontSize="small" color="error" /> Error saving</>}
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button onClick={onClose} color="inherit">Close</Button>
                    <Button onClick={handleSaveAndClose} variant="contained" disabled={saveStatus === 'saving'}>
                        Done
                    </Button>
                </Box>
            </Box>

            {/* Main Layout Area */}
            <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>

                {/* Editor Pane */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, borderRight: 1, borderColor: 'divider' }}>
                    <EditorToolbar onFormat={applyFormatting} />

                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                            <Tab label="Question" value="question" />
                            <Tab label="Answer" value="answer" />
                        </Tabs>
                    </Box>

                    <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                        {activeTab === 'question' && (
                            <MarkdownTextarea
                                ref={questionRef}
                                label="Front of card (Markdown supported)"
                                value={draft.question}
                                onChange={(val) => setDraft({ ...draft, question: val })}
                                onSave={forceSave}
                            />
                        )}
                        {activeTab === 'answer' && (
                            <MarkdownTextarea
                                ref={answerRef}
                                label="Back of card (Markdown supported)"
                                value={draft.answer}
                                onChange={(val) => setDraft({ ...draft, answer: val })}
                                onSave={forceSave}
                            />
                        )}
                    </Box>
                </Box>

                {/* Live Preview Pane */}
                <Box sx={{ flex: 1, minWidth: 0, bgcolor: 'grey.50', display: { xs: 'none', md: 'block' } }}>
                    <LivePreview question={draft.question} answer={draft.answer} />
                </Box>

                {/* Sidebar Pane */}
                <Box sx={{ width: 250, flexShrink: 0, display: { xs: 'none', lg: 'block' } }}>
                    <EditorSidebar
                        tags={draft.tags}
                        setTags={(val) => setDraft({ ...draft, tags: val })}
                    />
                </Box>

            </Box>
        </Box>
    );
};
