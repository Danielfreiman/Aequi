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

// Usa backend/proxy serverless para proteger a chave e evitar CORS
const apiBase = '/api/abacatepay';

export async function createCheckoutSession(payload: CheckoutPayload): Promise<CheckoutResponse> {
  const response = await fetch(`${apiBase}/checkout`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
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
  const response = await fetch(`${apiBase}/customer/create`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Falha ao criar cliente.');
  }

  return response.json();
}
