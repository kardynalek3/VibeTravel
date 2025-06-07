import { describe, it, expect, vi, beforeEach } from "vitest";
import { PlansService } from "../../../src/lib/services/plans.service";

describe("PlansService", () => {
  let mockSupabase: any;
  let plansService: PlansService;

  beforeEach(() => {
    // Create a mock Supabase client
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      single: vi.fn(),
      maybeSingle: vi.fn(),
    };

    plansService = new PlansService(mockSupabase);
    // Clear cache before each test
    plansService.clearCache();
  });

  it("should fetch a public plan successfully", async () => {
    // Mock plan data for a public plan
    const mockPlanData = {
      id: "plan-123",
      note_id: "note-123",
      content: { title: "Test Plan", days: [] },
      is_public: true,
      likes_count: 5,
      created_at: "2023-01-01T00:00:00Z",
      user_id: "user-123",
      destinations: [{ city: "Kraków", country: "Polska" }]
    };

    // Mock user data
    const mockUserData = {
      first_name: "Jan",
      last_name: "Kowalski"
    };

    // Set up mock responses
    mockSupabase.single
      .mockResolvedValueOnce({ data: mockPlanData, error: null })
      .mockResolvedValueOnce({ data: mockUserData, error: null });

    mockSupabase.maybeSingle
      .mockResolvedValueOnce({ data: null, error: null });

    // Call the service method (with a different user than the plan owner)
    const result = await plansService.getPlanById("plan-123", "other-user");

    // Verify the response
    expect(result).toEqual({
      id: "plan-123",
      note_id: "note-123",
      content: { title: "Test Plan", days: [] },
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

    // Verify that the correct Supabase queries were made
    expect(mockSupabase.from).toHaveBeenCalledWith("plans");
    expect(mockSupabase.is).toHaveBeenCalledWith("deleted_at", null);
  });

  it("should check if the plan is liked by the user", async () => {
    // Mock plan data
    const mockPlanData = {
      id: "plan-123",
      note_id: "note-123",
      content: { title: "Test Plan", days: [] },
      is_public: true,
      likes_count: 5,
      created_at: "2023-01-01T00:00:00Z",
      user_id: "user-123",
      destinations: [{ city: "Kraków", country: "Polska" }]
    };

    // Mock user data
    const mockUserData = {
      first_name: "Jan",
      last_name: "Kowalski"
    };

    // Set up mock responses
    mockSupabase.single
      .mockResolvedValueOnce({ data: mockPlanData, error: null })
      .mockResolvedValueOnce({ data: mockUserData, error: null });

    // Mock that the user has liked the plan
    mockSupabase.maybeSingle
      .mockResolvedValueOnce({ data: { id: 1 }, error: null });

    // Call the service method
    const result = await plansService.getPlanById("plan-123", "user-456");

    // Verify that is_liked_by_me is true
    expect(result.is_liked_by_me).toBe(true);
  });

  it("should throw an error for a private plan accessed by another user", async () => {
    // Mock plan data for a private plan
    const mockPlanData = {
      id: "plan-123",
      note_id: "note-123",
      content: { title: "Test Plan", days: [] },
      is_public: false,
      likes_count: 0,
      created_at: "2023-01-01T00:00:00Z",
      user_id: "user-123",
      destinations: [{ city: "Kraków", country: "Polska" }]
    };

    // Set up mock response
    mockSupabase.single.mockResolvedValueOnce({ data: mockPlanData, error: null });

    // Call the service method with a different user ID
    await expect(plansService.getPlanById("plan-123", "other-user"))
      .rejects.toThrow("Forbidden: You do not have permission to view this plan");
  });

  it("should throw an error when the plan is not found", async () => {
    // Mock a response for a non-existent plan
    mockSupabase.single.mockResolvedValueOnce({ data: null, error: null });

    // Call the service method
    await expect(plansService.getPlanById("non-existent", "user-123"))
      .rejects.toThrow("Plan not found");
  });

  it("should throw an error when destination data is missing", async () => {
    // Mock plan data with missing destination
    const mockPlanData = {
      id: "plan-123",
      note_id: "note-123",
      content: { title: "Test Plan", days: [] },
      is_public: true,
      likes_count: 5,
      created_at: "2023-01-01T00:00:00Z",
      user_id: "user-123",
      destinations: [] // Empty destinations array
    };

    // Mock user data
    const mockUserData = {
      first_name: "Jan",
      last_name: "Kowalski"
    };

    // Set up mock responses
    mockSupabase.single
      .mockResolvedValueOnce({ data: mockPlanData, error: null })
      .mockResolvedValueOnce({ data: mockUserData, error: null });
      
    // Call the service method
    await expect(plansService.getPlanById("plan-123", "user-123"))
      .rejects.toThrow("Destination data not found");
  });

  it("should return cached data for subsequent requests", async () => {
    // Mock plan data for a public plan
    const mockPlanData = {
      id: "plan-123",
      note_id: "note-123",
      content: { title: "Test Plan", days: [] },
      is_public: true,
      likes_count: 5,
      created_at: "2023-01-01T00:00:00Z",
      user_id: "user-123",
      destinations: [{ city: "Kraków", country: "Polska" }]
    };

    // Mock user data
    const mockUserData = {
      first_name: "Jan",
      last_name: "Kowalski"
    };

    // Set up mock responses for the first call
    mockSupabase.single
      .mockResolvedValueOnce({ data: mockPlanData, error: null })
      .mockResolvedValueOnce({ data: mockUserData, error: null });

    mockSupabase.maybeSingle
      .mockResolvedValueOnce({ data: null, error: null });

    // First call should hit the database
    await plansService.getPlanById("plan-123", "other-user");

    // Reset mocks to verify they aren't called again
    mockSupabase.from.mockClear();
    mockSupabase.select.mockClear();
    mockSupabase.eq.mockClear();
    mockSupabase.is.mockClear();
    mockSupabase.single.mockClear();
    mockSupabase.maybeSingle.mockClear();

    // Second call should use cached data
    const cachedResult = await plansService.getPlanById("plan-123", "other-user");

    // Verify that Supabase methods weren't called
    expect(mockSupabase.from).not.toHaveBeenCalled();
    expect(mockSupabase.select).not.toHaveBeenCalled();
    expect(mockSupabase.single).not.toHaveBeenCalled();

    // Verify the cached response is correct
    expect(cachedResult).toEqual({
      id: "plan-123",
      note_id: "note-123",
      content: { title: "Test Plan", days: [] },
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
  });
}); 