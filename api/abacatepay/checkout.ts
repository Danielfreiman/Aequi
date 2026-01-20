// Serverless proxy para iniciar checkout na AbacatePay sem expor a secret no front
const BASE = process.env.ABACATEPAY_API_URL || 'https://sandbox.abacatepay.com/api';
const API_BASE = BASE.endsWith('/v1') ? BASE : `${BASE.replace(/\/$/, '')}/v1`;
const API_KEY = process.env.ABACATEPAY_API_KEY;

function setCors(res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    setCors(res);
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!API_KEY) {
    return res.status(500).json({ error: 'Missing ABACATEPAY_API_KEY' });
  }

  try {
    const payload = { ...(req.body || {}), source: 'aequi-app' };
    const upstream = await fetch(`${API_BASE}/checkout`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      setCors(res);
      return res.status(upstream.status).json(data);
    }

    const checkoutUrl = data.checkoutUrl || data.checkout_url || data.url;
    if (!checkoutUrl) {
      setCors(res);
      return res.status(500).json({ error: 'API nao retornou checkout_url' });
    }

    setCors(res);
    return res.status(200).json({ checkoutUrl });
  } catch (err: any) {
    setCors(res);
    return res.status(500).json({ error: err?.message || 'Erro inesperado' });
  }
}
