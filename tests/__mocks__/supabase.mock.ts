import type { Session, SupabaseClient, User } from '@supabase/supabase-js';

// Mock dla klienta Supabase używany w testach
export const mockSupabaseClient = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signInWithPassword: () =>
      Promise.resolve({
        data: {
          session: {
            access_token: 'mock-token',
            refresh_token: 'mock-refresh',
            expires_at: Date.now() + 3600,
            user: { id: 'test-user-id' } as User,
          } as Session,
        },
        error: null,
      }),
    signOut: () => Promise.resolve({ error: null }),
  },
  from: (table: string) => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: null }),
      }),
    }),
    insert: () => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: null }),
      }),
    }),
  }),
} as unknown as SupabaseClient;
