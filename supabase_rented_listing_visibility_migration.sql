-- LagosRentHelp: hide rented homes from public browsing while preserving
-- access for the listing landlord and administrators.

begin;

create or replace function public.touch_property_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists touch_property_updated_at on public.properties;
create trigger touch_property_updated_at
before update on public.properties
for each row execute function public.touch_property_updated_at();

drop policy if exists "public can read approved properties" on public.properties;
create policy "public can read approved properties"
on public.properties
for select
to anon, authenticated
using (approval_status = 'approved' and status = 'available');

drop policy if exists "administrators can read all properties" on public.properties;
create policy "administrators can read all properties"
on public.properties
for select
to authenticated
using (public.current_app_role() in ('admin', 'super_admin'));

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
    raise exception 'Super administrator access required';
  end if;

  return query
  select property.*
  from public.properties property
  where property.created_by = p_landlord_user_id
    and property.status = 'rented'
  order by property.updated_at desc;
end;
$$;

revoke all on function public.get_super_admin_landlord_rented_listings(text) from public;
grant execute on function public.get_super_admin_landlord_rented_listings(text) to authenticated;

commit;
