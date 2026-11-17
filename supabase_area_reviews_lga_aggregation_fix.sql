-- LagosRentHelp Area Reviews: aggregate neighbourhood, estate, street and
-- building reviews into their parent LGA pages.
-- Safe to run after supabase_area_reviews_migration.sql.

begin;

create or replace function public.get_area_review_locations(p_search text default null)
returns table (
  id uuid,
  name text,
  slug text,
  location_type text,
  lga text,
  state text,
  description text,
  review_count bigint,
  average_rating numeric,
  average_rent numeric,
  average_move_in_cost numeric,
  electricity_rating numeric,
  water_rating numeric,
  security_rating numeric,
  roads_rating numeric,
  noise_rating numeric,
  maintenance_rating numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select
    location.id,
    location.name,
    location.slug,
    location.location_type,
    location.lga,
    location.state,
    location.description,
    count(review.id) filter (where review.status = 'approved') as review_count,
    round(avg(review.overall_rating) filter (where review.status = 'approved'), 1) as average_rating,
    round(avg(review.rent_amount) filter (where review.status = 'approved' and review.rent_amount is not null), 0) as average_rent,
    round(avg(review.move_in_cost) filter (where review.status = 'approved' and review.move_in_cost is not null), 0) as average_move_in_cost,
    round(avg(review.electricity_rating) filter (where review.status = 'approved'), 1) as electricity_rating,
    round(avg(review.water_rating) filter (where review.status = 'approved'), 1) as water_rating,
    round(avg(review.security_rating) filter (where review.status = 'approved'), 1) as security_rating,
    round(avg(review.roads_rating) filter (where review.status = 'approved'), 1) as roads_rating,
    round(avg(review.noise_rating) filter (where review.status = 'approved'), 1) as noise_rating,
    round(avg(review.maintenance_rating) filter (where review.status = 'approved'), 1) as maintenance_rating
  from public.area_review_locations location
  left join public.area_review_locations reviewed_location on
    reviewed_location.status = 'active'
    and (
      (
        location.location_type = 'lga'
        and lower(trim(reviewed_location.lga)) = lower(trim(location.lga))
      )
      or (
        location.location_type <> 'lga'
        and reviewed_location.id = location.id
      )
  )
  left join public.area_reviews review on review.location_id = reviewed_location.id
  where location.status = 'active'
    and (
      nullif(trim(p_search), '') is null
      or location.name ilike '%' || trim(p_search) || '%'
      or location.lga ilike '%' || trim(p_search) || '%'
    )
  group by location.id
  order by count(review.id) filter (where review.status = 'approved') desc, location.name;
$$;

create or replace function public.get_area_review_location(p_slug text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_location record;
  v_reviews jsonb;
begin
  select * into v_location
  from public.get_area_review_locations(null) summary
  where summary.slug = p_slug
  limit 1;

  if not found then return null; end if;

  select coalesce(jsonb_agg(review_row order by review_row.created_at desc), '[]'::jsonb)
  into v_reviews
  from (
    select
      review.id,
      case
        when review.show_first_name then split_part(
          coalesce(nullif(review.reviewer_name, ''), app_user.name, 'Lagos resident'),
          ' ',
          1
        )
        else 'Lagos resident'
      end as display_name,
      review.residency_status,
      review.property_type,
      review.lived_from,
      review.lived_to,
      review.rent_amount,
      review.service_charge,
      review.move_in_cost,
      review.overall_rating,
      review.electricity_rating,
      review.water_rating,
      review.security_rating,
      review.roads_rating,
      review.noise_rating,
      review.maintenance_rating,
      review.flood_risk,
      review.headline,
      review.review_text,
      review.evidence_verified,
      review.created_at
    from public.area_reviews review
    join public.area_review_locations reviewed_location
      on reviewed_location.id = review.location_id
    left join public.users app_user on app_user.id = review.user_id
    where (
        (
          v_location.location_type = 'lga'
          and lower(trim(reviewed_location.lga)) = lower(trim(v_location.lga))
        )
        or (
          v_location.location_type <> 'lga'
          and reviewed_location.id = v_location.id
        )
      )
      and reviewed_location.status = 'active'
      and review.status = 'approved'
  ) review_row;

  return jsonb_build_object(
    'location', to_jsonb(v_location),
    'reviews', v_reviews
  );
end;
$$;

revoke all on function public.get_area_review_locations(text) from public;
revoke all on function public.get_area_review_location(text) from public;
grant execute on function public.get_area_review_locations(text) to anon, authenticated;
grant execute on function public.get_area_review_location(text) to anon, authenticated;

commit;
