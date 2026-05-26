import { useEffect, useRef, useState, useCallback } from 'react';
import debounce from 'lodash.debounce';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useAutosave<T>(
    draft: T,
    initialData: T | undefined,
    saveFn: (data: T) => Promise<void>,
    isEqual: (a: T, b: T) => boolean,
    debounceMs: number = 2000
) {
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Track previous to see if changed
    const draftRef = useRef(draft);
    draftRef.current = draft;

    const initialDataRef = useRef(initialData);
    initialDataRef.current = initialData;

    const debouncedSaveRef = useRef(
        debounce(async (currentDraft: T, onSaveComplete: () => void, onError: (e: any) => void) => {
            try {
                await saveFn(currentDraft);
                onSaveComplete();
            } catch (err: any) {
                onError(err);
            }
        }, debounceMs)
    );

    useEffect(() => {
        // If undefined or hasn't changed from original, or hasn't changed since last render, skip autosave
        if (!initialDataRef.current) return;
        if (isEqual(draft, initialDataRef.current)) {
            if (saveStatus !== 'idle') setSaveStatus('idle');
            return;
        }

        setSaveStatus('saving');
        setErrorMsg(null);

        debouncedSaveRef.current(
            draft,
            () => setSaveStatus('saved'),
            (err) => {
                setSaveStatus('error');
                setErrorMsg(err.message || 'Error saving data');
            }
        );

        return () => {
            // Need to cancel debounced calls when unmounting to prevent state updates on unmounted component
            debouncedSaveRef.current.cancel();
        };
    }, [draft, isEqual, saveStatus]);

    const forceSave = useCallback(async () => {
        debouncedSaveRef.current.cancel();
        setSaveStatus('saving');
        try {
            await saveFn(draftRef.current);
            setSaveStatus('saved');
        } catch (err: any) {
            setSaveStatus('error');
            setErrorMsg(err.message || 'Error saving data');
        }
    }, [saveFn]);

    return { saveStatus, errorMsg, forceSave };
}
