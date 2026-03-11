// api/auth/logout.js
// Remove o cookie de sessão e redireciona para a página inicial

export default function handler(req, res) {
  res.setHeader('Set-Cookie',
    'discord_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
  );
  res.redirect('/');
}