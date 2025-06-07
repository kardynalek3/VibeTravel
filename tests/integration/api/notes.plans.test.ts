import { describe, it, expect, vi, beforeEach } from "vitest";
import type { APIRoute } from "astro";

// Mock UUID validation
vi.mock("uuid", () => ({
  validate: vi.fn((id) => id !== "invalid-uuid-format")
}));

describe("POST /api/notes/[noteId]/plans", () => {
  // Store the original implementation of the endpoint
  let POST: APIRoute;
  
  beforeEach(async () => {
    // Clear all mocks between tests
    vi.clearAllMocks();
    
    // Ensure we're mocking the right modules before importing the handler
    vi.doMock("../../../src/lib/services/plans.service", () => {
      return {
        PlansService: vi.fn()
      };
    });
    
    vi.doMock("../../../src/lib/services/ai.service", () => {
      return {
        AIService: vi.fn()
      };
    });
    
    vi.doMock("../../../src/lib/clients/ai.client", () => {
      return {
        AiClient: vi.fn()
      };
    });
    
    // Reload the module to get a fresh instance of the endpoint
    vi.resetModules();
    const module = await import("../../../src/pages/api/notes/[noteId]/plans");
    POST = module.POST;
  });
  
  it("should return 201 when plan is successfully generated", async () => {
    // Setup mocks
    const mockParams = { noteId: "note-123" };
    const mockLocals = {
      supabase: {},
      session: { user: { id: "user-456" } }
    };
    
    // Mock environment variable
    vi.stubEnv("OPENROUTER_API_KEY", "mock-api-key");
    
    // Import and mock the services
    const { PlansService } = await import("../../../src/lib/services/plans.service");
    const { AIService } = await import("../../../src/lib/services/ai.service");
    const { AiClient } = await import("../../../src/lib/clients/ai.client");
    
    // Configure the mock implementation for this test
    const mockGeneratePlanFromNote = vi.fn().mockResolvedValue({
      id: "plan-123",
      note_id: "note-123",
      content: { title: "Test Plan", days: [] },
      is_public: false,
      likes_count: 0,
      created_at: "2023-01-01T00:00:00Z",
      user: {
        first_name: "Jan",
        last_name_initial: "K"
      },
      destination: {
        city: "Kraków", 
        country: "Polska"
      },
      is_liked_by_me: false
    });
    
    (PlansService as any).mockImplementation(() => ({
      generatePlanFromNote: mockGeneratePlanFromNote
    }));
    
    (AIService as any).mockImplementation(() => ({}));
    (AiClient as any).mockImplementation(() => ({}));
    
    // Call the endpoint
    const response = await POST({ params: mockParams, locals: mockLocals } as any);
    
    // Verify the response
    expect(response.status).toBe(201);
    
    const responseData = await response.json();
    expect(responseData).toHaveProperty("id", "plan-123");
    expect(responseData).toHaveProperty("note_id", "note-123");
    
    // Verify that the service was called with the correct parameters
    expect(mockGeneratePlanFromNote).toHaveBeenCalledWith("note-123", "user-456");
  });
  
  it("should return 400 for invalid noteId format", async () => {
    // Setup mocks with an invalid UUID
    const mockParams = { noteId: "invalid-uuid-format" };
    const mockLocals = { 
      supabase: {},
      session: { user: { id: "user-456" } }
    };
    
    // Call the endpoint (the UUID validation is already mocked at the top)
    const response = await POST({ params: mockParams, locals: mockLocals } as any);
    
    // Verify the response
    expect(response.status).toBe(400);
    
    const responseData = await response.json();
    expect(responseData).toHaveProperty("message", "Nieprawidłowy format identyfikatora notatki");
  });
  
  it("should return 401 when user is not authenticated", async () => {
    // Setup mocks without a session
    const mockParams = { noteId: "note-123" };
    const mockLocals = { 
      supabase: {},
      session: null
    };
    
    // Call the endpoint
    const response = await POST({ params: mockParams, locals: mockLocals } as any);
    
    // Verify the response
    expect(response.status).toBe(401);
    
    const responseData = await response.json();
    expect(responseData).toHaveProperty("message", "Wymagane uwierzytelnienie");
  });
  
  it("should return 403 when note belongs to another user", async () => {
    // Setup mocks
    const mockParams = { noteId: "note-123" };
    const mockLocals = {
      supabase: {},
      session: { user: { id: "user-456" } }
    };
    
    // Mock environment variable
    vi.stubEnv("OPENROUTER_API_KEY", "mock-api-key");
    
    // Import and mock the services
    const { PlansService } = await import("../../../src/lib/services/plans.service");
    
    // Configure the mock implementation for this test to throw a forbidden error
    const mockGeneratePlanFromNote = vi.fn().mockRejectedValue(
      new Error("Forbidden: You don't have permission to generate a plan for this note")
    );
    
    (PlansService as any).mockImplementation(() => ({
      generatePlanFromNote: mockGeneratePlanFromNote
    }));
    
    // Call the endpoint
    const response = await POST({ params: mockParams, locals: mockLocals } as any);
    
    // Verify the response
    expect(response.status).toBe(403);
    
    const responseData = await response.json();
    expect(responseData).toHaveProperty("message", "Brak uprawnień do generowania planu dla tej notatki");
  });
  
  it("should return 403 when daily limit is exceeded", async () => {
    // Setup mocks
    const mockParams = { noteId: "note-123" };
    const mockLocals = {
      supabase: {},
      session: { user: { id: "user-456" } }
    };
    
    // Mock environment variable
    vi.stubEnv("OPENROUTER_API_KEY", "mock-api-key");
    
    // Import and mock the services
    const { PlansService } = await import("../../../src/lib/services/plans.service");
    
    // Configure the mock implementation for this test to throw a limit exceeded error
    const limitError = new Error("Daily generation limit exceeded (2 plans). Reset at 2023-06-16T00:00:00Z");
    const mockGeneratePlanFromNote = vi.fn().mockRejectedValue(limitError);
    
    (PlansService as any).mockImplementation(() => ({
      generatePlanFromNote: mockGeneratePlanFromNote
    }));
    
    // Call the endpoint
    const response = await POST({ params: mockParams, locals: mockLocals } as any);
    
    // Verify the response
    expect(response.status).toBe(403);
    
    const responseData = await response.json();
    expect(responseData).toHaveProperty("message", "Przekroczono dzienny limit generowania planów (2 plany)");
    expect(responseData).toHaveProperty("reset_time");
  });
  
  it("should return 404 when note is not found", async () => {
    // Setup mocks
    const mockParams = { noteId: "note-123" };
    const mockLocals = {
      supabase: {},
      session: { user: { id: "user-456" } }
    };
    
    // Mock environment variable
    vi.stubEnv("OPENROUTER_API_KEY", "mock-api-key");
    
    // Import and mock the services
    const { PlansService } = await import("../../../src/lib/services/plans.service");
    
    // Configure the mock implementation for this test to throw a note not found error
    const mockGeneratePlanFromNote = vi.fn().mockRejectedValue(
      new Error("Note not found")
    );
    
    (PlansService as any).mockImplementation(() => ({
      generatePlanFromNote: mockGeneratePlanFromNote
    }));
    
    // Call the endpoint
    const response = await POST({ params: mockParams, locals: mockLocals } as any);
    
    // Verify the response
    expect(response.status).toBe(404);
    
    const responseData = await response.json();
    expect(responseData).toHaveProperty("message", "Notatka o podanym identyfikatorze nie istnieje");
  });
  
  it("should return 422 when note lacks sufficient data", async () => {
    // Setup mocks
    const mockParams = { noteId: "note-123" };
    const mockLocals = {
      supabase: {},
      session: { user: { id: "user-456" } }
    };
    
    // Mock environment variable
    vi.stubEnv("OPENROUTER_API_KEY", "mock-api-key");
    
    // Import and mock the services
    const { PlansService } = await import("../../../src/lib/services/plans.service");
    
    // Configure the mock implementation for this test to throw an insufficient data error
    const mockGeneratePlanFromNote = vi.fn().mockRejectedValue(
      new Error("Failed to generate plan: Insufficient note data. Missing: attractions, duration")
    );
    
    (PlansService as any).mockImplementation(() => ({
      generatePlanFromNote: mockGeneratePlanFromNote
    }));
    
    // Call the endpoint
    const response = await POST({ params: mockParams, locals: mockLocals } as any);
    
    // Verify the response
    expect(response.status).toBe(422);
    
    const responseData = await response.json();
    expect(responseData).toHaveProperty("message", "Notatka nie zawiera wystarczających danych do wygenerowania planu");
    expect(responseData).toHaveProperty("details");
  });
  
  it("should return 500 when AI service is unavailable", async () => {
    // Setup mocks
    const mockParams = { noteId: "note-123" };
    const mockLocals = {
      supabase: {},
      session: { user: { id: "user-456" } }
    };
    
    // Mock environment variable
    vi.stubEnv("OPENROUTER_API_KEY", "mock-api-key");
    
    // Import and mock the services
    const { PlansService } = await import("../../../src/lib/services/plans.service");
    
    // Configure the mock implementation for this test to throw an AI service error
    const mockGeneratePlanFromNote = vi.fn().mockRejectedValue(
      new Error("Failed to generate plan: Failed to generate AI response: AI service unavailable")
    );
    
    (PlansService as any).mockImplementation(() => ({
      generatePlanFromNote: mockGeneratePlanFromNote
    }));
    
    // Call the endpoint
    const response = await POST({ params: mockParams, locals: mockLocals } as any);
    
    // Verify the response
    expect(response.status).toBe(500);
    
    const responseData = await response.json();
    expect(responseData).toHaveProperty("message", "Wystąpił błąd podczas generowania planu");
    expect(responseData).toHaveProperty("error_id");
  });
  
  it("should return 500 when OpenRouter API key is missing", async () => {
    // Setup mocks
    const mockParams = { noteId: "note-123" };
    const mockLocals = {
      supabase: {},
      session: { user: { id: "user-456" } }
    };
    
    // Mock missing environment variable
    vi.stubEnv("OPENROUTER_API_KEY", "");
    
    // Call the endpoint
    const response = await POST({ params: mockParams, locals: mockLocals } as any);
    
    // Verify the response
    expect(response.status).toBe(500);
    
    const responseData = await response.json();
    expect(responseData).toHaveProperty("message", "Konfiguracja serwera jest nieprawidłowa");
  });
}); 