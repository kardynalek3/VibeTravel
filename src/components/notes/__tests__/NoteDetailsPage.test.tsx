import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import NoteDetailsPage from "../NoteDetailsPage";
import { SegmentType, TransportType } from "@/types";
import type { NoteResponseDTO } from "@/types";
import { useNoteDetails } from "@/components/notes/hooks/useNoteDetails";
import { useGenerationLimit } from "@/components/notes/hooks/useGenerationLimit";
import { useDeleteNote } from "@/components/notes/hooks/useDeleteNote";
import { useGeneratePlan } from "@/components/notes/hooks/useGeneratePlan";

// Mock the hooks
vi.mock("@/components/notes/hooks/useNoteDetails", () => ({
  useNoteDetails: vi.fn(),
}));

vi.mock("@/components/notes/hooks/useGenerationLimit", () => ({
  useGenerationLimit: vi.fn(),
}));

vi.mock("@/components/notes/hooks/useDeleteNote", () => ({
  useDeleteNote: vi.fn(),
}));

vi.mock("@/components/notes/hooks/useGeneratePlan", () => ({
  useGeneratePlan: vi.fn(),
}));

const mockNote: NoteResponseDTO = {
  id: "note-1",
  user_id: "user-1",
  destination: {
    id: 1,
    city: "Kraków",
    country: "Polska",
  },
  segment: SegmentType.Family,
  transport: TransportType.Car,
  duration: 3,
  attractions: "Wawel\nSukiennice\nKościół Mariacki",
  is_draft: false,
  created_at: "2024-01-01T12:00:00Z",
  updated_at: "2024-01-01T12:00:00Z",
};

describe("NoteDetailsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("wyświetla skeleton podczas ładowania", () => {
    vi.mocked(useNoteDetails).mockReturnValue({
      isLoading: true,
      error: "Wystąpił nieznany błąd",
      note: undefined,
    });

    vi.mocked(useGenerationLimit).mockReturnValue({
      remainingGenerations: 5,
      resetTime: "2024-01-02T12:00:00Z",
      isLoading: false,
      error: null,
    });

    render(<NoteDetailsPage noteId="note-1" />);

    expect(screen.getByTestId("loading-skeleton")).toBeInTheDocument();
  });

  it("wyświetla błąd gdy nie udało się pobrać notatki", () => {
    vi.mocked(useNoteDetails).mockReturnValue({
      isLoading: false,
      error: "Nie udało się pobrać notatki",
      note: undefined,
    });

    vi.mocked(useGenerationLimit).mockReturnValue({
      remainingGenerations: 5,
      resetTime: "2024-01-02T12:00:00Z",
      isLoading: false,
      error: null,
    });

    render(<NoteDetailsPage noteId="note-1" />);

    expect(screen.getByText("Nie udało się pobrać notatki")).toBeInTheDocument();
  });

  it("wyświetla informację gdy notatka nie istnieje", () => {
    vi.mocked(useNoteDetails).mockReturnValue({
      isLoading: false,
      error: "Wystąpił nieznany błąd",
      note: undefined,
    });

    vi.mocked(useGenerationLimit).mockReturnValue({
      remainingGenerations: 5,
      resetTime: "2024-01-02T12:00:00Z",
      isLoading: false,
      error: null,
    });

    render(<NoteDetailsPage noteId="note-1" />);

    expect(screen.getByText("Nie znaleziono notatki.")).toBeInTheDocument();
  });

  it("wyświetla szczegóły notatki", () => {
    vi.mocked(useNoteDetails).mockReturnValue({
      isLoading: false,
      error: "Wystąpił nieznany błąd",
      note: mockNote,
    });

    vi.mocked(useGenerationLimit).mockReturnValue({
      remainingGenerations: 5,
      resetTime: "2024-01-02T12:00:00Z",
      isLoading: false,
      error: null,
    });

    vi.mocked(useDeleteNote).mockReturnValue({
      deleteNote: vi.fn(),
      isDeleting: false,
    });

    vi.mocked(useGeneratePlan).mockReturnValue({
      generatePlan: vi.fn(),
      isGenerating: false,
    });

    render(<NoteDetailsPage noteId="note-1" />);

    expect(screen.getByText("Kraków, Polska")).toBeInTheDocument();
    expect(screen.getByText(/Wawel/)).toBeInTheDocument();
  });

  it("obsługuje usuwanie notatki", async () => {
    const mockDeleteNote = vi.fn();

    vi.mocked(useNoteDetails).mockReturnValue({
      isLoading: false,
      error: "Wystąpił nieznany błąd",
      note: mockNote,
    });

    vi.mocked(useGenerationLimit).mockReturnValue({
      remainingGenerations: 5,
      resetTime: "2024-01-02T12:00:00Z",
      isLoading: false,
      error: null,
    });

    vi.mocked(useDeleteNote).mockReturnValue({
      deleteNote: mockDeleteNote,
      isDeleting: false,
    });

    vi.mocked(useGeneratePlan).mockReturnValue({
      generatePlan: vi.fn(),
      isGenerating: false,
    });

    render(<NoteDetailsPage noteId="note-1" />);

    const deleteButton = screen.getByText("Usuń");
    await userEvent.click(deleteButton);

    const confirmButton = screen.getByText("Usuń", { selector: "button[role='button']" });
    await userEvent.click(confirmButton);

    expect(mockDeleteNote).toHaveBeenCalledWith("note-1");
  });

  it("obsługuje generowanie planu", async () => {
    const mockGeneratePlan = vi.fn();

    vi.mocked(useNoteDetails).mockReturnValue({
      isLoading: false,
      error: "Wystąpił nieznany błąd",
      note: mockNote,
    });

    vi.mocked(useGenerationLimit).mockReturnValue({
      remainingGenerations: 5,
      resetTime: "2024-01-02T12:00:00Z",
      isLoading: false,
      error: null,
    });

    vi.mocked(useDeleteNote).mockReturnValue({
      deleteNote: vi.fn(),
      isDeleting: false,
    });

    vi.mocked(useGeneratePlan).mockReturnValue({
      generatePlan: mockGeneratePlan,
      isGenerating: false,
    });

    render(<NoteDetailsPage noteId="note-1" />);

    const generateButton = screen.getByText(/Generuj plan/);
    await userEvent.click(generateButton);

    expect(mockGeneratePlan).toHaveBeenCalledWith("note-1");
  });
});
