import type { VercelRequest, VercelResponse } from '@vercel/node';

// Dados simulados do cardápio do iFood
const mockCategories: Record<string, any[]> = {
  'default': [
    { id: 'cat-01', name: 'Pratos Principais', index: 1, status: 'AVAILABLE', template: 'DEFAULT' },
    { id: 'cat-02', name: 'Lanches', index: 2, status: 'AVAILABLE', template: 'DEFAULT' },
    { id: 'cat-03', name: 'Bebidas', index: 3, status: 'AVAILABLE', template: 'DEFAULT' },
    { id: 'cat-04', name: 'Sobremesas', index: 4, status: 'AVAILABLE', template: 'DEFAULT' },
    { id: 'cat-05', name: 'Combos', index: 5, status: 'AVAILABLE', template: 'DEFAULT' },
    { id: 'cat-06', name: 'Acompanhamentos', index: 6, status: 'AVAILABLE', template: 'DEFAULT' },
  ],
};

const mockProducts: Record<string, any[]> = {
  'default': [
    {
      id: 'prod-01',
      name: 'Filé Mignon ao Molho Madeira',
      description: 'Filé mignon grelhado com molho madeira, acompanha arroz branco e batatas sauté',
      externalCode: 'FM001',
      status: 'AVAILABLE',
      price: { value: 54.90, originalValue: 64.90 },
      categoryId: 'cat-01',
      serving: '1 pessoa',
    },
    {
      id: 'prod-02',
      name: 'Picanha na Brasa',
      description: 'Picanha grelhada no ponto, acompanha farofa, vinagrete e arroz',
      externalCode: 'PB001',
      status: 'AVAILABLE',
      price: { value: 72.90 },
      categoryId: 'cat-01',
      serving: '1-2 pessoas',
    },
    {
      id: 'prod-03',
      name: 'Risoto de Camarão',
      description: 'Risoto cremoso com camarões frescos, alho-poró e parmesão',
      externalCode: 'RC001',
      status: 'AVAILABLE',
      price: { value: 62.90 },
      categoryId: 'cat-01',
      serving: '1 pessoa',
    },
    {
      id: 'prod-04',
      name: 'X-Burger Artesanal',
      description: 'Hambúrguer 180g, queijo cheddar, bacon crocante, alface, tomate e molho especial',
      externalCode: 'XB001',
      status: 'AVAILABLE',
      price: { value: 32.90 },
      categoryId: 'cat-02',
      serving: '1 pessoa',
    },
    {
      id: 'prod-05',
      name: 'X-Salada Clássico',
      description: 'Hambúrguer 150g, queijo, alface, tomate, cebola e maionese',
      externalCode: 'XS001',
      status: 'AVAILABLE',
      price: { value: 26.90 },
      categoryId: 'cat-02',
    },
    {
      id: 'prod-06',
      name: 'Coca-Cola 350ml',
      description: 'Refrigerante Coca-Cola lata',
      externalCode: 'CC350',
      status: 'AVAILABLE',
      price: { value: 6.00 },
      categoryId: 'cat-03',
      ean: '7894900010015',
    },
    {
      id: 'prod-07',
      name: 'Suco Natural 500ml',
      description: 'Suco natural de laranja, limão ou maracujá',
      externalCode: 'SN500',
      status: 'AVAILABLE',
      price: { value: 12.00 },
      categoryId: 'cat-03',
    },
    {
      id: 'prod-08',
      name: 'Água Mineral 500ml',
      description: 'Água mineral sem gás',
      externalCode: 'AM500',
      status: 'AVAILABLE',
      price: { value: 4.00 },
      categoryId: 'cat-03',
      ean: '7896002301015',
    },
    {
      id: 'prod-09',
      name: 'Petit Gâteau',
      description: 'Bolinho de chocolate quente com sorvete de creme',
      externalCode: 'PG001',
      status: 'AVAILABLE',
      price: { value: 24.90 },
      categoryId: 'cat-04',
    },
    {
      id: 'prod-10',
      name: 'Pudim de Leite',
      description: 'Pudim de leite condensado com calda de caramelo',
      externalCode: 'PL001',
      status: 'AVAILABLE',
      price: { value: 14.90 },
      categoryId: 'cat-04',
    },
    {
      id: 'prod-11',
      name: 'Combo Família',
      description: 'Picanha + arroz + farofa + vinagrete + 4 bebidas (serve 4)',
      externalCode: 'CF001',
      status: 'AVAILABLE',
      price: { value: 199.90, originalValue: 249.90 },
      categoryId: 'cat-05',
      serving: '4 pessoas',
    },
    {
      id: 'prod-12',
      name: 'Combo Individual',
      description: 'Prato do dia + bebida + sobremesa',
      externalCode: 'CI001',
      status: 'AVAILABLE',
      price: { value: 49.90, originalValue: 59.90 },
      categoryId: 'cat-05',
      serving: '1 pessoa',
    },
    {
      id: 'prod-13',
      name: 'Porção de Batata Frita',
      description: 'Batatas fritas crocantes (400g)',
      externalCode: 'BF001',
      status: 'AVAILABLE',
      price: { value: 22.90 },
      categoryId: 'cat-06',
    },
    {
      id: 'prod-14',
      name: 'Onion Rings',
      description: 'Anéis de cebola empanados (300g)',
      externalCode: 'OR001',
      status: 'AVAILABLE',
      price: { value: 19.90 },
      categoryId: 'cat-06',
    },
  ],
};

const mockComplements: Record<string, any[]> = {
  'prod-04': [
    {
      id: 'grp-01',
      name: 'Adicionais',
      minQuantity: 0,
      maxQuantity: 5,
      sequence: 1,
      complements: [
        { id: 'cmp-01', name: 'Bacon extra', price: 5.00, status: 'AVAILABLE', sequence: 1, minQuantity: 0, maxQuantity: 2 },
        { id: 'cmp-02', name: 'Queijo cheddar extra', price: 4.00, status: 'AVAILABLE', sequence: 2, minQuantity: 0, maxQuantity: 2 },
        { id: 'cmp-03', name: 'Ovo', price: 3.00, status: 'AVAILABLE', sequence: 3, minQuantity: 0, maxQuantity: 1 },
        { id: 'cmp-04', name: 'Cebola caramelizada', price: 4.00, status: 'AVAILABLE', sequence: 4, minQuantity: 0, maxQuantity: 1 },
      ],
    },
    {
      id: 'grp-02',
      name: 'Ponto da Carne',
      minQuantity: 1,
      maxQuantity: 1,
      sequence: 2,
      complements: [
        { id: 'cmp-05', name: 'Mal passado', price: 0, status: 'AVAILABLE', sequence: 1, minQuantity: 0, maxQuantity: 1 },
        { id: 'cmp-06', name: 'Ao ponto', price: 0, status: 'AVAILABLE', sequence: 2, minQuantity: 0, maxQuantity: 1 },
        { id: 'cmp-07', name: 'Bem passado', price: 0, status: 'AVAILABLE', sequence: 3, minQuantity: 0, maxQuantity: 1 },
      ],
    },
  ],
  'prod-05': [
    {
      id: 'grp-03',
      name: 'Adicionais',
      minQuantity: 0,
      maxQuantity: 3,
      sequence: 1,
      complements: [
        { id: 'cmp-08', name: 'Bacon', price: 5.00, status: 'AVAILABLE', sequence: 1, minQuantity: 0, maxQuantity: 1 },
        { id: 'cmp-09', name: 'Ovo', price: 3.00, status: 'AVAILABLE', sequence: 2, minQuantity: 0, maxQuantity: 1 },
      ],
    },
  ],
  'prod-01': [
    {
      id: 'grp-04',
      name: 'Acompanhamento Extra',
      minQuantity: 0,
      maxQuantity: 2,
      sequence: 1,
      complements: [
        { id: 'cmp-10', name: 'Arroz extra', price: 6.00, status: 'AVAILABLE', sequence: 1, minQuantity: 0, maxQuantity: 1 },
        { id: 'cmp-11', name: 'Batata extra', price: 8.00, status: 'AVAILABLE', sequence: 2, minQuantity: 0, maxQuantity: 1 },
      ],
    },
    {
      id: 'grp-05',
      name: 'Ponto da Carne',
      minQuantity: 1,
      maxQuantity: 1,
      sequence: 2,
      complements: [
        { id: 'cmp-12', name: 'Mal passado', price: 0, status: 'AVAILABLE', sequence: 1, minQuantity: 0, maxQuantity: 1 },
        { id: 'cmp-13', name: 'Ao ponto', price: 0, status: 'AVAILABLE', sequence: 2, minQuantity: 0, maxQuantity: 1 },
        { id: 'cmp-14', name: 'Bem passado', price: 0, status: 'AVAILABLE', sequence: 3, minQuantity: 0, maxQuantity: 1 },
      ],
    },
  ],
  'prod-07': [
    {
      id: 'grp-06',
      name: 'Sabor',
      minQuantity: 1,
      maxQuantity: 1,
      sequence: 1,
      complements: [
        { id: 'cmp-15', name: 'Laranja', price: 0, status: 'AVAILABLE', sequence: 1, minQuantity: 0, maxQuantity: 1 },
        { id: 'cmp-16', name: 'Limão', price: 0, status: 'AVAILABLE', sequence: 2, minQuantity: 0, maxQuantity: 1 },
        { id: 'cmp-17', name: 'Maracujá', price: 0, status: 'AVAILABLE', sequence: 3, minQuantity: 0, maxQuantity: 1 },
      ],
    },
  ],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { merchantId } = req.query;
  const path = req.url?.split('/api/ifood/menu/')[1]?.split('?')[0] || '';

  if (!merchantId) {
    return res.status(400).json({ error: 'merchantId é obrigatório' });
  }

  try {
    // Roteamento baseado no path
    if (path === 'categories') {
      return res.status(200).json(mockCategories['default']);
    }

    if (path === 'products') {
      return res.status(200).json(mockProducts['default']);
    }

    // Buscar complementos de um produto específico
    const complementsMatch = path.match(/^products\/(.+)\/complements$/);
    if (complementsMatch) {
      const productId = complementsMatch[1];
      const complements = mockComplements[productId] || [];
      return res.status(200).json(complements);
    }

    return res.status(404).json({ error: 'Endpoint não encontrado' });
  } catch (error) {
    console.error('Erro ao buscar menu:', error);
    return res.status(500).json({ error: 'Erro interno ao buscar menu' });
  }
}
