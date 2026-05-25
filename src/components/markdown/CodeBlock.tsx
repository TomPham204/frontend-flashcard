import React, { useState, ReactNode } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

interface CodeBlockProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: ReactNode;
  [key: string]: any;
}

export default function CodeBlock({ inline, className, children, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';

  if (!inline && match) {
    const codeString = String(children).replace(/\n$/, '');
    
    const handleCopy = (e: React.MouseEvent) => {
      e.stopPropagation(); // prevent flipping the flashcard
      navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <Box 
        sx={{ 
          position: 'relative', 
          borderRadius: 2, 
          overflow: 'hidden', 
          my: 2,
          border: '1px solid rgba(255,255,255,0.1)' 
        }}
        onClick={(e) => e.stopPropagation()} // Prevent card flip when clicking code
      >
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            bgcolor: 'rgba(0,0,0,0.5)', 
            px: 2, 
            py: 0.5 
          }}
        >
          <span style={{ color: '#aaa', fontSize: '0.75rem', fontFamily: 'monospace' }}>
            {language}
          </span>
          <Tooltip title={copied ? "Copied!" : "Copy code"}>
            <IconButton size="small" onClick={handleCopy} sx={{ color: 'white' }}>
              {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ overflowX: 'auto', p: 2, bgcolor: '#0d1117', textAlign: 'left' }}>
          <code className={className} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }} {...props}>
            {children}
          </code>
        </Box>
      </Box>
    );
  }
  
  return (
    <code className={className} {...props}>
      {children}
    </code>
  );
}
