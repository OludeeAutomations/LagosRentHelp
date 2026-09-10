-- LagosRentHelp: safe first-stage Row Level Security
-- Run this once in Supabase Dashboard -> SQL Editor.
--
-- This policy set matches the CURRENT architecture:
--   Browser -> Express backend -> Supabase (service role)
--
-- The Express backend will continue to work. Direct browser access is limited
-- to safe columns from approved properties and their public reviews. Users,
-- leads, and notifications remain backend-only until Supabase Auth replaces
-- the current custom JWT authentication.

begin;

-- Remove any old policies, including policies with names unknown to this repo.
do $$
declare
  policy_row record;
begin
  for policy_row in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('users', 'properties', 'leads', 'notifications', 'reviews')
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      policy_row.policyname,
      policy_row.schemaname,
      policy_row.tablename
    );
  end loop;
end
$$;

-- Turn RLS on for every application table.
alter table public.users enable row level security;
alter table public.properties enable row level security;
alter table public.leads enable row level security;
alter table public.notifications enable row level security;
alter table public.reviews enable row level security;

-- Remove broad Data API permissions first. The service_role is deliberately
-- not included here and remains available only to the server.
revoke all privileges on table public.users from public, anon, authenticated;
revoke all privileges on table public.properties from public, anon, authenticated;
revoke all privileges on table public.leads from public, anon, authenticated;
revoke all privileges on table public.notifications from public, anon, authenticated;
revoke all privileges on table public.reviews from public, anon, authenticated;

grant usage on schema public to anon, authenticated;

-- Public property catalogue. Internal ownership and approval-audit columns
-- are intentionally excluded from the browser-facing grant.
grant select (
  id,
  title,
  description,
  price,
  location,
  total_package_price,
  type,
  listing_type,
  bedrooms,
  bathrooms,
  area,
  amenities,
  images,
  status,
  approval_status,
  views,
  likes,
  rating,
  review_count,
  coordinates,
  available_from,
  minimum_stay,
  created_at,
  updated_at
) on table public.properties to anon, authenticated;

create policy "public can read approved properties"
on public.properties
for select
to anon, authenticated
using (approval_status = 'approved');

-- Public review fields. user_id and moderation counters stay private.
grant select (
  id,
  property_id,
  rating,
  comment,
  is_verified,
  response,
  response_date,
  helpful,
  created_at,
  updated_at
) on table public.reviews to anon, authenticated;

create policy "public can read reviews for approved properties"
on public.reviews
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.properties
    where properties.id = reviews.property_id
      and properties.approval_status = 'approved'
  )
);

-- No browser policies are intentionally created for users, leads, or
-- notifications. With RLS enabled and privileges revoked, those tables are
-- accessible only through trusted server-side code using service_role.

commit;

