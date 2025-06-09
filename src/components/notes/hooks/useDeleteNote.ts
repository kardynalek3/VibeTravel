import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/db/supabase.client";
import { useNavigate } from "@/lib/hooks/useNavigate";
import { toast } from "sonner";

async function deleteNote(noteId: string) {
  const { error } = await supabase.from("notes").delete().eq("id", noteId);

  if (error) {
    throw new Error("Nie udało się usunąć notatki");
  }
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate, isPending: isDeleting } = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Notatka została usunięta");
      navigate("/notes");
    },
    onError: error => {
      toast.error(
        error instanceof Error ? error.message : "Wystąpił błąd podczas usuwania notatki"
      );
    },
  });

  return {
    deleteNote: mutate,
    isDeleting,
  };
}
