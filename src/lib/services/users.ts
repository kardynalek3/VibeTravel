import { supabase } from "@/db/supabase.client";

export interface GenerationLimitResponse {
  remainingGenerations: number;
  resetTime?: string;
  totalLimit?: number;
}

type GenerationLimitData = {
  remaining_generations: number;
  reset_time: string | null;
  total_limit: number;
};

type CanGenerateResponse = {
  can_generate: boolean;
};

export async function fetchGenerationLimit(): Promise<GenerationLimitResponse> {
  const { data: rawData, error } = await supabase
    // @ts-expect-error - Table type is not properly inferred
    .from("generation_limits")
    .select("remaining_generations, reset_time")
    .single();

  if (error) {
    throw new Error("Nie udało się pobrać limitu generowań");
  }

  const data = rawData as unknown as GenerationLimitData;

  return {
    remainingGenerations: data.remaining_generations,
    resetTime: data.reset_time ?? undefined,
  };
}

export const UsersService = {
  /**
   * Pobiera informacje o limicie generowania planów dla zalogowanego użytkownika
   */
  async getGenerationLimit(): Promise<GenerationLimitResponse> {
    const { data: rawData, error } = await supabase
      // @ts-expect-error - Table type is not properly inferred
      .from("generation_limits")
      .select("remaining_generations, reset_time, total_limit")
      .single();

    if (error) {
      console.error("Error fetching generation limit:", error);
      throw new Error("Nie udało się pobrać informacji o limicie generowania planów");
    }

    if (!rawData) {
      return {
        remainingGenerations: 0,
        resetTime: new Date().toISOString(),
      };
    }

    const data = rawData as unknown as GenerationLimitData;

    return {
      remainingGenerations: data.remaining_generations,
      resetTime: data.reset_time ?? undefined,
      totalLimit: data.total_limit,
    };
  },

  /**
   * Dekrementuje licznik pozostałych generowań dla użytkownika
   */
  async decrementGenerationLimit(): Promise<void> {
    // @ts-expect-error - RPC function type is not properly inferred
    const { error } = await supabase.rpc("decrement_generation_limit");

    if (error) {
      console.error("Error decrementing generation limit:", error);
      throw new Error("Nie udało się zaktualizować limitu generowania planów");
    }
  },

  /**
   * Sprawdza, czy użytkownik może wygenerować nowy plan
   */
  async canGeneratePlan(): Promise<boolean> {
    // @ts-expect-error - RPC function type is not properly inferred
    const { data: rawData, error } = await supabase.rpc("can_generate_plan").single();

    if (error) {
      console.error("Error checking generation limit:", error);
      throw new Error("Nie udało się sprawdzić możliwości generowania planu");
    }

    const data = rawData as unknown as CanGenerateResponse;
    return data?.can_generate ?? false;
  },
};
