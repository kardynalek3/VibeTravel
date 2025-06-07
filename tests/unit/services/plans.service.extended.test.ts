import { describe, it, expect, vi, beforeEach } from "vitest";
import { PlansService } from "../../../src/lib/services/plans.service";
import { AIService } from "../../../src/lib/services/ai.service";
import { validate } from "uuid";
import type { Note, PlanContent } from "../../../src/types";

// Mock UUID validation
vi.mock("uuid", () => ({
  validate: vi.fn((id) => id !== "invalid-uuid-format"),
}));

describe("PlansService - Plan Generation", () => {
  let mockSupabase: any;
  let mockAiService: any;
  let plansService: PlansService;
  let mockNote: Note;
  let mockPlanContent: PlanContent;

  beforeEach(() => {
    // Reset mocks between tests
    vi.clearAllMocks();

    // Mock Supabase client
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      count: vi.fn().mockReturnThis(),
      single: vi.fn(),
      maybeSingle: vi.fn(),
      head: vi.fn(),
    };

    // Mock AI Service
    mockAiService = {
      generatePlanFromNote: vi.fn(),
    };

    // Initialize Plans Service with the mocks
    plansService = new PlansService(mockSupabase, mockAiService as unknown as AIService);
    plansService.clearCache();

    // Mock note data
    mockNote = {
      id: "note-123",
      user_id: "user-456",
      destination_id: 1,
      segment: "family",
      transport: "car",
      duration: 3,
      attractions: "Wawel, Rynek Główny, Muzeum Narodowe",
      is_draft: false,
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
      destinations: [{ city: "Kraków", country: "Polska" }],
    } as any;

    // Mock plan content
    mockPlanContent = {
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

  it("should successfully generate a plan from a valid note", async () => {
    // Mockowanie metody checkDailyLimit aby zwrócić true (limit nie został przekroczony)
    const checkDailyLimitSpy = vi.spyOn(plansService as any, "checkDailyLimit");
    checkDailyLimitSpy.mockResolvedValue(true);

    // Setup mock responses
    mockSupabase.single
      .mockResolvedValueOnce({ data: mockNote, error: null }) // Note fetch
      .mockResolvedValueOnce({ data: { id: "plan-123" }, error: null }); // Plan insert

    // Mock AI response
    mockAiService.generatePlanFromNote.mockResolvedValueOnce(mockPlanContent);

    // Setup mock for getPlanById (called at the end)
    const mockGeneratedPlan = {
      id: "plan-123",
      note_id: "note-123",
      user: { first_name: "Jan", last_name_initial: "K" },
      destination: { city: "Kraków", country: "Polska" },
      content: mockPlanContent,
      is_public: false,
      likes_count: 0,
      created_at: "2023-01-01T12:00:00Z",
      is_liked_by_me: false,
    };

    // Mock to override the getPlanById method
    const getPlanByIdSpy = vi.spyOn(plansService, "getPlanById");
    getPlanByIdSpy.mockResolvedValueOnce(mockGeneratedPlan);

    // Call the service method
    const result = await plansService.generatePlanFromNote("note-123", "user-456");

    // Verify the responses
    expect(result).toEqual(mockGeneratedPlan);

    // Verify that the methods were called with correct parameters
    expect(checkDailyLimitSpy).toHaveBeenCalledWith("user-456");
    expect(mockSupabase.from).toHaveBeenCalledWith("notes");
    expect(mockAiService.generatePlanFromNote).toHaveBeenCalledWith(mockNote, "user-456");
    expect(mockSupabase.from).toHaveBeenCalledWith("plans");
    expect(mockSupabase.insert).toHaveBeenCalledWith({
      note_id: "note-123",
      user_id: "user-456",
      destination_id: 1,
      content: mockPlanContent,
      is_public: false,
      likes_count: 0,
    });
  });

  it("should throw an error if daily limit is exceeded", async () => {
    // Mockowanie metody checkDailyLimit aby zwrócić false (limit został przekroczony)
    const checkDailyLimitSpy = vi.spyOn(plansService as any, "checkDailyLimit");
    checkDailyLimitSpy.mockResolvedValue(false);
    
    // Mockowanie metody getDailyLimitResetTime
    const getDailyLimitResetTimeSpy = vi.spyOn(plansService as any, "getDailyLimitResetTime");
    const resetTime = new Date();
    resetTime.setDate(resetTime.getDate() + 1);
    getDailyLimitResetTimeSpy.mockReturnValue(resetTime);

    // Call the service method and expect it to throw
    await expect(plansService.generatePlanFromNote("note-123", "user-456"))
      .rejects.toThrow(/Daily generation limit exceeded/);

    // Verify that the limit check was called but not the plan generation
    expect(checkDailyLimitSpy).toHaveBeenCalledWith("user-456");
    expect(mockAiService.generatePlanFromNote).not.toHaveBeenCalled();
  });

  it("should throw an error for non-existent note", async () => {
    // Mockowanie metody checkDailyLimit aby zwrócić true (limit nie został przekroczony)
    const checkDailyLimitSpy = vi.spyOn(plansService as any, "checkDailyLimit");
    checkDailyLimitSpy.mockResolvedValue(true);

    // Setup mock responses - nota nie istnieje
    mockSupabase.single.mockResolvedValueOnce({ data: null, error: null }); // Note not found

    // Call the service method and expect it to throw
    await expect(plansService.generatePlanFromNote("note-123", "user-456"))
      .rejects.toThrow("Note not found");

    // Verify that the daily limit was checked but not the AI generation
    expect(checkDailyLimitSpy).toHaveBeenCalledWith("user-456");
    expect(mockSupabase.from).toHaveBeenCalledWith("notes");
    expect(mockAiService.generatePlanFromNote).not.toHaveBeenCalled();
  });

  it("should throw an error if the note belongs to another user", async () => {
    // Mockowanie metody checkDailyLimit aby zwrócić true (limit nie został przekroczony)
    const checkDailyLimitSpy = vi.spyOn(plansService as any, "checkDailyLimit");
    checkDailyLimitSpy.mockResolvedValue(true);

    // Setup mock responses - nota należy do innego użytkownika
    mockSupabase.single.mockResolvedValueOnce({
      data: { ...mockNote, user_id: "different-user" },
      error: null,
    });

    // Call the service method and expect it to throw
    await expect(plansService.generatePlanFromNote("note-123", "user-456"))
      .rejects.toThrow("Forbidden: You don't have permission");

    // Verify that the checks were done but not the generation
    expect(checkDailyLimitSpy).toHaveBeenCalledWith("user-456");
    expect(mockSupabase.from).toHaveBeenCalledWith("notes");
    expect(mockAiService.generatePlanFromNote).not.toHaveBeenCalled();
  });

  it("should throw an error if trying to generate from a draft note", async () => {
    // Mockowanie metody checkDailyLimit aby zwrócić true (limit nie został przekroczony)
    const checkDailyLimitSpy = vi.spyOn(plansService as any, "checkDailyLimit");
    checkDailyLimitSpy.mockResolvedValue(true);

    // Setup mock responses - nota jest szkicem
    mockSupabase.single.mockResolvedValueOnce({
      data: { ...mockNote, is_draft: true },
      error: null,
    });

    // Call the service method and expect it to throw
    await expect(plansService.generatePlanFromNote("note-123", "user-456"))
      .rejects.toThrow("Cannot generate plan from a draft note");

    // Verify that the checks were done but not the generation
    expect(checkDailyLimitSpy).toHaveBeenCalledWith("user-456");
    expect(mockSupabase.from).toHaveBeenCalledWith("notes");
    expect(mockAiService.generatePlanFromNote).not.toHaveBeenCalled();
  });

  it("should throw an error if AI service is not initialized", async () => {
    // Create a plans service without AI service
    const plansServiceWithoutAI = new PlansService(mockSupabase);

    // Call the service method and expect it to throw
    await expect(plansServiceWithoutAI.generatePlanFromNote("note-123", "user-456"))
      .rejects.toThrow("AI Service not initialized");
  });

  it("should throw an error for invalid noteId format", async () => {
    // Call the service method with invalid UUID
    await expect(plansService.generatePlanFromNote("invalid-uuid-format", "user-456"))
      .rejects.toThrow("Invalid noteId format");

    // Verify that no further processing was done
    expect(mockSupabase.from).not.toHaveBeenCalled();
    expect(mockAiService.generatePlanFromNote).not.toHaveBeenCalled();
  });
}); 