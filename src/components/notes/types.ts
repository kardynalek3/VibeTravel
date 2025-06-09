import type { NoteCreateDTO, SegmentType, TransportType } from '@/types';

export interface NoteFormData extends NoteCreateDTO {}

export interface NoteFormContext {
  isEditing: boolean;
  isDirty: boolean;
  setIsDirty: (value: boolean) => void;
  lastSavedDraft?: NoteFormData;
  setLastSavedDraft: (data?: NoteFormData) => void;
}

export interface DestinationOption {
  value: number;
  label: string;
  country: string;
}

export interface AutoSaveState {
  lastSaved: Date | null;
  isAutoSaving: boolean;
  error?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface NoteFormHeaderProps {
  title: string;
  onBack: () => void;
}

export interface UnsavedChangesDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface FormActionsProps {
  onSave: () => void;
  onSaveDraft: () => void;
  isSubmitting: boolean;
  isDraft: boolean;
}

export interface DestinationSearchProps {
  value: number;
  onChange: (value: number) => void;
  error?: string;
}

export interface SegmentSelectProps {
  value: SegmentType;
  onChange: (value: SegmentType) => void;
  error?: string;
}

export interface TransportSelectProps {
  value: TransportType;
  onChange: (value: TransportType) => void;
  error?: string;
}

export interface DurationSelectProps {
  value: number;
  onChange: (value: number) => void;
  error?: string;
}

export interface AttractionsTextareaProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
} 