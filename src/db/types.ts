export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      notes: {
        Row: {
          id: string;
          user_id: string;
          destination_id: number;
          segment: string | null;
          transport: string | null;
          duration: number;
          attractions: string;
          is_draft: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          destination_id: number;
          segment?: string | null;
          transport?: string | null;
          duration: number;
          attractions: string;
          is_draft?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          destination_id?: number;
          segment?: string | null;
          transport?: string | null;
          duration?: number;
          attractions?: string;
          is_draft?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      destinations: {
        Row: {
          id: number;
          city: string;
          country: string;
          location: unknown;
          created_at: string;
        };
        Insert: {
          id?: number;
          city: string;
          country: string;
          location: unknown;
          created_at?: string;
        };
        Update: {
          id?: number;
          city?: string;
          country?: string;
          location?: unknown;
          created_at?: string;
        };
      };
      generation_limits: {
        Row: {
          id: string;
          user_id: string;
          remaining_generations: number;
          reset_time: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          remaining_generations: number;
          reset_time: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          remaining_generations?: number;
          reset_time?: string;
          created_at?: string;
        };
      };
      plans: {
        Row: {
          id: string;
          note_id: string;
          user_id: string;
          destination_id: number;
          content: Json;
          is_public: boolean;
          likes_count: number;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          note_id: string;
          user_id: string;
          destination_id: number;
          content: Json;
          is_public?: boolean;
          likes_count?: number;
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          note_id?: string;
          user_id?: string;
          destination_id?: number;
          content?: Json;
          is_public?: boolean;
          likes_count?: number;
          created_at?: string;
          deleted_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      generate_plan: {
        Args: {
          note_id: string;
        };
        Returns: {
          plan_id: string;
        };
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
