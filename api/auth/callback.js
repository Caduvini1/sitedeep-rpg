// api/auth/callback.js
const https = require('https');

function httpPost(url, headers, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname, path: u.pathname,
      method: 'POST', headers
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function httpGet(url, headers) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    https.get({ hostname: u.hostname, path: u.pathname, headers }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

function supabaseUpsert(table, record) {
  const url = `${process.env.SUPABASE_URL}/rest/v1/${table}`;
  const body = JSON.stringify(record);
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname, path: `${u.pathname}?on_conflict=id`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'apikey': process.env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        'Prefer': 'resolution=merge-duplicates'
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

module.exports = async function (req, res) {
  const { code } = req.query;
  if (!code) return res.redirect('/?error=no_code');

  try {
    // 1. Troca o código pelo token do Discord
    const bodyParams = new URLSearchParams({
      client_id:     process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type:    'authorization_code',
      code,
      redirect_uri:  process.env.DISCORD_REDIRECT_URI,
    }).toString();

    const tokenData = await httpPost(
      'https://discord.com/api/oauth2/token',
      { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(bodyParams) },
      bodyParams
    );

    if (!tokenData.access_token) return res.redirect('/?error=token_failed');

    // 2. Busca dados do usuário no Discord
    const user = await httpGet('https://discord.com/api/users/@me', {
      Authorization: `Bearer ${tokenData.access_token}`
    });

    if (!user.id) return res.redirect('/?error=user_failed');

    // 3. Salva/atualiza usuário no Supabase
    await supabaseUpsert('users', {
      id:          user.id,
      username:    user.username,
      global_name: user.global_name || user.username,
      avatar:      user.avatar || null,
    });

    // 4. Cria cookie de sessão
    const session = Buffer.from(JSON.stringify({
      id:          user.id,
      username:    user.username,
      global_name: user.global_name || user.username,
      avatar:      user.avatar || null,
    })).toString('base64');

    res.setHeader('Set-Cookie',
      `discord_session=${session}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`
    );
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.redirect('/?error=server_error');
  }
};