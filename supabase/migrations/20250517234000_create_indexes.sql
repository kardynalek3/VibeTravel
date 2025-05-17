-- Migration: create_indexes
-- Created at: 2025-05-17 23:40:00
-- Description: Creates indexes to optimize query performance
--
-- This migration adds indexes to frequently queried columns
-- and creates specialized indexes for better performance.

-- indexes for notes table
create index idx_notes_user_id on notes(user_id);
create index idx_notes_destination_id on notes(destination_id);
create index idx_notes_deleted_at_null on notes(deleted_at) where deleted_at is null;

-- add comments to notes indexes
comment on index idx_notes_user_id is 'Index to speed up queries filtering by user_id';
comment on index idx_notes_destination_id is 'Index to speed up queries filtering by destination_id';
comment on index idx_notes_deleted_at_null is 'Partial index for active (not deleted) notes';

-- indexes for plans table
create index idx_plans_user_id on plans(user_id);
create index idx_plans_note_id on plans(note_id);
create index idx_plans_destination_id on plans(destination_id);
create index idx_plans_deleted_at_null on plans(deleted_at) where deleted_at is null;
create index idx_plans_public on plans(created_at) where is_public = true and deleted_at is null;
create index idx_plans_content_gin on plans using gin (content);
create index idx_plans_likes_count on plans(likes_count desc) where is_public = true and deleted_at is null;

-- add comments to plans indexes
comment on index idx_plans_user_id is 'Index to speed up queries filtering by user_id';
comment on index idx_plans_note_id is 'Index to speed up queries filtering by note_id';
comment on index idx_plans_destination_id is 'Index to speed up queries filtering by destination_id';
comment on index idx_plans_deleted_at_null is 'Partial index for active (not deleted) plans';
comment on index idx_plans_public is 'Partial index for public and active plans';
comment on index idx_plans_content_gin is 'GIN index for efficient JSONB content searches';
comment on index idx_plans_likes_count is 'Index for sorting popular public plans';

-- indexes for likes table
create index idx_likes_user_id on likes(user_id);
create index idx_likes_plan_id on likes(plan_id);

-- add comments to likes indexes
comment on index idx_likes_user_id is 'Index to speed up queries filtering by user_id';
comment on index idx_likes_plan_id is 'Index to speed up queries filtering by plan_id';

-- indexes for destinations table
create index idx_destinations_location on destinations using gist (location);
create index idx_destinations_city on destinations(city);

-- add comments to destinations indexes
comment on index idx_destinations_location is 'Spatial index for geographical queries';
comment on index idx_destinations_city is 'Index to speed up city name searches'; 