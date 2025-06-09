import { supabase } from "@/db/supabase.client";
import type { PlanContent, PlanResponseDTO } from "@/types";

type GeneratePlanResponse = {
  plan_id: string;
};

type DatabasePlan = {
  id: string;
  note_id: string;
  content: any;
  is_public: boolean | null;
  likes_count: number | null;
  created_at: string | null;
  deleted_at: string | null;
  user: {
    first_name: string;
    last_name: string;
  };
  destination: {
    id: number;
    city: string;
    country: string;
  };
};

export async function generatePlan(noteId: string): Promise<PlanResponseDTO> {
  // @ts-expect-error - RPC function type is not properly inferred
  const { data, error } = await supabase.rpc("generate_plan", { note_id: noteId });

  if (error) {
    throw new Error("Nie udało się wygenerować planu");
  }

  const response = data as GeneratePlanResponse;

  const { data: plan, error: planError } = await supabase
    .from("plans")
    .select(
      `
      *,
      user:users (
        first_name,
        last_name
      ),
      destination:destinations (
        id,
        city,
        country
      )
    `
    )
    .eq("id", response.plan_id)
    .single();

  if (planError || !plan) {
    throw new Error("Nie udało się pobrać wygenerowanego planu");
  }

  const typedPlan = plan as unknown as DatabasePlan;

  if (!typedPlan.created_at || !typedPlan.is_public || typedPlan.likes_count === null) {
    throw new Error("Nieprawidłowe dane planu");
  }

  return {
    id: typedPlan.id,
    note_id: typedPlan.note_id,
    content: typedPlan.content,
    is_public: typedPlan.is_public,
    likes_count: typedPlan.likes_count,
    created_at: typedPlan.created_at,
    deleted_at: typedPlan.deleted_at ?? undefined,
    user: {
      first_name: typedPlan.user.first_name,
      last_name_initial: typedPlan.user.last_name[0],
    },
    destination: {
      id: typedPlan.destination.id,
      city: typedPlan.destination.city,
      country: typedPlan.destination.country,
    },
    is_liked_by_me: false,
  };
}

export async function updatePlan(
  planId: string,
  content: PlanContent,
  isPublic: boolean
): Promise<void> {
  const { error } = await supabase
    .from("plans")
    .update({ content, is_public: isPublic })
    .eq("id", planId);

  if (error) {
    throw new Error("Nie udało się zaktualizować planu");
  }
}

export async function deletePlan(planId: string): Promise<void> {
  const { error } = await supabase
    .from("plans")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", planId);

  if (error) {
    throw new Error("Nie udało się usunąć planu");
  }
}

export async function togglePlanLike(planId: string): Promise<void> {
  // @ts-expect-error - RPC function type is not properly inferred
  const { error } = await supabase.rpc("toggle_plan_like", { plan_id: planId });

  if (error) {
    throw new Error("Nie udało się zmienić polubienia planu");
  }
}
