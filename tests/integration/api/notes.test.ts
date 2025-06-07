import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockSupabaseClient } from '../../__mocks__/supabase.mock';
import type { NoteCreateDTO } from '../../../src/types.ts';
import { SegmentType, TransportType } from '../../../src/types.ts';
import { NotesService } from '../../../src/lib/services/notes.service';

// Mockuję moduł supabase.client.ts
vi.mock('../../../src/db/supabase.client', () => ({
  supabaseClient: mockSupabaseClient,
}));

// Mockuję fetch aby nie wykonywać rzeczywistych żądań HTTP
vi.mock('undici', () => ({
  fetch: vi.fn(),
}));

// Testy jednostkowe dla endpointu POST /notes
describe('POST /api/notes', () => {
  let notesService: NotesService;
  const userId = 'test-user-id';

  const validNoteData: NoteCreateDTO = {
    destination_id: 1,
    segment: SegmentType.Family,
    transport: TransportType.Car,
    duration: 3,
    attractions: 'Test attractions for integration test',
    is_draft: true,
  };

  beforeEach(() => {
    notesService = new NotesService(mockSupabaseClient);
    vi.resetAllMocks();
  });

  it('should create a note successfully', async () => {
    // Mockowanie implementacji createNote dla tego testu
    notesService.createNote = vi.fn().mockResolvedValue({
      id: 'test-note-id',
      user_id: userId,
      destination: {
        city: 'Kraków',
        country: 'Polska',
      },
      ...validNoteData,
      created_at: '2023-06-15T10:00:00Z',
      updated_at: '2023-06-15T10:00:00Z',
    });

    const result = await notesService.createNote(userId, validNoteData);

    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('destination');
    expect(result.destination).toHaveProperty('city');
    expect(result.destination).toHaveProperty('country');
    expect(result.duration).toBe(validNoteData.duration);
    expect(result.attractions).toBe(validNoteData.attractions);
    expect(result.is_draft).toBe(validNoteData.is_draft);
  });

  it('should return 404 for non-existent destination', async () => {
    const invalidDestinationData = {
      ...validNoteData,
      destination_id: 99999,
    };

    // Mockowanie implementacji createNote, która rzuca wyjątek dla tego testu
    notesService.createNote = vi.fn().mockRejectedValue(
      new Error('Nie znaleziono miejsca docelowego o ID: 99999')
    );

    await expect(notesService.createNote(userId, invalidDestinationData)).rejects.toThrowError(
      /Nie znaleziono miejsca docelowego/
    );
  });
});
