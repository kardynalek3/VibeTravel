import type { APIRoute } from "astro";
import { PlansService } from "../../../lib/services/plans.service";
import { validate as isUUID } from "uuid";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const { id } = params;

    // 1. Validate the ID parameter
    if (!id || !isUUID(id)) {
      return new Response(
        JSON.stringify({
          status: 400,
          message: "Nieprawidłowy format identyfikatora planu",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 2. Get supabase and user ID from context
    const supabase = locals.supabase;
    const userId = locals.session?.user?.id;

    // 3. Create service instance and fetch the plan
    const plansService = new PlansService(supabase);
    const plan = await plansService.getPlanById(id, userId);

    // 4. Return the response
    return new Response(JSON.stringify(plan), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // 5. Error handling
    const message = error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd";

    if (message.includes("Forbidden")) {
      return new Response(JSON.stringify({ status: 403, message: "Brak uprawnień do wyświetlenia tego planu" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (message.includes("not found")) {
      return new Response(JSON.stringify({ status: 404, message: "Plan o podanym identyfikatorze nie istnieje" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.error("Error fetching plan:", error);
    return new Response(JSON.stringify({ status: 500, message: "Wystąpił nieoczekiwany błąd serwera" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
