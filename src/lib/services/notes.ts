import type { NoteCreateDTO, NoteResponseDTO, NoteUpdateDTO } from '@/types';

const API_BASE_URL = '/api/notes';

export class NotesService {
  static async create(data: NoteCreateDTO): Promise<NoteResponseDTO> {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create note');
    }

    return response.json();
  }

  static async update(id: string, data: NoteUpdateDTO): Promise<NoteResponseDTO> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update note');
    }

    return response.json();
  }

  static async getById(id: string): Promise<NoteResponseDTO> {
    const response = await fetch(`${API_BASE_URL}/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch note');
    }

    return response.json();
  }

  static async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete note');
    }
  }
} 