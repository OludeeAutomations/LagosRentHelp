-- LagosRentHelp: Supabase Auth + tenant/landlord model
-- Run AFTER supabase_rls.sql in Supabase Dashboard -> SQL Editor.

begin;

alter table public.users
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null;

create unique index if not exists users_auth_user_id_unique
  on public.users (auth_user_id)
  where auth_user_id is not null;

-- Replace the legacy role check without depending on its generated name.
do $$
declare
  constraint_row record;
begin
  for constraint_row in
    select conname
    from pg_constraint
    where conrelid = 'public.users'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%role%'
  loop
    execute format('alter table public.users drop constraint %I', constraint_row.conname);
  end loop;
end
$$;

update public.users set role = 'landlord' where role = 'agent';

alter table public.users
  add constraint users_role_check
  check (role in ('user', 'landlord', 'admin', 'super_admin'));

create table if not exists public.landlord_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique references public.users(id) on delete cascade,
  business_name text not null,
  whatsapp_number text not null,
  residential_address text not null,
  bio text not null default '',
  verification_status text not null default 'pending'
    check (verification_status in ('pending', 'verified', 'rejected')),
  verification_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.landlord_profiles enable row level security;
revoke all privileges on table public.landlord_profiles from public, anon, authenticated;
grant select, insert, update on table public.landlord_profiles to authenticated;

-- Creates or safely links an application profile after Supabase has
-- authenticated the email address. Requested roles are limited to the two
-- public roles; admin roles can only be assigned by trusted server-side code.
create or replace function public.ensure_my_profile()
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_auth_id uuid := auth.uid();
  v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_name text := coalesce(
    auth.jwt() -> 'user_metadata' ->> 'full_name',
    auth.jwt() -> 'user_metadata' ->> 'name',
    split_part(v_email, '@', 1),
    'User'
  );
  v_phone text := coalesce(auth.jwt() -> 'user_metadata' ->> 'phone', '');
  v_requested_role text := case
    when auth.jwt() -> 'user_metadata' ->> 'account_type' = 'landlord'
      then 'landlord'
    else 'user'
  end;
  v_email_confirmed boolean := false;
  v_profile public.users%rowtype;
begin
  if v_auth_id is null then
    raise exception 'Authentication required';
  end if;

  select (email_confirmed_at is not null)
  into v_email_confirmed
  from auth.users
  where id = v_auth_id;

  select * into v_profile
  from public.users
  where auth_user_id = v_auth_id
  limit 1;

  if not found and v_email <> '' then
    select * into v_profile
    from public.users
    where lower(email) = v_email
      and auth_user_id is null
    limit 1
    for update;

    if found then
      if not v_email_confirmed then
        raise exception 'Verify this email address before linking the existing account';
      end if;

      update public.users
      set auth_user_id = v_auth_id
      where id = v_profile.id
      returning * into v_profile;
    end if;
  end if;

  if v_profile.id is null then
    insert into public.users (
      id, auth_user_id, name, email, phone, password, role
    ) values (
      v_auth_id::text,
      v_auth_id,
      v_name,
      v_email,
      v_phone,
      'SUPABASE_AUTH_MANAGED',
      v_requested_role
    )
    returning * into v_profile;
  end if;

  return jsonb_build_object(
    'id', v_profile.id,
    'name', v_profile.name,
    'email', v_profile.email,
    'phone', v_profile.phone,
    'role', case when v_profile.role = 'agent' then 'landlord' else v_profile.role end,
    'created_at', v_profile.created_at
  );
end;
$$;

create or replace function public.current_public_user_id()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select id from public.users where auth_user_id = auth.uid() limit 1
$$;

create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where auth_user_id = auth.uid() limit 1
$$;

create or replace function public.get_my_properties()
returns setof public.properties
language sql
stable
security definer
set search_path = public
as $$
  select properties.*
  from public.properties
  where properties.created_by = public.current_public_user_id()
    and public.current_app_role() = 'landlord'
  order by properties.created_at desc
$$;

create or replace function public.complete_landlord_onboarding(
  p_business_name text,
  p_whatsapp_number text,
  p_residential_address text,
  p_bio text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile jsonb;
  v_user_id text;
  v_role text;
begin
  v_profile := public.ensure_my_profile();
  v_user_id := v_profile ->> 'id';
  v_role := v_profile ->> 'role';

  if nullif(trim(p_business_name), '') is null
    or nullif(trim(p_whatsapp_number), '') is null
    or nullif(trim(p_residential_address), '') is null then
    raise exception 'Business name, WhatsApp number and address are required';
  end if;

  if v_role in ('user', 'landlord') then
    update public.users
    set role = 'landlord'
    where id = v_user_id;
    v_role := 'landlord';
  end if;

  insert into public.landlord_profiles (
    user_id, business_name, whatsapp_number, residential_address, bio
  ) values (
    v_user_id, trim(p_business_name), trim(p_whatsapp_number),
    trim(p_residential_address), coalesce(trim(p_bio), '')
  )
  on conflict (user_id) do update set
    business_name = excluded.business_name,
    whatsapp_number = excluded.whatsapp_number,
    residential_address = excluded.residential_address,
    bio = excluded.bio,
    updated_at = now();

  return jsonb_build_object('id', v_user_id, 'role', v_role);
end;
$$;

create or replace function public.complete_user_profile(
  p_name text,
  p_phone text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile jsonb;
  v_user_id text;
begin
  v_profile := public.ensure_my_profile();
  v_user_id := v_profile ->> 'id';

  if nullif(trim(p_name), '') is null or nullif(trim(p_phone), '') is null then
    raise exception 'Name and phone number are required';
  end if;

  update public.users
  set name = trim(p_name), phone = trim(p_phone)
  where id = v_user_id;

  return public.ensure_my_profile();
end;
$$;

revoke all on function public.ensure_my_profile() from public;
revoke all on function public.complete_landlord_onboarding(text, text, text, text) from public;
revoke all on function public.complete_user_profile(text, text) from public;
revoke all on function public.current_public_user_id() from public;
revoke all on function public.current_app_role() from public;
revoke all on function public.get_my_properties() from public;
grant execute on function public.ensure_my_profile() to authenticated;
grant execute on function public.complete_landlord_onboarding(text, text, text, text) to authenticated;
grant execute on function public.complete_user_profile(text, text) to authenticated;
grant execute on function public.current_public_user_id() to authenticated;
grant execute on function public.current_app_role() to authenticated;
grant execute on function public.get_my_properties() to authenticated;

drop policy if exists "landlords read own profile" on public.landlord_profiles;
drop policy if exists "landlords insert own profile" on public.landlord_profiles;
drop policy if exists "landlords update own profile" on public.landlord_profiles;

create policy "landlords read own profile"
on public.landlord_profiles for select to authenticated
using (user_id = public.current_public_user_id());

create policy "landlords insert own profile"
on public.landlord_profiles for insert to authenticated
with check (user_id = public.current_public_user_id());

create policy "landlords update own profile"
on public.landlord_profiles for update to authenticated
using (user_id = public.current_public_user_id())
with check (user_id = public.current_public_user_id());

-- Landlords may read all safe fields on their own pending/rejected listings.
drop policy if exists "landlords can read own properties" on public.properties;
drop policy if exists "landlords can create own properties" on public.properties;
drop policy if exists "landlords can update own properties" on public.properties;
drop policy if exists "landlords can delete own properties" on public.properties;

create policy "landlords can read own properties"
on public.properties for select to authenticated
using (
  public.current_app_role() = 'landlord'
  and created_by = public.current_public_user_id()
);

grant insert (
  title, description, price, location, total_package_price, type,
  listing_type, bedrooms, bathrooms, area, amenities, images, status,
  approval_status, coordinates, available_from, minimum_stay,
  owner_id, contact_user_id, created_by
) on table public.properties to authenticated;

create policy "landlords can create own properties"
on public.properties for insert to authenticated
with check (
  public.current_app_role() = 'landlord'
  and owner_id = public.current_public_user_id()
  and contact_user_id = public.current_public_user_id()
  and created_by = public.current_public_user_id()
  and approval_status = 'pending'
);

grant update (
  title, description, price, location, total_package_price, type,
  listing_type, bedrooms, bathrooms, area, amenities, images, status,
  coordinates, available_from, minimum_stay
) on table public.properties to authenticated;

create policy "landlords can update own properties"
on public.properties for update to authenticated
using (
  public.current_app_role() = 'landlord'
  and created_by = public.current_public_user_id()
)
with check (
  public.current_app_role() = 'landlord'
  and created_by = public.current_public_user_id()
  and owner_id = public.current_public_user_id()
  and contact_user_id = public.current_public_user_id()
);

grant delete on table public.properties to authenticated;
create policy "landlords can delete own properties"
on public.properties for delete to authenticated
using (
  public.current_app_role() = 'landlord'
  and created_by = public.current_public_user_id()
);

-- Property images are public, but each landlord can only write inside the
-- folder named with their Supabase Auth UUID.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-images',
  'property-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public property images" on storage.objects;
drop policy if exists "landlords upload property images" on storage.objects;
drop policy if exists "landlords update property images" on storage.objects;
drop policy if exists "landlords delete property images" on storage.objects;

create policy "public property images"
on storage.objects for select to public
using (bucket_id = 'property-images');

create policy "landlords upload property images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'property-images'
  and public.current_app_role() = 'landlord'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "landlords update property images"
on storage.objects for update to authenticated
using (
  bucket_id = 'property-images'
  and public.current_app_role() = 'landlord'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'property-images'
  and public.current_app_role() = 'landlord'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "landlords delete property images"
on storage.objects for delete to authenticated
using (
  bucket_id = 'property-images'
  and public.current_app_role() = 'landlord'
  and (storage.foldername(name))[1] = auth.uid()::text
);

commit;
