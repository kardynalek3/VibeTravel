import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Wand2 } from "lucide-react";
import { useNavigate } from "@/lib/hooks/useNavigate";
import GenerationLimitInfo from "./GenerationLimitInfo";

interface NoteActionsProps {
  noteId: string;
  isDraft: boolean;
  generationLimitInfo: {
    remainingGenerations: number;
    resetTime?: string;
  };
  onDelete: () => void;
  onGeneratePlan: () => void;
  isGenerating?: boolean;
  isDeleting?: boolean;
}

export default function NoteActions({
  noteId,
  isDraft,
  generationLimitInfo,
  onDelete,
  onGeneratePlan,
  isGenerating = false,
  isDeleting = false,
}: NoteActionsProps) {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleEdit = () => {
    navigate(`/notes/${noteId}/edit`);
  };

  const handleDelete = async () => {
    setIsDeleteDialogOpen(false);
    onDelete();
  };

  const canGeneratePlan = !isDraft && generationLimitInfo.remainingGenerations > 0;

  return (
    <>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-4">
          <Button variant="outline" onClick={handleEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Edytuj
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? "Usuwanie..." : "Usuń"}
          </Button>
        </div>

        {!isDraft && (
          <div className="flex items-center gap-4">
            <Button onClick={onGeneratePlan} disabled={!canGeneratePlan || isGenerating}>
              <Wand2 className="mr-2 h-4 w-4" />
              {isGenerating ? "Generowanie..." : "Generuj plan"}
              {canGeneratePlan && !isGenerating && (
                <span className="ml-2 text-xs">
                  ({generationLimitInfo.remainingGenerations} pozostało)
                </span>
              )}
            </Button>
            <GenerationLimitInfo {...generationLimitInfo} />
          </div>
        )}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć tę notatkę?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta akcja jest nieodwracalna. Notatka zostanie trwale usunięta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Usuń</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
