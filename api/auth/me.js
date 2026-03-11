// api/auth/me.js
// Retorna os dados do usuário logado a partir do cookie de sessão

export default function handler(req, res) {
  const cookie = req.headers.cookie || '';
  const match  = cookie.match(/discord_session=([^;]+)/);

  if (!match) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const decoded = Buffer.from(match[1], 'base64').toString('utf-8');
    const user    = JSON.parse(decoded);
    res.status(200).json(user);
  } catch {
    res.status(401).json({ error: 'Invalid session' });
  }
}