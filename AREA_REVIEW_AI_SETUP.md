# Area Reviews AI setup

The browser never receives the Azure OpenAI API key. The `area-review-ai` Supabase Edge Function identifies the visitor, reads approved Area Reviews data, applies the daily limit, and then calls the Azure OpenAI Responses API.

## One-time production setup

1. Run `supabase_area_ai_migration.sql` in the Supabase SQL Editor. This adds the private AI usage table and atomic daily-limit function. The same setup is also included in the full `supabase_area_reviews_migration.sql` for new installations.
2. Add the server-only secrets:

   ```powershell
   npx supabase secrets set AZURE_OPENAI_ENDPOINT="https://YOUR-RESOURCE.openai.azure.com" AZURE_OPENAI_API_KEY="your-key" AZURE_OPENAI_DEPLOYMENT="your-deployment-name" AREA_AI_DAILY_LIMIT="10" AREA_AI_ANONYMOUS_DAILY_LIMIT="3"
   ```

3. Deploy the Edge Function:

   ```powershell
   npx supabase functions deploy area-review-ai --no-verify-jwt
   ```

Use the Azure **deployment name**, not merely the underlying model name, for `AZURE_OPENAI_DEPLOYMENT`. The three Azure secrets are required. Usage-limit secrets are optional; the defaults are 3 daily questions for a visitor without an account, 10 for a signed-in account, and a 30-question daily network safeguard. Browsing Area Reviews remains account-free; submitting or editing a review still requires sign-in.

For stronger anonymous rate-limit privacy, you can also set a long random `AREA_AI_RATE_LIMIT_SALT` secret. Configure Azure quota and budget alerts as the final cost safeguard.

VS Code uses Deno for `supabase/functions`. Install the recommended **Deno** workspace extension if prompted, then reload the editor; this removes incorrect `Deno` and `npm:` TypeScript errors from Edge Function files.

The assistant is deliberately grounded only in approved Area Reviews aggregates and approved available property listings. It does not send reviewer names, emails, phone numbers, landlord contact details, or raw review text to the model.
