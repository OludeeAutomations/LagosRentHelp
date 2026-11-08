-- LagosRentHelp: persistent superadmin profile images.
-- Run after supabase_lagosrenthelp_listings_migration.sql.

begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-images',
  'profile-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public profile images" on storage.objects;
create policy "public profile images"
on storage.objects for select to public
using (bucket_id = 'profile-images');

drop policy if exists "superadmins upload profile images" on storage.objects;
create policy "superadmins upload profile images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'profile-images'
  and public.current_app_role() = 'super_admin'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "superadmins update profile images" on storage.objects;
create policy "superadmins update profile images"
on storage.objects for update to authenticated
using (
  bucket_id = 'profile-images'
  and public.current_app_role() = 'super_admin'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'profile-images'
  and public.current_app_role() = 'super_admin'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "superadmins delete profile images" on storage.objects;
create policy "superadmins delete profile images"
on storage.objects for delete to authenticated
using (
  bucket_id = 'profile-images'
  and public.current_app_role() = 'super_admin'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Include the saved platform avatar when renters unlock a LagosRentHelp
-- listing contact. Verified landlord contacts keep their existing behaviour.
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
    'avatar', case
      when owner.role in ('admin', 'super_admin') then coalesce(
        nullif(auth_owner.raw_user_meta_data ->> 'avatar_url', ''),
        nullif(auth_owner.raw_user_meta_data ->> 'picture', '')
      )
      else null
    end,
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
  left join auth.users auth_owner
    on auth_owner.id = owner.auth_user_id
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
