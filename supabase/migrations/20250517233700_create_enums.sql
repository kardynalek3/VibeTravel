-- Migration: create_enums
-- Created at: 2025-05-17 23:37:00
-- Description: Creates ENUM types for VibeTravels application
--
-- This migration establishes the custom ENUM types used throughout the application
-- for categorizing travel segment types, trip types, and transport methods.

-- create segment type enum (family, couple, solo)
create type segment_type as enum ('family', 'couple', 'solo');

-- create trip type enum (touring, leisure)
create type trip_type as enum ('touring', 'leisure');

-- create transport type enum (car, public_transport, plane, walking)
create type transport_type as enum ('car', 'public_transport', 'plane', 'walking');

-- Add comments to enum types for better documentation
comment on type segment_type is 'Types of travel segments (family, couple, solo)';
comment on type trip_type is 'Types of trips (touring, leisure)';
comment on type transport_type is 'Types of transportation methods'; 