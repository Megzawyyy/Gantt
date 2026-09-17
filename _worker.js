// Cloudflare Pages Advanced Mode Worker: _worker.js
// Handles /api/data with Cloudflare KV storage and serves static assets for everything else.
// Works seamlessly with Cloudflare Pages Direct Upload (Drag-and-Drop), Git repos, and Wrangler CLI.

const KV_KEY = 'workspace-data';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Sync-Key',
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...CORS_HEADERS,
    },
  });
}

function checkAuth(request, env) {
  if (!env.SYNC_KEY) return true; // no passphrase configured -> open access
  const provided = request.headers.get('X-Sync-Key');
  return provided === env.SYNC_KEY;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle preflight CORS OPTIONS requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    // Handle /api/data endpoint
    if (url.pathname === '/api/data' || url.pathname === '/api/data/') {
      if (!env.DATA_KV) {
        return json({
          error: 'DATA_KV binding is not configured. Please bind a KV namespace named DATA_KV in your Cloudflare Pages project settings (Settings -> Functions / Bindings).'
        }, 500);
      }

      if (!checkAuth(request, env)) {
        return json({ error: 'Unauthorized: Invalid or missing X-Sync-Key header.' }, 401);
      }

      if (request.method === 'GET') {
        const stored = await env.DATA_KV.get(KV_KEY);
        if (!stored) {
          return json(null); // nothing saved yet - initial blank/default state
        }
        return new Response(stored, {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
            ...CORS_HEADERS,
          },
        });
      }

      if (request.method === 'POST') {
        let body;
        try {
          body = await request.text();
          JSON.parse(body); // validate it's valid JSON before storing
        } catch (err) {
          return json({ error: 'Request body is not valid JSON.' }, 400);
        }

        await env.DATA_KV.put(KV_KEY, body);
        return json({ ok: true, savedAt: Date.now() });
      }

      return json({ error: 'Method not allowed' }, 405);
    }

    // Fall back to serving static files (index.html, etc.) from Pages assets
    return env.ASSETS.fetch(request);
  },
};
