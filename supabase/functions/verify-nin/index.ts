import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "https://lagosrenthelp.ng",
  "https://www.lagosrenthelp.ng",
  "http://localhost:5173",
]);

const corsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin && allowedOrigins.has(origin)
    ? origin
    : "https://lagosrenthelp.ng",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
});

const json = (
  body: Record<string, unknown>,
  status: number,
  origin: string | null,
) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
});

Deno.serve(async (request) => {
  const origin = request.headers.get("Origin");
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }
  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405, origin);
  }
  if (origin && !allowedOrigins.has(origin)) {
    return json({ error: "Origin not allowed." }, 403, origin);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const dojahAppId = Deno.env.get("DOJAH_APP_ID");
  const dojahPrivateKey = Deno.env.get("DOJAH_PRIVATE_KEY");
  const dojahBaseUrl = Deno.env.get("DOJAH_BASE_URL") || "https://api.dojah.io";

  if (!supabaseUrl || !anonKey || !serviceRoleKey || !dojahAppId || !dojahPrivateKey) {
    return json({ error: "NIN verification is not configured." }, 503, origin);
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization) {
    return json({ error: "Authentication required." }, 401, origin);
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });
  const { data: authData, error: authError } = await authClient.auth.getUser();
  if (authError || !authData.user) {
    return json({ error: "Your session is invalid or has expired." }, 401, origin);
  }

  let nin = "";
  try {
    const body = await request.json();
    nin = String(body?.nin || "").replace(/\D/g, "");
  } catch {
    return json({ error: "A valid JSON request is required." }, 400, origin);
  }
  if (!/^\d{11}$/.test(nin)) {
    return json({ error: "Enter a valid 11-digit NIN." }, 400, origin);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error: countError } = await admin
    .from("nin_verification_attempts")
    .select("id", { count: "exact", head: true })
    .eq("auth_user_id", authData.user.id)
    .gte("attempted_at", oneHourAgo);

  if (countError) {
    return json({ error: "Run the latest landlord database migration before verifying a NIN." }, 503, origin);
  }
  if ((count || 0) >= 5) {
    return json({ error: "Too many verification attempts. Try again in one hour." }, 429, origin);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const endpoint = new URL("/api/v1/kyc/nin", dojahBaseUrl);
    endpoint.searchParams.set("nin", nin);
    const providerResponse = await fetch(endpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
        AppId: dojahAppId,
        Authorization: dojahPrivateKey,
      },
      signal: controller.signal,
    });
    const providerBody = await providerResponse.json().catch(() => null) as Record<string, unknown> | null;
    const entity = providerBody?.entity as Record<string, unknown> | undefined;
    const verified = providerResponse.ok && Boolean(entity);

    const { error: auditError } = await admin.from("nin_verification_attempts").insert({
      auth_user_id: authData.user.id,
      nin: verified ? nin : null,
      nin_last_four: nin.slice(-4),
      successful: verified,
      provider_status: providerResponse.status,
    });
    if (auditError) {
      return json({ error: "The verification result could not be saved. Please try again." }, 500, origin);
    }

    if (!verified) {
      const configurationError = providerResponse.status === 401 || providerResponse.status === 403;
      return json(
        {
          error: configurationError
            ? "The NIN verification service is not configured correctly."
            : "This NIN could not be verified. Confirm the number and try again.",
        },
        configurationError ? 503 : 422,
        origin,
      );
    }

    const firstName = String(entity?.firstname || entity?.first_name || "").trim();
    const middleName = String(entity?.middlename || entity?.middle_name || "").trim();
    const lastName = String(entity?.surname || entity?.lastname || entity?.last_name || "").trim();
    const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ");

    return json({
      verified: true,
      identity: { firstName, middleName, lastName, fullName },
    }, 200, origin);
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "AbortError";
    return json({
      error: timedOut
        ? "The verification service took too long to respond. Please try again."
        : "The verification service is temporarily unavailable.",
    }, 503, origin);
  } finally {
    clearTimeout(timeout);
  }
});
