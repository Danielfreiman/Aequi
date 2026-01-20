type CheckoutPayload = {
  planId: string;
  email: string;
  trialDays?: number;
  metadata?: Record<string, string>;
  successUrl?: string;
  cancelUrl?: string;
  testMode?: boolean;
};

type CustomerPayload = {
  name: string;
  email: string;
  cellphone: string;
  taxId: string;
};

export type CheckoutResponse = {
  checkoutUrl?: string;
};

const rawApiBase = import.meta.env.VITE_ABACATEPAY_API_URL || '/api/payments';
const apiBase = rawApiBase.endsWith('/v1') ? rawApiBase : `${rawApiBase.replace(/\/$/, '')}/v1`;
const apiKey = import.meta.env.VITE_ABACATEPAY_API_KEY;

export async function createCheckoutSession(payload: CheckoutPayload): Promise<CheckoutResponse> {
  if (!apiKey) {
    throw new Error('Configure VITE_ABACATEPAY_API_KEY no .env.local');
  }

  const response = await fetch(`${apiBase}/checkout`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ ...payload, source: 'aequi-app' }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Falha ao iniciar checkout.');
  }

  return response.json();
}

export async function createCustomer(payload: CustomerPayload) {
  if (!apiKey) {
    throw new Error('Configure VITE_ABACATEPAY_API_KEY no .env.local');
  }

  const response = await fetch(`${apiBase}/customer/create`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Falha ao criar cliente.');
  }

  return response.json();
}
