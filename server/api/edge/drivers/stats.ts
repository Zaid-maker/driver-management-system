export const config = { runtime: 'edge' };

// Edge runtime globals are available; declare minimal types for TS
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const caches: any;

function hex(buffer: ArrayBuffer): string {
  let out = '';
  for (const b of new Uint8Array(buffer)) {
    out += b.toString(16).padStart(2, '0');
  }
  return out;
}

async function tokenHash(authHeader: string | null): Promise<string> {
  if (!authHeader) return 'anon';
  const encoder = new TextEncoder();
  const data = encoder.encode(authHeader);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return hex(digest);
}

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const auth = request.headers.get('authorization');
  const hash = await tokenHash(auth);

  const cache = caches.default;
  const cacheKey = new Request(`https://edge-cache.local/stats?key=${hash}`, { method: 'GET' });

  // Attempt cache
  const cached = await cache.match(cacheKey);
  if (cached) {
    return cached;
  }

  // Build internal backend URL (avoid routing back to edge)
  const origin = `${url.origin}`;
  const backendUrl = `${origin}/api/_internal/drivers/stats`;

  // Forward request to Node backend
  const resp = await fetch(backendUrl, {
    headers: {
      ...(auth ? { authorization: auth } : {}),
    },
    // Disallow CDN caching at this hop to rely on edge cache
    cache: 'no-store',
  });

  // Pass through response; cache only successful responses briefly
  const headers = new Headers(resp.headers);
  headers.set('Vary', 'Authorization');
  // Ensure short-lived caching at edge per user
  headers.set('Cache-Control', 'private, max-age=0, s-maxage=60, stale-while-revalidate=300');

  const body = await resp.arrayBuffer();
  const out = new Response(body, { status: resp.status, statusText: resp.statusText, headers });

  if (resp.ok) {
    // Cache the response for this user token hash
    await cache.put(cacheKey, out.clone());
  }

  return out;
}
