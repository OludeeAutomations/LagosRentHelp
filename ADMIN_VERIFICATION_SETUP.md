# Admin verification deployment

The frontend deployment alone is not enough. Install the database workflow before using the dashboard.

1. Register and confirm `info@lagosrenthelp.ng` through the normal LagosRentHelp signup/login flow.
2. In Supabase Dashboard, open **SQL Editor** and run `supabase_admin_verification_migration.sql`.
3. Run `supabase_rental_matching_migration.sql` to install renter preferences and private listing requirements.
4. Redeploy the `verify-nin` Edge Function after the SQL migrations so new NIN checks save the verified identity name.
5. Sign out and sign back in with `info@lagosrenthelp.ng`.
6. Open `/admin/verifications` to review landlord applications.
7. Open `/admin/accounts` to grant admin access to other people. Each person must register and confirm a normal account before the primary administrator enters their email.

The primary administrator is protected from removal. Staff administrators can review landlord applications; only the primary super-admin can add or remove staff.

Uploaded identity and ownership files stay in the private `landlord-verification` bucket. Dashboard document links expire after five minutes.
