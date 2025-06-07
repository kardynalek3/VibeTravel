import type { SupabaseClient } from "@supabase/supabase-js";
import type { NoteCreateDTO, NoteResponseDTO } from "../../types.ts";

/**
 * Serwis do obsługi notatek
 * Zawiera metody do tworzenia, pobierania, aktualizacji i usuwania notatek
 */
export class NotesService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Tworzy nową notatkę dla użytkownika
   * @param userId - ID zalogowanego użytkownika
   * @param noteData - Dane notatki do utworzenia
   * @returns Utworzona notatka z informacjami o miejscu docelowym
   * @throws Error jeśli miejsce docelowe nie istnieje lub wystąpił błąd podczas tworzenia notatki
   */
  async createNote(userId: string, noteData: NoteCreateDTO): Promise<NoteResponseDTO> {
    // 1. Sprawdź, czy miejsce docelowe istnieje
    const { data: destination, error: destinationError } = await this.supabase
      .from("destinations")
      .select("id, city, country")
      .eq("id", noteData.destination_id)
      .single();

    if (destinationError || !destination) {
      throw new Error(`Nie znaleziono miejsca docelowego o ID: ${noteData.destination_id}`);
    }

    // 2. Utwórz nową notatkę
    const { data: note, error: noteError } = await this.supabase
      .from("notes")
      .insert({
        user_id: userId,
        ...noteData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select(
        "id, user_id, segment, transport, duration, attractions, is_draft, created_at, updated_at"
      )
      .single();

    if (noteError || !note) {
      throw new Error(`Nie udało się utworzyć notatki: ${noteError?.message || "Nieznany błąd"}`);
    }

    // 3. Przygotuj odpowiedź w formacie NoteResponseDTO
    return {
      ...note,
      destination: {
        city: destination.city,
        country: destination.country,
      },
    };
  }
}
