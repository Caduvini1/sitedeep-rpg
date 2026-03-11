// api/auth/callback.js
// Recebe o código do Discord, troca por token, busca usuário e cria sessão

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.redirect('/?error=no_code');
  }

  const clientId     = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri  = process.env.DISCORD_REDIRECT_URI ||
    `https://${req.headers.host}/api/auth/callback`;

  try {
    // 1. Troca o código pelo access token
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id:     clientId,
        client_secret: clientSecret,
        grant_type:    'authorization_code',
        code,
        redirect_uri:  redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      console.error('Token error:', tokenData);
      return res.redirect('/?error=token_failed');
    }

    // 2. Busca os dados do usuário no Discord
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const user = await userRes.json();

    if (!user.id) {
      return res.redirect('/?error=user_failed');
    }

    // 3. Cria um cookie de sessão simples com os dados do usuário
    const sessionData = {
      id:            user.id,
      username:      user.username,
      discriminator: user.discriminator || '0',
      avatar:        user.avatar,
      global_name:   user.global_name || user.username,
    };

    const encoded = Buffer.from(JSON.stringify(sessionData)).toString('base64');

    // Cookie válido por 7 dias
    res.setHeader('Set-Cookie', 
      `discord_session=${encoded}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`
    );

    res.redirect('/');
  } catch (err) {
    console.error('Callback error:', err);
    res.redirect('/?error=server_error');
  }
}