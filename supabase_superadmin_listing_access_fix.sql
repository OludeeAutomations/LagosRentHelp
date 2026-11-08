-- Fix protected-column access for the superadmin listing manager without
-- granting private landlord matching fields to every authenticated user.
-- Safe to run after supabase_lagosrenthelp_listings_migration.sql.

begin;

create or replace function public.get_super_admin_properties(
  p_property_id text default null
)
returns setof public.properties
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if coalesce(public.current_app_role(), '') <> 'super_admin' then
    raise exception 'Superadmin access required';
  end if;

  return query
  select property.*
  from public.properties property
  where p_property_id is null or property.id = p_property_id
  order by property.created_at desc;
end;
$$;

create or replace function public.create_lagosrenthelp_property(
  p_listing jsonb
)
returns public.properties
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id text := public.current_public_user_id();
  v_input public.properties;
  v_property public.properties;
begin
  if coalesce(public.current_app_role(), '') <> 'super_admin' or v_profile_id is null then
    raise exception 'Superadmin access required';
  end if;

  v_input := jsonb_populate_record(null::public.properties, p_listing);

  insert into public.properties (
    title, description, price, total_package_price, location, type,
    listing_type, minimum_stay, bedrooms, bathrooms, area, amenities, images,
    status, approval_status, owner_id, contact_user_id, created_by,
    tenant_max_occupants, tenant_employment_type, tenant_min_income_band,
    tenant_guarantor_required, tenant_min_lease_months, tenant_pets_allowed,
    tenant_smoking_allowed, tenant_move_in_window, tenant_accommodation_type,
    tenant_gender_preference
  ) values (
    v_input.title, v_input.description, v_input.price,
    v_input.total_package_price, v_input.location, v_input.type,
    v_input.listing_type, v_input.minimum_stay, v_input.bedrooms,
    v_input.bathrooms, v_input.area, v_input.amenities, v_input.images,
    'available', 'approved', v_profile_id, v_profile_id, v_profile_id,
    v_input.tenant_max_occupants, v_input.tenant_employment_type,
    v_input.tenant_min_income_band, v_input.tenant_guarantor_required,
    v_input.tenant_min_lease_months, v_input.tenant_pets_allowed,
    v_input.tenant_smoking_allowed, v_input.tenant_move_in_window,
    v_input.tenant_accommodation_type, v_input.tenant_gender_preference
  )
  returning * into v_property;

  return v_property;
end;
$$;

create or replace function public.update_super_admin_property(
  p_property_id text,
  p_listing jsonb
)
returns public.properties
language plpgsql
security definer
set search_path = public
as $$
declare
  v_input public.properties;
  v_property public.properties;
begin
  if coalesce(public.current_app_role(), '') <> 'super_admin' then
    raise exception 'Superadmin access required';
  end if;

  v_input := jsonb_populate_record(null::public.properties, p_listing);

  update public.properties property
  set title = v_input.title,
      description = v_input.description,
      price = v_input.price,
      total_package_price = v_input.total_package_price,
      location = v_input.location,
      type = v_input.type,
      listing_type = v_input.listing_type,
      minimum_stay = v_input.minimum_stay,
      bedrooms = v_input.bedrooms,
      bathrooms = v_input.bathrooms,
      area = v_input.area,
      amenities = v_input.amenities,
      images = coalesce(v_input.images, property.images),
      tenant_max_occupants = v_input.tenant_max_occupants,
      tenant_employment_type = v_input.tenant_employment_type,
      tenant_min_income_band = v_input.tenant_min_income_band,
      tenant_guarantor_required = v_input.tenant_guarantor_required,
      tenant_min_lease_months = v_input.tenant_min_lease_months,
      tenant_pets_allowed = v_input.tenant_pets_allowed,
      tenant_smoking_allowed = v_input.tenant_smoking_allowed,
      tenant_move_in_window = v_input.tenant_move_in_window,
      tenant_accommodation_type = v_input.tenant_accommodation_type,
      tenant_gender_preference = v_input.tenant_gender_preference
  where property.id = p_property_id
  returning property.* into v_property;

  if v_property.id is null then
    raise exception 'Listing not found';
  end if;
  return v_property;
end;
$$;

create or replace function public.set_super_admin_property_status(
  p_property_id text,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status_input public.properties;
begin
  if coalesce(public.current_app_role(), '') <> 'super_admin' then
    raise exception 'Superadmin access required';
  end if;
  if p_status not in ('available', 'rented', 'pending') then
    raise exception 'Invalid property status';
  end if;

  v_status_input := jsonb_populate_record(
    null::public.properties,
    jsonb_build_object('status', p_status)
  );
  update public.properties
  set status = v_status_input.status
  where id = p_property_id;
end;
$$;

create or replace function public.delete_super_admin_property(
  p_property_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(public.current_app_role(), '') <> 'super_admin' then
    raise exception 'Superadmin access required';
  end if;
  delete from public.properties where id = p_property_id;
end;
$$;

create or replace function public.get_super_admin_landlord_rented_listings(
  p_landlord_user_id text
)
returns setof public.properties
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if coalesce(public.current_app_role(), '') <> 'super_admin' then
    raise exception 'Superadmin access required';
  end if;

  return query
  select property.*
  from public.properties property
  where property.created_by = p_landlord_user_id
    and property.status = 'rented'
  order by property.updated_at desc;
end;
$$;

revoke all on function public.get_super_admin_properties(text) from public;
revoke all on function public.create_lagosrenthelp_property(jsonb) from public;
revoke all on function public.update_super_admin_property(text, jsonb) from public;
revoke all on function public.set_super_admin_property_status(text, text) from public;
revoke all on function public.delete_super_admin_property(text) from public;
revoke all on function public.get_super_admin_landlord_rented_listings(text) from public;

grant execute on function public.get_super_admin_properties(text) to authenticated;
grant execute on function public.create_lagosrenthelp_property(jsonb) to authenticated;
grant execute on function public.update_super_admin_property(text, jsonb) to authenticated;
grant execute on function public.set_super_admin_property_status(text, text) to authenticated;
grant execute on function public.delete_super_admin_property(text) to authenticated;
grant execute on function public.get_super_admin_landlord_rented_listings(text) to authenticated;

commit;
