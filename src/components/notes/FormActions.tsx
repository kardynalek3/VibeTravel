import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FormActionsProps } from './types';
import { useNoteFormContext } from './NoteFormPage';

export default function FormActions({
  onSave,
  onSaveDraft,
  isSubmitting,
  isDraft,
}: FormActionsProps) {
  const { isDirty } = useNoteFormContext();

  return (
    <div className="flex items-center justify-end gap-4 pt-6">
      <Button
        type="button"
        variant="outline"
        onClick={onSaveDraft}
        disabled={isSubmitting || (!isDirty && !isDraft)}
      >
        {isSubmitting ? (
          <span className="inline-flex items-center gap-1">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Zapisywanie...
          </span>
        ) : (
          'Zapisz wersję roboczą'
        )}
      </Button>
      <Button
        type="submit"
        onClick={onSave}
        disabled={isSubmitting || !isDirty}
        className="inline-flex items-center gap-2"
      >
        {isSubmitting ? (
          <span className="inline-flex items-center gap-1">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Zapisywanie...
          </span>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Zapisz
          </>
        )}
      </Button>
    </div>
  );
} 