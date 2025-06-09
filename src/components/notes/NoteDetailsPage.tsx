import { useNoteDetails } from "@/components/notes/hooks/useNoteDetails";
import { useGenerationLimit } from "@/components/notes/hooks/useGenerationLimit";
import { useDeleteNote } from "@/components/notes/hooks/useDeleteNote";
import { useGeneratePlan } from "@/components/notes/hooks/useGeneratePlan";
import NoteHeader from "@/components/notes/NoteHeader";
import NoteContent from "@/components/notes/NoteContent";
import NoteActions from "@/components/notes/NoteActions";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface NoteDetailsPageProps {
  noteId: string;
}

export default function NoteDetailsPage({ noteId }: NoteDetailsPageProps) {
  const { isLoading: isLoadingNote, error: noteError, note } = useNoteDetails(noteId);
  const { remainingGenerations, resetTime, isLoading: isLoadingLimit } = useGenerationLimit();
  const { deleteNote, isDeleting } = useDeleteNote();
  const { generatePlan, isGenerating } = useGeneratePlan();

  const handleDelete = async () => {
    await deleteNote(noteId);
  };

  const handleGeneratePlan = async () => {
    if (!note || note.is_draft) return;
    await generatePlan(noteId);
  };

  if (isLoadingNote || isLoadingLimit) {
    return (
      <div className="space-y-8" data-testid="loading-skeleton">
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  }

  if (noteError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{noteError}</AlertDescription>
      </Alert>
    );
  }

  if (!note) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Nie znaleziono notatki.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <NoteHeader
        destination={note.destination}
        createdAt={note.created_at}
        updatedAt={note.updated_at}
        isDraft={note.is_draft}
      />
      <NoteContent note={note} />
      <NoteActions
        noteId={note.id}
        isDraft={note.is_draft}
        generationLimitInfo={{
          remainingGenerations,
          resetTime,
        }}
        onDelete={handleDelete}
        onGeneratePlan={handleGeneratePlan}
        isGenerating={isGenerating}
        isDeleting={isDeleting}
      />
    </div>
  );
}
