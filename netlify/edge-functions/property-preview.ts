type NetlifyContext = {
  next: () => Promise<Response>;
};

declare const Netlify: {
  env: {
    get: (name: string) => string | undefined;
  };
};

type PropertyPreview = {
  title: string;
  description: string | null;
  images: string[] | null;
};

const escapeAttribute = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const getEnvironmentValue = (name: string) => {
  try {
    return Netlify.env.get(name);
  } catch {
    return undefined;
  }
};

const getProperty = async (propertyId: string) => {
  const supabaseUrl =
    getEnvironmentValue("SUPABASE_URL") ||
    getEnvironmentValue("VITE_SUPABASE_URL");
  const supabaseKey =
    getEnvironmentValue("SUPABASE_ANON_KEY") ||
    getEnvironmentValue("VITE_SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseKey) return null;

  const query = new URL("/rest/v1/properties", supabaseUrl);
  query.searchParams.set("select", "title,description,images");
  query.searchParams.set("id", `eq.${propertyId}`);
  query.searchParams.set("approval_status", "eq.approved");
  query.searchParams.set("limit", "1");

  const response = await fetch(query, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  });

  if (!response.ok) return null;
  const properties = (await response.json()) as PropertyPreview[];
  return properties[0] || null;
};

export default async (request: Request, context: NetlifyContext) => {
  const pageResponsePromise = context.next();
  const url = new URL(request.url);
  const propertyId = decodeURIComponent(
    url.pathname.replace(/^\/properties\//, "").split("/")[0],
  );

  let property: PropertyPreview | null = null;
  try {
    property = propertyId ? await getProperty(propertyId) : null;
  } catch (error) {
    console.error("Unable to build property share preview", error);
  }

  const pageResponse = await pageResponsePromise;
  const contentType = pageResponse.headers.get("content-type") || "";
  const primaryImage = property?.images?.[0];

  if (!property || !primaryImage || !contentType.includes("text/html")) {
    return pageResponse;
  }

  const pageHtml = await pageResponse.text();
  const title = escapeAttribute(property.title);
  const description = escapeAttribute(
    (property.description || `View ${property.title} on Lagos Affordable Homes`)
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 200),
  );
  const imageUrl = escapeAttribute(new URL(primaryImage, url.origin).href);
  const listingUrl = escapeAttribute(url.href);
  const metadata = `
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${listingUrl}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:alt" content="${title}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${imageUrl}" />`;

  const html = pageHtml
    .replace(
      /<title>[^<]*<\/title>/i,
      `<title>${title} | Lagos Affordable Homes</title>`,
    )
    .replace("</head>", `${metadata}\n  </head>`);
  const headers = new Headers(pageResponse.headers);
  headers.delete("content-length");
  headers.delete("content-encoding");

  return new Response(html, {
    status: pageResponse.status,
    statusText: pageResponse.statusText,
    headers,
  });
};
