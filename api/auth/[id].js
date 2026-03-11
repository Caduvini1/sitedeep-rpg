// api/fichas/[id].js — PUT (atualizar) e DELETE (deletar)
const https = require('https');

function getSession(req) {
  const match = (req.headers.cookie || '').match(/discord_session=([^;]+)/);
  if (!match) return null;
  try { return JSON.parse(Buffer.from(match[1], 'base64').toString()); } catch { return null; }
}

function supabase(method, path, body, anonKey, supabaseUrl) {
  return new Promise((resolve, reject) => {
    const u = new URL(`${supabaseUrl}/rest/v1/${path}`);
    const bodyStr = body ? JSON.stringify(body) : null;
    const headers = {
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (bodyStr) headers['Content-Length'] = Buffer.byteLength(bodyStr);

    const req = https.request({ hostname: u.hostname, path: u.pathname + u.search, method, headers }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve(data); } });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

module.exports = async function (req, res) {
  const user = getSession(req);
  if (!user) return res.status(401).json({ error: 'Não autenticado' });

  const { id } = req.query;
  const KEY = process.env.SUPABASE_ANON_KEY;
  const URL = process.env.SUPABASE_URL;

  if (req.method === 'PUT') {
    const { name, data } = req.body;
    await supabase('PATCH',
      `fichas?id=eq.${id}&user_id=eq.${user.id}`,
      { name, data, updated_at: new Date().toISOString() },
      KEY, URL
    );
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    await supabase('DELETE', `fichas?id=eq.${id}&user_id=eq.${user.id}`, null, KEY, URL);
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
};