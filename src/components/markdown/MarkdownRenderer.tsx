import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CodeBlock from './CodeBlock';
import 'highlight.js/styles/github-dark.css';
import './markdown.css';

interface MarkdownRendererProps {
    content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
    return (
        <Box className="markdown-body" sx={{ textAlign: 'left', width: '100%' }}>
            <ReactMarkdown
                rehypePlugins={[rehypeHighlight]}
                components={{
                    code: CodeBlock as any,
                    h1: ({ node, ...props }) => <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, mt: 2 }} {...props} />,
                    h2: ({ node, ...props }) => <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mt: 2 }} {...props} />,
                    h3: ({ node, ...props }) => <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mt: 1 }} {...props} />,
                    p: ({ node, ...props }) => <Typography variant="body1" sx={{ mb: 1, lineHeight: 1.6 }} {...props} />,
                    a: ({ node, ...props }) => <a style={{ color: '#6366f1', textDecoration: 'none' }} target="_blank" rel="noopener noreferrer" {...props} />,
                }}
            >
                {content}
            </ReactMarkdown>
        </Box>
    );
}
