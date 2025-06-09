import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import NoteForm from "./NoteForm";
import { NotesService } from "@/lib/services/notes";
import { NoteFormContext } from "./NoteFormPage";
import { SegmentType, TransportType } from "@/types";
import { FormProvider, useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";

// Mock komponentów formularza
vi.mock("./DestinationSearch", () => ({
  default: ({ control }: any) => (
    <div>
      <label htmlFor="destination">Miejsce docelowe</label>
      <select id="destination" data-testid="destination-select" name="destination_id">
        <option value="">Wybierz miejsce</option>
        <option value="1">Warszawa, Polska</option>
      </select>
      <div data-testid="destination-error" role="alert" />
    </div>
  ),
}));

vi.mock("./SegmentSelect", () => ({
  default: ({ control }: any) => (
    <div>
      <label htmlFor="segment">Segment podróży</label>
      <select id="segment" data-testid="segment-select" name="segment">
        <option value="">Wybierz segment</option>
        <option value={SegmentType.Family}>Rodzina</option>
      </select>
      <div data-testid="segment-error" role="alert" />
    </div>
  ),
}));

vi.mock("./TransportSelect", () => ({
  default: ({ control }: any) => (
    <div>
      <label htmlFor="transport">Środek transportu</label>
      <select id="transport" data-testid="transport-select" name="transport">
        <option value="">Wybierz transport</option>
        <option value={TransportType.Car}>Samochód</option>
      </select>
      <div data-testid="transport-error" role="alert" />
    </div>
  ),
}));

vi.mock("./DurationSelect", () => ({
  default: ({ control }: any) => (
    <div>
      <label htmlFor="duration">Długość wycieczki</label>
      <select id="duration" data-testid="duration-select" name="duration">
        <option value="">Wybierz długość</option>
        <option value="1">1 dzień</option>
        <option value="2">2 dni</option>
        <option value="3">3 dni</option>
        <option value="4">4 dni</option>
        <option value="5">5 dni</option>
      </select>
      <div data-testid="duration-error" role="alert" />
    </div>
  ),
}));

vi.mock("./AttractionsTextarea", () => ({
  default: ({ control }: any) => (
    <div>
      <label htmlFor="attractions">Atrakcje i miejsca do odwiedzenia</label>
      <textarea
        id="attractions"
        data-testid="attractions-textarea"
        name="attractions"
        placeholder="Opisz atrakcje i miejsca, które chcesz odwiedzić..."
      />
      <div data-testid="attractions-error" role="alert" />
    </div>
  ),
}));

// Mock serwisu notatek
vi.mock("@/lib/services/notes", () => ({
  NotesService: {
    create: vi.fn(),
    update: vi.fn(),
    getById: vi.fn(),
  },
}));

// Mock kontekstu formularza
const mockContext = {
  isEditing: false,
  isDirty: false,
  setIsDirty: vi.fn(),
  lastSavedDraft: undefined,
  setLastSavedDraft: vi.fn(),
};

const renderNoteForm = (props = {}) => {
  return render(
    <NoteFormContext.Provider value={mockContext}>
      <NoteForm {...props} />
    </NoteFormContext.Provider>
  );
};

describe("NoteForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderuje formularz z wszystkimi polami", () => {
    renderNoteForm();

    expect(screen.getByTestId("destination-select")).toBeInTheDocument();
    expect(screen.getByTestId("segment-select")).toBeInTheDocument();
    expect(screen.getByTestId("transport-select")).toBeInTheDocument();
    expect(screen.getByTestId("duration-select")).toBeInTheDocument();
    expect(screen.getByTestId("attractions-textarea")).toBeInTheDocument();
  });

  it("wyświetla komunikaty o błędach przy próbie zapisu pustego formularza", async () => {
    renderNoteForm();
    const user = userEvent.setup();

    const submitButton = screen.getByRole("button", { name: /zapisz$/i });
    await user.click(submitButton);

    await waitFor(() => {
      const destinationError = screen.getByTestId("destination-error");
      const attractionsError = screen.getByTestId("attractions-error");

      expect(destinationError).toHaveAttribute("role", "alert");
      expect(attractionsError).toHaveAttribute("role", "alert");
    });
  });

  it("wywołuje API przy zapisie poprawnie wypełnionego formularza", async () => {
    renderNoteForm();
    const user = userEvent.setup();

    // Wypełnij formularz
    await user.selectOptions(screen.getByTestId("destination-select"), "1");
    await user.selectOptions(screen.getByTestId("segment-select"), SegmentType.Family);
    await user.selectOptions(screen.getByTestId("transport-select"), TransportType.Car);
    await user.selectOptions(screen.getByTestId("duration-select"), "3");
    await user.type(screen.getByTestId("attractions-textarea"), "Test atrakcji");

    const submitButton = screen.getByRole("button", { name: /zapisz$/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(NotesService.create).toHaveBeenCalledWith({
        destination_id: 1,
        segment: SegmentType.Family,
        transport: TransportType.Car,
        duration: 3,
        attractions: "Test atrakcji",
        is_draft: false,
      });
    });
  });

  it("ładuje i wyświetla dane istniejącej notatki", async () => {
    const mockNote = {
      id: "1",
      user_id: "1",
      destination: { id: 1, city: "Warszawa", country: "Polska" },
      segment: SegmentType.Family,
      transport: TransportType.Car,
      duration: 3,
      attractions: "Test atrakcji",
      is_draft: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    vi.mocked(NotesService.getById).mockResolvedValueOnce(mockNote);

    renderNoteForm({ noteId: "1" });

    await waitFor(() => {
      expect(NotesService.getById).toHaveBeenCalledWith("1");
      expect(screen.getByTestId("destination-select")).toHaveValue("1");
      expect(screen.getByTestId("segment-select")).toHaveValue(SegmentType.Family);
      expect(screen.getByTestId("transport-select")).toHaveValue(TransportType.Car);
      expect(screen.getByTestId("duration-select")).toHaveValue("3");
      expect(screen.getByTestId("attractions-textarea")).toHaveValue("Test atrakcji");
    });
  });

  it("obsługuje zapisywanie wersji roboczej", async () => {
    renderNoteForm();
    const user = userEvent.setup();

    // Wypełnij tylko wymagane pola
    await user.selectOptions(screen.getByTestId("destination-select"), "1");
    await user.type(screen.getByTestId("attractions-textarea"), "Test atrakcji");

    const draftButton = screen.getByRole("button", { name: /zapisz wersję roboczą/i });
    await user.click(draftButton);

    await waitFor(() => {
      expect(NotesService.create).toHaveBeenCalledWith({
        destination_id: 1,
        segment: SegmentType.Family,
        transport: TransportType.Car,
        duration: 1,
        attractions: "Test atrakcji",
        is_draft: true,
      });
      expect(mockContext.setLastSavedDraft).toHaveBeenCalled();
    });
  });
});
