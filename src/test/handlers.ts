import { http, HttpResponse } from 'msw';
import { SegmentType, TransportType } from '@/types';
import type { NoteResponseDTO } from '@/types';

const mockNote: NoteResponseDTO = {
  id: '1',
  user_id: '1',
  destination: {
    id: 1,
    city: 'Warszawa',
    country: 'Polska',
  },
  segment: SegmentType.Family,
  transport: TransportType.Car,
  duration: 3,
  attractions: 'Pałac Kultury, Stare Miasto',
  is_draft: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const handlers = [
  // GET /api/notes/:id
  http.get('/api/notes/:id', ({ params }) => {
    return HttpResponse.json(mockNote);
  }),

  // POST /api/notes
  http.post('/api/notes', async ({ request }) => {
    const data = await request.json() as Partial<NoteResponseDTO>;
    return HttpResponse.json({
      ...mockNote,
      ...data,
      id: '2',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }),

  // PATCH /api/notes/:id
  http.patch('/api/notes/:id', async ({ params, request }) => {
    const data = await request.json() as Partial<NoteResponseDTO>;
    return HttpResponse.json({
      ...mockNote,
      ...data,
      updated_at: new Date().toISOString(),
    });
  }),

  // DELETE /api/notes/:id
  http.delete('/api/notes/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),
]; 