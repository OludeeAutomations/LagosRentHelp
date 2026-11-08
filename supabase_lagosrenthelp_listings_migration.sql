-- LagosRentHelp: allow the primary superadmin account to publish and manage
-- platform-owned listings. Run after the existing landlord, verification,
-- rental-matching, and landlord-leads migrations.

begin;

grant insert (
  title, description, price, location, total_package_price, type,
  listing_type, bedrooms, bathrooms, area, amenities, images, status,
  approval_status, coordinates, available_from, minimum_stay,
  owner_id, contact_user_id, created_by,
  tenant_max_occupants, tenant_employment_type, tenant_min_income_band,
  tenant_guarantor_required, tenant_min_lease_months, tenant_pets_allowed,
  tenant_smoking_allowed, tenant_move_in_window, tenant_accommodation_type,
  tenant_gender_preference
) on table public.properties to authenticated;

grant update (
  title, description, price, location, total_package_price, type,
  listing_type, bedrooms, bathrooms, area, amenities, images, status,
  approval_status, coordinates, available_from, minimum_stay,
  owner_id, contact_user_id, created_by,
  tenant_max_occupants, tenant_employment_type, tenant_min_income_band,
  tenant_guarantor_required, tenant_min_lease_months, tenant_pets_allowed,
  tenant_smoking_allowed, tenant_move_in_window, tenant_accommodation_type,
  tenant_gender_preference
) on table public.properties to authenticated;

grant delete on table public.properties to authenticated;

drop policy if exists "superadmins can create platform properties" on public.properties;
create policy "superadmins can create platform properties"
on public.properties for insert to authenticated
with check (
  public.current_app_role() = 'super_admin'
  and owner_id = public.current_public_user_id()
  and contact_user_id = public.current_public_user_id()
  and created_by = public.current_public_user_id()
  and approval_status = 'approved'
);

drop policy if exists "superadmins can update all properties" on public.properties;
create policy "superadmins can update all properties"
on public.properties for update to authenticated
using (public.current_app_role() = 'super_admin')
with check (public.current_app_role() = 'super_admin');

drop policy if exists "superadmins can delete all properties" on public.properties;
create policy "superadmins can delete all properties"
on public.properties for delete to authenticated
using (public.current_app_role() = 'super_admin');

drop policy if exists "superadmins upload property images" on storage.objects;
create policy "superadmins upload property images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'property-images'
  and public.current_app_role() = 'super_admin'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "superadmins update property images" on storage.objects;
create policy "superadmins update property images"
on storage.objects for update to authenticated
using (
  bucket_id = 'property-images'
  and public.current_app_role() = 'super_admin'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'property-images'
  and public.current_app_role() = 'super_admin'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "superadmins delete property images" on storage.objects;
create policy "superadmins delete property images"
on storage.objects for delete to authenticated
using (
  bucket_id = 'property-images'
  and public.current_app_role() = 'super_admin'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Platform-owned listings resolve to the LagosRentHelp brand rather than the
-- private name of the administrator who published them. Landlord contacts keep
-- their existing verified profile information.
create or replace function public.get_property_contact(p_property_id text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  if public.current_public_user_id() is null then
    raise exception 'Authentication required';
  end if;

  select jsonb_build_object(
    'id', owner.id,
    'name', case
      when owner.role in ('admin', 'super_admin') then 'LagosRentHelp'
      else owner.name
    end,
    'phone', owner.phone,
    'whatsapp_number', coalesce(profile.whatsapp_number, owner.phone),
    'verification_status', case
      when owner.role in ('admin', 'super_admin') then 'verified'
      else profile.verification_status
    end,
    'state', coalesce(profile.state, 'Lagos'),
    'local_government', coalesce(profile.local_government, '')
  )
  into v_result
  from public.properties property
  join public.users owner
    on owner.id = coalesce(property.contact_user_id, property.created_by, property.owner_id)
  left join public.landlord_profiles profile
    on profile.user_id = owner.id
  where property.id = p_property_id
    and property.approval_status = 'approved'
    and property.status = 'available'
    and (
      owner.role in ('admin', 'super_admin')
      or profile.verification_status = 'verified'
    )
  limit 1;

  if v_result is null then
    raise exception 'Verified listing contact not found';
  end if;
  return v_result;
end;
$$;

revoke all on function public.get_property_contact(text) from public;
grant execute on function public.get_property_contact(text) to authenticated;

commit;
