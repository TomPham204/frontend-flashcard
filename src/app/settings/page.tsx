'use client';

import * as React from 'react';
import { useFlashcardStore } from '@/store/useFlashcardStore';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

export default function SettingsPage() {
  const { cards, importDeck, resetDeck } = useFlashcardStore();
  const [mounted, setMounted] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(cards, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `flashcards_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'Deck exported successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to export deck.' });
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedCards = JSON.parse(event.target?.result as string);
        if (Array.isArray(importedCards)) {
          importDeck(importedCards);
          setMessage({ type: 'success', text: `Successfully imported ${importedCards.length} cards.` });
        } else {
          throw new Error('Invalid format');
        }
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to parse JSON file. Ensure it is a valid flashcards export.' });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to delete all cards and progress? This cannot be undone.')) {
      resetDeck();
      setMessage({ type: 'success', text: 'Deck has been reset.' });
    }
  };

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Typography variant="h4" gutterBottom>Settings</Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 4 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 4 }}>
        <Box>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Data Management</Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>Export Data</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Download all your flashcards and study progress as a JSON file.
                </Typography>
                <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExport}>
                  Export JSON
                </Button>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>Import Data</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Upload a previously exported JSON file to restore your flashcards and progress.
                </Typography>
                <input
                  type="file"
                  accept=".json"
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                  onChange={handleImport}
                />
                <Button variant="outlined" startIcon={<FileUploadIcon />} onClick={() => fileInputRef.current?.click()}>
                  Import JSON
                </Button>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }} color="error" gutterBottom>Danger Zone</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Permanently delete all flashcards and study progress.
                </Typography>
                <Button variant="contained" color="error" startIcon={<DeleteForeverIcon />} onClick={handleReset}>
                  Reset Deck
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
