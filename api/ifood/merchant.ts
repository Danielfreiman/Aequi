
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ifoodFetch } from '../_lib/ifood/client.ts';

// Mock de merchants para desenvolvimento
const mockMerchants: Record<string, any> = {
  '12345678000190': {
    id: 'merchant-001',
    name: 'Restaurante Sabor & Arte',
    corporateName: 'SABOR E ARTE ALIMENTOS LTDA',
    cnpj: '12345678000190',
    status: 'AVAILABLE',
    createdAt: '2023-01-15T10:00:00Z',
    address: {
      street: 'Rua das Flores',
      number: '123',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      postalCode: '01310-100',
    },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { cnpj } = req.query;

  if (!cnpj || typeof cnpj !== 'string') {
    return res.status(400).json({ error: 'CNPJ é obrigatório' });
  }

  const cleanCnpj = cnpj.replace(/\D/g, '');

  try {
    const merchant = mockMerchants[cleanCnpj];

    if (!merchant) {
      // Create a deterministic mock name based on CNPJ
      const suffix = cleanCnpj.slice(-4);
      const dynamicMerchant = {
        id: `merchant-${cleanCnpj.slice(0, 8)}`,
        name: `Restaurante iFood ${suffix}`,
        corporateName: `IFOOD TESTE UNIDADE ${suffix} LTDA`,
        cnpj: cleanCnpj,
        status: 'AVAILABLE',
        createdAt: new Date().toISOString(),
        address: {
          street: 'Rua Principal',
          number: suffix,
          neighborhood: 'Centro',
          city: 'Cidade iFood',
          state: 'SP',
          postalCode: '01000-000',
        },
      };
      return res.status(200).json(dynamicMerchant);
    }

    return res.status(200).json(merchant);
  } catch (error) {
    console.error('Erro ao buscar merchant:', error);
    return res.status(500).json({ error: 'Erro interno ao buscar merchant' });
  }
}
