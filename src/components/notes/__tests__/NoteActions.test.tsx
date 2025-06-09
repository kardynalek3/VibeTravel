import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import NoteActions from "../NoteActions";

// Mock nawigacji
vi.mock("@/lib/hooks/useNavigate", () => ({
  useNavigate: () => vi.fn(),
}));

describe("NoteActions", () => {
  const mockProps = {
    noteId: "1",
    isDraft: false,
    generationLimitInfo: {
      remainingGenerations: 5,
      resetTime: "2024-01-02T12:00:00Z",
    },
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onGeneratePlan: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderuje wszystkie przyciski akcji dla normalnej notatki", () => {
    render(<NoteActions {...mockProps} />);

    expect(screen.getByText(/edytuj/i)).toBeInTheDocument();
    expect(screen.getByText(/usuń/i)).toBeInTheDocument();
    expect(screen.getByText(/generuj plan/i)).toBeInTheDocument();
  });

  it("nie wyświetla przycisku generowania planu dla wersji roboczej", () => {
    render(<NoteActions {...mockProps} isDraft={true} />);

    expect(screen.getByText(/edytuj/i)).toBeInTheDocument();
    expect(screen.getByText(/usuń/i)).toBeInTheDocument();
    expect(screen.queryByText(/generuj plan/i)).not.toBeInTheDocument();
  });

  it("wyłącza przycisk generowania planu gdy limit został wykorzystany", () => {
    render(
      <NoteActions
        {...mockProps}
        generationLimitInfo={{
          remainingGenerations: 0,
          resetTime: "2024-01-02T12:00:00Z",
        }}
      />
    );

    const generateButton = screen.getByText(/generuj plan/i);
    expect(generateButton).toBeDisabled();
  });

  it("wyświetla dialog potwierdzenia przy próbie usunięcia", async () => {
    const user = userEvent.setup();
    render(<NoteActions {...mockProps} />);

    const deleteButton = screen.getByText(/usuń/i);
    await user.click(deleteButton);

    expect(screen.getByText(/czy na pewno chcesz usunąć/i)).toBeInTheDocument();
    expect(screen.getByText(/ta akcja jest nieodwracalna/i)).toBeInTheDocument();
  });

  it("wywołuje odpowiednie funkcje przy potwierdzeniu usunięcia", async () => {
    const user = userEvent.setup();
    render(<NoteActions {...mockProps} />);

    // Otwórz dialog
    const deleteButton = screen.getByText(/usuń/i);
    await user.click(deleteButton);

    // Potwierdź usunięcie
    const confirmButton = screen.getByRole("button", { name: /usuń/i });
    await user.click(confirmButton);

    expect(mockProps.onDelete).toHaveBeenCalled();
  });

  it("nie wywołuje funkcji usuwania przy anulowaniu", async () => {
    const user = userEvent.setup();
    render(<NoteActions {...mockProps} />);

    // Otwórz dialog
    const deleteButton = screen.getByText(/usuń/i);
    await user.click(deleteButton);

    // Anuluj usunięcie
    const cancelButton = screen.getByRole("button", { name: /anuluj/i });
    await user.click(cancelButton);

    expect(mockProps.onDelete).not.toHaveBeenCalled();
  });

  it("wywołuje funkcję generowania planu", async () => {
    const user = userEvent.setup();
    render(<NoteActions {...mockProps} />);

    const generateButton = screen.getByText(/generuj plan/i);
    await user.click(generateButton);

    expect(mockProps.onGeneratePlan).toHaveBeenCalled();
  });

  it("wyświetla pozostałą liczbę generowań", () => {
    render(<NoteActions {...mockProps} />);
    expect(screen.getByText(/\(5 pozostało\)/i)).toBeInTheDocument();
  });
});
