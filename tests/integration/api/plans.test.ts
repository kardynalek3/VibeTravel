import { describe, it, expect, vi, beforeEach } from "vitest";
import type { APIRoute } from "astro";

// Mock UUID validation
vi.mock("uuid", () => ({
  validate: vi.fn((id) => id !== "invalid-uuid-format")
}));

describe("GET /api/plans/:id", () => {
  // Store the original implementation of the endpoint
  let GET: APIRoute;
  
  beforeEach(async () => {
    // Clear all mocks between tests
    vi.clearAllMocks();
    
    // Ensure we're mocking the right modules before importing the handler
    vi.doMock("../../../src/lib/services/plans.service", () => {
      return {
        PlansService: vi.fn()
      };
    });
    
    // Reload the module to get a fresh instance of the endpoint
    vi.resetModules();
    const module = await import("../../../src/pages/api/plans/[id]");
    GET = module.GET;
  });
  
  it("should return 200 and plan data for a public plan", async () => {
    // Setup mocks
    const mockParams = { id: "public-plan-123" };
    const mockLocals = {
      supabase: {},
      session: { user: { id: "user-456" } }
    };
    
    // Import and mock the PlansService
    const { PlansService } = await import("../../../src/lib/services/plans.service");
    
    // Configure the mock implementation for this test
    const mockGetPlanById = vi.fn().mockResolvedValue({
      id: "public-plan-123",
      note_id: "note-123",
      content: { title: "Public Test Plan", days: [] },
      is_public: true,
      likes_count: 5,
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
      getPlanById: mockGetPlanById
    }));
    
    // Call the endpoint
    const response = await GET({ params: mockParams, locals: mockLocals } as any);
    
    // Verify the response
    expect(response.status).toBe(200);
    
    const responseData = await response.json();
    expect(responseData).toHaveProperty("id", "public-plan-123");
    expect(responseData).toHaveProperty("is_public", true);
    expect(responseData.user).toHaveProperty("first_name", "Jan");
    expect(responseData.destination).toHaveProperty("city", "Kraków");
    
    // Verify that the service was called with the correct parameters
    expect(mockGetPlanById).toHaveBeenCalledWith("public-plan-123", "user-456");
  });
  
  it("should return 403 for private plan accessed by unauthorized user", async () => {
    // Setup mocks
    const mockParams = { id: "private-plan-456" };
    const mockLocals = {
      supabase: {},
      session: { user: { id: "user-456" } }
    };
    
    // Import and mock the PlansService
    const { PlansService } = await import("../../../src/lib/services/plans.service");
    
    // Configure the mock implementation for this test
    const mockGetPlanById = vi.fn().mockRejectedValue(
      new Error("Forbidden: You do not have permission to view this plan")
    );
    
    (PlansService as any).mockImplementation(() => ({
      getPlanById: mockGetPlanById
    }));
    
    // Call the endpoint
    const response = await GET({ params: mockParams, locals: mockLocals } as any);
    
    // Verify the response
    expect(response.status).toBe(403);
    
    const responseData = await response.json();
    expect(responseData).toHaveProperty("message", "Brak uprawnień do wyświetlenia tego planu");
    
    // Verify that the service was called with the correct parameters
    expect(mockGetPlanById).toHaveBeenCalledWith("private-plan-456", "user-456");
  });
  
  it("should return 404 for non-existent plan", async () => {
    // Setup mocks
    const mockParams = { id: "non-existent" };
    const mockLocals = {
      supabase: {},
      session: { user: { id: "user-123" } }
    };
    
    // Import and mock the PlansService
    const { PlansService } = await import("../../../src/lib/services/plans.service");
    
    // Configure the mock implementation for this test
    const mockGetPlanById = vi.fn().mockRejectedValue(
      new Error("Plan not found")
    );
    
    (PlansService as any).mockImplementation(() => ({
      getPlanById: mockGetPlanById
    }));
    
    // Call the endpoint
    const response = await GET({ params: mockParams, locals: mockLocals } as any);
    
    // Verify the response
    expect(response.status).toBe(404);
    
    const responseData = await response.json();
    expect(responseData).toHaveProperty("message", "Plan o podanym identyfikatorze nie istnieje");
    
    // Verify that the service was called with the correct parameters
    expect(mockGetPlanById).toHaveBeenCalledWith("non-existent", "user-123");
  });
  
  it("should return 400 for invalid UUID format", async () => {
    // Setup mocks with an invalid UUID
    const mockParams = { id: "invalid-uuid-format" };
    const mockLocals = { 
      supabase: {},
      session: { user: { id: "user-123" } }
    };
    
    // Call the endpoint (the UUID validation is already mocked at the top)
    const response = await GET({ params: mockParams, locals: mockLocals } as any);
    
    // Verify the response
    expect(response.status).toBe(400);
    
    const responseData = await response.json();
    expect(responseData).toHaveProperty("message", "Nieprawidłowy format identyfikatora planu");
  });
}); 