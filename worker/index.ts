// The site's one bit of server code. Everything else is static files, which
// Cloudflare serves without running this (see run_worker_first in
// wrangler.jsonc); only /api/* comes here.
//
// /api/musickit-token hands the CD player an Apple MusicKit developer token.
// The token is a short-lived JWT, signed here with ES256 from three Worker
// secrets, so the private key never leaves Cloudflare and never reaches the
// repo or the browser. Each token works only on the site address that asked
// for it (Apple's "origin" claim), and is reused until shortly before it
// expires.
//
// /api/music/songs is temporary: it lists My Brothers And I's songs and their
// catalog IDs, so David can pick the player's tracks. Remove it once the IDs
// are in src/data/tracks.ts.

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  /** The MusicKit .p8 key, as pasted (PEM, with or without its header lines). */
  MUSICKIT_PRIVATE_KEY?: string;
  MUSICKIT_KEY_ID?: string;
  APPLE_TEAM_ID?: string;
}

/** How long a token lasts, and how long before the end we stop handing it out. */
const TOKEN_SECONDS = 12 * 60 * 60;
const RENEW_BEFORE = 30 * 60;

/** The band's Apple Music artist ID, from the site's Apple Music link. */
const ARTIST_ID = '892386824';

const tokens = new Map<string, { token: string; expires: number }>();
let signingKey: Promise<CryptoKey> | undefined;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/musickit-token') {
      if (request.method !== 'GET') return text('Method not allowed', 405);
      const issued = await developerToken(env, url.origin).catch(() => undefined);
      if (!issued) return text('Apple Music is not set up yet.', 503);
      const left = issued.expires - RENEW_BEFORE - now();
      return Response.json(
        { token: issued.token },
        {
          headers: {
            // The browser may reuse it, but nothing in between may keep it.
            'Cache-Control': `private, max-age=${Math.max(0, Math.min(left, 3600))}`,
            'X-Content-Type-Options': 'nosniff',
          },
        },
      );
    }

    if (url.pathname === '/api/music/songs') {
      const issued = await developerToken(env, url.origin).catch(() => undefined);
      if (!issued) return text('Apple Music is not set up yet: the token could not be made.', 503);
      try {
        return text(await listSongs(issued.token));
      } catch (error) {
        return text(`The token was made, but the catalog lookup failed: ${String(error)}`, 502);
      }
    }

    return env.ASSETS.fetch(request);
  },
};

const now = () => Math.floor(Date.now() / 1000);

function text(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

async function developerToken(env: Env, origin: string) {
  const cached = tokens.get(origin);
  if (cached && cached.expires - RENEW_BEFORE > now()) return cached;

  const { MUSICKIT_PRIVATE_KEY: pem, MUSICKIT_KEY_ID: kid, APPLE_TEAM_ID: team } = env;
  if (!pem || !kid || !team) throw new Error('missing secrets');

  signingKey ??= importKey(pem).catch((error) => {
    signingKey = undefined;
    throw error;
  });
  const key = await signingKey;

  const iat = now();
  const exp = iat + TOKEN_SECONDS;
  const header = { alg: 'ES256', kid: kid.trim() };
  const payload = { iss: team.trim(), iat, exp, origin: [origin] };
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
  // Web Crypto's ECDSA signature is the raw r and s, which is what a JWT wants.
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    new TextEncoder().encode(unsigned),
  );
  const issued = { token: `${unsigned}.${base64url(signature)}`, expires: exp };
  tokens.set(origin, issued);
  return issued;
}

function importKey(pem: string) {
  // Accept the key with or without its BEGIN/END lines, and with real or
  // written-out ("\n") line breaks, since dashboards paste it either way.
  const body = pem
    .replace(/\\n/g, '\n')
    .replace(/-----[A-Z ]+-----/g, '')
    .replace(/\s+/g, '');
  const der = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey('pkcs8', der, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
}

function base64url(input: string | ArrayBuffer) {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// ---- Temporary: the song list for picking tracks --------------------------

interface Resource {
  id: string;
  attributes?: { name?: string; releaseDate?: string; artistName?: string };
  relationships?: { tracks?: { data: Resource[] } };
}

async function apple(token: string, path: string) {
  const response = await fetch(`https://api.music.apple.com${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`Apple Music answered ${response.status} for ${path}`);
  return (await response.json()) as { data?: Resource[]; next?: string; results?: { artists?: { data: Resource[] } } };
}

async function listSongs(token: string) {
  const lines: string[] = [];

  const search = await apple(token, '/v1/catalog/us/search?types=artists&limit=5&term=My+Brothers+And+I');
  lines.push('Artists matching "My Brothers And I":');
  for (const artist of search.results?.artists?.data ?? []) {
    lines.push(`  ${artist.attributes?.name}  (artist ID ${artist.id})`);
  }
  lines.push('', `Songs for artist ID ${ARTIST_ID}, by release:`, '');

  const albums: Resource[] = [];
  let next: string | undefined = `/v1/catalog/us/artists/${ARTIST_ID}/albums?limit=100`;
  while (next) {
    const page = await apple(token, next);
    albums.push(...(page.data ?? []));
    next = page.next;
  }
  albums.sort((a, b) => (b.attributes?.releaseDate ?? '').localeCompare(a.attributes?.releaseDate ?? ''));

  for (let i = 0; i < albums.length; i += 50) {
    const ids = albums.slice(i, i + 50).map((album) => album.id).join(',');
    const page = await apple(token, `/v1/catalog/us/albums?ids=${ids}&include=tracks`);
    for (const album of page.data ?? []) {
      lines.push(`${album.attributes?.name} (${album.attributes?.releaseDate ?? 'no date'})`);
      for (const track of album.relationships?.tracks?.data ?? []) {
        lines.push(`  ${track.id}  ${track.attributes?.name}`);
      }
      lines.push('');
    }
  }
  return lines.join('\n');
}
