-- Fix OAuth profile completion repeatedly reusing a stale JWT phone value.
-- Run this once in Supabase Dashboard -> SQL Editor.

begin;

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

revoke all on function public.complete_user_profile(text, text) from public;
grant execute on function public.complete_user_profile(text, text) to authenticated;

commit;
