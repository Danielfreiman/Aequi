import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const IFOOD_TOKEN_URL = 'https://merchant-api.ifood.com.br/authentication/v1.0/oauth/token';

// Renova o token de acesso usando o refresh token
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId é obrigatório' });
  }

  const clientId = process.env.IFOOD_CLIENT_ID;
  const clientSecret = process.env.IFOOD_CLIENT_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!clientId || !clientSecret || !supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Configuração do servidor incompleta' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Busca a conexão do usuário
    const { data: connection, error: fetchError } = await supabase
      .from('ifood_connections')
      .select('*')
      .eq('profile_id', userId)
      .single();

    if (fetchError || !connection) {
      return res.status(404).json({ error: 'Conexão não encontrada' });
    }

    // Verifica se o token ainda é válido
    const tokenExpiresAt = new Date(connection.token_expires_at);
    const now = new Date();
    
    // Se ainda não expirou (com margem de 5 minutos), retorna o token atual
    if (tokenExpiresAt > new Date(now.getTime() + 5 * 60 * 1000)) {
      return res.status(200).json({
        accessToken: connection.access_token,
        merchantId: connection.merchant_id,
        merchantName: connection.merchant_name,
      });
    }

    // Token expirou, precisa renovar
    if (!connection.refresh_token) {
      return res.status(401).json({ error: 'Refresh token não disponível. Reconecte ao iFood.' });
    }

    const tokenResponse = await fetch(IFOOD_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: connection.refresh_token,
      }),
    });

    if (!tokenResponse.ok) {
      // Refresh token inválido, marca conexão como inativa
      await supabase
        .from('ifood_connections')
        .update({ status: 'expired' })
        .eq('profile_id', userId);
      
      return res.status(401).json({ error: 'Sessão expirada. Reconecte ao iFood.' });
    }

    const tokenData = await tokenResponse.json();
    const newAccessToken = tokenData.access_token || tokenData.accessToken;
    const newRefreshToken = tokenData.refresh_token || tokenData.refreshToken;
    const expiresIn = tokenData.expires_in || tokenData.expiresIn || 3600;

    // Atualiza os tokens no banco
    await supabase
      .from('ifood_connections')
      .update({
        access_token: newAccessToken,
        refresh_token: newRefreshToken || connection.refresh_token,
        token_expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('profile_id', userId);

    return res.status(200).json({
      accessToken: newAccessToken,
      merchantId: connection.merchant_id,
      merchantName: connection.merchant_name,
    });
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    return res.status(500).json({ error: 'Erro interno ao renovar token' });
  }
}
