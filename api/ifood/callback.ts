import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const IFOOD_TOKEN_URL = 'https://merchant-api.ifood.com.br/authentication/v1.0/oauth/token';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { code, state, error: authError } = req.query;

  // Se o usuário negou a autorização
  if (authError) {
    return res.redirect('/app/integracao-ifood?error=authorization_denied');
  }

  if (!code || typeof code !== 'string') {
    return res.redirect('/app/integracao-ifood?error=no_code');
  }

  const clientId = process.env.IFOOD_CLIENT_ID;
  const clientSecret = process.env.IFOOD_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.redirect('/app/integracao-ifood?error=server_config');
  }

  // Decodifica o state para pegar o userId
  let userId = '';
  if (state && typeof state === 'string') {
    try {
      const decoded = JSON.parse(Buffer.from(state, 'base64').toString());
      userId = decoded.userId || '';
    } catch (e) {
      console.error('Erro ao decodificar state:', e);
    }
  }

  // URL de callback
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : process.env.APP_URL || 'http://localhost:5173';
  const redirectUri = `${baseUrl}/api/ifood/callback`;

  try {
    // Troca o código por token de acesso
    const tokenResponse = await fetch(IFOOD_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Erro ao trocar código:', tokenResponse.status, errorText);
      return res.redirect('/app/integracao-ifood?error=token_exchange');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token || tokenData.accessToken;
    const refreshToken = tokenData.refresh_token || tokenData.refreshToken;
    const expiresIn = tokenData.expires_in || tokenData.expiresIn || 3600;

    // Busca informações do merchant autorizado
    const merchantResponse = await fetch('https://merchant-api.ifood.com.br/merchant/v1.0/merchants', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    let merchantData = null;
    if (merchantResponse.ok) {
      const merchants = await merchantResponse.json();
      if (merchants && merchants.length > 0) {
        merchantData = merchants[0]; // Pega o primeiro merchant
      }
    }

    // Salva a conexão no Supabase se tiver userId
    if (userId && merchantData) {
      const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);

        await supabase.from('ifood_connections').upsert({
          profile_id: userId,
          merchant_id: merchantData.id,
          merchant_name: merchantData.name,
          corporate_name: merchantData.corporateName,
          cnpj: merchantData.document,
          access_token: accessToken,
          refresh_token: refreshToken,
          token_expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
          status: 'active',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'profile_id' });
      }
    }

    // Redireciona de volta para o app com sucesso
    const successParams = new URLSearchParams({
      success: 'true',
      merchant: merchantData?.name || 'Conectado',
    });

    return res.redirect(`/app/integracao-ifood?${successParams.toString()}`);
  } catch (error) {
    console.error('Erro no callback:', error);
    return res.redirect('/app/integracao-ifood?error=internal');
  }
}
