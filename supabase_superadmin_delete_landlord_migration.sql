-- LagosRentHelp: allow only the superadmin to permanently remove a landlord
-- account and its property portfolio.
-- Run after the landlord and superadmin dashboard migrations.

begin;

create or replace function public.delete_landlord_account(
  p_landlord_user_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_auth_user_id uuid;
  v_email text;
  v_listing_count integer := 0;
begin
  if coalesce(public.current_app_role(), '') <> 'super_admin' then
    raise exception 'Superadmin access required';
  end if;

  select app_user.auth_user_id, app_user.email
  into v_auth_user_id, v_email
  from public.users app_user
  join public.landlord_profiles profile on profile.user_id = app_user.id
  where app_user.id = p_landlord_user_id
    and app_user.role = 'landlord'
  limit 1
  for update of app_user;

  if not found then
    raise exception 'Landlord account not found';
  end if;

  select count(*)::integer
  into v_listing_count
  from public.properties property
  where property.created_by = p_landlord_user_id
     or property.owner_id = p_landlord_user_id
     or property.contact_user_id = p_landlord_user_id;

  -- Property leads are removed by their property/user foreign-key cascades.
  delete from public.properties property
  where property.created_by = p_landlord_user_id
     or property.owner_id = p_landlord_user_id
     or property.contact_user_id = p_landlord_user_id;

  -- The public user cascade removes the landlord profile, verification,
  -- verification events, renter preferences, and lead relationships.
  delete from public.users where id = p_landlord_user_id;

  -- Remove the sign-in identity as the final step. The captured UUID remains
  -- available even though the public profile has already been deleted.
  if v_auth_user_id is not null then
    delete from auth.users where id = v_auth_user_id;
  end if;

  return jsonb_build_object(
    'deleted', true,
    'email', v_email,
    'deleted_listings', v_listing_count
  );
end;
$$;

revoke all on function public.delete_landlord_account(text) from public;
grant execute on function public.delete_landlord_account(text) to authenticated;

commit;
