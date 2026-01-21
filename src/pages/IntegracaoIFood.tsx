import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Store,
  Package,
  ShoppingBag,
  RefreshCw,
  Check,
  AlertCircle,
  ChevronRight,
  Download,
  Calendar,
  X,
  Unlink,
  ExternalLink,
  Archive,
  Pencil,
  Trash2,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuthSession } from '../hooks/useAuthSession';
import {
  type IFoodMerchant,
  type IFoodCategory,
  type IFoodProduct,
  type IFoodComplementGroup,
  type IFoodOrder,
  type IFoodOrdersSummary,
  getMenuCategories,
  getMenuProducts,
  getProductComplements,
  getOrdersHistory,
  calculateOrdersSummary,
  formatCNPJ,
} from '../services/ifood';

type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error' | 'expired';
type TabType = 'cardapio' | 'pedidos' | 'produtos';

interface LocalStore {
  id: string;
  name: string;
  external_id: string | null;
}

interface SavedProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category: string | null;
  status: string;
  external_code: string | null;
  source: string | null;
  ifood_id: string | null;
  created_at: string;
  updated_at: string;
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function IntegracaoIFood() {
  const { userId } = useAuthSession();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();


  // Estado da conexão
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [connectionMessage, setConnectionMessage] = useState('');
  const [merchant, setMerchant] = useState<IFoodMerchant | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Estado das lojas locais (para seleção ao conectar)
  const [localStores, setLocalStores] = useState<LocalStore[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [connectedStoreName, setConnectedStoreName] = useState<string>('');

  // Estado das abas
  const [activeTab, setActiveTab] = useState<TabType>('cardapio');

  // Estado do cardápio
  const [categories, setCategories] = useState<IFoodCategory[]>([]);
  const [products, setProducts] = useState<IFoodProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<IFoodProduct | null>(null);
  const [complements, setComplements] = useState<IFoodComplementGroup[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [importingProducts, setImportingProducts] = useState(false);
  const [importMessage, setImportMessage] = useState('');

  // Estado dos pedidos
  const [orders, setOrders] = useState<IFoodOrder[]>([]);
  const [ordersSummary, setOrdersSummary] = useState<IFoodOrdersSummary | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [selectedOrder, setSelectedOrder] = useState<IFoodOrder | null>(null);

  // Estado dos produtos salvos (aba Produtos)
  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>([]);
  const [loadingSavedProducts, setLoadingSavedProducts] = useState(false);
  const [savedProductFilter, setSavedProductFilter] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<SavedProduct | null>(null);

  // Carrega o profile_id correspondente ao userId
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('owner_id', userId)
        .single();
      if (data) setProfileId(data.id);
    };
    fetchProfile();
  }, [userId]);

  // Carrega lojas locais do usuário
  const loadLocalStores = async () => {
    if (!profileId) return;

    const { data } = await supabase
      .from('stores')
      .select('id, name, external_id')
      .eq('profile_id', profileId)
      .order('name');

    if (data && data.length > 0) {
      setLocalStores(data);
      setSelectedStoreId(data[0].id);
    }
  };

  useEffect(() => {
    loadLocalStores();
  }, [profileId]);


  // Processa parâmetros da URL (retorno do OAuth)
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const merchantName = searchParams.get('merchant');

    if (success === 'true') {
      setConnectionMessage(`Conectado com sucesso a ${merchantName || 'iFood'}!`);
      setSearchParams({});
      loadSavedConnection();
    } else if (error) {
      const errorMessages: Record<string, string> = {
        authorization_denied: 'Você negou a autorização. Tente novamente se desejar conectar.',
        no_code: 'Erro na autorização. Código não recebido.',
        server_config: 'Erro de configuração do servidor.',
        token_exchange: 'Erro ao obter token de acesso.',
        internal: 'Erro interno. Tente novamente.',
      };
      setConnectionStatus('error');
      setConnectionMessage(errorMessages[error] || 'Erro desconhecido na conexão.');
      setSearchParams({});
    }
  }, [searchParams]);

  // Carrega conexão salva
  const loadSavedConnection = async () => {
    if (!profileId) return;

    const { data } = await supabase
      .from('ifood_connections')
      .select('*, stores(name)')
      .eq('profile_id', profileId)
      .single();


    if (data?.merchant_id && data?.status === 'active') {
      setMerchant({
        id: data.merchant_id,
        name: data.merchant_name,
        corporateName: data.corporate_name,
        cnpj: data.cnpj || '',
        status: 'AVAILABLE',
        createdAt: data.created_at,
        address: data.address || {},
      });
      setAccessToken(data.access_token);
      setConnectionStatus('connected');
      // Nome da loja local conectada
      if (data.stores?.name) {
        setConnectedStoreName(data.stores.name);
      }
    } else if (data?.status === 'expired') {
      setConnectionStatus('expired');
      setConnectionMessage('Sua conexão expirou. Por favor, reconecte ao iFood.');
    }
  };

  useEffect(() => {
    loadSavedConnection();
  }, [profileId]);


  // Busca cardápio quando conectado
  useEffect(() => {
    if (connectionStatus === 'connected' && merchant) {
      loadMenu();
    }
  }, [connectionStatus, merchant]);


  const checkConnection = async () => {
    setConnectionStatus('connecting');
    setConnectionMessage('Verificando conexão com iFood...');

    try {
      const response = await fetch('/api/ifood/token');
      const data = await response.json();

      if (data.ok && data.hasToken) {
        setConnectionStatus('connected');
        setConnectionMessage('Conexão ativa (Token válido).');

        // Load merchants for confirmation if possible, or just set dummy active state
        // In centralized app, merchant ID usually comes from env or a different config, 
        // but for now we assume success means we are good.
        // We can call smoke test to get more info.

        const smoke = await fetch('/api/ifood/smoke');
        const smokeData = await smoke.json();


        if (smokeData.ok && smokeData.merchants?.[0]) {
          const m = smokeData.merchants[0];
          setMerchant(m);

          // PERSISTÊNCIA: Salva a conexão ativa no banco de dados para o usuário
          if (profileId) {
            await supabase.from('ifood_connections').upsert({
              profile_id: profileId,
              merchant_id: m.id,
              merchant_name: m.name,
              corporate_name: m.corporateName,
              cnpj: m.cnpj,
              status: 'active',
              address: m.address,
              updated_at: new Date().toISOString()
            }, { onConflict: 'profile_id' });
          }


        } else {
          // If smoke failed but token ok, still technically connected but maybe no merchants
          setConnectionMessage('Token OK, mas falha ao listar lojas.');
        }

      } else {
        setConnectionStatus('error');
        setConnectionMessage('Não foi possível obter token. Verifique as credenciais no servidor.');
      }
    } catch (error) {
      setConnectionStatus('error');
      setConnectionMessage('Erro ao contactar servidor.');
    }
  };


  // Inicia o fluxo - agora apenas verifica o backend
  const handleConnect = () => {
    checkConnection();
  };


  const handleDisconnect = async () => {
    try {
      if (profileId) {
        await supabase
          .from('ifood_connections')
          .update({ status: 'inactive', updated_at: new Date().toISOString() })
          .eq('profile_id', profileId);
      }


      setMerchant(null);
      setAccessToken(null);
      setConnectionStatus('idle');
      setConnectionMessage('Integração desativada.');
      setCategories([]);
      setProducts([]);
      setOrders([]);
      setOrdersSummary(null);
    } catch (error) {
      console.error('Erro ao desconectar:', error);
    }
  };



  // Funções para produtos salvos (aba Produtos)
  const loadSavedProducts = async () => {
    if (!profileId) return;

    setLoadingSavedProducts(true);
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('profile_id', profileId)
        .order('category', { ascending: true })
        .order('name', { ascending: true });


      if (error) throw error;
      setSavedProducts(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos salvos:', error);
    } finally {
      setLoadingSavedProducts(false);
    }
  };

  const handleUpdateProduct = async (product: SavedProduct) => {
    if (!profileId) return;

    try {
      const { error } = await supabase
        .from('menu_items')
        .update({
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          status: product.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', product.id)
        .eq('profile_id', profileId);


      if (error) throw error;

      setEditingProduct(null);
      await loadSavedProducts();
      setImportMessage('Produto atualizado com sucesso!');
      setTimeout(() => setImportMessage(''), 3000);
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      setImportMessage('Erro ao atualizar produto.');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!profileId || !confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', productId)
        .eq('profile_id', profileId);


      if (error) throw error;

      await loadSavedProducts();
      setImportMessage('Produto excluído com sucesso!');
      setTimeout(() => setImportMessage(''), 3000);
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      setImportMessage('Erro ao excluir produto.');
    }
  };

  // Carrega produtos salvos quando a aba é ativada
  useEffect(() => {
    if (activeTab === 'produtos' && profileId) {
      loadSavedProducts();
    }
  }, [activeTab, profileId]);


  const loadMenu = async () => {
    if (!merchant) return;

    setLoadingMenu(true);
    try {
      const [cats, prods] = await Promise.all([
        getMenuCategories(merchant.id),
        getMenuProducts(merchant.id),
      ]);

      setCategories(cats);
      setProducts(prods);
    } catch (error) {
      console.error('Erro ao carregar cardápio:', error);
    } finally {
      setLoadingMenu(false);
    }
  };

  const loadProductComplements = async (product: IFoodProduct) => {
    if (!merchant) return;

    setSelectedProduct(product);
    try {
      const groups = await getProductComplements(merchant.id, product.id);
      setComplements(groups);
    } catch (error) {
      console.error('Erro ao carregar complementos:', error);
      setComplements([]);
    }
  };

  const loadOrders = async () => {
    if (!merchant) return;

    setLoadingOrders(true);
    try {
      const result = await getOrdersHistory(
        merchant.id,
        dateRange.start,
        dateRange.end
      );

      setOrders(result.orders);
      setOrdersSummary(calculateOrdersSummary(result.orders));
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'pedidos' && merchant && orders.length === 0) {
      loadOrders();
    }
  }, [activeTab, merchant]);

  // Polling Real-time (Persistência)
  useEffect(() => {
    if (connectionStatus === 'connected' && merchant) {
      const interval = setInterval(() => {
        loadOrders(); // Atualiza a lista de pedidos a cada 5 minutos
      }, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [connectionStatus, merchant]);


  // Sincronização Automática (Persistência)
  useEffect(() => {
    if (connectionStatus === 'connected' && orders.length > 0) {
      const timer = setTimeout(() => {
        handleImportOrders(true); // Sincroniza silenciosamente em background
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [orders, connectionStatus]);


  const handleImportProducts = async () => {
    if (!profileId || products.length === 0) return;

    setImportingProducts(true);
    setImportMessage('Importando produtos para o sistema...');

    try {
      // 1. Salvar no mirror do iFood (menu_items)
      const menuItems = products.map(p => ({
        profile_id: profileId,
        name: p.name,
        description: p.description,
        price: p.price.value,
        original_price: p.price.originalValue || null,
        category: categories.find(c => c.id === p.categoryId)?.name || 'Outros',
        status: p.status === 'AVAILABLE' ? 'active' : 'paused',
        external_code: p.externalCode,
        source: 'ifood',
        ifood_id: p.id,
      }));

      const { error: menuError } = await supabase.from('menu_items').upsert(menuItems, {
        onConflict: 'profile_id,ifood_id',
      });

      if (menuError) throw menuError;

      // 2. Sincronizar com a tabela global de produtos para cálculos de CMV/Margem
      // Se o produto já existe no global (pelo ifood_id ou nome), atualiza o preço.
      const globalProducts = products.map(p => ({
        profile_id: profileId,
        name: p.name,
        category: categories.find(c => c.id === p.categoryId)?.name || 'iFood',
        price: p.price.value,
        ifood_id: p.id,
      }));


      // Nota: o upsert aqui assume que a tabela products tem profile_id e ifood_id como constraint única opcional
      // ou que podemos vincular pelo nome se preferir. Usaremos ifood_id.
      const { error: prodError } = await supabase.from('products').upsert(globalProducts, {
        onConflict: 'profile_id,ifood_id',
      });

      if (prodError) console.error('Aviso: Erro ao sincronizar com tabela global de produtos:', prodError);

      setImportMessage(`${products.length} produtos sincronizados! Vá para "Engenharia de Cardápio" para definir os custos.`);
      setTimeout(() => setImportMessage(''), 5000);
    } catch (error: any) {
      console.error('Erro ao importar:', error);
      setImportMessage(error.message || 'Erro ao importar produtos.');
    } finally {
      setImportingProducts(false);
    }
  };


  const handleImportOrders = async (silent = false) => {
    if (!profileId || orders.length === 0) return;

    if (!silent) {
      setImportingProducts(true);
      setImportMessage('Sincronizando pedidos com o banco de dados...');
    }

    try {
      // 1. Preparar pedidos para a tabela ifood_orders
      // Filtrar apenas concluídos para o financeiro, mas salvar todos no log se desejar
      const ordersToSave = orders.map(order => ({
        profile_id: profileId,
        ifood_order_id: order.id,
        short_code: order.shortCode,
        order_type: order.type,
        order_status: order.status,
        customer_name: order.customer.name,
        delivery_fee: order.total.deliveryFee,
        total_amount: order.total.order,
        items_amount: order.total.items,
        discounts: order.total.discount,
        order_timestamp: order.createdAt,
      }));


      // Upsert orders
      const { data: savedOrders, error: orderError } = await supabase
        .from('ifood_orders')
        .upsert(ordersToSave, { onConflict: 'profile_id,ifood_order_id' })
        .select();

      if (orderError) throw orderError;

      // 2. Preparar itens dos pedidos
      const orderItemsToSave: any[] = [];
      orders.forEach(order => {
        const savedOrder = savedOrders?.find(so => so.ifood_order_id === order.id);
        if (savedOrder && order.items) {
          order.items.forEach(item => {
            orderItemsToSave.push({
              order_id: savedOrder.id,
              ifood_product_id: item.id,
              name: item.name,
              quantity: item.quantity,
              unit_price: item.unitPrice,
              total_price: item.totalPrice,
              observations: item.observations,
            });
          });
        }
      });

      if (orderItemsToSave.length > 0) {
        const { error: itemsError } = await supabase
          .from('ifood_order_items')
          .upsert(orderItemsToSave); // No conflict specified, we might just insert or use a logic to avoid duplicates
        if (itemsError) console.error('Aviso: Erro ao salvar itens específicos:', itemsError);
      }

      // 3. Gerar transações financeiras (apenas para concluídos)
      const transactions = orders
        .filter(o => o.status === 'CONCLUDED')
        .map(order => ({
          profile_id: profileId,
          date: order.createdAt.split('T')[0],
          description: `Pedido iFood #${order.shortCode}`,
          value: order.total.order,
          type: 'Receita',
          category: 'Vendas iFood',
          is_paid: true,
          source: 'ifood',
          ifood_order_id: order.id,
        }));


      if (transactions.length > 0) {
        const { error: transError } = await supabase
          .from('fin_transactions')
          .upsert(transactions, { onConflict: 'profile_id,ifood_order_id' });

        if (transError) {
          // Se falhar por coluna não existente, avisar que precisa rodar a migração
          if (transError.message.includes('ifood_order_id')) {
            throw new Error('Erro de Schema: A coluna ifood_order_id não existe em fin_transactions. Por favor, aplique a migração SQL mais recente.');
          }
          throw transError;
        }
      }

      if (!silent) {
        setImportMessage(`${transactions.length} pedidos sincronizados com sucesso!`);
        setTimeout(() => setImportMessage(''), 3000);
      }
    } catch (error: any) {
      console.error('Erro ao importar pedidos:', error);
      if (!silent) setImportMessage(error.message || 'Erro ao sincronizar pedidos.');
    } finally {
      if (!silent) setImportingProducts(false);
    }
  };


  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.categoryId === selectedCategory);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-navy">Integração iFood</h2>
          <p className="text-slate-600 text-sm">
            Conecte sua loja para importar cardápio, complementos e histórico de pedidos.
          </p>
        </div>
      </div>

      {/* Card de Conexão */}
      {connectionStatus !== 'connected' ? (
        <div className="rounded-2xl bg-white border border-slate-100 shadow-soft p-6">
          <div className="flex items-start gap-4">
            <div className="size-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0">
              <Store size={28} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-navy mb-1">Conectar ao iFood</h3>
              <p className="text-sm text-slate-600 mb-4">
                Clique no botão abaixo para autorizar o Aequi a acessar os dados da sua loja no iFood.
                Você será redirecionado para o iFood para fazer login e autorizar o acesso.
              </p>

              {connectionStatus === 'error' && connectionMessage && (
                <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  <AlertCircle size={18} />
                  {connectionMessage}
                </div>
              )}

              {connectionStatus === 'expired' && (
                <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">
                  <AlertCircle size={18} />
                  {connectionMessage}
                </div>
              )}

              {/* Seleção de Loja */}
              {localStores.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Selecione a loja para vincular:
                  </label>
                  <select
                    value={selectedStoreId}
                    onChange={(e) => setSelectedStoreId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  >
                    {localStores.map(store => (
                      <option key={store.id} value={store.id}>{store.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-2">
                    Esta loja será vinculada à conta do iFood após a autorização.
                  </p>
                </div>
              )}

              {localStores.length === 0 && (
                <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">
                  <AlertCircle size={18} />
                  Você não tem lojas cadastradas. A conexão será feita sem vínculo com loja.
                </div>
              )}

              <button
                onClick={handleConnect}
                disabled={connectionStatus === 'connecting'}
                className="px-6 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition disabled:opacity-60 flex items-center gap-2"
              >
                {connectionStatus === 'connecting' ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Redirecionando...
                  </>
                ) : (
                  <>
                    <ExternalLink size={18} />
                    Conectar com iFood
                  </>
                )}
              </button>

              <p className="text-xs text-slate-500 mt-4">
                Ao conectar, você autoriza o Aequi a acessar informações do seu cardápio e histórico de pedidos.
                Você pode desconectar a qualquer momento.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Card do Merchant Conectado */}
          <div className="rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Store size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold">{merchant?.name}</h3>
                    <Check size={20} className="text-green-300" />
                  </div>
                  <p className="text-red-100 text-sm">{merchant?.corporateName}</p>
                  {merchant?.cnpj && (
                    <p className="text-red-200 text-xs font-mono mt-1">{formatCNPJ(merchant.cnpj)}</p>
                  )}
                  {connectedStoreName && (
                    <p className="text-red-100 text-xs mt-1 flex items-center gap-1">
                      <Store size={12} />
                      Vinculado a: {connectedStoreName}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-medium flex items-center gap-2"
              >
                <Unlink size={16} />
                Desconectar
              </button>
            </div>

            {merchant?.address && Object.keys(merchant.address).length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/20 text-sm text-red-100">
                <p>{merchant.address.street}, {merchant.address.number} - {merchant.address.neighborhood}</p>
                <p>{merchant.address.city}/{merchant.address.state} - {merchant.address.postalCode}</p>
              </div>
            )}
          </div>

          {/* Mensagem de sucesso */}
          {connectionMessage && connectionMessage.includes('sucesso') && (
            <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-700 flex items-center gap-2">
              <Check size={16} />
              {connectionMessage}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('cardapio')}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${activeTab === 'cardapio'
                ? 'border-red-500 text-red-500'
                : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
            >
              <Package size={16} />
              Cardápio iFood
            </button>
            <button
              onClick={() => setActiveTab('produtos')}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${activeTab === 'produtos'
                ? 'border-red-500 text-red-500'
                : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
            >
              <Archive size={16} />
              Produtos Salvos
            </button>
            <button
              onClick={() => setActiveTab('pedidos')}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${activeTab === 'pedidos'
                ? 'border-red-500 text-red-500'
                : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
            >
              <ShoppingBag size={16} />
              Histórico de Pedidos
            </button>
          </div>

          {/* Tab: Cardápio */}
          {activeTab === 'cardapio' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  >
                    <option value="all">Todas as categorias</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={loadMenu}
                    disabled={loadingMenu}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition flex items-center gap-2"
                  >
                    <RefreshCw size={16} className={loadingMenu ? 'animate-spin' : ''} />
                    Atualizar
                  </button>
                </div>
                <button
                  onClick={handleImportProducts}
                  disabled={importingProducts || products.length === 0}
                  className="px-5 py-2 rounded-xl bg-primary text-white font-semibold hover:brightness-110 transition disabled:opacity-60 flex items-center gap-2"
                >
                  {importingProducts ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Download size={16} />
                  )}
                  Importar para Aequi
                </button>
              </div>

              {importMessage && (
                <div className={`rounded-xl p-4 text-sm flex items-center gap-2 ${importMessage.includes('sucesso')
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
                  }`}>
                  {importMessage.includes('sucesso') ? <Check size={16} /> : <AlertCircle size={16} />}
                  {importMessage}
                </div>
              )}

              {/* Resumo */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
                  <p className="text-xs uppercase text-slate-500 font-semibold">Categorias</p>
                  <p className="text-2xl font-black text-navy">{categories.length}</p>
                </div>
                <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
                  <p className="text-xs uppercase text-slate-500 font-semibold">Produtos</p>
                  <p className="text-2xl font-black text-navy">{products.length}</p>
                </div>
                <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
                  <p className="text-xs uppercase text-slate-500 font-semibold">Ativos</p>
                  <p className="text-2xl font-black text-green-600">
                    {products.filter(p => p.status === 'AVAILABLE').length}
                  </p>
                </div>
                <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
                  <p className="text-xs uppercase text-slate-500 font-semibold">Pausados</p>
                  <p className="text-2xl font-black text-amber-600">
                    {products.filter(p => p.status === 'UNAVAILABLE').length}
                  </p>
                </div>
              </div>

              {/* Lista de Produtos */}
              <div className="rounded-2xl bg-white border border-slate-100 shadow-soft overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-navy">Produtos do Cardápio</h3>
                  <p className="text-sm text-slate-500">
                    {loadingMenu ? 'Carregando...' : `${filteredProducts.length} produtos`}
                  </p>
                </div>

                <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                  {loadingMenu ? (
                    <div className="p-8 text-center">
                      <RefreshCw size={24} className="animate-spin mx-auto text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500">Carregando cardápio...</p>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                      Nenhum produto encontrado.
                    </div>
                  ) : (
                    filteredProducts.map(product => (
                      <div
                        key={product.id}
                        className="p-4 hover:bg-slate-50 cursor-pointer transition"
                        onClick={() => loadProductComplements(product)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-navy truncate">{product.name}</h4>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${product.status === 'AVAILABLE'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-amber-100 text-amber-700'
                                }`}>
                                {product.status === 'AVAILABLE' ? 'Ativo' : 'Pausado'}
                              </span>
                            </div>
                            <p className="text-sm text-slate-500 truncate mt-1">{product.description}</p>
                            <p className="text-xs text-slate-400 mt-1">
                              {categories.find(c => c.id === product.categoryId)?.name}
                              {product.externalCode && ` • Cód: ${product.externalCode}`}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-navy">{currencyFormatter.format(product.price.value)}</p>
                            {product.price.originalValue && (
                              <p className="text-xs text-slate-400 line-through">
                                {currencyFormatter.format(product.price.originalValue)}
                              </p>
                            )}
                          </div>
                          <ChevronRight size={20} className="text-slate-300 flex-shrink-0" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Modal de Complementos */}
              {selectedProduct && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-navy">{selectedProduct.name}</h3>
                        <p className="text-sm text-slate-500">{currencyFormatter.format(selectedProduct.price.value)}</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedProduct(null);
                          setComplements([]);
                        }}
                        className="p-2 hover:bg-slate-100 rounded-lg transition"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <div className="p-5 overflow-y-auto max-h-[60vh]">
                      {complements.length === 0 ? (
                        <p className="text-slate-500 text-center py-4">
                          Este produto não possui complementos.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {complements.map(group => (
                            <div key={group.id} className="rounded-xl border border-slate-200 overflow-hidden">
                              <div className="bg-slate-50 px-4 py-3">
                                <h4 className="font-semibold text-navy">{group.name}</h4>
                                <p className="text-xs text-slate-500">
                                  {group.minQuantity > 0 ? `Obrigatório • ` : ''}
                                  Máx. {group.maxQuantity} {group.maxQuantity === 1 ? 'opção' : 'opções'}
                                </p>
                              </div>
                              <div className="divide-y divide-slate-100">
                                {group.complements.map(comp => (
                                  <div key={comp.id} className="px-4 py-3 flex items-center justify-between">
                                    <span className="text-sm">{comp.name}</span>
                                    {comp.price > 0 && (
                                      <span className="text-sm text-green-600 font-medium">
                                        + {currencyFormatter.format(comp.price)}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Produtos Salvos */}
          {activeTab === 'produtos' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <select
                    value={savedProductFilter}
                    onChange={(e) => setSavedProductFilter(e.target.value)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  >
                    <option value="all">Todas as categorias</option>
                    {[...new Set(savedProducts.map(p => p.category).filter(Boolean))].map(cat => (
                      <option key={cat} value={cat!}>{cat}</option>
                    ))}
                  </select>
                  <button
                    onClick={loadSavedProducts}
                    disabled={loadingSavedProducts}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition flex items-center gap-2"
                  >
                    <RefreshCw size={16} className={loadingSavedProducts ? 'animate-spin' : ''} />
                    Atualizar
                  </button>
                </div>
              </div>

              {importMessage && (
                <div className={`rounded-xl p-4 text-sm flex items-center gap-2 ${importMessage.includes('sucesso')
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
                  }`}>
                  {importMessage.includes('sucesso') ? <Check size={16} /> : <AlertCircle size={16} />}
                  {importMessage}
                </div>
              )}

              {/* Resumo */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
                  <p className="text-xs uppercase text-slate-500 font-semibold">Total Produtos</p>
                  <p className="text-2xl font-black text-navy">{savedProducts.length}</p>
                </div>
                <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
                  <p className="text-xs uppercase text-slate-500 font-semibold">Ativos</p>
                  <p className="text-2xl font-black text-green-600">
                    {savedProducts.filter(p => p.status === 'active').length}
                  </p>
                </div>
                <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
                  <p className="text-xs uppercase text-slate-500 font-semibold">Pausados</p>
                  <p className="text-2xl font-black text-amber-600">
                    {savedProducts.filter(p => p.status === 'paused').length}
                  </p>
                </div>
                <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
                  <p className="text-xs uppercase text-slate-500 font-semibold">Do iFood</p>
                  <p className="text-2xl font-black text-red-500">
                    {savedProducts.filter(p => p.source === 'ifood').length}
                  </p>
                </div>
              </div>

              {/* Lista de Produtos */}
              <div className="rounded-2xl bg-white border border-slate-100 shadow-soft overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-navy">Produtos Salvos no Sistema</h3>
                  <p className="text-sm text-slate-500">
                    {loadingSavedProducts ? 'Carregando...' : `${savedProducts.filter(p => savedProductFilter === 'all' || p.category === savedProductFilter).length} produtos`}
                  </p>
                </div>

                <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                  {loadingSavedProducts ? (
                    <div className="p-8 text-center">
                      <RefreshCw size={24} className="animate-spin mx-auto text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500">Carregando produtos...</p>
                    </div>
                  ) : savedProducts.filter(p => savedProductFilter === 'all' || p.category === savedProductFilter).length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                      <Archive size={40} className="mx-auto mb-3 text-slate-300" />
                      <p>Nenhum produto salvo ainda.</p>
                      <p className="text-xs mt-1">Importe produtos do iFood na aba "Cardápio iFood".</p>
                    </div>
                  ) : (
                    savedProducts
                      .filter(p => savedProductFilter === 'all' || p.category === savedProductFilter)
                      .map(product => (
                        <div key={product.id} className="p-4 hover:bg-slate-50 transition">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-navy truncate">{product.name}</h4>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${product.status === 'active'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-amber-100 text-amber-700'
                                  }`}>
                                  {product.status === 'active' ? 'Ativo' : 'Pausado'}
                                </span>
                                {product.source === 'ifood' && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                                    iFood
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-slate-500 truncate mt-1">{product.description || 'Sem descrição'}</p>
                              <p className="text-xs text-slate-400 mt-1">
                                {product.category || 'Sem categoria'}
                                {product.external_code && ` • Cód: ${product.external_code}`}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-navy">{currencyFormatter.format(product.price)}</p>
                              {product.original_price && (
                                <p className="text-xs text-slate-400 line-through">
                                  {currencyFormatter.format(product.original_price)}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setEditingProduct(product)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-400 hover:text-primary"
                                title="Editar"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="p-2 hover:bg-red-50 rounded-lg transition text-slate-400 hover:text-red-500"
                                title="Excluir"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Modal de Edição */}
              {editingProduct && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="font-bold text-navy">Editar Produto</h3>
                      <button
                        onClick={() => setEditingProduct(null)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <div className="p-5 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                        <input
                          type="text"
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                        <textarea
                          value={editingProduct.description || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Preço</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editingProduct.price}
                            onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                          <input
                            type="text"
                            value={editingProduct.category || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                        <select
                          value={editingProduct.status}
                          onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value })}
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="active">Ativo</option>
                          <option value="paused">Pausado</option>
                        </select>
                      </div>
                    </div>
                    <div className="p-5 border-t border-slate-100 flex justify-end gap-3">
                      <button
                        onClick={() => setEditingProduct(null)}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleUpdateProduct(editingProduct)}
                        className="px-4 py-2 rounded-xl bg-primary text-white font-semibold hover:brightness-110 transition"
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Pedidos */}
          {activeTab === 'pedidos' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-slate-400" />
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-sm"
                    />
                    <span className="text-slate-400">até</span>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <button
                    onClick={loadOrders}
                    disabled={loadingOrders}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition flex items-center gap-2"
                  >
                    <RefreshCw size={16} className={loadingOrders ? 'animate-spin' : ''} />
                    Buscar
                  </button>
                </div>
                <button
                  onClick={handleImportOrders}
                  disabled={importingProducts || orders.length === 0}
                  className="px-5 py-2 rounded-xl bg-primary text-white font-semibold hover:brightness-110 transition disabled:opacity-60 flex items-center gap-2"
                >
                  {importingProducts ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Download size={16} />
                  )}
                  Importar Pedidos
                </button>
              </div>

              {importMessage && (
                <div className={`rounded-xl p-4 text-sm flex items-center gap-2 ${importMessage.includes('sucesso') || importMessage.includes('importados')
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
                  }`}>
                  {importMessage.includes('sucesso') || importMessage.includes('importados') ? <Check size={16} /> : <AlertCircle size={16} />}
                  {importMessage}
                </div>
              )}

              {/* Resumo */}
              {ordersSummary && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
                    <p className="text-xs uppercase text-slate-500 font-semibold">Total Pedidos</p>
                    <p className="text-2xl font-black text-navy">{ordersSummary.totalOrders}</p>
                  </div>
                  <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
                    <p className="text-xs uppercase text-slate-500 font-semibold">Receita Total</p>
                    <p className="text-2xl font-black text-green-600">{currencyFormatter.format(ordersSummary.totalRevenue)}</p>
                  </div>
                  <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
                    <p className="text-xs uppercase text-slate-500 font-semibold">Ticket Médio</p>
                    <p className="text-2xl font-black text-primary">{currencyFormatter.format(ordersSummary.averageTicket)}</p>
                  </div>
                  <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
                    <p className="text-xs uppercase text-slate-500 font-semibold">Delivery</p>
                    <p className="text-2xl font-black text-navy">{ordersSummary.deliveryOrders}</p>
                  </div>
                  <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
                    <p className="text-xs uppercase text-slate-500 font-semibold">Retirada</p>
                    <p className="text-2xl font-black text-navy">{ordersSummary.takeoutOrders}</p>
                  </div>
                  <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
                    <p className="text-xs uppercase text-slate-500 font-semibold">Cancelados</p>
                    <p className="text-2xl font-black text-red-500">{ordersSummary.cancelledOrders}</p>
                  </div>
                </div>
              )}

              {/* Lista de Pedidos */}
              <div className="rounded-2xl bg-white border border-slate-100 shadow-soft overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-navy">Pedidos</h3>
                  <p className="text-sm text-slate-500">
                    {loadingOrders ? 'Carregando...' : `${orders.length} pedidos no período`}
                  </p>
                </div>

                <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                  {loadingOrders ? (
                    <div className="p-8 text-center">
                      <RefreshCw size={24} className="animate-spin mx-auto text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500">Carregando pedidos...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                      Nenhum pedido encontrado no período selecionado.
                    </div>
                  ) : (
                    orders.map(order => (
                      <div
                        key={order.id}
                        className="p-4 hover:bg-slate-50 cursor-pointer transition"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className={`size-10 rounded-full flex items-center justify-center ${order.status === 'CONCLUDED'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-red-100 text-red-600'
                              }`}>
                              {order.status === 'CONCLUDED' ? <Check size={18} /> : <X size={18} />}
                            </div>
                            <div>
                              <p className="font-semibold text-navy">#{order.shortCode}</p>
                              <p className="text-xs text-slate-500">
                                {new Date(order.createdAt).toLocaleString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${order.type === 'DELIVERY'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                              }`}>
                              {order.type === 'DELIVERY' ? 'Delivery' : 'Retirada'}
                            </span>
                            <p className="font-bold text-navy">{currencyFormatter.format(order.total.order)}</p>
                            <ChevronRight size={20} className="text-slate-300" />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Modal de Detalhes do Pedido */}
              {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-navy">Pedido #{selectedOrder.shortCode}</h3>
                        <p className="text-sm text-slate-500">
                          {new Date(selectedOrder.createdAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <div className="p-5 overflow-y-auto max-h-[60vh] space-y-4">
                      <div className="flex gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${selectedOrder.status === 'CONCLUDED'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                          }`}>
                          {selectedOrder.status === 'CONCLUDED' ? 'Concluído' : 'Cancelado'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${selectedOrder.type === 'DELIVERY'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                          }`}>
                          {selectedOrder.type === 'DELIVERY' ? 'Delivery' : 'Retirada'}
                        </span>
                      </div>

                      <div className="rounded-xl border border-slate-200 overflow-hidden">
                        <div className="bg-slate-50 px-4 py-3">
                          <h4 className="font-semibold text-navy">Itens do Pedido</h4>
                        </div>
                        <div className="divide-y divide-slate-100">
                          {selectedOrder.items.map(item => (
                            <div key={item.id} className="px-4 py-3 flex items-center justify-between">
                              <div>
                                <p className="font-medium">{item.quantity}x {item.name}</p>
                                {item.observations && (
                                  <p className="text-xs text-slate-500">Obs: {item.observations}</p>
                                )}
                              </div>
                              <p className="font-medium">{currencyFormatter.format(item.totalPrice)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Subtotal</span>
                          <span>{currencyFormatter.format(selectedOrder.total.items)}</span>
                        </div>
                        {selectedOrder.total.deliveryFee > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Taxa de entrega</span>
                            <span>{currencyFormatter.format(selectedOrder.total.deliveryFee)}</span>
                          </div>
                        )}
                        {selectedOrder.total.discount > 0 && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Desconto</span>
                            <span>-{currencyFormatter.format(selectedOrder.total.discount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-200">
                          <span>Total</span>
                          <span>{currencyFormatter.format(selectedOrder.total.order)}</span>
                        </div>
                      </div>

                      {selectedOrder.deliveryAddress && (
                        <div className="rounded-xl border border-slate-200 p-4">
                          <h4 className="font-semibold text-navy mb-2">Endereço de Entrega</h4>
                          <p className="text-sm text-slate-600">
                            {selectedOrder.deliveryAddress.street}, {selectedOrder.deliveryAddress.number}
                            {selectedOrder.deliveryAddress.complement && ` - ${selectedOrder.deliveryAddress.complement}`}
                          </p>
                          <p className="text-sm text-slate-600">
                            {selectedOrder.deliveryAddress.neighborhood} - {selectedOrder.deliveryAddress.city}/{selectedOrder.deliveryAddress.state}
                          </p>
                          <p className="text-sm text-slate-600">{selectedOrder.deliveryAddress.postalCode}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
