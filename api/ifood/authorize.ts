import type { VercelRequest, VercelResponse } from '@vercel/node';

// URL de autorização do iFood
const IFOOD_AUTH_URL = 'https://merchant-api.ifood.com.br/authentication/v1.0/oauth/authorize';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const clientId = process.env.IFOOD_CLIENT_ID;
  
  if (!clientId) {
    return res.status(500).json({ error: 'Credenciais do iFood não configuradas no servidor' });
  }

  // URL de callback - onde o iFood vai redirecionar após autorização
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : process.env.APP_URL || 'http://localhost:5173';
  
  const redirectUri = `${baseUrl}/api/ifood/callback`;
  
  // State para segurança (prevenir CSRF) - inclui o userId se fornecido
  const { userId } = req.query;
  const state = Buffer.from(JSON.stringify({
    userId: userId || '',
    timestamp: Date.now(),
    random: Math.random().toString(36).substring(7),
  })).toString('base64');

  // Monta URL de autorização do iFood
  const authUrl = new URL(IFOOD_AUTH_URL);
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('state', state);
  // Scopes necessários para acessar merchant, menu e orders
  authUrl.searchParams.set('scope', 'merchant catalog order');

  // Redireciona o usuário para o iFood
  return res.redirect(302, authUrl.toString());
}
