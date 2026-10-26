-- LagosRentHelp Area Reviews AI usage protection.
-- Run once in the Supabase SQL Editor before deploying area-review-ai.

begin;

create table if not exists public.area_ai_usage (
  usage_key text primary key,
  auth_user_id uuid references auth.users(id) on delete cascade,
  usage_date date not null default current_date,
  request_count integer not null default 0 check (request_count >= 0),
  updated_at timestamptz not null default now()
);

-- Upgrade the earlier signed-in-only version without losing its counters.
alter table public.area_ai_usage add column if not exists usage_key text;
alter table public.area_ai_usage add column if not exists auth_user_id uuid references auth.users(id) on delete cascade;
update public.area_ai_usage
set usage_key = 'user:' || auth_user_id::text
where usage_key is null and auth_user_id is not null;
alter table public.area_ai_usage alter column usage_key set not null;
alter table public.area_ai_usage drop constraint if exists area_ai_usage_pkey;
alter table public.area_ai_usage alter column auth_user_id drop not null;
alter table public.area_ai_usage add constraint area_ai_usage_pkey primary key (usage_key);

alter table public.area_ai_usage enable row level security;
revoke all privileges on table public.area_ai_usage from public, anon, authenticated;

drop function if exists public.consume_area_ai_request(uuid, integer);

create or replace function public.consume_area_ai_request(
  p_usage_key text,
  p_daily_limit integer default 10
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limit integer := greatest(1, least(coalesce(p_daily_limit, 10), 100));
  v_count integer;
begin
  if nullif(trim(p_usage_key), '') is null or char_length(p_usage_key) > 160 then
    raise exception 'A valid usage key is required';
  end if;

  insert into public.area_ai_usage (usage_key, usage_date, request_count, updated_at)
  values (trim(p_usage_key), current_date, 1, now())
  on conflict (usage_key) do update
  set usage_date = current_date,
      request_count = case
        when area_ai_usage.usage_date = current_date then area_ai_usage.request_count + 1
        else 1
      end,
      updated_at = now()
  where area_ai_usage.usage_date <> current_date
     or area_ai_usage.request_count < v_limit
  returning request_count into v_count;

  if v_count is null then
    raise exception 'AI_DAILY_LIMIT_REACHED';
  end if;

  return greatest(v_limit - v_count, 0);
end;
$$;

revoke all on function public.consume_area_ai_request(text, integer) from public;
grant execute on function public.consume_area_ai_request(text, integer) to service_role;

commit;
