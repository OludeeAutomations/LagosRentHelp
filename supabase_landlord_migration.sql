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

alter table public.landlord_profiles
  add column if not exists state text not null default '',
  add column if not exists local_government text not null default '';

-- Sensitive identity and ownership evidence is deliberately kept outside the
-- public-facing landlord profile. Applications can only be written through
-- the validated security-definer function below.
create table if not exists public.landlord_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique references public.users(id) on delete cascade,
  nin text not null unique check (nin ~ '^[0-9]{11}$'),
  identity_image_path text not null,
  property_address text not null,
  property_local_government text not null,
  ownership_document_type text not null check (
    ownership_document_type in (
      'certificate_of_occupancy',
      'deed_of_assignment',
      'governors_consent',
      'land_certificate',
      'land_use_charge',
      'survey_plan',
      'other_ownership_document'
    )
  ),
  ownership_document_path text not null,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Written only by the Dojah Edge Function with the service role. The
-- successful NIN value is retained briefly as server-side proof that the
-- application RPC cannot be called without completing provider verification.
create table if not exists public.nin_verification_attempts (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  nin text,
  nin_last_four text not null check (nin_last_four ~ '^[0-9]{4}$'),
  successful boolean not null default false,
  provider_status integer,
  attempted_at timestamptz not null default now(),
  check (not successful or nin ~ '^[0-9]{11}$')
);

create index if not exists nin_verification_attempts_user_time_idx
  on public.nin_verification_attempts (auth_user_id, attempted_at desc);

alter table public.landlord_profiles enable row level security;
alter table public.landlord_verifications enable row level security;
alter table public.nin_verification_attempts enable row level security;
revoke all privileges on table public.landlord_profiles from public, anon, authenticated;
revoke all privileges on table public.landlord_verifications from public, anon, authenticated;
revoke all privileges on table public.nin_verification_attempts from public, anon, authenticated;
grant select on table public.landlord_profiles to authenticated;
grant select on table public.landlord_verifications to authenticated;

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
  -- A signup preference is not authorization. A new account remains a normal
  -- user until submit_landlord_application validates a complete application.
  v_requested_role text := 'user';
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

-- Existing landlords use this function to update non-sensitive profile data.
-- It cannot promote a normal user into the landlord role.
create or replace function public.update_landlord_profile(
  p_business_name text,
  p_whatsapp_number text,
  p_residential_address text,
  p_state text,
  p_local_government text,
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

  if v_role <> 'landlord' then
    raise exception 'Submit a landlord verification application first';
  end if;

  if nullif(trim(p_business_name), '') is null
    or nullif(trim(p_whatsapp_number), '') is null
    or nullif(trim(p_residential_address), '') is null
    or nullif(trim(p_state), '') is null
    or nullif(trim(p_local_government), '') is null then
    raise exception 'Business name, WhatsApp number, address, state and local government are required';
  end if;

  update public.landlord_profiles
  set business_name = trim(p_business_name),
      whatsapp_number = trim(p_whatsapp_number),
      residential_address = trim(p_residential_address),
      state = trim(p_state),
      local_government = trim(p_local_government),
      bio = coalesce(trim(p_bio), ''),
      updated_at = now()
  where user_id = v_user_id;

  return jsonb_build_object('id', v_user_id, 'role', v_role);
end;
$$;

-- Completes the full application atomically after the browser has uploaded
-- both files into the authenticated user's private folder.
create or replace function public.submit_landlord_application(
  p_business_name text,
  p_whatsapp_number text,
  p_residential_address text,
  p_state text,
  p_local_government text,
  p_bio text,
  p_nin text,
  p_identity_image_path text,
  p_property_address text,
  p_property_local_government text,
  p_ownership_document_type text,
  p_ownership_document_path text
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, storage
as $$
declare
  v_profile jsonb;
  v_user_id text;
  v_role text;
  v_auth_folder text := auth.uid()::text;
begin
  v_profile := public.ensure_my_profile();
  v_user_id := v_profile ->> 'id';
  v_role := v_profile ->> 'role';

  if v_role not in ('user', 'landlord') then
    raise exception 'This account cannot submit a landlord application';
  end if;

  if nullif(trim(p_business_name), '') is null
    or nullif(trim(p_whatsapp_number), '') is null
    or nullif(trim(p_residential_address), '') is null
    or nullif(trim(p_state), '') is null
    or nullif(trim(p_local_government), '') is null
    or nullif(trim(p_property_address), '') is null
    or nullif(trim(p_property_local_government), '') is null then
    raise exception 'Complete all required profile and property location fields';
  end if;

  if trim(p_nin) !~ '^[0-9]{11}$' then
    raise exception 'A valid 11-digit NIN is required';
  end if;

  if not exists (
    select 1
    from public.nin_verification_attempts
    where auth_user_id = auth.uid()
      and nin = trim(p_nin)
      and successful = true
      and attempted_at >= now() - interval '24 hours'
  ) then
    raise exception 'Verify this NIN with Dojah before submitting the application';
  end if;

  if p_ownership_document_type not in (
    'certificate_of_occupancy',
    'deed_of_assignment',
    'governors_consent',
    'land_certificate',
    'land_use_charge',
    'survey_plan',
    'other_ownership_document'
  ) then
    raise exception 'Select a valid ownership document type';
  end if;

  if not (trim(p_property_local_government) = any(array[
    'Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa',
    'Badagry', 'Epe', 'Eti-Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye', 'Ikeja',
    'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland', 'Mushin', 'Ojo',
    'Oshodi-Isolo', 'Shomolu', 'Surulere'
  ]::text[])) then
    raise exception 'Select a valid Lagos local government area';
  end if;

  if split_part(p_identity_image_path, '/', 1) <> v_auth_folder
    or split_part(p_ownership_document_path, '/', 1) <> v_auth_folder then
    raise exception 'Verification documents must belong to the signed-in user';
  end if;

  if not exists (
    select 1 from storage.objects
    where bucket_id = 'landlord-verification' and name = p_identity_image_path
  ) or not exists (
    select 1 from storage.objects
    where bucket_id = 'landlord-verification' and name = p_ownership_document_path
  ) then
    raise exception 'One or more verification documents could not be found';
  end if;

  insert into public.landlord_profiles (
    user_id, business_name, whatsapp_number, residential_address,
    state, local_government, bio, verification_status, verification_note
  ) values (
    v_user_id, trim(p_business_name), trim(p_whatsapp_number),
    trim(p_residential_address), trim(p_state), trim(p_local_government),
    coalesce(trim(p_bio), ''), 'pending', null
  )
  on conflict (user_id) do update set
    business_name = excluded.business_name,
    whatsapp_number = excluded.whatsapp_number,
    residential_address = excluded.residential_address,
    state = excluded.state,
    local_government = excluded.local_government,
    bio = excluded.bio,
    verification_status = 'pending',
    verification_note = null,
    updated_at = now();

  insert into public.landlord_verifications (
    user_id, nin, identity_image_path, property_address,
    property_local_government, ownership_document_type,
    ownership_document_path
  ) values (
    v_user_id, trim(p_nin), p_identity_image_path, trim(p_property_address),
    trim(p_property_local_government), p_ownership_document_type,
    p_ownership_document_path
  )
  on conflict (user_id) do update set
    nin = excluded.nin,
    identity_image_path = excluded.identity_image_path,
    property_address = excluded.property_address,
    property_local_government = excluded.property_local_government,
    ownership_document_type = excluded.ownership_document_type,
    ownership_document_path = excluded.ownership_document_path,
    submitted_at = now(),
    updated_at = now();

  update public.users set role = 'landlord' where id = v_user_id;
  return jsonb_build_object('id', v_user_id, 'role', 'landlord');
end;
$$;

create or replace function public.complete_user_profile(
  p_name text,
  p_phone text
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_auth_id uuid := auth.uid();
  v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_email_confirmed boolean := false;
  v_profile public.users%rowtype;
  v_constraint_name text;
begin
  if v_auth_id is null then
    raise exception 'Authentication required';
  end if;

  if nullif(trim(p_name), '') is null or nullif(trim(p_phone), '') is null then
    raise exception 'Name and phone number are required';
  end if;

  -- Lock this auth account so concurrent auth events cannot create the same
  -- public profile while profile completion is running.
  select (email_confirmed_at is not null)
  into v_email_confirmed
  from auth.users
  where id = v_auth_id
  for update;

  select * into v_profile
  from public.users
  where auth_user_id = v_auth_id
  limit 1
  for update;

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
      set auth_user_id = v_auth_id,
          name = trim(p_name),
          phone = trim(p_phone)
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
      trim(p_name),
      v_email,
      trim(p_phone),
      'SUPABASE_AUTH_MANAGED',
      'user'
    )
    returning * into v_profile;
  elsif v_profile.auth_user_id = v_auth_id then
    update public.users
    set name = trim(p_name), phone = trim(p_phone)
    where id = v_profile.id
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
exception
  when unique_violation then
    get stacked diagnostics v_constraint_name = constraint_name;
    if v_constraint_name = 'users_phone_key' then
      raise exception using
        errcode = '23505',
        message = 'This phone number is already linked to another account.';
    end if;
    raise;
end;
$$;

revoke all on function public.ensure_my_profile() from public;
revoke all on function public.complete_landlord_onboarding(text, text, text, text) from public;
revoke all on function public.update_landlord_profile(text, text, text, text, text, text) from public;
revoke all on function public.submit_landlord_application(text, text, text, text, text, text, text, text, text, text, text, text) from public;
revoke all on function public.complete_user_profile(text, text) from public;
revoke all on function public.current_public_user_id() from public;
revoke all on function public.current_app_role() from public;
revoke all on function public.get_my_properties() from public;
grant execute on function public.ensure_my_profile() to authenticated;
revoke execute on function public.complete_landlord_onboarding(text, text, text, text) from authenticated;
grant execute on function public.update_landlord_profile(text, text, text, text, text, text) to authenticated;
grant execute on function public.submit_landlord_application(text, text, text, text, text, text, text, text, text, text, text, text) to authenticated;
grant execute on function public.complete_user_profile(text, text) to authenticated;
grant execute on function public.current_public_user_id() to authenticated;
grant execute on function public.current_app_role() to authenticated;
grant execute on function public.get_my_properties() to authenticated;

drop policy if exists "landlords read own profile" on public.landlord_profiles;
drop policy if exists "landlords insert own profile" on public.landlord_profiles;
drop policy if exists "landlords update own profile" on public.landlord_profiles;

create policy "landlords read own profile"
on public.landlord_profiles for select to authenticated
using (
  user_id = public.current_public_user_id()
  or public.current_app_role() in ('admin', 'super_admin')
);

drop policy if exists "landlords read own verification" on public.landlord_verifications;
create policy "landlords read own verification"
on public.landlord_verifications for select to authenticated
using (
  user_id = public.current_public_user_id()
  or public.current_app_role() in ('admin', 'super_admin')
);

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
  and approval_status = 'approved'
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

-- Identity and ownership files are private. Users can only access their own
-- folder; administrators can read them for manual verification.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'landlord-verification',
  'landlord-verification',
  false,
  5242880,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "landlords read verification files" on storage.objects;
drop policy if exists "landlords upload verification files" on storage.objects;
drop policy if exists "landlords delete verification files" on storage.objects;

create policy "landlords read verification files"
on storage.objects for select to authenticated
using (
  bucket_id = 'landlord-verification'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.current_app_role() in ('admin', 'super_admin')
  )
);

create policy "landlords upload verification files"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'landlord-verification'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "landlords delete verification files"
on storage.objects for delete to authenticated
using (
  bucket_id = 'landlord-verification'
  and (storage.foldername(name))[1] = auth.uid()::text
);

commit;
