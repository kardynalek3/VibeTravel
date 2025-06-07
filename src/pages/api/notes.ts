import type { APIRoute } from "astro";
import { noteCreateSchema } from "../../lib/schemas/note.schema";
import { NotesService } from "../../lib/services/notes.service";

/**
 * Endpoint do tworzenia nowych notatek
 * Metoda: POST
 * Ścieżka: /api/notes
 */
export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // 1. Sprawdź uwierzytelnienie użytkownika
    const supabase = locals.supabase;
    const { session } = locals;

    if (!session || !session.user) {
      return new Response(
        JSON.stringify({
          status: 401,
          message: "Wymagane uwierzytelnienie",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const userId = session.user.id;

    // 2. Pobierz dane wejściowe z żądania
    const requestData = await request.json().catch(() => null);

    if (!requestData) {
      return new Response(
        JSON.stringify({
          status: 400,
          message: "Nieprawidłowy format danych wejściowych",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 3. Walidacja danych wejściowych za pomocą Zod
    const validationResult = noteCreateSchema.safeParse(requestData);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return new Response(
        JSON.stringify({
          status: 400,
          message: "Nieprawidłowe dane wejściowe",
          errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 4. Inicjalizacja serwisu notatek
    const notesService = new NotesService(supabase);

    // 5. Utworzenie notatki
    const note = await notesService.createNote(userId, validationResult.data);

    // 6. Zwróć odpowiedź z kodem 201 Created
    return new Response(JSON.stringify(note), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Błąd podczas tworzenia notatki:", error);

    // Obsługa specyficznych błędów
    const errorMessage = error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd";

    if (errorMessage.includes("Nie znaleziono miejsca docelowego")) {
      return new Response(
        JSON.stringify({
          status: 404,
          message: errorMessage,
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Domyślna odpowiedź dla nieobsłużonych błędów
    return new Response(
      JSON.stringify({
        status: 500,
        message: "Wystąpił nieoczekiwany błąd serwera",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
