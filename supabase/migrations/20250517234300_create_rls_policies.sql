-- Migration: create_rls_policies
-- Created at: 2025-05-17 23:43:00
-- Description: Creates Row Level Security (RLS) policies
--
-- This migration establishes RLS policies to control access to tables
-- based on user role and ownership.

---------------------------
-- RLS policies for profiles
---------------------------

-- select policy for authenticated users to access their own profile
create policy profiles_select_own on profiles
  for select to authenticated
  using (auth.uid() = id);

-- select policy for anon users - deny access
create policy profiles_select_anon on profiles
  for select to anon
  using (false);

-- update policy for authenticated users to update their own profile
create policy profiles_update_own on profiles
  for update to authenticated
  using (auth.uid() = id);

-- insert policy for authenticated users (automatically handled by Supabase Auth)
create policy profiles_insert_own on profiles
  for insert to authenticated
  with check (auth.uid() = id);

-- add comments to profile policies
comment on policy profiles_select_own on profiles is 'Users can view their own profile';
comment on policy profiles_select_anon on profiles is 'Anonymous users cannot view profiles';
comment on policy profiles_update_own on profiles is 'Users can update their own profile';
comment on policy profiles_insert_own on profiles is 'Users can insert their own profile';

---------------------------
-- RLS policies for notes
---------------------------

-- select policy for authenticated users to access their own notes
create policy notes_select_own on notes
  for select to authenticated
  using (auth.uid() = user_id and deleted_at is null);

-- select policy for anon users - deny access
create policy notes_select_anon on notes
  for select to anon
  using (false);

-- insert policy for authenticated users
create policy notes_insert_own on notes
  for insert to authenticated
  with check (auth.uid() = user_id);

-- update policy for authenticated users to update their own notes
create policy notes_update_own on notes
  for update to authenticated
  using (auth.uid() = user_id and deleted_at is null);

-- delete policy for authenticated users to soft delete their own notes
create policy notes_delete_own on notes
  for delete to authenticated
  using (auth.uid() = user_id);

-- add comments to notes policies
comment on policy notes_select_own on notes is 'Users can view their own active notes';
comment on policy notes_select_anon on notes is 'Anonymous users cannot view notes';
comment on policy notes_insert_own on notes is 'Users can create their own notes';
comment on policy notes_update_own on notes is 'Users can update their own active notes';
comment on policy notes_delete_own on notes is 'Users can delete their own notes';

---------------------------
-- RLS policies for plans
---------------------------

-- select policy for authenticated users to access their own plans and public plans
create policy plans_select_own on plans
  for select to authenticated
  using ((auth.uid() = user_id or is_public = true) and deleted_at is null);

-- select policy for anon users to access only public plans
create policy plans_select_public_anon on plans
  for select to anon
  using (is_public = true and deleted_at is null);

-- insert policy for authenticated users
create policy plans_insert_own on plans
  for insert to authenticated
  with check (auth.uid() = user_id);

-- update policy for authenticated users to update their own plans
create policy plans_update_own on plans
  for update to authenticated
  using (auth.uid() = user_id and deleted_at is null);

-- delete policy for authenticated users to soft delete their own plans
create policy plans_delete_own on plans
  for delete to authenticated
  using (auth.uid() = user_id);

-- add comments to plans policies
comment on policy plans_select_own on plans is 'Users can view their own plans and all public plans';
comment on policy plans_select_public_anon on plans is 'Anonymous users can only view public plans';
comment on policy plans_insert_own on plans is 'Users can create their own plans';
comment on policy plans_update_own on plans is 'Users can update their own plans';
comment on policy plans_delete_own on plans is 'Users can delete their own plans';

---------------------------
-- RLS policies for likes
---------------------------

-- select policy for all users to view likes
create policy likes_select_all_authenticated on likes
  for select to authenticated
  using (true);

-- select policy for anon users to view likes
create policy likes_select_all_anon on likes
  for select to anon
  using (true);

-- insert policy for authenticated users to like plans
create policy likes_insert_own on likes
  for insert to authenticated
  with check (auth.uid() = user_id);

-- delete policy for authenticated users to unlike plans
create policy likes_delete_own on likes
  for delete to authenticated
  using (auth.uid() = user_id);

-- add comments to likes policies
comment on policy likes_select_all_authenticated on likes is 'All authenticated users can view likes';
comment on policy likes_select_all_anon on likes is 'Anonymous users can view likes';
comment on policy likes_insert_own on likes is 'Users can like plans';
comment on policy likes_delete_own on likes is 'Users can remove their own likes';

---------------------------
-- RLS policies for destinations
---------------------------

-- select policy for all users to view destinations
create policy destinations_select_all_authenticated on destinations
  for select to authenticated
  using (true);

-- select policy for anon users to view destinations
create policy destinations_select_all_anon on destinations
  for select to anon
  using (true);

-- insert policy for service role only (admin operations)
create policy destinations_insert_admin on destinations
  for insert to service_role
  with check (true);

-- update policy for service role only (admin operations)
create policy destinations_update_admin on destinations
  for update to service_role
  using (true);

-- add comments to destinations policies
comment on policy destinations_select_all_authenticated on destinations is 'All authenticated users can view destinations';
comment on policy destinations_select_all_anon on destinations is 'Anonymous users can view destinations';
comment on policy destinations_insert_admin on destinations is 'Only service role can add destinations';
comment on policy destinations_update_admin on destinations is 'Only service role can update destinations';

---------------------------
-- RLS policies for ai_errors
---------------------------

-- select policy for admin access only
create policy ai_errors_select_admin on ai_errors
  for select to authenticated
  using (auth.uid() in (select id from auth.users where auth.users.role = 'admin'));

-- select policy for anon users - deny access
create policy ai_errors_select_anon on ai_errors
  for select to anon
  using (false);

-- insert policy for logging errors (allows application to log errors)
create policy ai_errors_insert_service on ai_errors
  for insert to service_role
  with check (true);

-- add comments to ai_errors policies
comment on policy ai_errors_select_admin on ai_errors is 'Only admins can view AI error logs';
comment on policy ai_errors_select_anon on ai_errors is 'Anonymous users cannot view AI error logs';
comment on policy ai_errors_insert_service on ai_errors is 'Service role can insert error logs'; 