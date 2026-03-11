// api/auth/login.js
// Redireciona o usuário para o Discord para autenticação OAuth2

export default function handler(req, res) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI || 
    `https://${req.headers.host}/api/auth/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identify',
  });

  res.redirect(`https://discord.com/oauth2/authorize?${params}`);
}