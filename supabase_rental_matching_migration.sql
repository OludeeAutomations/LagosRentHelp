-- LagosRentHelp: privacy-conscious renter-to-listing matching
-- Run after supabase_landlord_migration.sql and
-- supabase_admin_verification_migration.sql.

begin;

create table if not exists public.renter_preferences (
  user_id text primary key references public.users(id) on delete cascade,
  preferred_lga text not null,
  budget_min numeric not null check (budget_min >= 0),
  budget_max numeric not null check (budget_max >= budget_min),
  property_type text not null check (property_type in (
    '1-bedroom', '2-bedroom', '3-bedroom', 'duplex', 'studio',
    'mini-flat', 'short-let'
  )),
  occupant_count integer not null check (occupant_count between 1 and 10),
  is_adult boolean not null check (is_adult = true),
  employment_type text not null check (employment_type in (
    'salaried', 'self_employed', 'contract', 'student', 'retired'
  )),
  income_band integer not null check (income_band between 1 and 5),
  move_in_window text not null check (move_in_window in (
    'immediately', 'within_1_month', 'within_3_months', 'flexible'
  )),
  lease_duration_months integer not null check (lease_duration_months in (3, 6, 12, 24)),
  has_guarantor boolean not null,
  has_pets boolean not null,
  smokes boolean not null,
  accommodation_type text not null check (accommodation_type in ('any', 'private', 'shared')),
  gender text not null default 'prefer_not_to_say' check (gender in (
    'female', 'male', 'prefer_not_to_say'
  )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.renter_preferences enable row level security;
revoke all privileges on table public.renter_preferences from public, anon, authenticated;
grant select, insert, update, delete on table public.renter_preferences to authenticated;

drop policy if exists "renters manage own preferences" on public.renter_preferences;
create policy "renters manage own preferences"
on public.renter_preferences for all to authenticated
using (user_id = public.current_public_user_id())
with check (user_id = public.current_public_user_id());

alter table public.properties
  add column if not exists tenant_max_occupants integer not null default 10
    check (tenant_max_occupants between 1 and 10),
  add column if not exists tenant_employment_type text not null default 'any'
    check (tenant_employment_type in ('any', 'salaried', 'self_employed', 'contract', 'student', 'retired')),
  add column if not exists tenant_min_income_band integer not null default 0
    check (tenant_min_income_band between 0 and 5),
  add column if not exists tenant_guarantor_required boolean not null default false,
  add column if not exists tenant_min_lease_months integer not null default 0
    check (tenant_min_lease_months in (0, 3, 6, 12, 24)),
  add column if not exists tenant_pets_allowed boolean not null default true,
  add column if not exists tenant_smoking_allowed boolean not null default true,
  add column if not exists tenant_move_in_window text not null default 'flexible'
    check (tenant_move_in_window in ('immediately', 'within_1_month', 'within_3_months', 'flexible')),
  add column if not exists tenant_accommodation_type text not null default 'any'
    check (tenant_accommodation_type in ('any', 'private', 'shared')),
  add column if not exists tenant_gender_preference text not null default 'any'
    check (tenant_gender_preference in ('any', 'female', 'male'));

grant insert (
  tenant_max_occupants,
  tenant_employment_type,
  tenant_min_income_band,
  tenant_guarantor_required,
  tenant_min_lease_months,
  tenant_pets_allowed,
  tenant_smoking_allowed,
  tenant_move_in_window,
  tenant_accommodation_type,
  tenant_gender_preference
) on table public.properties to authenticated;

grant update (
  tenant_max_occupants,
  tenant_employment_type,
  tenant_min_income_band,
  tenant_guarantor_required,
  tenant_min_lease_months,
  tenant_pets_allowed,
  tenant_smoking_allowed,
  tenant_move_in_window,
  tenant_accommodation_type,
  tenant_gender_preference
) on table public.properties to authenticated;

create or replace function public.save_my_renter_preferences(
  p_preferred_lga text,
  p_budget_min numeric,
  p_budget_max numeric,
  p_property_type text,
  p_occupant_count integer,
  p_is_adult boolean,
  p_employment_type text,
  p_income_band integer,
  p_move_in_window text,
  p_lease_duration_months integer,
  p_has_guarantor boolean,
  p_has_pets boolean,
  p_smokes boolean,
  p_accommodation_type text,
  p_gender text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id text := public.current_public_user_id();
  v_result public.renter_preferences%rowtype;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if nullif(trim(p_preferred_lga), '') is null
    or p_budget_min < 0
    or p_budget_max < p_budget_min
    or p_occupant_count not between 1 and 10
    or not p_is_adult then
    raise exception 'Complete all required rental preference fields';
  end if;

  insert into public.renter_preferences (
    user_id, preferred_lga, budget_min, budget_max, property_type,
    occupant_count, is_adult, employment_type, income_band, move_in_window,
    lease_duration_months, has_guarantor, has_pets, smokes,
    accommodation_type, gender
  ) values (
    v_user_id, trim(p_preferred_lga), p_budget_min, p_budget_max,
    p_property_type, p_occupant_count, p_is_adult, p_employment_type, p_income_band,
    p_move_in_window, p_lease_duration_months, p_has_guarantor,
    p_has_pets, p_smokes, p_accommodation_type,
    case when p_accommodation_type = 'shared' then p_gender else 'prefer_not_to_say' end
  )
  on conflict (user_id) do update set
    preferred_lga = excluded.preferred_lga,
    budget_min = excluded.budget_min,
    budget_max = excluded.budget_max,
    property_type = excluded.property_type,
    occupant_count = excluded.occupant_count,
    is_adult = excluded.is_adult,
    employment_type = excluded.employment_type,
    income_band = excluded.income_band,
    move_in_window = excluded.move_in_window,
    lease_duration_months = excluded.lease_duration_months,
    has_guarantor = excluded.has_guarantor,
    has_pets = excluded.has_pets,
    smokes = excluded.smokes,
    accommodation_type = excluded.accommodation_type,
    gender = excluded.gender,
    updated_at = now()
  returning * into v_result;

  return to_jsonb(v_result) - 'user_id';
end;
$$;

create or replace function public.get_my_renter_preferences()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_result public.renter_preferences%rowtype;
begin
  select * into v_result
  from public.renter_preferences
  where user_id = public.current_public_user_id();

  if not found then return null; end if;
  return to_jsonb(v_result) - 'user_id';
end;
$$;

create or replace function public.get_recommended_property_matches()
returns table (
  property_id text,
  match_score integer,
  match_reasons text[]
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  return query
  select
    property.id::text,
    (
      case when position(lower(preference.preferred_lga) in lower(property.location)) > 0 then 18 else 0 end +
      case when property.price between preference.budget_min and preference.budget_max then 18 else 0 end +
      case when property.type::text = preference.property_type then 14 else 0 end +
      case when preference.occupant_count <= property.tenant_max_occupants then 10 else 0 end +
      case when property.tenant_employment_type = 'any' or property.tenant_employment_type = preference.employment_type then 10 else 0 end +
      case when property.tenant_min_income_band = 0 or preference.income_band >= property.tenant_min_income_band then 10 else 0 end +
      case when property.tenant_move_in_window = 'flexible' or preference.move_in_window = 'flexible' or property.tenant_move_in_window = preference.move_in_window then 5 else 0 end +
      case when property.tenant_min_lease_months = 0 or preference.lease_duration_months >= property.tenant_min_lease_months then 5 else 0 end +
      case when not property.tenant_guarantor_required or preference.has_guarantor then 4 else 0 end +
      case when not preference.has_pets or property.tenant_pets_allowed then 2 else 0 end +
      case when not preference.smokes or property.tenant_smoking_allowed then 2 else 0 end +
      case when property.tenant_accommodation_type = 'any'
                  or preference.accommodation_type = 'any'
                  or (
                    property.tenant_accommodation_type = preference.accommodation_type
                    and (
                      property.tenant_accommodation_type <> 'shared'
                      or property.tenant_gender_preference = 'any'
                      or property.tenant_gender_preference = preference.gender
                    )
                  ) then 2 else 0 end
    )::integer as match_score,
    array_remove(array[
      case when position(lower(preference.preferred_lga) in lower(property.location)) > 0 then 'Preferred location' end,
      case when property.price between preference.budget_min and preference.budget_max then 'Within your budget' end,
      case when property.type::text = preference.property_type then 'Preferred property type' end,
      case when preference.occupant_count <= property.tenant_max_occupants then 'Occupancy fits' end,
      case when property.tenant_employment_type = 'any' or property.tenant_employment_type = preference.employment_type then 'Employment requirement matches' end,
      case when property.tenant_min_income_band = 0 or preference.income_band >= property.tenant_min_income_band then 'Affordability requirement matches' end,
      case when property.tenant_move_in_window = 'flexible' or preference.move_in_window = 'flexible' or property.tenant_move_in_window = preference.move_in_window then 'Move-in timing matches' end,
      case when not property.tenant_guarantor_required or preference.has_guarantor then 'Guarantor requirement matches' end,
      case when not preference.has_pets or property.tenant_pets_allowed then 'Pet policy matches' end,
      case when not preference.smokes or property.tenant_smoking_allowed then 'Smoking policy matches' end
    ], null)::text[] as match_reasons
  from public.properties property
  cross join public.renter_preferences preference
  where preference.user_id = public.current_public_user_id()
    and property.approval_status = 'approved'
    and property.status = 'available'
  order by 2 desc, property.created_at desc;
end;
$$;

revoke all on function public.save_my_renter_preferences(text, numeric, numeric, text, integer, boolean, text, integer, text, integer, boolean, boolean, boolean, text, text) from public;
revoke all on function public.get_my_renter_preferences() from public;
revoke all on function public.get_recommended_property_matches() from public;

grant execute on function public.save_my_renter_preferences(text, numeric, numeric, text, integer, boolean, text, integer, text, integer, boolean, boolean, boolean, text, text) to authenticated;
grant execute on function public.get_my_renter_preferences() to authenticated;
grant execute on function public.get_recommended_property_matches() to authenticated;

commit;
