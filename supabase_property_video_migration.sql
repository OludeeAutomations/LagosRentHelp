-- LagosRentHelp: optional property walkthrough videos.
-- Run after supabase_superadmin_listing_access_fix.sql.

begin;

alter table public.properties
  add column if not exists video_url text;

grant select (video_url) on table public.properties to anon, authenticated;
grant insert (video_url), update (video_url) on table public.properties to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-videos',
  'property-videos',
  true,
  52428800,
  array['video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public property videos" on storage.objects;
create policy "public property videos"
on storage.objects for select to public
using (bucket_id = 'property-videos');

drop policy if exists "landlords upload property videos" on storage.objects;
create policy "landlords upload property videos"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'property-videos'
  and public.current_app_role() = 'landlord'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "landlords update property videos" on storage.objects;
create policy "landlords update property videos"
on storage.objects for update to authenticated
using (
  bucket_id = 'property-videos'
  and public.current_app_role() = 'landlord'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'property-videos'
  and public.current_app_role() = 'landlord'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "landlords delete property videos" on storage.objects;
create policy "landlords delete property videos"
on storage.objects for delete to authenticated
using (
  bucket_id = 'property-videos'
  and public.current_app_role() = 'landlord'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "superadmins upload property videos" on storage.objects;
create policy "superadmins upload property videos"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'property-videos'
  and public.current_app_role() = 'super_admin'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "superadmins update property videos" on storage.objects;
create policy "superadmins update property videos"
on storage.objects for update to authenticated
using (
  bucket_id = 'property-videos'
  and public.current_app_role() = 'super_admin'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'property-videos'
  and public.current_app_role() = 'super_admin'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "superadmins delete property videos" on storage.objects;
create policy "superadmins delete property videos"
on storage.objects for delete to authenticated
using (
  bucket_id = 'property-videos'
  and public.current_app_role() = 'super_admin'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Refresh the security-definer functions so superadmin-created listings can
-- write the new protected column without exposing landlord matching fields.
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
    video_url, status, approval_status, owner_id, contact_user_id, created_by,
    tenant_max_occupants, tenant_employment_type, tenant_min_income_band,
    tenant_guarantor_required, tenant_min_lease_months, tenant_pets_allowed,
    tenant_smoking_allowed, tenant_move_in_window, tenant_accommodation_type,
    tenant_gender_preference
  ) values (
    v_input.title, v_input.description, v_input.price,
    v_input.total_package_price, v_input.location, v_input.type,
    v_input.listing_type, v_input.minimum_stay, v_input.bedrooms,
    v_input.bathrooms, v_input.area, v_input.amenities, v_input.images,
    v_input.video_url, 'available', 'approved', v_profile_id, v_profile_id,
    v_profile_id, v_input.tenant_max_occupants, v_input.tenant_employment_type,
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
      video_url = coalesce(v_input.video_url, property.video_url),
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

revoke all on function public.create_lagosrenthelp_property(jsonb) from public;
revoke all on function public.update_super_admin_property(text, jsonb) from public;
grant execute on function public.create_lagosrenthelp_property(jsonb) to authenticated;
grant execute on function public.update_super_admin_property(text, jsonb) to authenticated;

commit;
