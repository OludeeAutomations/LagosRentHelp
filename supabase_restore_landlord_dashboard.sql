-- Restore the dashboard role for existing accounts that already completed
-- landlord onboarding. Run once in Supabase Dashboard -> SQL Editor.

begin;

update public.users app_user
set role = 'landlord'
where app_user.role = 'user'
  and exists (
    select 1
    from public.landlord_profiles landlord_profile
    where landlord_profile.user_id = app_user.id
  );

commit;
