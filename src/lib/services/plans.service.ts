import { SupabaseClient } from "@supabase/supabase-js";
import type { PlanResponseDTO, Note } from "../../types";
import { AIService } from "./ai.service";
import { validate as isUUID } from "uuid";

// Simple in-memory cache for plans
type CacheEntry = {
  data: PlanResponseDTO;
  timestamp: number;
};

const CACHE_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds
const planCache = new Map<string, CacheEntry>();

// Maximum number of plans a user can generate per day
const DAILY_GENERATION_LIMIT = 2;

export class PlansService {
  constructor(
    private supabase: SupabaseClient,
    private aiService?: AIService
  ) {}

  async getPlanById(planId: string, userId?: string): Promise<PlanResponseDTO> {
    // Check cache for public plans only (if userId not provided or not matching the request)
    const cacheKey = `plan_${planId}_${userId || "anonymous"}`;
    const cachedPlan = planCache.get(cacheKey);

    // Return cached plan if it exists and is not expired
    if (cachedPlan && Date.now() - cachedPlan.timestamp < CACHE_TIMEOUT) {
      return cachedPlan.data;
    }

    // 1. Fetch plan data from the database
    const { data: plan, error } = await this.supabase
      .from("plans")
      .select(
        `
        id,
        note_id,
        content,
        is_public,
        likes_count,
        created_at,
        user_id,
        destinations:destinations(city, country)
      `
      )
      .eq("id", planId)
      .is("deleted_at", null)
      .single();

    if (error) throw new Error(`Failed to fetch plan: ${error.message}`);
    if (!plan) throw new Error("Plan not found");

    // 2. Check permissions
    if (!plan.is_public && plan.user_id !== userId) {
      throw new Error("Forbidden: You do not have permission to view this plan");
    }

    // 3. Ensure we have destination data before proceeding
    if (!plan.destinations || !plan.destinations[0]) {
      throw new Error("Destination data not found");
    }

    // 4. Fetch user information
    const { data: userData, error: userError } = await this.supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", plan.user_id)
      .single();

    if (userError) throw new Error(`Failed to fetch user data: ${userError.message}`);

    // 5. Check if the user liked the plan
    let isLikedByMe = false;
    if (userId) {
      const { data: likeData, error: likeError } = await this.supabase
        .from("likes")
        .select("id")
        .eq("plan_id", planId)
        .eq("user_id", userId)
        .maybeSingle();

      if (!likeError) {
        isLikedByMe = !!likeData;
      }
    }

    const destinationData = plan.destinations[0];

    // 6. Transform data to the appropriate response format
    const responseData: PlanResponseDTO = {
      id: plan.id,
      note_id: plan.note_id,
      user: {
        first_name: userData.first_name,
        last_name_initial: userData.last_name.charAt(0),
      },
      destination: {
        city: destinationData.city,
        country: destinationData.country,
      },
      content: plan.content,
      is_public: plan.is_public,
      likes_count: plan.likes_count,
      created_at: plan.created_at,
      is_liked_by_me: isLikedByMe,
    };

    // 7. Cache the result if it's a public plan or the owner is requesting it
    if (plan.is_public || plan.user_id === userId) {
      planCache.set(cacheKey, {
        data: responseData,
        timestamp: Date.now(),
      });
    }

    return responseData;
  }

  /**
   * Generuje nowy plan podróży na podstawie notatki
   * @param noteId ID notatki, na podstawie której ma być wygenerowany plan
   * @param userId ID użytkownika generującego plan
   * @returns Wygenerowany plan podróży
   */
  async generatePlanFromNote(noteId: string, userId: string): Promise<PlanResponseDTO> {
    if (!isUUID(noteId)) {
      throw new Error("Invalid noteId format");
    }

    if (!userId) {
      throw new Error("User must be authenticated to generate plans");
    }

    if (!this.aiService) {
      throw new Error("AI Service not initialized");
    }

    // 1. Sprawdzenie limitu dziennego
    const canGenerate = await this.checkDailyLimit(userId);
    if (!canGenerate) {
      const resetTime = this.getDailyLimitResetTime();
      throw new Error(
        `Daily generation limit exceeded (${DAILY_GENERATION_LIMIT} plans). Reset at ${resetTime.toISOString()}`
      );
    }

    // 2. Pobranie notatki
    const { data: note, error: noteError } = await this.supabase
      .from("notes")
      .select(
        `
        id, 
        user_id, 
        destination_id, 
        segment, 
        transport, 
        duration, 
        attractions, 
        is_draft,
        created_at,
        updated_at,
        destinations:destinations(city, country)
      `
      )
      .eq("id", noteId)
      .is("deleted_at", null)
      .single();

    if (noteError || !note) {
      throw new Error(noteError ? `Failed to fetch note: ${noteError.message}` : "Note not found");
    }

    // 3. Sprawdzenie uprawnień do notatki
    if (note.user_id !== userId) {
      throw new Error("Forbidden: You don't have permission to generate a plan for this note");
    }

    // 4. Sprawdzenie, czy notatka nie jest szkicem
    if (note.is_draft) {
      throw new Error("Cannot generate plan from a draft note");
    }

    // 5. Generowanie planu przez AI
    const planContent = await this.aiService.generatePlanFromNote(note as Note, userId);

    // 6. Zapis planu w bazie danych
    const { data: newPlan, error: insertError } = await this.supabase
      .from("plans")
      .insert({
        note_id: noteId,
        user_id: userId,
        destination_id: note.destination_id,
        content: planContent,
        is_public: false, // Domyślnie plan jest prywatny
        likes_count: 0,
      })
      .select("id")
      .single();

    if (insertError || !newPlan) {
      throw new Error(`Failed to save generated plan: ${insertError?.message || "Unknown error"}`);
    }

    // 7. Pobranie pełnych danych wygenerowanego planu
    return this.getPlanById(newPlan.id, userId);
  }

  /**
   * Sprawdza, czy użytkownik nie przekroczył dziennego limitu generowania planów
   * @param userId ID użytkownika do sprawdzenia
   * @returns true jeśli użytkownik może wygenerować więcej planów, false jeśli limit został osiągnięty
   */
  private async checkDailyLimit(userId: string): Promise<boolean> {
    // Pobierz początek i koniec bieżącego dnia w UTC
    const now = new Date();
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
    const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59));

    // Pobierz liczbę planów wygenerowanych dzisiaj
    const { count, error } = await this.supabase
      .from("plans")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", startOfDay.toISOString())
      .lte("created_at", endOfDay.toISOString());

    if (error) {
      console.error("Error checking daily limit:", error);
      // W przypadku błędu, pozwalamy na generowanie dla lepszego doświadczenia użytkownika
      return true;
    }

    // Zwróć true jeśli liczba wygenerowanych planów jest mniejsza niż limit
    return (count || 0) < DAILY_GENERATION_LIMIT;
  }

  /**
   * Zwraca czas resetowania dziennego limitu (północ następnego dnia UTC)
   * @returns Data resetowania limitu
   */
  private getDailyLimitResetTime(): Date {
    const now = new Date();
    const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
    return tomorrow;
  }

  // Utility method to clear the cache (useful for testing or after updates)
  clearCache(): void {
    planCache.clear();
  }
}
