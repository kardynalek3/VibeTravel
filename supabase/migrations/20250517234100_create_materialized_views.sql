-- Migration: create_materialized_views
-- Created at: 2025-05-17 23:41:00
-- Description: Creates materialized views for commonly accessed data
--
-- This migration establishes materialized views for frequently queried data
-- to improve performance and reduce database load.

-- materialized view for popular public plans
create materialized view popular_public_plans as
select p.id, p.user_id, p.destination_id, p.content, p.likes_count,
       d.city as destination_city, d.location as destination_location,
       pr.first_name as user_first_name,
       left(pr.last_name, 1) as user_last_initial
from plans p
join destinations d on p.destination_id = d.id
join profiles pr on p.user_id = pr.id
where p.is_public = true and p.deleted_at is null
order by p.likes_count desc, p.created_at desc;

-- add comment to popular_public_plans view
comment on materialized view popular_public_plans is 'Pre-computed view of popular public travel plans';

-- materialized view for region activity
create materialized view region_activity as
select d.city, count(p.id) as plan_count
from plans p
join destinations d on p.destination_id = d.id
where p.is_public = true and p.deleted_at is null
group by d.city
order by plan_count desc;

-- add comment to region_activity view
comment on materialized view region_activity is 'Pre-computed view of plan activity by region';

-- indexes for materialized views
create index idx_popular_plans_likes on popular_public_plans(likes_count desc);
create index idx_popular_plans_destination on popular_public_plans(destination_city);
create index idx_region_activity_count on region_activity(plan_count desc);

-- add comments to materialized view indexes
comment on index idx_popular_plans_likes is 'Index for sorting popular plans by likes';
comment on index idx_popular_plans_destination is 'Index for filtering popular plans by destination';
comment on index idx_region_activity_count is 'Index for sorting regions by activity'; 