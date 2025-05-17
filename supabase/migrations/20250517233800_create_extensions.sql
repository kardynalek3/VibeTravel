-- Migration: create_extensions
-- Created at: 2025-05-17 23:38:00
-- Description: Enables required PostgreSQL extensions for VibeTravels application
--
-- This migration enables PostGIS for geographical data handling
-- and pg_cron for scheduling database maintenance tasks.

-- enable postgis extension for geographical data
create extension if not exists "postgis";

-- enable pg_cron extension for scheduling tasks
create extension if not exists "pg_cron";

-- add comments explaining the purpose of each extension
comment on extension postgis is 'PostGIS geometry and geography spatial types and functions';
comment on extension pg_cron is 'Job scheduler for PostgreSQL'; 