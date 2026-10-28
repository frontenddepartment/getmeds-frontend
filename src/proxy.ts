import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';

/**
 * Runs before every page and proxied path. Two jobs:
 *
 * 1. Vidrys AI logs: when an AI crawler (GPTBot, ClaudeBot, PerplexityBot, ...) requests a page,
 *    report it to Vidrys (app.vidrys.com > AI logs). Ordinary visitors are never sent, and the
 *    report goes out after the response, so a slow or failing Vidrys never touches the page.
 * 2. CORS for the proxied backend paths only (see CORS_PATHS).
 */

// The ingest URL from app.vidrys.com > AI logs > Next.js. VIDRYS_LOGS_INGEST_URL overrides it
// (local testing against a fake receiver, so test hits don't land in the real AI logs).
const VIDRYS_INGEST_URL =
  process.env.VIDRYS_LOGS_INGEST_URL ||
  'https://vidrys-api.onrender.com/api/v1/public/logs/0Q_aHf856FIDs7a1JPvbtZZTeyCHqtIJ?via=nextjs';
const AI_BOTS =
  /Meta-ExternalAgent|Applebot-Extended|Claude-SearchBot|Perplexity-User|Google-Extended|OAI-SearchBot|PerplexityBot|ChatGPT-User|Claude-User|Claude-Web|ClaudeBot|Amazonbot|Bingbot|GPTBot|CCBot|VidrysCheck/i;

function reportAiCrawler(request: NextRequest, event: NextFetchEvent) {
  const userAgent = request.headers.get('user-agent') ?? '';
  if (!AI_BOTS.test(userAgent)) return;
  event.waitUntil(
    fetch(VIDRYS_INGEST_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
        method: request.method,
        path: request.nextUrl.pathname,
        user_agent: userAgent,
      }),
    }).catch(() => {}),
  );
}

/**
 * CORS for the proxied backend paths, from VITE_ALLOWED_CORS_ORIGIN (a comma-separated list).
 *
 * The old site's scripts/update-vercel-headers.cjs wrote these headers into vercel.json. Static
 * headers can name only one origin, so it kept the first entry and dropped the rest. Here each
 * request is answered with its own Origin when that origin is on the list, so every listed origin
 * works. Methods, allowed headers and credentials are the values it wrote.
 */

// The paths vercel.json gave CORS headers to: the backend, WordPress and admin-panel proxies.
// Pages don't get them (nor the Vary: Origin that comes with them, which would split caches).
const CORS_PATHS =
  /^\/(api|wp-json|wp-content|public|masteradmin|masteradlorock|masteradlorockpd|masteradlorockpdprocess|masteradlogriyon|adminadlorock)(\/|$)/;

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

export function proxy(request: NextRequest, event: NextFetchEvent) {
  reportAiCrawler(request, event);

  if (!CORS_PATHS.test(request.nextUrl.pathname)) return NextResponse.next();

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

export const config = {
  // Every page, including robots.txt, sitemap.xml and llms.txt, which crawlers fetch first.
  // Build output and the favicon are left out.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
