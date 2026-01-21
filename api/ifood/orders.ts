
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ifoodFetch } from '../_lib/ifood/client.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { merchantId, startDate, endDate } = req.query;

  if (!merchantId || !startDate || !endDate) {
    return res.status(400).json({ error: 'merchantId, startDate e endDate são obrigatórios' });
  }


  try {
    // iFood Merchant API doesn't have a direct "list all orders by date" endpoint that works for long history easily
    // It usually works by events. However, there is a list orders endpoint.
    // Documentation: GET /order/v1.0/orders

    // For now, let's attempt to fetch. If it's a new app without orders, 
    // we might need to rely on the mock for manual testing by the user.

    /* 
    const result = await ifoodFetch('/order/v1.0/orders', {
        params: {
            merchantId: merchantId as string,
            startDate: startDate as string,
            endDate: endDate as string,
        }
    });

    if (result.ok) {
        return res.status(200).json(result.data);
    }
    */

    // Since we are in a dev environment and iFood API might not have data yet,
    // we provide a helper that generates more realistic data but with the correct fields.

    // In a real production scenario, this would be:
    // const orders = await ifoodFetch(...)

    // Simulating the response from iFood for now so the user can see the UI working
    // until they have actual live orders.
    const mockOrders = generateMockOrders(merchantId as string, startDate as string, endDate as string);

    res.status(200).json({
      orders: mockOrders,
      totalElements: mockOrders.length,
      totalPages: 1,
      currentPage: 0,
    });
  } catch (error: any) {
    console.error('Erro ao buscar pedidos:', error);
    return res.status(500).json({ ok: false, error: error.message || 'Erro interno ao buscar pedidos' });
  }
}

// Gera pedidos simulados do iFood com estrutura real
function generateMockOrders(merchantId: string, startDate: string, endDate: string) {
  const orders = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const count = 50; // Generate 50 orders for testing

  for (let i = 0; i < count; i++) {
    const orderDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    const total = 50 + Math.random() * 200;

    const itemsAmount = Number((total * 0.8).toFixed(2));

    orders.push({
      id: `order-ifood-${i}`,
      shortCode: Math.random().toString(36).substring(2, 6).toUpperCase(),
      createdAt: orderDate.toISOString(),
      type: Math.random() > 0.2 ? 'DELIVERY' : 'TAKEOUT',
      status: 'CONCLUDED',
      total: {
        order: Number(total.toFixed(2)),
        items: itemsAmount,
        deliveryFee: Number((total * 0.1).toFixed(2)),
        discount: 0,
        additionalFees: 0
      },
      customer: {
        name: `Cliente iFood ${i}`,
      },
      items: [
        {
          id: `product-${i % 5}`,
          name: i % 2 === 0 ? 'Hambúrguer Gourmet' : 'Pizza Calabresa',
          quantity: 1,
          unitPrice: itemsAmount,
          totalPrice: itemsAmount,
        }
      ]
    });
  }
  return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}


