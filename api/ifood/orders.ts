import type { VercelRequest, VercelResponse } from '@vercel/node';

// Gera pedidos simulados do iFood
function generateMockOrders(merchantId: string, startDate: string, endDate: string) {
  const orders = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const numOrders = Math.min(daysDiff * 8, 100); // ~8 pedidos por dia

  const items = [
    { name: 'X-Burger Artesanal', price: 32.90 },
    { name: 'Filé Mignon ao Molho Madeira', price: 54.90 },
    { name: 'Picanha na Brasa', price: 72.90 },
    { name: 'Coca-Cola 350ml', price: 6.00 },
    { name: 'Suco Natural 500ml', price: 12.00 },
    { name: 'Petit Gâteau', price: 24.90 },
    { name: 'Combo Individual', price: 49.90 },
    { name: 'Porção de Batata Frita', price: 22.90 },
  ];

  const statuses = ['CONCLUDED', 'CONCLUDED', 'CONCLUDED', 'CONCLUDED', 'CANCELLED'];
  const types = ['DELIVERY', 'DELIVERY', 'DELIVERY', 'TAKEOUT'];
  const paymentTypes = ['ONLINE', 'CREDIT', 'DEBIT', 'PIX', 'VOUCHER'];

  for (let i = 0; i < numOrders; i++) {
    const orderDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    const numItems = 1 + Math.floor(Math.random() * 4);
    const orderItems = [];
    let itemsTotal = 0;

    for (let j = 0; j < numItems; j++) {
      const item = items[Math.floor(Math.random() * items.length)];
      const qty = 1 + Math.floor(Math.random() * 2);
      orderItems.push({
        id: `item-${i}-${j}`,
        name: item.name,
        quantity: qty,
        unitPrice: item.price,
        totalPrice: item.price * qty,
      });
      itemsTotal += item.price * qty;
    }

    const deliveryFee = Math.random() > 0.3 ? 5 + Math.floor(Math.random() * 10) : 0;
    const discount = Math.random() > 0.7 ? Math.floor(itemsTotal * 0.1) : 0;
    const orderType = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    orders.push({
      id: `order-${merchantId.slice(-8)}-${String(i + 1).padStart(4, '0')}`,
      shortCode: `${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      createdAt: orderDate.toISOString(),
      type: orderType,
      status,
      merchant: {
        id: merchantId,
        name: 'Restaurante Conectado',
      },
      customer: {
        name: `Cliente ${i + 1}`,
        phone: `11${9}${Math.floor(10000000 + Math.random() * 90000000)}`,
      },
      payments: {
        methods: [
          {
            type: paymentTypes[Math.floor(Math.random() * paymentTypes.length)],
            value: itemsTotal + deliveryFee - discount,
          },
        ],
        total: itemsTotal + deliveryFee - discount,
      },
      total: {
        items: itemsTotal,
        additionalFees: 0,
        deliveryFee: orderType === 'DELIVERY' ? deliveryFee : 0,
        discount,
        order: itemsTotal + (orderType === 'DELIVERY' ? deliveryFee : 0) - discount,
      },
      items: orderItems,
      deliveryAddress: orderType === 'DELIVERY' ? {
        street: 'Rua das Palmeiras',
        number: String(100 + Math.floor(Math.random() * 900)),
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        postalCode: '01310-100',
      } : undefined,
    });
  }

  return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { merchantId, startDate, endDate, page = '0', size = '50' } = req.query;

  if (!merchantId || typeof merchantId !== 'string') {
    return res.status(400).json({ error: 'merchantId é obrigatório' });
  }

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'startDate e endDate são obrigatórios' });
  }

  try {
    const allOrders = generateMockOrders(
      merchantId, 
      startDate as string, 
      endDate as string
    );
    
    const pageNum = parseInt(page as string) || 0;
    const pageSize = parseInt(size as string) || 50;
    const start = pageNum * pageSize;
    const end = start + pageSize;
    
    const orders = allOrders.slice(start, end);
    const totalPages = Math.ceil(allOrders.length / pageSize);

    return res.status(200).json({
      orders,
      totalElements: allOrders.length,
      totalPages,
      currentPage: pageNum,
    });
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return res.status(500).json({ error: 'Erro interno ao buscar pedidos' });
  }
}
