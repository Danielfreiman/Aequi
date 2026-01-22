// Serviço de integração com a API do iFood
// Documentação oficial: https://developer.ifood.com.br/

export type IFoodCredentials = {
  clientId: string;
  clientSecret: string;
  merchantId?: string;
};

export type IFoodToken = {
  accessToken: string;
  expiresIn: number;
  expiresAt: number;
};

export type IFoodMerchant = {
  id: string;
  name: string;
  corporateName: string;
  cnpj: string;
  status: 'AVAILABLE' | 'UNAVAILABLE';
  createdAt: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    postalCode: string;
  };
};

export type IFoodCategory = {
  id: string;
  name: string;
  index: number;
  status: 'AVAILABLE' | 'UNAVAILABLE';
  template: string;
};

export type IFoodProduct = {
  id: string;
  name: string;
  description: string;
  externalCode?: string;
  status: 'AVAILABLE' | 'UNAVAILABLE';
  price: {
    value: number;
    originalValue?: number;
  };
  imagePath?: string;
  categoryId: string;
  serving?: string;
  dietaryRestrictions?: string[];
  ean?: string;
};

export type IFoodComplement = {
  id: string;
  name: string;
  description?: string;
  price: number;
  status: 'AVAILABLE' | 'UNAVAILABLE';
  sequence: number;
  minQuantity: number;
  maxQuantity: number;
};

export type IFoodComplementGroup = {
  id: string;
  name: string;
  minQuantity: number;
  maxQuantity: number;
  sequence: number;
  complements: IFoodComplement[];
};

export type IFoodOrder = {
  id: string;
  shortCode: string;
  createdAt: string;
  type: 'DELIVERY' | 'TAKEOUT' | 'INDOOR';
  status: string;
  merchant: {
    id: string;
    name: string;
  };
  customer: {
    name: string;
    phone?: string;
  };
  payments: {
    methods: {
      type: string;
      value: number;
    }[];
    total: number;
  };
  total: {
    items: number;
    additionalFees: number;
    deliveryFee: number;
    discount: number;
    order: number;
    fees?: number;
    netValue?: number;
  };
  items: {
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    options?: {
      name: string;
      addition: number;
    }[];
    observations?: string;
  }[];
  deliveryAddress?: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    postalCode: string;
    complement?: string;
    reference?: string;
  };
};

export type IFoodOrdersSummary = {
  count: number;
  totalValue: number;
  totalFees: number;
  totalNetValue: number;
  averageTicket: number;
  deliveryOrders: number;
  takeoutOrders: number;
  cancelledOrders: number;
};

// URLs da API do iFood
const IFOOD_API_URL = 'https://merchant-api.ifood.com.br';
const IFOOD_AUTH_URL = 'https://merchant-api.ifood.com.br/authentication/v1.0/oauth/token';

// Cache do token em memória
let tokenCache: IFoodToken | null = null;

/**
 * Obtém token de autenticação da API do iFood
 */
export async function getIFoodToken(credentials: IFoodCredentials): Promise<IFoodToken> {
  // Verifica se há token em cache válido
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache;
  }

  const response = await fetch('/api/ifood/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      clientId: credentials.clientId,
      clientSecret: credentials.clientSecret,
      grantType: 'client_credentials',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erro ao autenticar com iFood: ${error}`);
  }

  const data = await response.json();

  tokenCache = {
    accessToken: data.accessToken,
    expiresIn: data.expiresIn,
    expiresAt: Date.now() + (data.expiresIn * 1000) - 60000, // 1 min de margem
  };

  return tokenCache;
}

/**
 * Busca lojas do merchant pelo CNPJ
 */
export async function getMerchantByCNPJ(cnpj: string): Promise<IFoodMerchant | null> {
  const response = await fetch(`/api/ifood/merchant?cnpj=${encodeURIComponent(cnpj)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    const error = await response.text();
    throw new Error(`Erro ao buscar merchant: ${error}`);
  }

  return response.json();
}

/**
 * Busca todas as categorias do cardápio
 */
export async function getMenuCategories(merchantId: string): Promise<IFoodCategory[]> {
  const response = await fetch(`/api/ifood/menu/categories?merchantId=${merchantId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erro ao buscar categorias: ${error}`);
  }

  return response.json();
}

/**
 * Busca todos os produtos do cardápio
 */
export async function getMenuProducts(merchantId: string): Promise<IFoodProduct[]> {
  const response = await fetch(`/api/ifood/menu/products?merchantId=${merchantId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erro ao buscar produtos: ${error}`);
  }

  return response.json();
}

/**
 * Busca complementos de um produto
 */
export async function getProductComplements(merchantId: string, productId: string): Promise<IFoodComplementGroup[]> {
  const response = await fetch(`/api/ifood/menu/products/${productId}/complements?merchantId=${merchantId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erro ao buscar complementos: ${error}`);
  }

  return response.json();
}

/**
 * Busca histórico de pedidos
 */
export async function getOrdersHistory(
  merchantId: string,
  startDate: string,
  endDate: string,
  page: number = 0,
  size: number = 50
): Promise<{ orders: IFoodOrder[]; totalElements: number; totalPages: number }> {
  const params = new URLSearchParams({
    merchantId,
    startDate,
    endDate,
    page: page.toString(),
    size: size.toString(),
  });

  const response = await fetch(`/api/ifood/orders?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erro ao buscar pedidos: ${error}`);
  }

  return response.json();
}

/**
 * Busca detalhes de um pedido específico
 */
export async function getOrderDetails(merchantId: string, orderId: string): Promise<IFoodOrder> {
  const response = await fetch(`/api/ifood/orders/${orderId}?merchantId=${merchantId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erro ao buscar pedido: ${error}`);
  }

  return response.json();
}

/**
 * Gera resumo dos pedidos
 */
export function calculateOrdersSummary(orders: IFoodOrder[]): IFoodOrdersSummary {
  const completedOrders = orders.filter(o => o.status !== 'CANCELLED');
  const cancelledOrders = orders.filter(o => o.status === 'CANCELLED');

  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total.order, 0);
  const totalFees = completedOrders.reduce((sum, o) => sum + (o.total.fees || 0), 0);
  const totalNetValue = completedOrders.reduce((sum, o) => sum + (o.total.netValue || o.total.order), 0);

  return {
    count: orders.length,
    totalValue: totalRevenue,
    totalFees,
    totalNetValue,
    averageTicket: completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0,
    deliveryOrders: orders.filter(o => o.type === 'DELIVERY').length,
    takeoutOrders: orders.filter(o => o.type === 'TAKEOUT').length,
    cancelledOrders: cancelledOrders.length,
  };
}

/**
 * Formata CNPJ para exibição
 */
export function formatCNPJ(cnpj: string): string {
  const digits = cnpj.replace(/\D/g, '');
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

/**
 * Remove formatação do CNPJ
 */
export function cleanCNPJ(cnpj: string): string {
  return cnpj.replace(/\D/g, '');
}

/**
 * Valida CNPJ
 */
export function isValidCNPJ(cnpj: string): boolean {
  const digits = cleanCNPJ(cnpj);

  if (digits.length !== 14) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  // Validação dos dígitos verificadores
  let sum = 0;
  let weight = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i]) * weight[i];
  }

  let remainder = sum % 11;
  let digit1 = remainder < 2 ? 0 : 11 - remainder;

  if (parseInt(digits[12]) !== digit1) return false;

  sum = 0;
  weight = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  for (let i = 0; i < 13; i++) {
    sum += parseInt(digits[i]) * weight[i];
  }

  remainder = sum % 11;
  let digit2 = remainder < 2 ? 0 : 11 - remainder;

  return parseInt(digits[13]) === digit2;
}

// Limpa cache do token
export function clearTokenCache(): void {
  tokenCache = null;
}
