import { useCallback, useEffect, useState } from 'react';
import { useBeforeUnload } from '../../../lib/hooks/useBeforeUnload';

export interface UseUnsavedChangesWarningProps {
  isDirty: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface UseUnsavedChangesWarningResult {
  showWarning: boolean;
  handleNavigationAttempt: () => void;
}

export function useUnsavedChangesWarning({
  isDirty,
  onConfirm,
  onCancel,
}: UseUnsavedChangesWarningProps): UseUnsavedChangesWarningResult {
  const [showWarning, setShowWarning] = useState(false);

  // Add beforeunload event listener
  useBeforeUnload(isDirty);

  // Handle navigation attempt
  const handleNavigationAttempt = useCallback(() => {
    if (isDirty) {
      setShowWarning(true);
    } else {
      onConfirm();
    }
  }, [isDirty, onConfirm]);

  // Handle dialog confirmation
  useEffect(() => {
    if (!showWarning) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowWarning(false);
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showWarning, onCancel]);

  return {
    showWarning,
    handleNavigationAttempt,
  };
} 