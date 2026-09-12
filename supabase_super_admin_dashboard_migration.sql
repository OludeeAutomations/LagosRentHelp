-- LagosRentHelp: super-admin dashboard and landlord portfolio reporting
-- Run after supabase_admin_verification_migration.sql.

begin;

create index if not exists properties_created_by_idx
  on public.properties (created_by);

create or replace function public.get_super_admin_landlords()
returns table (
  user_id text,
  name text,
  email text,
  phone text,
  business_name text,
  whatsapp_number text,
  residential_address text,
  state text,
  local_government text,
  bio text,
  verification_status text,
  verification_note text,
  joined_at timestamptz,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  listing_count bigint,
  available_listings bigint,
  rented_listings bigint,
  total_views bigint,
  total_likes bigint,
  latest_listing_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if coalesce(public.current_app_role(), '') <> 'super_admin' then
    raise exception 'Super administrator access required';
  end if;

  return query
  select
    app_user.id,
    app_user.name,
    app_user.email,
    app_user.phone,
    profile.business_name,
    profile.whatsapp_number,
    profile.residential_address,
    profile.state,
    profile.local_government,
    profile.bio,
    profile.verification_status,
    profile.verification_note,
    profile.created_at,
    verification.submitted_at,
    profile.reviewed_at,
    count(property.id)::bigint,
    (count(property.id) filter (where property.status = 'available'))::bigint,
    (count(property.id) filter (where property.status = 'rented'))::bigint,
    coalesce(sum(property.views), 0)::bigint,
    coalesce(sum(property.likes), 0)::bigint,
    max(property.created_at)
  from public.landlord_profiles profile
  join public.users app_user on app_user.id = profile.user_id
  left join public.landlord_verifications verification
    on verification.user_id = profile.user_id
  left join public.properties property
    on property.created_by = profile.user_id
  group by
    app_user.id,
    app_user.name,
    app_user.email,
    app_user.phone,
    profile.business_name,
    profile.whatsapp_number,
    profile.residential_address,
    profile.state,
    profile.local_government,
    profile.bio,
    profile.verification_status,
    profile.verification_note,
    profile.created_at,
    verification.submitted_at,
    profile.reviewed_at
  order by profile.created_at desc;
end;
$$;

revoke all on function public.get_super_admin_landlords() from public;
grant execute on function public.get_super_admin_landlords() to authenticated;

commit;
