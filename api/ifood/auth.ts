import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { clientId, clientSecret, grantType } = req.body;

  if (!clientId || !clientSecret) {
    return res.status(400).json({ error: 'clientId e clientSecret são obrigatórios' });
  }

  try {
    // Em produção, fazer chamada real à API do iFood:
    // const response = await fetch('https://merchant-api.ifood.com.br/authentication/v1.0/oauth/token', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //   },
    //   body: new URLSearchParams({
    //     grantType: grantType || 'client_credentials',
    //     clientId,
    //     clientSecret,
    //   }),
    // });
    
    // Para desenvolvimento, retornar token simulado
    return res.status(200).json({
      accessToken: `mock_token_${Date.now()}`,
      tokenType: 'bearer',
      expiresIn: 3600,
    });
  } catch (error) {
    console.error('Erro ao autenticar:', error);
    return res.status(500).json({ error: 'Erro interno ao autenticar' });
  }
}
