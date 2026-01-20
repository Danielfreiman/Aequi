import type { VercelRequest, VercelResponse } from '@vercel/node';

const IFOOD_AUTH_URL = 'https://merchant-api.ifood.com.br/authentication/v1.0/oauth/token';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Usa credenciais do ambiente ou do body
  const clientId = process.env.IFOOD_CLIENT_ID || req.body.clientId;
  const clientSecret = process.env.IFOOD_CLIENT_SECRET || req.body.clientSecret;
  const grantType = req.body.grantType || 'client_credentials';

  if (!clientId || !clientSecret) {
    return res.status(400).json({ error: 'Credenciais do iFood não configuradas' });
  }

  try {
    // Chamada real à API do iFood
    const response = await fetch(IFOOD_AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grantType,
        clientId,
        clientSecret,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro iFood Auth:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Erro ao autenticar com iFood',
        details: errorText 
      });
    }

    const data = await response.json();
    
    return res.status(200).json({
      accessToken: data.accessToken || data.access_token,
      tokenType: data.tokenType || data.token_type || 'bearer',
      expiresIn: data.expiresIn || data.expires_in || 3600,
    });
  } catch (error) {
    console.error('Erro ao autenticar:', error);
    return res.status(500).json({ error: 'Erro interno ao autenticar' });
  }
}
