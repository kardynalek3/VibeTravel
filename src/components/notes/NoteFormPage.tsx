import { createContext, useContext, useState } from 'react';
import { useNavigate } from '@/lib/hooks/useNavigate';
import type { NoteFormData, NoteFormContext as NoteFormContextType } from './types';
import type { NoteFormHeaderProps } from '@/components/notes/types';
import type { UnsavedChangesDialogProps } from '@/components/notes/types';
import { default as NoteFormHeader } from '@/components/notes/NoteFormHeader';
import { default as NoteForm } from '@/components/notes/NoteForm';
import { default as UnsavedChangesDialog } from '@/components/notes/UnsavedChangesDialog';

interface NoteFormPageProps {
  noteId?: string;
}

export const NoteFormContext = createContext<NoteFormContextType | null>(null);

export const useNoteFormContext = () => {
  const context = useContext(NoteFormContext);
  if (!context) {
    throw new Error('useNoteFormContext must be used within a NoteFormProvider');
  }
  return context;
};

export default function NoteFormPage({ noteId }: NoteFormPageProps) {
  const navigate = useNavigate();
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [lastSavedDraft, setLastSavedDraft] = useState<NoteFormData | undefined>();

  const handleBack = () => {
    if (isDirty) {
      setShowUnsavedDialog(true);
    } else {
      navigate('/notes');
    }
  };

  const handleConfirmLeave = () => {
    setShowUnsavedDialog(false);
    navigate('/notes');
  };

  const handleCancelLeave = () => {
    setShowUnsavedDialog(false);
  };

  return (
    <NoteFormContext.Provider
      value={{
        isEditing: !!noteId,
        isDirty,
        setIsDirty,
        lastSavedDraft,
        setLastSavedDraft,
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <NoteFormHeader
          title={noteId ? 'Edit Note' : 'New Note'}
          onBack={handleBack}
        />
        <div className="mt-8">
          <NoteForm noteId={noteId} />
        </div>
      </div>
      <UnsavedChangesDialog
        isOpen={showUnsavedDialog}
        onConfirm={handleConfirmLeave}
        onCancel={handleCancelLeave}
      />
    </NoteFormContext.Provider>
  );
} 