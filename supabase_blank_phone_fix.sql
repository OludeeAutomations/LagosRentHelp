-- Remove the invalid phone-identity rule. LagosRentHelp authenticates by
-- email/Google; phone is contact information and may legitimately be shared.
-- Run once in Supabase Dashboard -> SQL Editor.

begin;

alter table public.users alter column phone drop not null;

update public.users
set phone = null
where nullif(trim(phone), '') is null;

alter table public.users drop constraint if exists users_phone_key;
drop index if exists public.users_phone_key;

create index if not exists users_phone_lookup_idx
  on public.users (phone)
  where nullif(trim(phone), '') is not null;

create or replace function public.ensure_my_profile()
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_auth_id uuid := auth.uid();
  v_email text;
  v_name text;
  v_phone text;
  v_requested_role text := 'user';
  v_email_confirmed boolean := false;
  v_profile public.users%rowtype;
begin
  if v_auth_id is null then
    raise exception 'Authentication required';
  end if;

  select
    auth_account.email_confirmed_at is not null,
    lower(coalesce(auth_account.email, '')),
    coalesce(
      nullif(trim(auth_account.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(auth_account.raw_user_meta_data ->> 'name'), ''),
      split_part(lower(coalesce(auth_account.email, '')), '@', 1),
      'User'
    ),
    coalesce(
      nullif(trim(auth_account.raw_user_meta_data ->> 'phone'), ''),
      nullif(trim(auth_account.phone), '')
    )
  into v_email_confirmed, v_email, v_name, v_phone
  from auth.users auth_account
  where auth_account.id = v_auth_id;

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

  if v_profile.role = 'user' and exists (
    select 1
    from public.landlord_profiles landlord_profile
    where landlord_profile.user_id = v_profile.id
  ) then
    update public.users
    set role = 'landlord'
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
end;
$$;

revoke all on function public.ensure_my_profile() from public;
grant execute on function public.ensure_my_profile() to authenticated;

commit;
