import { NextResponse, type NextRequest } from 'next/server';

/**
 * CORS for the proxied backend paths, from VITE_ALLOWED_CORS_ORIGIN (a comma-separated list).
 *
 * The old site's scripts/update-vercel-headers.cjs wrote these headers into vercel.json. Static
 * headers can name only one origin, so it kept the first entry and dropped the rest. Here each
 * request is answered with its own Origin when that origin is on the list, so every listed origin
 * works. Methods, allowed headers and credentials are the values it wrote.
 */

const ALLOWED_ORIGINS = (process.env.ALLOWED_CORS_ORIGIN || process.env.VITE_ALLOWED_CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const CORS_HEADERS = {
  'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
  'Access-Control-Allow-Headers':
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

export function proxy(request: NextRequest) {
  const origin = request.headers.get('origin');
  const allowed = origin !== null && ALLOWED_ORIGINS.includes(origin.replace(/\/+$/, ''));

  // Preflight: answered here, so it never depends on the upstream handling OPTIONS.
  if (request.method === 'OPTIONS' && allowed) {
    return new NextResponse(null, {
      status: 204,
      headers: { 'Access-Control-Allow-Origin': origin, Vary: 'Origin', ...CORS_HEADERS },
    });
  }

  const response = NextResponse.next();
  if (allowed) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    for (const [key, value] of Object.entries(CORS_HEADERS)) response.headers.set(key, value);
  }
  // The answer depends on the Origin header, so caches must key on it.
  response.headers.append('Vary', 'Origin');
  return response;
}

// The paths vercel.json gave CORS headers to: the backend, WordPress and admin-panel proxies.
export const config = {
  matcher: [
    '/api/:path*',
    '/wp-json/:path*',
    '/wp-content/:path*',
    '/public/:path*',
    '/masteradmin/:path*',
    '/masteradlorock/:path*',
    '/masteradlorockpd/:path*',
    '/masteradlorockpdprocess/:path*',
    '/masteradlogriyon/:path*',
    '/adminadlorock/:path*',
  ],
};
