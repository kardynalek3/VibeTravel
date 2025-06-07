import { SupabaseClient } from "@supabase/supabase-js";
import { AiClient } from "../clients/ai.client";
import type { Note, PlanContent, AIError, SegmentType, TransportType, PlanDay, PlanItem } from "../../types";

/**
 * AIService - Serwis do obsługi generowania planów podróży przy użyciu AI
 */
export class AIService {
  constructor(
    private supabase: SupabaseClient,
    private aiClient: AiClient
  ) {}

  /**
   * Generuje szczegółowy plan podróży na podstawie notatki użytkownika
   * @param note Notatka użytkownika zawierająca dane do generowania planu
   * @param userId ID użytkownika żądającego generowania planu
   * @returns Wygenerowana struktura planu podróży
   */
  async generatePlanFromNote(note: Note, userId: string): Promise<PlanContent> {
    try {
      // Walidacja danych wejściowych
      this.validateNoteForGeneration(note);

      // Przygotowanie promptu dla AI
      const prompt = this.preparePrompt(note);

      // Konfiguracja parametrów generowania
      const generateOptions = {
        systemPrompt: this.getSystemPrompt(note.segment, note.transport),
        temperature: 0.7,
        maxTokens: 4000,
      };

      // Wywołanie API AI z timeoutem
      const aiResponse = await Promise.race([
        this.aiClient.generate(prompt, generateOptions),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("AI generation timeout after 3 minutes")), 180000);
        }),
      ]);

      // Parsowanie odpowiedzi AI do struktury PlanContent
      const planContent = this.parseAIResponse(aiResponse.content, note);

      return planContent;
    } catch (error) {
      // Logowanie błędu AI
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      await this.logAIError({
        user_id: userId,
        note_id: note.id,
        error_type: error instanceof Error ? error.name : "UnknownError",
        error_message: errorMessage,
        input_data: JSON.stringify(note),
      });

      // Rzucenie błędu do obsługi przez warstwę wyżej
      throw new Error(`Failed to generate plan: ${errorMessage}`);
    }
  }

  /**
   * Loguje błąd związany z generowaniem planu przez AI
   * @param errorData Dane błędu do zapisania
   */
  private async logAIError(errorData: Omit<AIError, "id" | "created_at">): Promise<void> {
    try {
      await this.supabase.from("ai_errors").insert(errorData);
    } catch (logError) {
      // W przypadku błędu logowania, wypisujemy do konsoli (nie przerywamy głównego flow)
      console.error("Failed to log AI error:", logError);
    }
  }

  /**
   * Waliduje, czy notatka zawiera wystarczające dane do generowania planu
   * @param note Notatka do walidacji
   */
  private validateNoteForGeneration(note: Note): void {
    const missingFields = [];

    if (!note.destination_id) missingFields.push("destination_id");
    if (!note.attractions || note.attractions.trim() === "") missingFields.push("attractions");
    if (!note.duration || note.duration < 1 || note.duration > 5) missingFields.push("duration");

    if (missingFields.length > 0) {
      throw new Error(`Insufficient note data. Missing: ${missingFields.join(", ")}`);
    }
  }

  /**
   * Przygotowuje prompt dla AI na podstawie notatki
   * @param note Notatka użytkownika
   * @returns Tekst promptu
   */
  private preparePrompt(note: Note): string {
    return `Generate a detailed travel plan for a ${note.duration}-day trip based on the following information:
    
Attractions: ${note.attractions}
Duration: ${note.duration} days
Travel style: ${note.segment || "not specified"}
Transport: ${note.transport || "not specified"}

Please create a detailed daily itinerary with the following structure:
1. A descriptive title for the trip
2. A brief summary of the overall experience
3. A detailed day-by-day plan with:
   - Specific times for each activity
   - Estimated duration for each attraction visit
   - Travel time between attractions
   - Opening hours when applicable
   - Brief descriptions of each place
4. A list of practical recommendations for the trip

Your response should be well-structured and include realistic timing that accounts for travel between attractions.`;
  }

  /**
   * Zwraca odpowiedni system prompt w zależności od preferencji podróży
   * @param segment Segment użytkownika (rodzina, para, solo)
   * @param transport Preferowany transport
   * @returns System prompt dla AI
   */
  private getSystemPrompt(segment?: SegmentType, transport?: TransportType): string {
    let systemPrompt = "You are an expert travel planner that creates detailed, realistic travel itineraries. ";

    if (segment) {
      switch (segment) {
        case "family":
          systemPrompt += "You specialize in family-friendly trips with activities suitable for children. ";
          break;
        case "couple":
          systemPrompt += "You specialize in romantic trips for couples with atmospheric locations and experiences. ";
          break;
        case "solo":
          systemPrompt +=
            "You specialize in solo travel experiences that are safe, enriching, and allow for social opportunities. ";
          break;
      }
    }

    if (transport) {
      systemPrompt += `Your plans consider ${transport} as the primary mode of transportation. `;
    }

    systemPrompt +=
      "Always provide realistic timing for visits and travel between attractions. Format your response as a structured JSON object without any additional text or explanations outside the JSON structure. The JSON should include title, summary, days array with daily activities, and recommendations array.";

    return systemPrompt;
  }

  /**
   * Parsuje odpowiedź z AI do struktury PlanContent
   * @param aiResponse Odpowiedź z API AI
   * @param note Oryginalna notatka dla kontekstu
   * @returns Sparsowana struktura planu
   */
  private parseAIResponse(aiResponse: string, note: Note): PlanContent {
    try {
      // Próba wyodrębnienia JSON z odpowiedzi
      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) || aiResponse.match(/{[\s\S]*?}/);

      let parsedResponse: any;

      if (jsonMatch) {
        // Jeśli znaleziono JSON w markdown code block lub jako czysty tekst
        parsedResponse = JSON.parse(jsonMatch[0].replace(/```json|```/g, ""));
      } else {
        // Próba parsowania całej odpowiedzi jako JSON
        parsedResponse = JSON.parse(aiResponse);
      }

      // Walidacja i normalizacja struktury
      const planContent: PlanContent = {
        title: parsedResponse.title || `${note.duration}-day Trip Plan`,
        summary: parsedResponse.summary || "A customized travel itinerary based on your preferences.",
        days: this.normalizeDays(parsedResponse.days || [], note),
        recommendations: Array.isArray(parsedResponse.recommendations) ? parsedResponse.recommendations : [],
      };

      return planContent;
    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : "Invalid format"}`);
    }
  }

  /**
   * Normalizuje strukturę dni w planie
   * @param days Surowa struktura dni z odpowiedzi AI
   * @param note Oryginalna notatka dla kontekstu
   * @returns Znormalizowana tablica dni
   */
  private normalizeDays(days: any[], note: Note): PlanDay[] {
    // Jeśli AI nie wygenerowało dni, tworzymy podstawową strukturę
    if (!days.length) {
      return Array.from({ length: note.duration }, (_, i) => ({
        date: this.getRelativeDateString(i),
        items: [],
      }));
    }

    // Normalizacja istniejącej struktury
    return days.map((day, index) => ({
      date: day.date || this.getRelativeDateString(index),
      items: Array.isArray(day.items) ? this.normalizeItems(day.items) : [],
    }));
  }

  /**
   * Normalizuje elementy planu dnia
   * @param items Surowe elementy planu z odpowiedzi AI
   * @returns Znormalizowana tablica elementów
   */
  private normalizeItems(items: any[]): PlanItem[] {
    return items.map((item) => {
      const normalizedItem: PlanItem = {
        time: typeof item.time === "string" ? item.time : "09:00",
        type: item.type === "transport" ? "transport" : "place",
        data: item.type === "transport" ? this.normalizeTransport(item.data) : this.normalizePlace(item.data),
      };
      return normalizedItem;
    });
  }

  /**
   * Normalizuje dane miejsca
   * @param placeData Surowe dane miejsca
   * @returns Znormalizowane dane miejsca
   */
  private normalizePlace(placeData: any): any {
    return {
      name: placeData?.name || "Unnamed location",
      description: placeData?.description || "",
      address: placeData?.address,
      opening_hours: placeData?.opening_hours,
      visit_duration: typeof placeData?.visit_duration === "number" ? placeData.visit_duration : 60,
      coordinates: placeData?.coordinates,
    };
  }

  /**
   * Normalizuje dane transportu
   * @param transportData Surowe dane transportu
   * @returns Znormalizowane dane transportu
   */
  private normalizeTransport(transportData: any): any {
    return {
      type: transportData?.type || "walking",
      duration: typeof transportData?.duration === "number" ? transportData.duration : 30,
      distance: transportData?.distance,
      start_coordinates: transportData?.start_coordinates,
      end_coordinates: transportData?.end_coordinates,
    };
  }

  /**
   * Zwraca względną datę jako string w formacie YYYY-MM-DD
   * @param dayOffset Przesunięcie dni od dzisiaj
   * @returns Data w formacie YYYY-MM-DD
   */
  private getRelativeDateString(dayOffset: number): string {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    return date.toISOString().split("T")[0];
  }
}
