// api/auth/me.js
module.exports = function (req, res) {
  const cookie = req.headers.cookie || '';
  const match  = cookie.match(/discord_session=([^;]+)/);
  if (!match) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const user = JSON.parse(Buffer.from(match[1], 'base64').toString());
    res.status(200).json(user);
  } catch {
    res.status(401).json({ error: 'Invalid session' });
  }
};