-- Migration: create_base_tables
-- Created at: 2025-05-17 23:39:00
-- Description: Creates the core tables for VibeTravels application
--
-- This migration establishes the foundational tables including:
-- profiles, destinations, notes, plans, likes, and ai_errors

-- create profiles table
-- extends auth.users with user preferences and statistics
create table profiles (
    id uuid references auth.users(id) primary key,
    first_name text not null,
    last_name text not null,
    email text not null unique,
    gender text,
    encrypted_password text not null,
    preferred_segment segment_type,
    preferred_trip_type trip_type,
    preferred_transport transport_type,
    favorite_destinations text[],
    plans_count int default 0,
    likes_received_count int default 0,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- enable row level security on profiles
alter table profiles enable row level security;

-- add comment to profiles table
comment on table profiles is 'User profiles containing preferences and statistics';

-- create destinations table
create table destinations (
    id serial primary key,
    city text not null,
    country text not null,
    location geography(point, 4326) not null,
    created_at timestamp with time zone default now()
);

-- enable row level security on destinations
alter table destinations enable row level security;

-- add comment to destinations table
comment on table destinations is 'Travel destinations with geographical coordinates';

-- create notes table
create table notes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) not null,
    destination_id int references destinations(id) not null,
    segment segment_type,
    transport transport_type,
    duration int not null check (duration between 1 and 5),
    attractions text not null check (length(attractions) <= 500),
    is_draft boolean default true,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    deleted_at timestamp with time zone
);

-- enable row level security on notes
alter table notes enable row level security;

-- add comment to notes table
comment on table notes is 'User travel notes with limited character count';

-- create plans table
create table plans (
    id uuid primary key default gen_random_uuid(),
    note_id uuid references notes(id) not null,
    user_id uuid references auth.users(id) not null,
    destination_id int references destinations(id) not null,
    content jsonb not null check (length(content::text) <= 5000),
    is_public boolean default true,
    likes_count int default 0,
    created_at timestamp with time zone default now(),
    deleted_at timestamp with time zone
);

-- enable row level security on plans
alter table plans enable row level security;

-- add comment to plans table
comment on table plans is 'AI-generated travel plans based on user notes';

-- Create a function to enforce the maximum plans per note limit
CREATE OR REPLACE FUNCTION enforce_max_plans_per_note()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM plans 
      WHERE note_id = NEW.note_id AND deleted_at IS NULL) >= 3 THEN
    RAISE EXCEPTION 'Maximum of 3 plans per note reached.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to execute the function before insert/update
CREATE TRIGGER max_plans_per_note_trigger
BEFORE INSERT OR UPDATE ON plans
FOR EACH ROW
EXECUTE FUNCTION enforce_max_plans_per_note();

-- create likes table
create table likes (
    id serial primary key,
    user_id uuid references auth.users(id) not null,
    plan_id uuid references plans(id) not null,
    created_at timestamp with time zone default now(),
    
    -- ensure one like per user per plan
    unique(user_id, plan_id)
);

-- enable row level security on likes
alter table likes enable row level security;

-- add comment to likes table
comment on table likes is 'User likes for travel plans';

-- create ai_errors table
create table ai_errors (
    id serial primary key,
    user_id uuid references auth.users(id),
    note_id uuid references notes(id),
    error_type text not null,
    error_message text not null,
    input_data text,
    created_at timestamp with time zone default now()
);

-- enable row level security on ai_errors
alter table ai_errors enable row level security;

-- add comment to ai_errors table
comment on table ai_errors is 'Logs of AI generation errors'; 