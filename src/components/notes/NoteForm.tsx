import { useEffect } from "react";
import { Form } from "@/components/ui/form";
import type { NoteFormData } from "./types";
import { useNoteFormContext } from "./NoteFormPage";
import DestinationSearch from "./DestinationSearch";
import SegmentSelect from "./SegmentSelect";
import TransportSelect from "./TransportSelect";
import DurationSelect from "./DurationSelect";
import AttractionsTextarea from "./AttractionsTextarea";
import FormActions from "./FormActions";
import { toast } from "sonner";
import { NotesService } from "@/lib/services/notes";
import { useAutoSave } from "./hooks/useAutoSave";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SegmentType, TransportType } from "@/types";

const noteFormSchema = z.object({
  destination_id: z.coerce.number().min(1, "Wybierz miejsce docelowe"),
  segment: z.nativeEnum(SegmentType, {
    required_error: "Wybierz segment podróży",
  }),
  transport: z.nativeEnum(TransportType, {
    required_error: "Wybierz środek transportu",
  }),
  duration: z.coerce
    .number()
    .min(1, "Wybierz długość wycieczki")
    .max(5, "Długość wycieczki nie może przekraczać 5 dni"),
  attractions: z
    .string()
    .min(1, "Opisz atrakcje")
    .max(5000, "Opis atrakcji nie może przekraczać 5000 znaków"),
  is_draft: z.boolean(),
});

type NoteFormSchema = z.infer<typeof noteFormSchema>;

interface NoteFormProps {
  noteId?: string;
}

export default function NoteForm({ noteId }: NoteFormProps) {
  const { setIsDirty, setLastSavedDraft } = useNoteFormContext();

  const form = useForm<NoteFormSchema>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      destination_id: undefined,
      segment: undefined,
      transport: undefined,
      duration: undefined,
      attractions: "",
      is_draft: false,
    },
    mode: "onSubmit",
  });

  useEffect(() => {
    if (noteId) {
      NotesService.getById(noteId).then(note => {
        if (note) {
          form.reset({
            destination_id: note.destination.id,
            segment: note.segment || SegmentType.Family,
            transport: note.transport || TransportType.Car,
            duration: note.duration,
            attractions: note.attractions,
            is_draft: note.is_draft,
          });
        }
      });
    }
  }, [noteId, form]);

  const onSubmit = async (data: NoteFormSchema) => {
    try {
      const submitData: NoteFormData = {
        destination_id: data.destination_id,
        segment: data.segment,
        transport: data.transport,
        duration: data.duration,
        attractions: data.attractions,
        is_draft: false,
      };

      if (noteId) {
        await NotesService.update(noteId, submitData);
      } else {
        await NotesService.create(submitData);
      }
      toast.success("Notatka została zapisana");
      setIsDirty(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Nie udało się zapisać notatki. Spróbuj ponownie.");
    }
  };

  const onDraftSave = async (data: NoteFormSchema) => {
    try {
      const draftData: NoteFormData = {
        destination_id: data.destination_id,
        segment: data.segment || SegmentType.Family,
        transport: data.transport || TransportType.Car,
        duration: data.duration || 1,
        attractions: data.attractions,
        is_draft: true,
      };

      if (noteId) {
        await NotesService.update(noteId, draftData);
      } else {
        await NotesService.create(draftData);
      }
      toast.success("Wersja robocza została zapisana");
      setIsDirty(false);
      setLastSavedDraft(draftData);
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Nie udało się zapisać wersji roboczej. Spróbuj ponownie.");
    }
  };

  useAutoSave(noteId);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-8 md:grid-cols-2">
          <DestinationSearch />
          <div className="grid gap-8 md:grid-cols-2">
            <SegmentSelect />
            <TransportSelect />
          </div>
          <DurationSelect />
        </div>
        <AttractionsTextarea />
        <FormActions
          onSave={form.handleSubmit(onSubmit)}
          onSaveDraft={form.handleSubmit(onDraftSave)}
          isSubmitting={form.formState.isSubmitting}
          isDraft={form.getValues().is_draft}
        />
      </form>
    </Form>
  );
}
