import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/db/supabase.client";
import type { NoteResponseDTO } from "@/types";
import { SegmentType, TransportType } from "@/types";

async function fetchNoteDetails(noteId: string): Promise<NoteResponseDTO> {
  const { data, error } = await supabase
    .from("notes")
    .select(
      `
      *,
      destination:destinations (
        id,
        city,
        country
      )
    `
    )
    .eq("id", noteId)
    .single();

  if (error) {
    throw new Error("Nie udało się pobrać notatki");
  }

  if (!data) {
    throw new Error("Notatka nie istnieje");
  }

  // Ensure non-null values for required fields
  if (!data.created_at || !data.id || !data.user_id || data.is_draft === null || !data.duration) {
    throw new Error("Nieprawidłowe dane notatki");
  }

  return {
    id: data.id,
    user_id: data.user_id,
    segment: data.segment ? (data.segment as SegmentType) : undefined,
    transport: data.transport ? (data.transport as TransportType) : undefined,
    duration: data.duration,
    attractions: data.attractions,
    is_draft: data.is_draft,
    created_at: data.created_at,
    updated_at: data.updated_at ?? data.created_at,
    deleted_at: data.deleted_at ?? undefined,
    destination: {
      id: data.destination.id,
      city: data.destination.city,
      country: data.destination.country,
    },
  };
}

export function useNoteDetails(noteId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["note", noteId],
    queryFn: () => fetchNoteDetails(noteId),
  });

  return {
    note: data,
    isLoading,
    error: error instanceof Error ? error.message : "Wystąpił nieznany błąd",
  };
}
