import type { APIRoute } from "astro";
import { PlansService } from "../../../../lib/services/plans.service";
import { AIService } from "../../../../lib/services/ai.service";
import { AiClient } from "../../../../lib/clients/ai.client";
import { validate as isUUID } from "uuid";

export const prerender = false;

export const POST: APIRoute = async ({ params, locals }) => {
  try {
    // 1. Walidacja parametru noteId
    const { noteId } = params;
    if (!noteId || !isUUID(noteId)) {
      return new Response(
        JSON.stringify({
          status: 400,
          message: "Nieprawidłowy format identyfikatora notatki",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 2. Pobranie kontekstu użytkownika
    const supabase = locals.supabase;
    const session = locals.session;

    // 3. Sprawdzenie uwierzytelnienia
    if (!session?.user?.id) {
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

    // 4. Inicjalizacja serwisów
    const aiApiKey = import.meta.env.OPENROUTER_API_KEY;
    if (!aiApiKey) {
      console.error("Missing OpenRouter API key");
      return new Response(
        JSON.stringify({
          status: 500,
          message: "Konfiguracja serwera jest nieprawidłowa",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const aiClient = new AiClient(aiApiKey);
    const aiService = new AIService(supabase, aiClient);
    const plansService = new PlansService(supabase, aiService);

    // 5. Generowanie planu
    const plan = await plansService.generatePlanFromNote(noteId, userId);

    // 6. Zwrócenie odpowiedzi
    return new Response(JSON.stringify(plan), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // 7. Obsługa błędów
    const message = error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd";
    console.error("Error generating plan:", error);

    // Mapowanie komunikatów błędów na odpowiednie kody HTTP
    if (message.includes("Invalid noteId format")) {
      return new Response(
        JSON.stringify({
          status: 400,
          message: "Nieprawidłowy format identyfikatora notatki",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (message.includes("Forbidden")) {
      return new Response(
        JSON.stringify({
          status: 403,
          message: "Brak uprawnień do generowania planu dla tej notatki",
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    if (message.includes("Daily generation limit exceeded")) {
      // Wyodrębnienie czasu resetowania limitu
      const resetTimeMatch = message.match(/Reset at (.*)/);
      const resetTime = resetTimeMatch ? resetTimeMatch[1] : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      return new Response(
        JSON.stringify({
          status: 403,
          message: `Przekroczono dzienny limit generowania planów (${2} plany)`,
          reset_time: resetTime,
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    if (message.includes("Note not found")) {
      return new Response(
        JSON.stringify({
          status: 404,
          message: "Notatka o podanym identyfikatorze nie istnieje",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    if (message.includes("Insufficient note data") || message.includes("Cannot generate plan from a draft note")) {
      return new Response(
        JSON.stringify({
          status: 422,
          message: "Notatka nie zawiera wystarczających danych do wygenerowania planu",
          details: {
            reason: message,
          },
        }),
        { status: 422, headers: { "Content-Type": "application/json" } }
      );
    }

    // Dla pozostałych błędów zwracamy 500
    return new Response(
      JSON.stringify({
        status: 500,
        message: "Wystąpił błąd podczas generowania planu",
        error_id: Math.random().toString(36).substring(2, 15),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
