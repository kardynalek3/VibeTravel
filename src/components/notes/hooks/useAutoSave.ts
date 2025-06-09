import { useState, useEffect, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import type { NoteFormData, AutoSaveState } from '../types';
import { useNoteFormContext } from '../NoteFormPage';
import { NotesService } from '@/lib/services/notes';

const AUTOSAVE_DELAY = 5000; // 5 seconds

export function useAutoSave(noteId?: string) {
  const form = useFormContext<NoteFormData>();
  const { isDirty, setIsDirty, setLastSavedDraft } = useNoteFormContext();
  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>({
    lastSaved: null,
    isAutoSaving: false,
  });

  const saveDraft = useCallback(async () => {
    if (!isDirty) return;

    const data = form.getValues();
    const draftData = { ...data, is_draft: true };

    try {
      setAutoSaveState((prev) => ({ ...prev, isAutoSaving: true }));
      
      if (noteId) {
        await NotesService.update(noteId, draftData);
      } else {
        const newNote = await NotesService.create(draftData);
        // Aktualizujemy URL po utworzeniu nowej notatki
        window.history.replaceState(null, '', `/notes/${newNote.id}/edit`);
      }

      setLastSavedDraft(draftData);
      setIsDirty(false);
      setAutoSaveState((prev) => ({
        ...prev,
        lastSaved: new Date(),
        isAutoSaving: false,
      }));
    } catch (error) {
      console.error('Error auto-saving draft:', error);
      toast.error('Nie udało się automatycznie zapisać wersji roboczej');
      setAutoSaveState((prev) => ({
        ...prev,
        isAutoSaving: false,
        error: 'Błąd automatycznego zapisywania',
      }));
    }
  }, [form, isDirty, setIsDirty, setLastSavedDraft, noteId]);

  useEffect(() => {
    if (!isDirty) return;

    const timeoutId = setTimeout(saveDraft, AUTOSAVE_DELAY);
    return () => clearTimeout(timeoutId);
  }, [isDirty, saveDraft]);

  return autoSaveState;
} 