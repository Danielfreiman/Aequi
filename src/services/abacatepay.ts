type CheckoutPayload = {
  plan: 'base' | 'growth' | 'scale';
  email: string;
};

type CheckoutResponse = {
  checkoutUrl?: string;
};

export async function createAbacatePayCheckout(payload: CheckoutPayload): Promise<CheckoutResponse> {
  const response = await fetch('/api/abacatepay/checkout', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Falha ao iniciar checkout.');
  }

  return response.json();
}
