-- LagosRentHelp: resident-powered Area Reviews
-- Run after supabase_landlord_migration.sql and
-- supabase_admin_verification_migration.sql in Supabase SQL Editor.

begin;

create extension if not exists pgcrypto;

create table if not exists public.area_review_locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  location_type text not null check (location_type in ('lga', 'neighbourhood', 'estate', 'street', 'building')),
  lga text not null,
  state text not null default 'Lagos',
  description text not null default '',
  status text not null default 'pending' check (status in ('pending', 'active', 'archived')),
  created_by text references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.area_review_locations alter column status set default 'pending';
alter table public.area_review_locations drop constraint if exists area_review_locations_status_check;
alter table public.area_review_locations
  add constraint area_review_locations_status_check
  check (status in ('pending', 'active', 'archived'));

alter table public.area_review_locations drop constraint if exists area_review_locations_location_type_check;
alter table public.area_review_locations
  add constraint area_review_locations_location_type_check
  check (location_type in ('lga', 'neighbourhood', 'estate', 'street', 'building'));

create table if not exists public.area_reviews (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.area_review_locations(id) on delete cascade,
  user_id text not null references public.users(id) on delete cascade,
  residency_status text not null check (residency_status in ('current', 'former')),
  property_type text not null,
  lived_from integer not null check (lived_from between 2000 and 2100),
  lived_to integer check (lived_to between 2000 and 2100 and lived_to >= lived_from),
  rent_amount numeric check (rent_amount is null or rent_amount >= 0),
  service_charge numeric check (service_charge is null or service_charge >= 0),
  move_in_cost numeric check (move_in_cost is null or move_in_cost >= 0),
  overall_rating integer not null check (overall_rating between 1 and 5),
  electricity_rating integer not null check (electricity_rating between 1 and 5),
  water_rating integer not null check (water_rating between 1 and 5),
  security_rating integer not null check (security_rating between 1 and 5),
  roads_rating integer not null check (roads_rating between 1 and 5),
  noise_rating integer not null check (noise_rating between 1 and 5),
  maintenance_rating integer not null check (maintenance_rating between 1 and 5),
  flood_risk text not null check (flood_risk in ('none', 'low', 'moderate', 'high', 'unsure')),
  headline text not null check (char_length(headline) between 5 and 90),
  review_text text not null check (char_length(review_text) between 80 and 1500),
  show_first_name boolean not null default false,
  evidence_verified boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  moderation_note text,
  reviewed_by text references public.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (location_id, user_id)
);

-- Area Reviews uses the same Supabase login as LagosRentHelp, but it must not
-- depend on a legacy public.users profile. Some older profiles were imported
-- with a phone number already attached to another auth identity, which made a
-- valid signed-in resident hit users_phone_key while submitting a review.
alter table public.area_reviews
  add column if not exists auth_user_id uuid references auth.users(id) on delete cascade,
  add column if not exists reviewer_name text,
  add column if not exists reviewer_email text;

alter table public.area_reviews alter column user_id drop not null;

update public.area_reviews review
set auth_user_id = app_user.auth_user_id,
    reviewer_name = coalesce(review.reviewer_name, app_user.name),
    reviewer_email = coalesce(review.reviewer_email, app_user.email)
from public.users app_user
where review.user_id = app_user.id
  and review.auth_user_id is null
  and app_user.auth_user_id is not null;

alter table public.area_reviews
  drop constraint if exists area_reviews_location_id_user_id_key;

create unique index if not exists area_reviews_location_auth_user_unique
  on public.area_reviews (location_id, auth_user_id)
  where auth_user_id is not null;

create index if not exists area_review_locations_search_idx
  on public.area_review_locations (lower(name), lower(lga));
create index if not exists area_reviews_public_idx
  on public.area_reviews (location_id, status, created_at desc);
create index if not exists area_reviews_moderation_idx
  on public.area_reviews (status, created_at desc);

alter table public.area_review_locations enable row level security;
alter table public.area_reviews enable row level security;

revoke all privileges on table public.area_review_locations from public, anon, authenticated;
revoke all privileges on table public.area_reviews from public, anon, authenticated;

insert into public.area_review_locations (name, slug, location_type, lga, description, status)
values
  ('Agege LGA', 'agege-lga', 'lga', 'Agege', 'Resident experiences covering rent, utilities, roads, flooding, security and daily life across Agege Local Government Area.', 'active'),
  ('Ajeromi-Ifelodun LGA', 'ajeromi-ifelodun-lga', 'lga', 'Ajeromi-Ifelodun', 'Resident experiences covering rent, utilities, roads, flooding, security and daily life across Ajeromi-Ifelodun Local Government Area.', 'active'),
  ('Alimosho LGA', 'alimosho-lga', 'lga', 'Alimosho', 'Resident experiences covering rent, utilities, roads, flooding, security and daily life across Alimosho Local Government Area.', 'active'),
  ('Amuwo-Odofin LGA', 'amuwo-odofin-lga', 'lga', 'Amuwo-Odofin', 'Resident experiences covering rent, utilities, roads, flooding, security and daily life across Amuwo-Odofin Local Government Area.', 'active'),
  ('Apapa LGA', 'apapa-lga', 'lga', 'Apapa', 'Resident experiences covering rent, utilities, roads, flooding, security and daily life across Apapa Local Government Area.', 'active'),
  ('Badagry LGA', 'badagry-lga', 'lga', 'Badagry', 'Resident experiences covering rent, utilities, roads, flooding, security and daily life across Badagry Local Government Area.', 'active'),
  ('Epe LGA', 'epe-lga', 'lga', 'Epe', 'Resident experiences covering rent, utilities, roads, flooding, security and daily life across Epe Local Government Area.', 'active'),
  ('Eti-Osa LGA', 'eti-osa-lga', 'lga', 'Eti-Osa', 'Resident experiences covering rent, utilities, roads, flooding, security and daily life across Eti-Osa Local Government Area.', 'active'),
  ('Ibeju-Lekki LGA', 'ibeju-lekki-lga', 'lga', 'Ibeju-Lekki', 'Resident experiences covering rent, utilities, roads, flooding, security and daily life across Ibeju-Lekki Local Government Area.', 'active'),
  ('Ifako-Ijaiye LGA', 'ifako-ijaiye-lga', 'lga', 'Ifako-Ijaiye', 'Resident experiences covering rent, utilities, roads, flooding, security and daily life across Ifako-Ijaiye Local Government Area.', 'active'),
  ('Ikeja LGA', 'ikeja-lga', 'lga', 'Ikeja', 'Resident experiences covering rent, utilities, roads, flooding, security and daily life across Ikeja Local Government Area.', 'active'),
  ('Ikorodu LGA', 'ikorodu-lga', 'lga', 'Ikorodu', 'Resident experiences covering rent, utilities, roads, flooding, security and daily life across Ikorodu Local Government Area.', 'active'),
  ('Kosofe LGA', 'kosofe-lga', 'lga', 'Kosofe', 'Resident experiences covering rent, utilities, roads, flooding, security and daily life across Kosofe Local Government Area.', 'active'),
  ('Lagos Island LGA', 'lagos-island-lga', 'lga', 'Lagos Island', 'Resident experiences covering rent, utilities, roads, flooding, security and daily life across Lagos Island Local Government Area.', 'active'),
  ('Lagos Mainland LGA', 'lagos-mainland-lga', 'lga', 'Lagos Mainland', 'Resident experiences covering rent, utilities, roads, flooding, security and daily life across Lagos Mainland Local Government Area.', 'active'),
  ('Mushin LGA', 'mushin-lga', 'lga', 'Mushin', 'Resident experiences covering rent, utilities, roads, flooding, security and daily life across Mushin Local Government Area.', 'active'),
  ('Ojo LGA', 'ojo-lga', 'lga', 'Ojo', 'Resident experiences covering rent, utilities, roads, flooding, security and daily life across Ojo Local Government Area.', 'active'),
  ('Oshodi-Isolo LGA', 'oshodi-isolo-lga', 'lga', 'Oshodi-Isolo', 'Resident experiences covering rent, utilities, roads, flooding, security and daily life across Oshodi-Isolo Local Government Area.', 'active'),
  ('Shomolu LGA', 'shomolu-lga', 'lga', 'Shomolu', 'Resident experiences covering rent, utilities, roads, flooding, security and daily life across Shomolu Local Government Area.', 'active'),
  ('Surulere LGA', 'surulere-lga', 'lga', 'Surulere', 'Resident experiences covering rent, utilities, roads, flooding, security and daily life across Surulere Local Government Area.', 'active'),
  ('Yaba', 'yaba', 'neighbourhood', 'Lagos Mainland', 'Share and discover first-hand living experiences from Yaba residents.', 'active'),
  ('Surulere', 'surulere', 'neighbourhood', 'Surulere', 'Real resident notes about costs, utilities, roads and daily life in Surulere.', 'active'),
  ('Ikeja', 'ikeja', 'neighbourhood', 'Ikeja', 'Resident-led information for renters considering Ikeja.', 'active'),
  ('Lekki Phase 1', 'lekki-phase-1', 'neighbourhood', 'Eti-Osa', 'Compare the real costs and living conditions reported around Lekki Phase 1.', 'active'),
  ('Ikotun', 'ikotun', 'neighbourhood', 'Alimosho', 'Practical housing experiences shared by people who live or have lived in Ikotun.', 'active'),
  ('Ajah', 'ajah', 'neighbourhood', 'Eti-Osa', 'Resident reviews of rent, flooding, utilities and commuting around Ajah.', 'active')
on conflict (slug) do nothing;

create or replace function public.get_area_review_locations(p_search text default null)
returns table (
  id uuid,
  name text,
  slug text,
  location_type text,
  lga text,
  state text,
  description text,
  review_count bigint,
  average_rating numeric,
  average_rent numeric,
  average_move_in_cost numeric,
  electricity_rating numeric,
  water_rating numeric,
  security_rating numeric,
  roads_rating numeric,
  noise_rating numeric,
  maintenance_rating numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select
    location.id,
    location.name,
    location.slug,
    location.location_type,
    location.lga,
    location.state,
    location.description,
    count(review.id) filter (where review.status = 'approved') as review_count,
    round(avg(review.overall_rating) filter (where review.status = 'approved'), 1) as average_rating,
    round(avg(review.rent_amount) filter (where review.status = 'approved' and review.rent_amount is not null), 0) as average_rent,
    round(avg(review.move_in_cost) filter (where review.status = 'approved' and review.move_in_cost is not null), 0) as average_move_in_cost,
    round(avg(review.electricity_rating) filter (where review.status = 'approved'), 1) as electricity_rating,
    round(avg(review.water_rating) filter (where review.status = 'approved'), 1) as water_rating,
    round(avg(review.security_rating) filter (where review.status = 'approved'), 1) as security_rating,
    round(avg(review.roads_rating) filter (where review.status = 'approved'), 1) as roads_rating,
    round(avg(review.noise_rating) filter (where review.status = 'approved'), 1) as noise_rating,
    round(avg(review.maintenance_rating) filter (where review.status = 'approved'), 1) as maintenance_rating
  from public.area_review_locations location
  left join public.area_reviews review on review.location_id = location.id
  where location.status = 'active'
    and (
      nullif(trim(p_search), '') is null
      or location.name ilike '%' || trim(p_search) || '%'
      or location.lga ilike '%' || trim(p_search) || '%'
    )
  group by location.id
  order by count(review.id) filter (where review.status = 'approved') desc, location.name;
$$;

create or replace function public.get_area_review_location(p_slug text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_location record;
  v_reviews jsonb;
begin
  select * into v_location
  from public.get_area_review_locations(null) summary
  where summary.slug = p_slug
  limit 1;

  if not found then return null; end if;

  select coalesce(jsonb_agg(review_row order by review_row.created_at desc), '[]'::jsonb)
  into v_reviews
  from (
    select
      review.id,
      case
        when review.show_first_name then split_part(
          coalesce(nullif(review.reviewer_name, ''), app_user.name, 'Lagos resident'),
          ' ',
          1
        )
        else 'Lagos resident'
      end as display_name,
      review.residency_status,
      review.property_type,
      review.lived_from,
      review.lived_to,
      review.rent_amount,
      review.service_charge,
      review.move_in_cost,
      review.overall_rating,
      review.electricity_rating,
      review.water_rating,
      review.security_rating,
      review.roads_rating,
      review.noise_rating,
      review.maintenance_rating,
      review.flood_risk,
      review.headline,
      review.review_text,
      review.evidence_verified,
      review.created_at
    from public.area_reviews review
    left join public.users app_user on app_user.id = review.user_id
    where review.location_id = v_location.id
      and review.status = 'approved'
  ) review_row;

  return jsonb_build_object(
    'location', to_jsonb(v_location),
    'reviews', v_reviews
  );
end;
$$;

create or replace function public.get_latest_area_reviews(p_limit integer default 6)
returns table (
  id uuid,
  location_name text,
  location_slug text,
  lga text,
  display_name text,
  residency_status text,
  property_type text,
  lived_from integer,
  lived_to integer,
  rent_amount numeric,
  service_charge numeric,
  move_in_cost numeric,
  overall_rating integer,
  electricity_rating integer,
  water_rating integer,
  security_rating integer,
  roads_rating integer,
  noise_rating integer,
  maintenance_rating integer,
  flood_risk text,
  headline text,
  review_text text,
  evidence_verified boolean,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    review.id,
    location.name,
    location.slug,
    location.lga,
    case
      when review.show_first_name then split_part(
        coalesce(nullif(review.reviewer_name, ''), app_user.name, 'Lagos resident'),
        ' ',
        1
      )
      else 'Lagos resident'
    end,
    review.residency_status,
    review.property_type,
    review.lived_from,
    review.lived_to,
    review.rent_amount,
    review.service_charge,
    review.move_in_cost,
    review.overall_rating,
    review.electricity_rating,
    review.water_rating,
    review.security_rating,
    review.roads_rating,
    review.noise_rating,
    review.maintenance_rating,
    review.flood_risk,
    review.headline,
    review.review_text,
    review.evidence_verified,
    review.created_at
  from public.area_reviews review
  join public.area_review_locations location on location.id = review.location_id
  left join public.users app_user on app_user.id = review.user_id
  where review.status = 'approved'
    and location.status = 'active'
  order by review.reviewed_at desc nulls last, review.created_at desc
  limit least(greatest(coalesce(p_limit, 6), 1), 12);
$$;

create or replace function public.submit_area_review(
  p_location_id uuid,
  p_location_name text,
  p_location_type text,
  p_lga text,
  p_residency_status text,
  p_property_type text,
  p_lived_from integer,
  p_lived_to integer,
  p_rent_amount numeric,
  p_service_charge numeric,
  p_move_in_cost numeric,
  p_overall_rating integer,
  p_electricity_rating integer,
  p_water_rating integer,
  p_security_rating integer,
  p_roads_rating integer,
  p_noise_rating integer,
  p_maintenance_rating integer,
  p_flood_risk text,
  p_headline text,
  p_review_text text,
  p_show_first_name boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_auth_user_id uuid := auth.uid();
  v_user_id text;
  v_reviewer_name text := coalesce(
    auth.jwt() -> 'user_metadata' ->> 'full_name',
    auth.jwt() -> 'user_metadata' ->> 'name',
    split_part(coalesce(auth.jwt() ->> 'email', ''), '@', 1),
    'Lagos resident'
  );
  v_reviewer_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_location_id uuid := p_location_id;
  v_slug text;
  v_review public.area_reviews%rowtype;
begin
  if v_auth_user_id is null then raise exception 'Sign in to submit a resident review'; end if;
  v_user_id := public.current_public_user_id();
  if p_location_type not in ('lga', 'neighbourhood', 'estate', 'street', 'building') then raise exception 'Select a valid location type'; end if;
  if p_residency_status not in ('current', 'former') then raise exception 'Select a valid residency status'; end if;
  if p_flood_risk not in ('none', 'low', 'moderate', 'high', 'unsure') then raise exception 'Select a valid flooding experience'; end if;
  if nullif(trim(p_location_name), '') is null or nullif(trim(p_lga), '') is null then raise exception 'Provide the location and local government area'; end if;
  if char_length(trim(p_headline)) not between 5 and 90 or char_length(trim(p_review_text)) not between 80 and 1500 then raise exception 'Write a headline and a review between 80 and 1,500 characters'; end if;
  if p_lived_from > extract(year from now())::integer or (p_lived_to is not null and p_lived_to > extract(year from now())::integer) then raise exception 'Residency years cannot be in the future'; end if;

  if v_location_id is not null and not exists (
    select 1 from public.area_review_locations where id = v_location_id and status = 'active'
  ) then
    raise exception 'This review location is no longer available';
  end if;

  if v_location_id is null then
    select location.id into v_location_id
    from public.area_review_locations location
    where lower(location.name) = lower(trim(p_location_name))
      and lower(location.lga) = lower(trim(p_lga))
      and location.status in ('active', 'pending')
    limit 1;

    if v_location_id is null then
      v_slug := trim(both '-' from regexp_replace(lower(trim(p_location_name)), '[^a-z0-9]+', '-', 'g'));
      if v_slug = '' then v_slug := 'lagos-location'; end if;
      if exists (select 1 from public.area_review_locations where slug = v_slug) then
        v_slug := v_slug || '-' || trim(both '-' from regexp_replace(lower(trim(p_lga)), '[^a-z0-9]+', '-', 'g'));
      end if;
      if exists (select 1 from public.area_review_locations where slug = v_slug) then
        v_slug := v_slug || '-' || substr(gen_random_uuid()::text, 1, 6);
      end if;

      insert into public.area_review_locations (name, slug, location_type, lga, description, created_by)
      values (
        trim(p_location_name), v_slug, p_location_type, trim(p_lga),
        'Resident experiences and practical rental information for ' || trim(p_location_name) || '.',
        v_user_id
      ) returning id into v_location_id;
    end if;
  end if;

  insert into public.area_reviews (
    location_id, user_id, auth_user_id, reviewer_name, reviewer_email,
    residency_status, property_type, lived_from, lived_to,
    rent_amount, service_charge, move_in_cost, overall_rating,
    electricity_rating, water_rating, security_rating, roads_rating,
    noise_rating, maintenance_rating, flood_risk, headline, review_text,
    show_first_name, status, moderation_note, reviewed_by, reviewed_at
  ) values (
    v_location_id, v_user_id, v_auth_user_id, v_reviewer_name, v_reviewer_email,
    p_residency_status, trim(p_property_type), p_lived_from,
    case when p_residency_status = 'current' then null else p_lived_to end,
    p_rent_amount, p_service_charge, p_move_in_cost, p_overall_rating,
    p_electricity_rating, p_water_rating, p_security_rating, p_roads_rating,
    p_noise_rating, p_maintenance_rating, p_flood_risk, trim(p_headline),
    trim(p_review_text), p_show_first_name, 'pending', null, null, null
  )
  on conflict (location_id, auth_user_id) where auth_user_id is not null do update set
    user_id = excluded.user_id,
    reviewer_name = excluded.reviewer_name,
    reviewer_email = excluded.reviewer_email,
    residency_status = excluded.residency_status,
    property_type = excluded.property_type,
    lived_from = excluded.lived_from,
    lived_to = excluded.lived_to,
    rent_amount = excluded.rent_amount,
    service_charge = excluded.service_charge,
    move_in_cost = excluded.move_in_cost,
    overall_rating = excluded.overall_rating,
    electricity_rating = excluded.electricity_rating,
    water_rating = excluded.water_rating,
    security_rating = excluded.security_rating,
    roads_rating = excluded.roads_rating,
    noise_rating = excluded.noise_rating,
    maintenance_rating = excluded.maintenance_rating,
    flood_risk = excluded.flood_risk,
    headline = excluded.headline,
    review_text = excluded.review_text,
    show_first_name = excluded.show_first_name,
    status = 'pending',
    moderation_note = null,
    reviewed_by = null,
    reviewed_at = null,
    updated_at = now()
  returning * into v_review;

  return jsonb_build_object('id', v_review.id, 'status', v_review.status);
end;
$$;

create or replace function public.get_admin_area_reviews()
returns table (
  id uuid,
  location_name text,
  location_slug text,
  lga text,
  reviewer_name text,
  reviewer_email text,
  display_name text,
  residency_status text,
  property_type text,
  lived_from integer,
  lived_to integer,
  rent_amount numeric,
  service_charge numeric,
  move_in_cost numeric,
  overall_rating integer,
  electricity_rating integer,
  water_rating integer,
  security_rating integer,
  roads_rating integer,
  noise_rating integer,
  maintenance_rating integer,
  flood_risk text,
  headline text,
  review_text text,
  evidence_verified boolean,
  status text,
  moderation_note text,
  submitted_at timestamptz,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if coalesce(public.current_app_role(), '') not in ('admin', 'super_admin') then
    raise exception 'Administrator access required';
  end if;

  return query
  select
    review.id,
    location.name,
    location.slug,
    location.lga,
    coalesce(nullif(review.reviewer_name, ''), app_user.name, 'Lagos resident'),
    coalesce(nullif(review.reviewer_email, ''), app_user.email, ''),
    case
      when review.show_first_name then split_part(
        coalesce(nullif(review.reviewer_name, ''), app_user.name, 'Lagos resident'),
        ' ',
        1
      )
      else 'Lagos resident'
    end,
    review.residency_status,
    review.property_type,
    review.lived_from,
    review.lived_to,
    review.rent_amount,
    review.service_charge,
    review.move_in_cost,
    review.overall_rating,
    review.electricity_rating,
    review.water_rating,
    review.security_rating,
    review.roads_rating,
    review.noise_rating,
    review.maintenance_rating,
    review.flood_risk,
    review.headline,
    review.review_text,
    review.evidence_verified,
    review.status,
    review.moderation_note,
    review.created_at,
    review.created_at
  from public.area_reviews review
  join public.area_review_locations location on location.id = review.location_id
  left join public.users app_user on app_user.id = review.user_id
  order by case when review.status = 'pending' then 0 else 1 end, review.created_at desc;
end;
$$;

create or replace function public.moderate_area_review(
  p_review_id uuid,
  p_status text,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(public.current_app_role(), '') not in ('admin', 'super_admin') then
    raise exception 'Administrator access required';
  end if;
  if p_status not in ('approved', 'rejected') then raise exception 'Select a valid moderation decision'; end if;

  update public.area_reviews
  set status = p_status,
      moderation_note = nullif(trim(p_note), ''),
      reviewed_by = public.current_public_user_id(),
      reviewed_at = now(),
      updated_at = now()
  where id = p_review_id;

  if not found then raise exception 'Review not found'; end if;

  if p_status = 'approved' then
    update public.area_review_locations location
    set status = 'active', updated_at = now()
    where location.id = (
      select review.location_id from public.area_reviews review where review.id = p_review_id
    );
  else
    update public.area_review_locations location
    set status = 'archived', updated_at = now()
    where location.id = (
      select review.location_id from public.area_reviews review where review.id = p_review_id
    )
      and location.status = 'pending'
      and not exists (
        select 1 from public.area_reviews approved_review
        where approved_review.location_id = location.id
          and approved_review.status = 'approved'
      );
  end if;
end;
$$;

create or replace function public.delete_area_review(p_review_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(public.current_app_role(), '') <> 'super_admin' then
    raise exception 'Super administrator access required';
  end if;

  delete from public.area_reviews
  where id = p_review_id;

  if not found then raise exception 'Review not found'; end if;
end;
$$;

revoke all on function public.get_area_review_locations(text) from public;
revoke all on function public.get_area_review_location(text) from public;
revoke all on function public.get_latest_area_reviews(integer) from public;
revoke all on function public.submit_area_review(uuid, text, text, text, text, text, integer, integer, numeric, numeric, numeric, integer, integer, integer, integer, integer, integer, integer, text, text, text, boolean) from public;
revoke all on function public.get_admin_area_reviews() from public;
revoke all on function public.moderate_area_review(uuid, text, text) from public;
revoke all on function public.delete_area_review(uuid) from public;

grant execute on function public.get_area_review_locations(text) to anon, authenticated;
grant execute on function public.get_area_review_location(text) to anon, authenticated;
grant execute on function public.get_latest_area_reviews(integer) to anon, authenticated;
grant execute on function public.submit_area_review(uuid, text, text, text, text, text, integer, integer, numeric, numeric, numeric, integer, integer, integer, integer, integer, integer, integer, text, text, text, boolean) to authenticated;
grant execute on function public.get_admin_area_reviews() to authenticated;
grant execute on function public.moderate_area_review(uuid, text, text) to authenticated;
grant execute on function public.delete_area_review(uuid) to authenticated;

commit;
