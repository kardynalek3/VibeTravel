import { describe, it, expect, vi, beforeEach } from "vitest";
import { AIService } from "../../../src/lib/services/ai.service";
import { AiClient } from "../../../src/lib/clients/ai.client";
import type { Note, SegmentType, TransportType, PlanPlace, PlanTransport, PlanContent } from "../../../src/types";

describe("AIService", () => {
  let mockSupabase: any;
  let mockAiClient: any;
  let aiService: AIService;
  let mockNote: Note;
  let expectedPlanContent: PlanContent;

  beforeEach(() => {
    // Mock Supabase client
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
    };

    // Mock AI client
    mockAiClient = {
      generate: vi.fn(),
    };

    // Inicjalizacja serwisu AI
    aiService = new AIService(mockSupabase, mockAiClient as unknown as AiClient);

    // Przykładowa notatka do testów
    mockNote = {
      id: "note-123",
      user_id: "user-456",
      destination_id: 1,
      segment: "family" as SegmentType,
      transport: "car" as TransportType,
      duration: 3,
      attractions: "Wawel, Rynek Główny, Muzeum Narodowe",
      is_draft: false,
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
    };

    // Oczekiwana struktura planu
    expectedPlanContent = {
      title: "3-dniowa wycieczka do Krakowa",
      summary: "Rodzinna wycieczka po Krakowie",
      days: [
        {
          date: "2023-01-02",
          items: [
            {
              time: "09:00",
              type: "place",
              data: {
                name: "Wawel",
                description: "Historyczny kompleks zamkowy",
                visit_duration: 120,
              },
            },
          ],
        },
      ],
      recommendations: ["Wygodne buty", "Parasol na wypadek deszczu"],
    };
  });

  describe("generatePlanFromNote", () => {
    it("should successfully generate a plan from a valid note", async () => {
      // Mockowanie odpowiedzi z AI z prostym poprawnym JSON
      mockAiClient.generate.mockResolvedValue({
        content: "{}",
        model: "gpt-4",
        usage: {
          prompt_tokens: 100,
          completion_tokens: 200,
          total_tokens: 300,
        },
      });

      // Mockowanie metody parseAIResponse
      const originalParseAIResponse = aiService["parseAIResponse"];
      aiService["parseAIResponse"] = vi.fn().mockReturnValue(expectedPlanContent);

      // Wywołanie testowanej metody
      const result = await aiService.generatePlanFromNote(mockNote, "user-456");

      // Weryfikacja czy AI Client został wywołany z odpowiednimi parametrami
      expect(mockAiClient.generate).toHaveBeenCalledTimes(1);
      expect(mockAiClient.generate.mock.calls[0][0]).toContain(mockNote.attractions);
      expect(mockAiClient.generate.mock.calls[0][0]).toContain(`${mockNote.duration} days`);

      // Weryfikacja czy metoda parseAIResponse została wywołana
      expect(aiService["parseAIResponse"]).toHaveBeenCalledTimes(1);

      // Weryfikacja struktury wygenerowanego planu
      expect(result).toHaveProperty("title", "3-dniowa wycieczka do Krakowa");
      expect(result).toHaveProperty("summary", "Rodzinna wycieczka po Krakowie");
      expect(result.days).toHaveLength(1);
      expect(result.days[0].items).toHaveLength(1);
      
      // Sprawdzanie, czy element jest typu 'place' przed dostępem do właściwości 'name'
      const item = result.days[0].items[0];
      expect(item.type).toBe("place");
      if (item.type === "place") {
        const placeData = item.data as PlanPlace;
        expect(placeData.name).toBe("Wawel");
      }
      
      expect(result.recommendations).toHaveLength(2);

      // Przywrócenie oryginalnej metody
      aiService["parseAIResponse"] = originalParseAIResponse;
    });

    it("should throw an error for a note with missing data", async () => {
      // Notatka z brakującymi danymi
      const invalidNote: Note = {
        ...mockNote,
        attractions: "", // Pusta lista atrakcji
      };

      // Oczekiwanie, że wywołanie metody rzuci błąd
      await expect(aiService.generatePlanFromNote(invalidNote, "user-456"))
        .rejects.toThrow("Failed to generate plan: Insufficient note data");

      // Sprawdzenie, czy błąd został zalogowany
      expect(mockSupabase.from).toHaveBeenCalledWith("ai_errors");
      expect(mockSupabase.insert).toHaveBeenCalled();
    });

    it("should handle AI client errors", async () => {
      // Mockowanie błędu z AI Client
      mockAiClient.generate.mockRejectedValue(new Error("AI service unavailable"));

      // Oczekiwanie, że wywołanie metody rzuci błąd
      await expect(aiService.generatePlanFromNote(mockNote, "user-456"))
        .rejects.toThrow("Failed to generate plan: AI service unavailable");

      // Sprawdzenie, czy błąd został zalogowany
      expect(mockSupabase.from).toHaveBeenCalledWith("ai_errors");
      expect(mockSupabase.insert).toHaveBeenCalled();
    });

    it("should handle invalid JSON responses from AI", async () => {
      // Niepoprawna odpowiedź JSON z AI
      mockAiClient.generate.mockResolvedValue({
        content: "This is not a valid JSON response",
        model: "gpt-4",
        usage: {
          prompt_tokens: 100,
          completion_tokens: 200,
          total_tokens: 300,
        },
      });

      // Oczekiwanie, że wywołanie metody rzuci błąd
      await expect(aiService.generatePlanFromNote(mockNote, "user-456"))
        .rejects.toThrow("Failed to generate plan: Failed to parse AI response");

      // Sprawdzenie, czy błąd został zalogowany
      expect(mockSupabase.from).toHaveBeenCalledWith("ai_errors");
      expect(mockSupabase.insert).toHaveBeenCalled();
    });
  });

  describe("System prompt generation", () => {
    it("should include family-specific instructions for family segment", async () => {
      // Notatka z segmentem "family"
      mockAiClient.generate.mockResolvedValue({
        content: "{}",
        model: "gpt-4",
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      });

      // Mockowanie metody parseAIResponse aby uniknąć błędów parsowania
      aiService["parseAIResponse"] = vi.fn().mockReturnValue(expectedPlanContent);

      // Wywołanie metody
      await aiService.generatePlanFromNote(
        { ...mockNote, segment: "family" as SegmentType },
        "user-456"
      );

      // Sprawdzenie czy prompt systemowy zawiera instrukcje dla rodzin
      expect(mockAiClient.generate.mock.calls[0][1].systemPrompt).toContain("family-friendly");
    });

    it("should include couple-specific instructions for couple segment", async () => {
      // Notatka z segmentem "couple"
      mockAiClient.generate.mockResolvedValue({
        content: "{}",
        model: "gpt-4",
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      });

      // Mockowanie metody parseAIResponse aby uniknąć błędów parsowania
      aiService["parseAIResponse"] = vi.fn().mockReturnValue(expectedPlanContent);

      // Wywołanie metody
      await aiService.generatePlanFromNote(
        { ...mockNote, segment: "couple" as SegmentType },
        "user-456"
      );

      // Sprawdzenie czy prompt systemowy zawiera instrukcje dla par
      expect(mockAiClient.generate.mock.calls[0][1].systemPrompt).toContain("romantic");
    });

    it("should include transport-specific instructions based on note transport", async () => {
      // Notatka z transportem "public_transport"
      mockAiClient.generate.mockResolvedValue({
        content: "{}",
        model: "gpt-4",
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      });

      // Mockowanie metody parseAIResponse aby uniknąć błędów parsowania
      aiService["parseAIResponse"] = vi.fn().mockReturnValue(expectedPlanContent);

      // Wywołanie metody
      await aiService.generatePlanFromNote(
        { ...mockNote, transport: "public_transport" as TransportType },
        "user-456"
      );

      // Sprawdzenie czy prompt systemowy zawiera informacje o transporcie publicznym
      expect(mockAiClient.generate.mock.calls[0][1].systemPrompt).toContain("public_transport");
    });
  });
}); 