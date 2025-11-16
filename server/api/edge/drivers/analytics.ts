export const config = { runtime: 'edge' };

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
  const cacheKey = new Request(`https://edge-cache.local/analytics?key=${hash}`, { method: 'GET' });

  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const origin = `${url.origin}`;
  const backendUrl = `${origin}/api/_internal/drivers/analytics`;

  const resp = await fetch(backendUrl, {
    headers: {
      ...(auth ? { authorization: auth } : {}),
    },
    cache: 'no-store',
  });

  const headers = new Headers(resp.headers);
  headers.set('Vary', 'Authorization');
  headers.set('Cache-Control', 'private, max-age=0, s-maxage=60, stale-while-revalidate=300');

  const body = await resp.arrayBuffer();
  const out = new Response(body, { status: resp.status, statusText: resp.statusText, headers });

  if (resp.ok) {
    await cache.put(cacheKey, out.clone());
  }

  return out;
}
