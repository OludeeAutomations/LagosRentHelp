-- LagosRentHelp: genuine property enquiries for verified landlords.
-- Run after supabase_instant_listing_migration.sql.

begin;

create table if not exists public.property_leads (
  id uuid primary key default gen_random_uuid(),
  property_id text not null references public.properties(id) on delete cascade,
  landlord_id text not null references public.users(id) on delete cascade,
  renter_id text not null references public.users(id) on delete cascade,
  channel text not null check (channel in ('phone', 'whatsapp', 'message')),
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (property_id, renter_id)
);

create index if not exists property_leads_landlord_created_idx
  on public.property_leads (landlord_id, created_at desc);

alter table public.property_leads enable row level security;
revoke all privileges on table public.property_leads from public, anon, authenticated;

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
    'name', owner.name,
    'phone', owner.phone,
    'whatsapp_number', profile.whatsapp_number,
    'verification_status', profile.verification_status,
    'state', profile.state,
    'local_government', profile.local_government
  )
  into v_result
  from public.properties property
  join public.users owner
    on owner.id = coalesce(property.created_by, property.owner_id, property.contact_user_id)
  join public.landlord_profiles profile
    on profile.user_id = owner.id
   and profile.verification_status = 'verified'
  where property.id = p_property_id
    and property.approval_status = 'approved'
    and property.status = 'available'
  limit 1;

  if v_result is null then
    raise exception 'Verified listing contact not found';
  end if;
  return v_result;
end;
$$;

create or replace function public.record_property_lead(
  p_property_id text,
  p_channel text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_renter_id text := public.current_public_user_id();
  v_landlord_id text;
  v_lead public.property_leads%rowtype;
begin
  if v_renter_id is null then
    raise exception 'Authentication required';
  end if;
  if p_channel not in ('phone', 'whatsapp', 'message') then
    raise exception 'Unsupported contact channel';
  end if;

  select coalesce(property.created_by, property.owner_id, property.contact_user_id)
  into v_landlord_id
  from public.properties property
  where property.id = p_property_id
    and property.approval_status = 'approved'
    and property.status = 'available'
  limit 1;

  if v_landlord_id is null then
    raise exception 'This listing is not available';
  end if;
  if v_landlord_id = v_renter_id then
    raise exception 'You cannot create an enquiry for your own listing';
  end if;

  insert into public.property_leads (property_id, landlord_id, renter_id, channel)
  values (p_property_id, v_landlord_id, v_renter_id, p_channel)
  on conflict (property_id, renter_id) do update
    set channel = excluded.channel,
        updated_at = now()
  returning * into v_lead;

  return jsonb_build_object('id', v_lead.id, 'recorded', true);
end;
$$;

create or replace function public.get_my_property_leads(
  p_limit integer default 25,
  p_offset integer default 0,
  p_status text default null,
  p_search text default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_landlord_id text := public.current_public_user_id();
  v_limit integer := least(greatest(coalesce(p_limit, 25), 1), 100);
  v_offset integer := greatest(coalesce(p_offset, 0), 0);
  v_result jsonb;
begin
  if v_landlord_id is null then
    raise exception 'Authentication required';
  end if;
  if p_status is not null and p_status not in ('new', 'contacted', 'qualified', 'closed') then
    raise exception 'Unsupported lead status';
  end if;

  with owned as (
    select
      lead.id,
      lead.channel,
      lead.status,
      lead.created_at,
      lead.updated_at,
      property.id as property_id,
      property.title as property_title,
      property.location as property_location,
      property.price as property_price,
      renter.name as renter_name,
      renter.email as renter_email,
      renter.phone as renter_phone
    from public.property_leads lead
    join public.properties property on property.id = lead.property_id
    join public.users renter on renter.id = lead.renter_id
    where lead.landlord_id = v_landlord_id
  ), filtered as (
    select *
    from owned
    where (p_status is null or status = p_status)
      and (
        nullif(trim(coalesce(p_search, '')), '') is null
        or renter_name ilike '%' || trim(p_search) || '%'
        or renter_email ilike '%' || trim(p_search) || '%'
        or renter_phone ilike '%' || trim(p_search) || '%'
        or property_title ilike '%' || trim(p_search) || '%'
      )
  )
  select jsonb_build_object(
    'items', coalesce((
      select jsonb_agg(to_jsonb(page_rows) order by page_rows.created_at desc)
      from (
        select * from filtered
        order by created_at desc
        limit v_limit offset v_offset
      ) page_rows
    ), '[]'::jsonb),
    'filtered_total', (select count(*) from filtered),
    'total', (select count(*) from owned),
    'new_count', (select count(*) from owned where status = 'new'),
    'contacted_count', (select count(*) from owned where status = 'contacted'),
    'qualified_count', (select count(*) from owned where status = 'qualified'),
    'closed_count', (select count(*) from owned where status = 'closed')
  ) into v_result;

  return v_result;
end;
$$;

create or replace function public.update_my_property_lead_status(
  p_lead_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_status not in ('new', 'contacted', 'qualified', 'closed') then
    raise exception 'Unsupported lead status';
  end if;

  update public.property_leads
  set status = p_status,
      updated_at = now()
  where id = p_lead_id
    and landlord_id = public.current_public_user_id();

  if not found then
    raise exception 'Lead not found';
  end if;
end;
$$;

revoke all on function public.record_property_lead(text, text) from public;
revoke all on function public.get_property_contact(text) from public;
revoke all on function public.get_my_property_leads(integer, integer, text, text) from public;
revoke all on function public.update_my_property_lead_status(uuid, text) from public;
grant execute on function public.record_property_lead(text, text) to authenticated;
grant execute on function public.get_property_contact(text) to authenticated;
grant execute on function public.get_my_property_leads(integer, integer, text, text) to authenticated;
grant execute on function public.update_my_property_lead_status(uuid, text) to authenticated;

commit;
