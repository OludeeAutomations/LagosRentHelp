-- LagosRentHelp: administrator and landlord verification workflow
-- Run after supabase_landlord_migration.sql in Supabase Dashboard -> SQL Editor.

begin;

alter table public.nin_verification_attempts
  add column if not exists verified_name text;

alter table public.landlord_verifications
  add column if not exists verified_identity_name text;

alter table public.landlord_profiles
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by text references public.users(id) on delete set null;

create or replace function public.attach_verified_identity_name()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select attempt.verified_name
  into new.verified_identity_name
  from public.nin_verification_attempts attempt
  join public.users app_user on app_user.auth_user_id = attempt.auth_user_id
  where app_user.id = new.user_id
    and attempt.nin = new.nin
    and attempt.successful = true
  order by attempt.attempted_at desc
  limit 1;
  return new;
end;
$$;

drop trigger if exists attach_verified_identity_name_on_submission
  on public.landlord_verifications;
create trigger attach_verified_identity_name_on_submission
before insert or update of nin on public.landlord_verifications
for each row execute function public.attach_verified_identity_name();

update public.landlord_verifications verification
set verified_identity_name = (
  select attempt.verified_name
  from public.nin_verification_attempts attempt
  join public.users app_user on app_user.auth_user_id = attempt.auth_user_id
  where app_user.id = verification.user_id
    and attempt.nin = verification.nin
    and attempt.successful = true
  order by attempt.attempted_at desc
  limit 1
)
where verification.verified_identity_name is null;

do $$
declare
  constraint_row record;
begin
  for constraint_row in
    select conname
    from pg_constraint
    where conrelid = 'public.landlord_verifications'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%ownership_document_type%'
  loop
    execute format(
      'alter table public.landlord_verifications drop constraint %I',
      constraint_row.conname
    );
  end loop;
end
$$;

alter table public.landlord_verifications
  add constraint landlord_verifications_ownership_document_type_check
  check (ownership_document_type in (
    'certificate_of_occupancy',
    'deed_of_assignment',
    'governors_consent',
    'land_certificate',
    'land_use_charge',
    'survey_plan',
    'other_ownership_document'
  ));

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
    select 1 from public.nin_verification_attempts
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
    'land_certificate'
  ) then
    raise exception 'Upload an accepted primary ownership document';
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
    state, local_government, bio, verification_status, verification_note,
    reviewed_at, reviewed_by
  ) values (
    v_user_id, trim(p_business_name), trim(p_whatsapp_number),
    trim(p_residential_address), trim(p_state), trim(p_local_government),
    coalesce(trim(p_bio), ''), 'pending', null, null, null
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
    reviewed_at = null,
    reviewed_by = null,
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

create table if not exists public.landlord_verification_reviews (
  id uuid primary key default gen_random_uuid(),
  landlord_user_id text not null references public.users(id) on delete cascade,
  reviewer_user_id text not null references public.users(id) on delete restrict,
  decision text not null check (decision in ('verified', 'rejected')),
  note text,
  created_at timestamptz not null default now()
);

create index if not exists landlord_verification_reviews_landlord_idx
  on public.landlord_verification_reviews (landlord_user_id, created_at desc);

alter table public.landlord_verification_reviews enable row level security;
revoke all privileges on table public.landlord_verification_reviews from public, anon, authenticated;
grant select on table public.landlord_verification_reviews to authenticated;

drop policy if exists "admins read landlord verification reviews"
  on public.landlord_verification_reviews;
create policy "admins read landlord verification reviews"
on public.landlord_verification_reviews for select to authenticated
using (public.current_app_role() in ('admin', 'super_admin'));

-- The primary account must already exist in Supabase Auth. This promotes the
-- matching application profile immediately when the migration is installed.
update public.users
set role = 'super_admin'
where lower(email) = 'info@lagosrenthelp.ng';

-- Lets the confirmed primary email claim its role if it registers after this
-- migration is installed. No other email can use this function for elevation.
create or replace function public.claim_primary_admin()
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_confirmed boolean := false;
  v_profile jsonb;
begin
  if auth.uid() is null or v_email <> 'info@lagosrenthelp.ng' then
    raise exception 'Primary administrator authorization required';
  end if;

  select email_confirmed_at is not null
  into v_confirmed
  from auth.users
  where id = auth.uid() and lower(email) = v_email;

  if not coalesce(v_confirmed, false) then
    raise exception 'Confirm the primary administrator email first';
  end if;

  v_profile := public.ensure_my_profile();
  update public.users
  set role = 'super_admin'
  where id = v_profile ->> 'id';

  return public.ensure_my_profile();
end;
$$;

create or replace function public.get_landlord_verification_queue(
  p_status text default null
)
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
  verification_status text,
  verification_note text,
  verified_identity_name text,
  nin_last_four text,
  property_address text,
  property_local_government text,
  ownership_document_type text,
  identity_image_path text,
  ownership_document_path text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewer_name text
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

  if p_status is not null and p_status not in ('pending', 'verified', 'rejected') then
    raise exception 'Invalid verification status';
  end if;

  return query
  select
    applicant.id,
    applicant.name,
    applicant.email,
    applicant.phone,
    profile.business_name,
    profile.whatsapp_number,
    profile.residential_address,
    profile.state,
    profile.local_government,
    profile.verification_status,
    profile.verification_note,
    verification.verified_identity_name,
    right(verification.nin, 4),
    verification.property_address,
    verification.property_local_government,
    verification.ownership_document_type,
    verification.identity_image_path,
    verification.ownership_document_path,
    verification.submitted_at,
    profile.reviewed_at,
    reviewer.name
  from public.landlord_profiles profile
  join public.landlord_verifications verification on verification.user_id = profile.user_id
  join public.users applicant on applicant.id = profile.user_id
  left join public.users reviewer on reviewer.id = profile.reviewed_by
  where p_status is null or profile.verification_status = p_status
  order by
    case profile.verification_status when 'pending' then 0 when 'rejected' then 1 else 2 end,
    verification.submitted_at desc;
end;
$$;

create or replace function public.review_landlord_verification(
  p_landlord_user_id text,
  p_decision text,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reviewer_id text := public.current_public_user_id();
begin
  if coalesce(public.current_app_role(), '') not in ('admin', 'super_admin') then
    raise exception 'Administrator access required';
  end if;

  if p_decision not in ('verified', 'rejected') then
    raise exception 'Decision must be verified or rejected';
  end if;

  if p_decision = 'rejected' and nullif(trim(coalesce(p_note, '')), '') is null then
    raise exception 'A rejection reason is required';
  end if;

  update public.landlord_profiles
  set verification_status = p_decision,
      verification_note = nullif(trim(coalesce(p_note, '')), ''),
      reviewed_at = now(),
      reviewed_by = v_reviewer_id,
      updated_at = now()
  where user_id = p_landlord_user_id;

  if not found then
    raise exception 'Landlord application not found';
  end if;

  insert into public.landlord_verification_reviews (
    landlord_user_id, reviewer_user_id, decision, note
  ) values (
    p_landlord_user_id, v_reviewer_id, p_decision,
    nullif(trim(coalesce(p_note, '')), '')
  );

  return jsonb_build_object(
    'userId', p_landlord_user_id,
    'verificationStatus', p_decision
  );
end;
$$;

create or replace function public.get_admin_users()
returns table (
  id text,
  name text,
  email text,
  phone text,
  role text,
  created_at timestamptz
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
  select app_user.id, app_user.name, app_user.email, app_user.phone,
         app_user.role, app_user.created_at
  from public.users app_user
  where app_user.role in ('admin', 'super_admin')
  order by case when lower(app_user.email) = 'info@lagosrenthelp.ng' then 0 else 1 end,
           app_user.created_at;
end;
$$;

create or replace function public.add_admin_by_email(p_email text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_target public.users%rowtype;
begin
  if coalesce(public.current_app_role(), '') <> 'super_admin' then
    raise exception 'Super administrator access required';
  end if;

  select * into v_target
  from public.users
  where lower(email) = lower(trim(p_email))
  limit 1
  for update;

  if v_target.id is null then
    raise exception 'No registered account uses that email address';
  end if;

  if lower(v_target.email) = 'info@lagosrenthelp.ng' then
    raise exception 'The primary administrator already has full access';
  end if;

  update public.users set role = 'admin' where id = v_target.id;

  return jsonb_build_object(
    'id', v_target.id,
    'name', v_target.name,
    'email', v_target.email,
    'phone', v_target.phone,
    'role', 'admin',
    'createdAt', v_target.created_at
  );
end;
$$;

create or replace function public.remove_admin(p_user_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(public.current_app_role(), '') <> 'super_admin' then
    raise exception 'Super administrator access required';
  end if;

  if p_user_id = public.current_public_user_id() then
    raise exception 'You cannot remove your own administrator access';
  end if;

  if exists (
    select 1 from public.users
    where id = p_user_id and lower(email) = 'info@lagosrenthelp.ng'
  ) then
    raise exception 'The primary administrator cannot be removed';
  end if;

  update public.users set role = 'user'
  where id = p_user_id and role = 'admin';

  if not found then
    raise exception 'Administrator account not found';
  end if;
end;
$$;

revoke all on function public.claim_primary_admin() from public;
revoke all on function public.attach_verified_identity_name() from public;
revoke all on function public.get_landlord_verification_queue(text) from public;
revoke all on function public.review_landlord_verification(text, text, text) from public;
revoke all on function public.get_admin_users() from public;
revoke all on function public.add_admin_by_email(text) from public;
revoke all on function public.remove_admin(text) from public;

grant execute on function public.claim_primary_admin() to authenticated;
grant execute on function public.get_landlord_verification_queue(text) to authenticated;
grant execute on function public.review_landlord_verification(text, text, text) to authenticated;
grant execute on function public.get_admin_users() to authenticated;
grant execute on function public.add_admin_by_email(text) to authenticated;
grant execute on function public.remove_admin(text) to authenticated;

-- Only verified landlords may upload listing images or submit new properties.
drop policy if exists "landlords can create own properties" on public.properties;
create policy "landlords can create own properties"
on public.properties for insert to authenticated
with check (
  public.current_app_role() = 'landlord'
  and owner_id = public.current_public_user_id()
  and contact_user_id = public.current_public_user_id()
  and created_by = public.current_public_user_id()
  and approval_status = 'pending'
  and exists (
    select 1 from public.landlord_profiles profile
    where profile.user_id = public.current_public_user_id()
      and profile.verification_status = 'verified'
  )
);

drop policy if exists "landlords upload property images" on storage.objects;
create policy "landlords upload property images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'property-images'
  and public.current_app_role() = 'landlord'
  and (storage.foldername(name))[1] = auth.uid()::text
  and exists (
    select 1 from public.landlord_profiles profile
    where profile.user_id = public.current_public_user_id()
      and profile.verification_status = 'verified'
  )
);

commit;
