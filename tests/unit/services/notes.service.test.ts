import { describe, it, expect, vi } from 'vitest';
import { NotesService } from '../../../src/lib/services/notes.service';
import { mockSupabaseClient } from '../../__mocks__/supabase.mock';
import { SegmentType, TransportType } from '../../../src/types';

// Mockowanie modułu supabase.client.ts
vi.mock('../../../src/db/supabase.client', () => ({
  supabaseClient: mockSupabaseClient,
}));

describe('NotesService', () => {
  let notesService: NotesService;
  const userId = 'test-user-id';

  beforeEach(() => {
    notesService = new NotesService(mockSupabaseClient);

    // Reset mocków przed każdym testem
    vi.resetAllMocks();
  });

  describe('createNote', () => {
    it('should create a note successfully', async () => {
      // Przygotowanie danych testowych
      const noteData = {
        destination_id: 1,
        segment: SegmentType.Family,
        transport: TransportType.Car,
        duration: 3,
        attractions: 'Test attractions',
        is_draft: true,
      };

      // Mockowanie odpowiedzi z bazy danych
      mockSupabaseClient.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 1, city: 'Kraków', country: 'Polska' },
              error: null,
            }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'test-note-id',
                user_id: userId,
                ...noteData,
                created_at: '2023-06-15T10:00:00Z',
                updated_at: '2023-06-15T10:00:00Z',
              },
              error: null,
            }),
          }),
        }),
      });

      // Wywołanie testowanej metody
      const result = await notesService.createNote(userId, noteData);

      // Weryfikacja wyniku
      expect(result).toHaveProperty('id', 'test-note-id');
      expect(result).toHaveProperty('user_id', userId);
      expect(result).toHaveProperty('destination_id', noteData.destination_id);
      expect(result).toHaveProperty('duration', noteData.duration);
      expect(result).toHaveProperty('attractions', noteData.attractions);
      expect(result).toHaveProperty('is_draft', noteData.is_draft);

      // Weryfikacja wywołań metod
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('destinations');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('notes');
    });

    it('should throw an error when destination does not exist', async () => {
      // Przygotowanie danych testowych
      const noteData = {
        destination_id: 999,
        segment: SegmentType.Family,
        transport: TransportType.Car,
        duration: 3,
        attractions: 'Test attractions',
        is_draft: true,
      };

      // Mockowanie odpowiedzi z bazy danych - brak danych dla wskazanego ID
      mockSupabaseClient.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Destination not found', code: 'PGRST116' },
            }),
          }),
        }),
      });

      // Weryfikacja, że metoda rzuca wyjątek
      await expect(notesService.createNote(userId, noteData)).rejects.toThrow(
        `Nie znaleziono miejsca docelowego o ID: ${noteData.destination_id}`
      );

      // Weryfikacja wywołań metod
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('destinations');
      expect(mockSupabaseClient.from).not.toHaveBeenCalledWith('notes');
    });
  });
});
