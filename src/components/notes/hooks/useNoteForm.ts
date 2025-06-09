import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SegmentType, TransportType } from "@/types";
import type { NoteCreateDTO, NoteResponseDTO } from "@/types";

const noteFormSchema = z.object({
  destination_id: z.number().min(1, "Wybierz miejsce docelowe"),
  segment: z.nativeEnum(SegmentType, {
    required_error: "Wybierz segment podróży",
  }),
  transport: z.nativeEnum(TransportType, {
    required_error: "Wybierz środek transportu",
  }),
  duration: z
    .number()
    .min(1, "Wybierz długość wycieczki")
    .max(5, "Długość wycieczki nie może przekraczać 5 dni"),
  attractions: z
    .string()
    .min(1, "Opisz atrakcje")
    .max(5000, "Opis atrakcji nie może przekraczać 5000 znaków"),
  is_draft: z.boolean(),
});

export type NoteFormData = z.infer<typeof noteFormSchema>;

interface UseNoteFormProps {
  initialData?: NoteResponseDTO;
  onSubmit: (data: NoteCreateDTO) => Promise<void>;
  onDraftSave: (data: NoteCreateDTO) => Promise<void>;
}

export function useNoteForm({ initialData, onSubmit, onDraftSave }: UseNoteFormProps) {
  const defaultValues: Partial<NoteFormData> = {
    destination_id: initialData?.destination.id,
    segment: initialData?.segment,
    transport: initialData?.transport,
    duration: initialData?.duration,
    attractions: initialData?.attractions,
    is_draft: initialData?.is_draft ?? false,
  };

  const form = useForm<NoteFormData>({
    resolver: zodResolver(noteFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const handleSubmit = form.handleSubmit(async data => {
    try {
      await onSubmit(data);
    } catch (error) {
      // Handle error (can be extended based on error handling requirements)
      console.error("Failed to submit form:", error);
    }
  });

  const handleDraftSave = async (data: NoteFormData) => {
    try {
      const draftData = { ...data, is_draft: true };
      await onDraftSave(draftData);
    } catch (error) {
      console.error("Failed to save draft:", error);
    }
  };

  return {
    form,
    handleSubmit,
    handleDraftSave,
    isValid: form.formState.isValid,
    isDirty: form.formState.isDirty,
    isSubmitting: form.formState.isSubmitting,
    errors: form.formState.errors,
  };
}
