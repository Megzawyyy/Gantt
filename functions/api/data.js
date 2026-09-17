// Cloudflare Pages Function: GET/POST /api/data
//
// This enables cross-device sync. It stores your workspace data as a JSON
// value in a Cloudflare KV namespace and hands it back on request.
//
// SETUP (one-time, ~2 minutes):
// 1. In the Cloudflare dashboard, go to Workers & Pages -> your Pages
//    project -> Settings -> Functions / Bindings -> KV namespace bindings.
// 2. Create a new KV namespace (any name, e.g. "GANTT_DATA") and bind it
//    to the variable name: DATA_KV
// 3. (Recommended, since this holds project/financial data) Add an
//    environment variable named SYNC_KEY with a private passphrase of your
//    choice.
// 4. Redeploy. Open the site and click "Sync Now" once to confirm it says "Synced".

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

export async function onRequestGet(context) {
  const { request, env } = context;

  if (!env.DATA_KV) {
    return json({
      error: 'DATA_KV binding is not configured. Bind a KV namespace to variable name DATA_KV in Pages Settings.'
    }, 500);
  }
  if (!checkAuth(request, env)) {
    return json({ error: 'Unauthorized: Invalid or missing X-Sync-Key.' }, 401);
  }

  const stored = await env.DATA_KV.get(KV_KEY);
  if (!stored) {
    return json(null); // nothing saved yet - not an error
  }
  return new Response(stored, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...CORS_HEADERS,
    },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.DATA_KV) {
    return json({
      error: 'DATA_KV binding is not configured. Bind a KV namespace to variable name DATA_KV in Pages Settings.'
    }, 500);
  }
  if (!checkAuth(request, env)) {
    return json({ error: 'Unauthorized: Invalid or missing X-Sync-Key.' }, 401);
  }

  let body;
  try {
    body = await request.text();
    JSON.parse(body); // validate it's real JSON before storing
  } catch (err) {
    return json({ error: 'Request body is not valid JSON.' }, 400);
  }

  await env.DATA_KV.put(KV_KEY, body);
  return json({ ok: true, savedAt: Date.now() });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}
