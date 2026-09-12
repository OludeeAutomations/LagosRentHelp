-- LagosRentHelp: indexes for high-traffic public browsing and dashboards.
-- Run once in Supabase Dashboard -> SQL Editor.

begin;

create extension if not exists pg_trgm;

create index if not exists properties_public_feed_idx
  on public.properties (approval_status, status, created_at desc);

create index if not exists properties_public_price_idx
  on public.properties (approval_status, status, price);

create index if not exists properties_public_type_idx
  on public.properties (approval_status, status, type, listing_type, created_at desc);

create index if not exists properties_location_trgm_idx
  on public.properties using gin (location gin_trgm_ops);

create index if not exists properties_owner_status_idx
  on public.properties (created_by, status, updated_at desc);

create index if not exists landlord_profiles_status_created_idx
  on public.landlord_profiles (verification_status, created_at desc);

create index if not exists landlord_verifications_submitted_idx
  on public.landlord_verifications (submitted_at desc);

create index if not exists property_leads_landlord_status_created_idx
  on public.property_leads (landlord_id, status, created_at desc);

commit;
