-- LagosRentHelp: publish listings from verified landlords immediately and
-- prevent the same landlord from submitting the same property twice.
-- Run after supabase_admin_verification_migration.sql.

begin;

alter table public.properties
  alter column approval_status set default 'approved';

-- Existing pending listings from verified landlords no longer need a second
-- administrative approval and can become visible immediately.
update public.properties property
set approval_status = 'approved',
    updated_at = now()
from public.landlord_profiles profile
where property.created_by = profile.user_id
  and profile.verification_status = 'verified'
  and property.approval_status = 'pending';

create or replace function public.normalise_listing_text(p_value text)
returns text
language sql
immutable
set search_path = public
as $$
  select lower(regexp_replace(trim(coalesce(p_value, '')), '\s+', ' ', 'g'));
$$;

create or replace function public.is_duplicate_property_listing(
  p_title text,
  p_location text,
  p_property_type text,
  p_listing_type text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.properties property
    where property.created_by = public.current_public_user_id()
      and public.normalise_listing_text(property.title) = public.normalise_listing_text(p_title)
      and public.normalise_listing_text(property.location) = public.normalise_listing_text(p_location)
      and property.type::text = p_property_type
      and property.listing_type::text = p_listing_type
  );
$$;

create or replace function public.prevent_duplicate_property_listing()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_fingerprint text;
begin
  v_fingerprint := concat_ws(
    '|',
    new.created_by,
    public.normalise_listing_text(new.title),
    public.normalise_listing_text(new.location),
    new.type::text,
    new.listing_type::text
  );

  -- Serialise matching submissions so two fast clicks cannot create duplicates.
  perform pg_advisory_xact_lock(hashtextextended(v_fingerprint, 0));

  if exists (
    select 1
    from public.properties property
    where property.id is distinct from new.id
      and property.created_by = new.created_by
      and public.normalise_listing_text(property.title) = public.normalise_listing_text(new.title)
      and public.normalise_listing_text(property.location) = public.normalise_listing_text(new.location)
      and property.type::text = new.type::text
      and property.listing_type::text = new.listing_type::text
  ) then
    raise exception 'This property has already been listed.' using errcode = '23505';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_duplicate_property_listing on public.properties;
create trigger prevent_duplicate_property_listing
before insert or update of title, location, type, listing_type, created_by
on public.properties
for each row execute function public.prevent_duplicate_property_listing();

drop policy if exists "landlords can create own properties" on public.properties;
create policy "landlords can create own properties"
on public.properties for insert to authenticated
with check (
  public.current_app_role() = 'landlord'
  and owner_id = public.current_public_user_id()
  and contact_user_id = public.current_public_user_id()
  and created_by = public.current_public_user_id()
  and approval_status = 'approved'
  and exists (
    select 1
    from public.landlord_profiles profile
    where profile.user_id = public.current_public_user_id()
      and profile.verification_status = 'verified'
  )
);

revoke all on function public.normalise_listing_text(text) from public;
revoke all on function public.is_duplicate_property_listing(text, text, text, text) from public;
revoke all on function public.prevent_duplicate_property_listing() from public;
grant execute on function public.is_duplicate_property_listing(text, text, text, text) to authenticated;

commit;
