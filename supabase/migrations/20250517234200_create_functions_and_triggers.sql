-- Migration: create_functions_and_triggers
-- Created at: 2025-05-17 23:42:00
-- Description: Creates database functions and triggers
--
-- This migration establishes functions for materialized view refresh,
-- counter updates, data cleanup, and admin reporting.

-- function to refresh materialized views
create or replace function refresh_materialized_views()
returns void as $$
begin
  refresh materialized view concurrently popular_public_plans;
  refresh materialized view concurrently region_activity;
end;
$$ language plpgsql;

-- add comment to refresh function
comment on function refresh_materialized_views() is 'Function to refresh all materialized views concurrently';

-- schedule weekly refresh of materialized views (Sunday at midnight)
select cron.schedule('0 0 * * 0', 'select refresh_materialized_views()');

-- schedule weekly vacuum analyze (Sunday at 2 AM)
select cron.schedule('0 2 * * 0', 'vacuum analyze');

-- function to update plans counter
create or replace function update_plans_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update profiles set plans_count = plans_count + 1 where id = new.user_id;
  elsif tg_op = 'UPDATE' and new.deleted_at is not null and old.deleted_at is null then
    update profiles set plans_count = plans_count - 1 where id = new.user_id;
  end if;
  return null;
end;
$$ language plpgsql;

-- add comment to plans counter function
comment on function update_plans_count() is 'Trigger function to maintain plans count in user profiles';

-- function to update likes counter
create or replace function update_likes_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update plans set likes_count = likes_count + 1 where id = new.plan_id;
    update profiles set likes_received_count = likes_received_count + 1 
    where id = (select user_id from plans where id = new.plan_id);
  elsif tg_op = 'DELETE' then
    update plans set likes_count = likes_count - 1 where id = old.plan_id;
    update profiles set likes_received_count = likes_received_count - 1 
    where id = (select user_id from plans where id = old.plan_id);
  end if;
  return null;
end;
$$ language plpgsql;

-- add comment to likes counter function
comment on function update_likes_count() is 'Trigger function to maintain likes count in plans and profiles';

-- function to clean up old AI error logs
create or replace function cleanup_old_ai_errors()
returns void as $$
begin
  -- delete AI error logs older than one month
  delete from ai_errors
  where created_at < now() - interval '1 month';
end;
$$ language plpgsql;

-- add comment to cleanup function
comment on function cleanup_old_ai_errors() is 'Function to remove AI error logs older than one month';

-- schedule daily cleanup of old errors (3 AM)
select cron.schedule('0 3 * * *', 'select cleanup_old_ai_errors()');

-- function for admin dashboard statistics
create or replace function get_admin_dashboard_stats()
returns table (
  total_users bigint,
  total_plans bigint,
  total_likes bigint,
  avg_plans_per_user numeric,
  public_plans_count bigint,
  private_plans_count bigint,
  ai_errors_count bigint,
  top_destinations json
) as $$
begin
  return query
  select
    (select count(*) from profiles),
    (select count(*) from plans where deleted_at is null),
    (select count(*) from likes),
    (select coalesce(avg(plans_count), 0) from profiles),
    (select count(*) from plans where is_public = true and deleted_at is null),
    (select count(*) from plans where is_public = false and deleted_at is null),
    (select count(*) from ai_errors where created_at > (now() - interval '30 days')),
    (select json_agg(t) from (
      select city, plan_count from region_activity limit 10
    ) t);
end;
$$ language plpgsql;

-- add comment to admin stats function
comment on function get_admin_dashboard_stats() is 'Function to generate statistics for admin dashboard';

-- create triggers to maintain counters
create trigger tr_update_plans_count
after insert or update on plans
for each row execute function update_plans_count();

-- add comment to plans trigger
comment on trigger tr_update_plans_count on plans is 'Trigger to update plans count on insert or soft delete';

create trigger tr_update_likes_count
after insert or delete on likes
for each row execute function update_likes_count();

-- add comment to likes trigger
comment on trigger tr_update_likes_count on likes is 'Trigger to update likes count on insert or delete'; 