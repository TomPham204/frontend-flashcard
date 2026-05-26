import { RefObject, useCallback } from 'react';

type MarkdownAction = 'bold' | 'italic' | 'code' | 'codeblock' | 'link' | 'list';

export function useMarkdownFormatter(
    textareaRef: RefObject<HTMLTextAreaElement | null>,
    onChange: (value: string) => void
) {
    const applyFormatting = useCallback((action: MarkdownAction) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value;
        const selectedText = value.substring(start, end);

        let insertBefore = '';
        let insertAfter = '';
        let cursorOffset = 0;

        switch (action) {
            case 'bold':
                insertBefore = '**';
                insertAfter = '**';
                cursorOffset = 2;
                break;
            case 'italic':
                insertBefore = '_';
                insertAfter = '_';
                cursorOffset = 1;
                break;
            case 'code':
                insertBefore = '`';
                insertAfter = '`';
                cursorOffset = 1;
                break;
            case 'codeblock':
                insertBefore = '\n```\n';
                insertAfter = '\n```\n';
                cursorOffset = 4;
                break;
            case 'link':
                insertBefore = '[';
                insertAfter = '](url)';
                cursorOffset = 1;
                break;
            case 'list':
                insertBefore = '\n- ';
                insertAfter = '';
                cursorOffset = 3;
                break;
        }

        const newValue =
            value.substring(0, start) +
            insertBefore +
            selectedText +
            insertAfter +
            value.substring(end);

        onChange(newValue);

        // Focus and adjust cursor positioning
        setTimeout(() => {
            textarea.focus();
            if (selectedText) {
                textarea.setSelectionRange(start, start + insertBefore.length + selectedText.length + insertAfter.length);
            } else {
                textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
            }
        }, 0);
    }, [textareaRef, onChange]);

    return { applyFormatting };
}
