import { useState, useEffect, useMemo } from 'react';
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
  ArrowLeft,
  PlusCircle,
  Clock,
  Info
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
  const [stores, setStores] = useState<any[]>([]);
  const [selectedStore, setSelectedStore] = useState<any | null>(null);
  const [loadingStores, setLoadingStores] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isAddingStore, setIsAddingStore] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');

  const fetchStores = async () => {
    if (!userId) return;
    setLoadingStores(true);
    try {
      // In this app, stores are often linked to profiles, which are linked to users.
      // However, the user wants "lojas cadastradas para aquele usuario".
      // Let's check the stores table structure. Assuming it has a user_id or similar.
      // Based on Ajustes.tsx, it just selects from 'stores'.
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setStores(data || []);
    } catch (err) {
      console.error('Error fetching stores:', err);
    } finally {
      setLoadingStores(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [userId]);

  const handleAddStore = async () => {
    if (!newStoreName.trim() || !userId) return;
    try {
      // We need a profile_id for the store usually. 
      // Let's fetch the first profile for the user to stay consistent.
      const { data: profile } = await supabase.from('profiles').select('id').limit(1).single();

      const { error } = await supabase.from('stores').insert({
        name: newStoreName,
        profile_id: profile?.id
      });
      if (error) throw error;
      setNewStoreName('');
      setIsAddingStore(false);
      fetchStores();
    } catch (err) {
      console.error('Error adding store:', err);
      alert('Erro ao criar loja.');
    }
  };

  return (
    <section className="space-y-6">
      {!selectedStore ? (
        // SECTION: Store Selection List
        <div className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-navy">Minhas Lojas</h2>
              <p className="text-slate-600 text-sm">
                Selecione a loja que deseja gerenciar a integração com iFood.
              </p>
            </div>
            {!isAddingStore && (
              <button
                onClick={() => setIsAddingStore(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-semibold hover:brightness-110 transition"
              >
                <PlusCircle size={20} />
                Nova Loja
              </button>
            )}
          </div>

          {isAddingStore && (
            <div className="bg-white p-6 rounded-2xl border border-primary/30 shadow-soft animate-in fade-in slide-in-from-top-2">
              <h3 className="font-bold text-navy mb-4">Adicionar Nova Loja</h3>
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  placeholder="Nome da Loja (ex: Pizzaria do Zé)"
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button onClick={handleAddStore} className="px-4 py-2 bg-primary text-white rounded-xl font-bold">Salvar</button>
                <button onClick={() => setIsAddingStore(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold">Cancelar</button>
              </div>
            </div>
          )}

          {loadingStores ? (
            <div className="text-center py-12 text-slate-500">
              <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
              Carregando lojas...
            </div>
          ) : stores.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
              <Store size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-600">Nenhuma loja cadastrada no banco de dados.</p>
              <button onClick={() => setIsAddingStore(true)} className="mt-4 text-primary font-bold hover:underline">Cadastrar minha primeira loja</button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stores.map(store => (
                <div
                  key={store.id}
                  onClick={() => setSelectedStore(store)}
                  className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft hover:shadow-lg hover:border-primary/30 transition cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition">
                    <ChevronRight size={20} className="text-slate-300" />
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition">
                      <Store size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-navy truncate group-hover:text-primary transition">{store.name || 'Loja Sem Nome'}</h3>
                      <p className="text-xs text-slate-400 font-mono">{store.id.slice(0, 8)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-4 border-t border-slate-50">
                    <span className="text-slate-500 text-xs">Gerenciar iFood</span>
                    <span className="flex items-center gap-1 font-bold text-primary group-hover:translate-x-1 transition-transform">
                      Detalhes
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedStore(null)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-navy transition group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Voltar para lista de lojas
          </button>

          <IntegracaoDetail store={selectedStore} />
        </div>
      )}
    </section>
  );
}

function IntegracaoDetail({ store }: { store: any }) {
  const storeId = store.id;
  const { userId } = useAuthSession();
  const [searchParams, setSearchParams] = useSearchParams();

  // Connection State
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [connectionMessage, setConnectionMessage] = useState('');
  const [merchant, setMerchant] = useState<IFoodMerchant | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [cnpjInput, setCnpjInput] = useState('');
  const [verifyingCnpj, setVerifyingCnpj] = useState(false);
  const [errorHeader, setErrorHeader] = useState<string | null>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<TabType>('cardapio');

  // Menu State
  const [categories, setCategories] = useState<IFoodCategory[]>([]);
  const [products, setProducts] = useState<IFoodProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<IFoodProduct | null>(null);
  const [complements, setComplements] = useState<IFoodComplementGroup[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [importingProducts, setImportingProducts] = useState(false);
  const [importMessage, setImportMessage] = useState('');

  // Orders State
  const [orders, setOrders] = useState<IFoodOrder[]>([]);
  const [ordersSummary, setOrdersSummary] = useState<IFoodOrdersSummary | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IFoodOrder | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  // Saved Products State
  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>([]);
  const [loadingSavedProducts, setLoadingSavedProducts] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SavedProduct | null>(null);

  // Profit/CMV State
  const [cmvSummary, setCmvSummary] = useState<{ grossProfit: number; marginPercent: number; totalCost: number } | null>(null);

  // Load Saved Connection
  const loadSavedConnection = async () => {
    if (!storeId) return;
    const { data } = await supabase
      .from('ifood_connections')
      .select('*')
      .eq('store_id', storeId)
      .single();

    if (data?.status === 'active') {
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
    } else if (data?.status === 'expired') {
      setConnectionStatus('expired');
    } else {
      setConnectionStatus('idle');
      setMerchant(null);
    }
  };

  useEffect(() => { loadSavedConnection(); }, [storeId]);

  // Handle Auth Callback
  useEffect(() => {
    const success = searchParams.get('success');
    const merchantIdFromParam = searchParams.get('merchantId');
    // In a real app, we'd verify the merchantId matches if passed
    if (success === 'true') {
      loadSavedConnection();
    }
  }, [searchParams]);

  const handleConnect = async () => {
    if (!cnpjInput.replace(/\D/g, '')) {
      alert('Por favor, insira o CNPJ da loja iFood.');
      return;
    }

    setVerifyingCnpj(true);
    setConnectionStatus('connecting');
    setConnectionMessage('Verificando CNPJ no iFood...');
    setErrorHeader(null);

    try {
      // 1. Fetch Merchant Details by CNPJ
      const response = await fetch(`/api/ifood/merchant?cnpj=${cnpjInput.replace(/\D/g, '')}`);
      if (!response.ok) {
        throw new Error('Loja não encontrada com este CNPJ no iFood.');
      }

      const merchantData = await response.json();

      // 2. Save Connection to DB
      const { error: dbError } = await supabase.from('ifood_connections').upsert({
        store_id: storeId,
        profile_id: store.profile_id, // Mandatory for current RLS
        merchant_id: merchantData.id,
        merchant_name: merchantData.name,
        corporate_name: merchantData.corporateName,
        cnpj: merchantData.cnpj,
        status: 'active',
        address: merchantData.address,
        access_token: 'centralized_token',
        expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
      }, { onConflict: 'store_id' });

      if (dbError) throw dbError;

      // 3. Update Local State
      setMerchant(merchantData);
      setConnectionStatus('connected');
      setConnectionMessage('');
    } catch (err: any) {
      console.error('Error connecting iFood:', err);
      setErrorHeader(err.message);
      setConnectionStatus('idle');
    } finally {
      setVerifyingCnpj(false);
    }
  };

  const handleDisconnect = async () => {
    if (confirm('Deseja realmente desconectar esta loja?')) {
      await supabase.from('ifood_connections').delete().eq('store_id', storeId);
      setConnectionStatus('idle');
      setMerchant(null);
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
    } catch (e) { console.error(e); }
    finally { setLoadingMenu(false); }
  };

  const loadOrders = async () => {
    if (!merchant) return;
    setLoadingOrders(true);
    try {
      const result = await getOrdersHistory(merchant.id, dateRange.start, dateRange.end);
      setOrders(result.orders);
      setOrdersSummary(calculateOrdersSummary(result.orders));
    } catch (e) { console.error(e); }
    finally { setLoadingOrders(false); }
  };

  const loadSavedProducts = async () => {
    setLoadingSavedProducts(true);
    const { data } = await supabase.from('menu_items').select('*').eq('store_id', storeId);
    setSavedProducts(data || []);
    setLoadingSavedProducts(false);
  };

  const loadCmvData = async () => {
    if (!storeId) return;
    const { data } = await supabase
      .from('view_ifood_cmv_analysis')
      .select('gross_profit, margin_percent, estimated_total_cost, revenue')
      .eq('store_id', storeId);

    if (data && data.length > 0) {
      const hasMissingCosts = data.some(row => row.gross_profit === null || row.gross_profit === undefined);
      const grossProfit = data.reduce((sum, row) => sum + (row.gross_profit || 0), 0);
      const totalCost = data.reduce((sum, row) => sum + (row.estimated_total_cost || 0), 0);
      const totalNetRevenue = data.reduce((sum, row) => sum + (row.revenue || 0), 0);

      setCmvSummary({
        grossProfit: hasMissingCosts ? null as any : grossProfit,
        totalCost,
        marginPercent: totalNetRevenue > 0 ? (grossProfit / totalNetRevenue) * 100 : 0
      });
    } else {
      setCmvSummary(null);
    }
  };

  useEffect(() => {
    if (connectionStatus === 'connected' && merchant) {
      if (activeTab === 'cardapio') loadMenu();
      if (activeTab === 'pedidos') {
        loadOrders();
        loadCmvData();
      }
      if (activeTab === 'produtos') loadSavedProducts();
    }
  }, [connectionStatus, merchant, activeTab]);

  const handleImportProducts = async (silent = false) => {
    if (!storeId || products.length === 0) return;
    if (!silent) { setImportingProducts(true); setImportMessage('Sincronizando...'); }
    try {
      const menuItems = products.map(p => ({
        store_id: storeId,
        profile_id: store.profile_id,
        name: p.name,
        description: p.description,
        price: p.price.value,
        category: categories.find(c => c.id === p.categoryId)?.name || 'Outros',
        status: p.status === 'AVAILABLE' ? 'active' : 'paused',
        ifood_id: p.id,
        source: 'ifood'
      }));
      await supabase.from('menu_items').upsert(menuItems, { onConflict: 'store_id,ifood_id' });

      const globalProducts = products.map(p => ({
        profile_id: store.profile_id,
        product_type: 'final' as const,
        name: p.name,
        description: p.description,
        category: categories.find(c => c.id === p.categoryId)?.name || 'iFood',
        price: p.price.value / 100,
        ifood_id: p.id,
        ifood_code: p.id,
        is_active: p.status === 'AVAILABLE',
        unit: 'un'
      }));
      await supabase.from('products').upsert(globalProducts, { onConflict: 'ifood_id' });

      if (!silent) { setImportMessage('Sincronizado!'); setTimeout(() => setImportMessage(''), 3000); }
    } catch (e) { console.error(e); }
    finally { if (!silent) setImportingProducts(false); }
  };

  const handleImportOrders = async (silent = false) => {
    if (!storeId || orders.length === 0) return;
    if (!silent) { setImportingProducts(true); setImportMessage('Sincronizando Pedidos...'); }
    try {
      const ordersToSave = orders.map(o => ({
        store_id: storeId,
        profile_id: store.profile_id,
        ifood_order_id: o.id,
        short_code: o.shortCode,
        order_type: o.type,
        order_status: o.status,
        customer_name: o.customer.name,
        total_amount: o.total.order,
        delivery_fee: o.total.deliveryFee || 0,
        items_amount: o.total.items || 0,
        discounts: o.total.discount || 0,
        fees: o.total.fees || 0,
        net_amount: o.total.netValue || o.total.order,
        order_timestamp: o.createdAt
      }));
      const { data: savedOrders, error: ordersError } = await supabase
        .from('ifood_orders')
        .upsert(ordersToSave, { onConflict: 'store_id,ifood_order_id' })
        .select();

      if (ordersError) throw ordersError;

      // 3. Save Order Items
      if (savedOrders) {
        const itemsToSave: any[] = [];
        orders.forEach(o => {
          const dbOrder = savedOrders.find(so => so.ifood_order_id === o.id);
          if (dbOrder) {
            o.items.forEach((item: any) => {
              itemsToSave.push({
                order_id: dbOrder.id,
                external_id: item.id,
                name: item.name,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                total_price: item.totalPrice,
                fees: item.fees || (item.totalPrice * 0.12), // Fallback to 12%
                net_amount: item.netValue || (item.totalPrice * 0.88),
                observations: item.observations
              });
            });
          }
        });

        if (itemsToSave.length > 0) {
          await supabase.from('ifood_order_items').upsert(itemsToSave, { onConflict: 'order_id,external_id' });
        }
      }

      const transactions = orders.filter(o => o.status === 'CONCLUDED').map(o => ({
        store_id: storeId,
        date: o.createdAt.split('T')[0],
        description: `Pedido iFood #${o.shortCode}`,
        value: o.total.netValue || o.total.order,
        type: 'Receita',
        category: 'Vendas iFood',
        is_paid: true,
        source: 'ifood',
        ifood_order_id: o.id
      }));
      await supabase.from('fin_transactions').upsert(transactions, { onConflict: 'ifood_order_id' });

      if (!silent) { setImportMessage('Pedidos Sincronizados!'); setTimeout(() => setImportMessage(''), 3000); }
    } catch (e) { console.error(e); }
    finally { if (!silent) setImportingProducts(false); }
  };

  const filteredProducts = selectedCategory === 'all' ? products : products.filter(p => p.categoryId === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
              <Store size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-navy">{store.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${connectionStatus === 'connected' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {connectionStatus === 'connected' ? 'iFood Conectado' : 'Sem Conexão iFood'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">ID: {store.id}</span>
              </div>
            </div>
          </div>
          {connectionStatus === 'connected' && (
            <button onClick={handleDisconnect} className="text-red-500 text-xs font-bold flex items-center gap-1 hover:underline">
              <Unlink size={14} /> Desconectar iFood
            </button>
          )}
        </div>
      </div>

      {connectionStatus !== 'connected' && (
        <div className="rounded-2xl bg-white border border-slate-100 shadow-soft p-12 text-center">
          <div className="size-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Store size={40} />
          </div>
          <h3 className="text-xl font-bold text-navy mb-2">Conectar {store.name}</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-8">
            Para gerenciar o cardápio e sincronizar pedidos desta loja, informe o CNPJ cadastrado no iFood.
          </p>

          <div className="max-w-xs mx-auto mb-6">
            <input
              type="text"
              value={cnpjInput}
              onChange={(e) => setCnpjInput(e.target.value)}
              placeholder="00.000.000/0000-00"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-center font-bold text-lg"
            />
          </div>

          {errorHeader && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-semibold flex items-center gap-2 justify-center">
              <AlertCircle size={16} />
              {errorHeader}
            </div>
          )}

          <button
            onClick={handleConnect}
            disabled={verifyingCnpj}
            className="px-8 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition flex items-center gap-2 mx-auto disabled:opacity-50"
          >
            {verifyingCnpj ? <RefreshCw className="animate-spin" size={20} /> : <Check size={20} />}
            Ativar Conexão iFood
          </button>
          <p className="mt-6 text-xs text-slate-400 flex items-center justify-center gap-1">
            <Info size={12} /> A conexão é baseada no CNPJ da sua loja iFood.
          </p>
        </div>
      )}

      {connectionStatus === 'connected' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Store size={120} />
            </div>
            <div className="flex justify-between items-center relative z-10">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black">{merchant?.name}</h3>
                  <div className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Loja iFood</div>
                </div>
                <p className="text-red-100 text-xs mt-1">{merchant?.corporateName}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-red-200 uppercase font-bold tracking-widest">CNPJ</p>
                <p className="text-sm font-mono">{merchant?.cnpj ? formatCNPJ(merchant.cnpj) : '---'}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
            {(['cardapio', 'pedidos', 'produtos'] as TabType[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition ${activeTab === tab ? 'bg-white text-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6 min-h-[400px]">
            {activeTab === 'cardapio' && (
              <div className="space-y-6">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <h3 className="font-bold text-navy">Gerenciar Cardápio iFood</h3>
                    <p className="text-xs text-slate-500">Produtos disponíveis na sua loja iFood.</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={loadMenu} className="p-2 text-slate-400 hover:text-navy transition"><RefreshCw size={20} /></button>
                    <button onClick={() => handleImportProducts()} disabled={importingProducts} className="px-4 py-2 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:brightness-110 transition">
                      {importingProducts ? <RefreshCw className="animate-spin" size={18} /> : <Download size={18} />}
                      Sincronizar no Aequi
                    </button>
                  </div>
                </div>

                {importMessage && <div className="p-3 bg-green-50 text-green-700 rounded-xl text-sm font-semibold flex items-center gap-2 animate-in fade-in"><Check size={16} />{importMessage}</div>}

                <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                  <button onClick={() => setSelectedCategory('all')} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${selectedCategory === 'all' ? 'bg-navy text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>Todos</button>
                  {categories.map(cat => (
                    <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${selectedCategory === cat.id ? 'bg-navy text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>{cat.name}</button>
                  ))}
                </div>

                {loadingMenu ? (
                  <div className="text-center py-20"><RefreshCw className="animate-spin mx-auto text-slate-300" size={32} /></div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-20 text-slate-400">Nenhum produto encontrado.</div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-3">
                    {filteredProducts.map(p => (
                      <div key={p.id} onClick={() => loadProductComplements(p)} className="p-4 rounded-xl border border-slate-100 hover:border-primary/30 transition cursor-pointer flex justify-between group">
                        <div>
                          <p className="font-bold text-navy group-hover:text-primary transition">{p.name}</p>
                          <p className="text-xs text-slate-500 line-clamp-1">{p.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-700">{currencyFormatter.format(p.price.value)}</p>
                          <span className={`text-[9px] font-black uppercase tracking-tighter ${p.status === 'AVAILABLE' ? 'text-green-600' : 'text-slate-400'}`}>{p.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'pedidos' && (
              <div className="space-y-6">
                <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-50 pb-4">
                  <div>
                    <h3 className="font-bold text-navy">Histórico e Sincronização</h3>
                    <p className="text-xs text-slate-500">Vendas concluídas geram transações financeiras.</p>
                  </div>

                  {/* Extrato de Taxas Section */}
                  {ordersSummary && (
                    <div className="mt-8 grid md:grid-cols-2 gap-6">
                      <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <h4 className="text-sm font-bold text-navy mb-4 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          Extrato de Taxas (Período)
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-slate-50 italic text-slate-500 text-xs text-right mb-2">
                            <span>Detalhamento estimado das retenções iFood</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Comissões iFood (Plano)</span>
                            <span className="text-sm font-bold text-red-500">- {currencyFormatter.format(ordersSummary.totalFees)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Taxas de Entrega (Repasse)</span>
                            <span className="text-sm font-bold text-slate-700">{currencyFormatter.format(orders.reduce((sum, o) => sum + (o.total.deliveryFee || 0), 0))}</span>
                          </div>
                          <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-sm font-black text-navy">Total de Retenções</span>
                            <span className="text-sm font-black text-red-600">- {currencyFormatter.format(ordersSummary.totalFees)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <h4 className="text-sm font-bold text-navy mb-4 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                          Performance de Lucro (Estimado)
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Recebimento Líquido</span>
                            <span className="text-sm font-bold text-green-600">{currencyFormatter.format(ordersSummary.totalNetValue)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Custo de Mercadoria (CMV)</span>
                            <span className="text-sm font-bold text-red-400">- {currencyFormatter.format(cmvSummary?.totalCost || 0)}</span>
                          </div>
                          <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-base font-black text-navy">Lucro Bruto Final</span>
                            <span className="text-lg font-black text-primary">{currencyFormatter.format(cmvSummary?.grossProfit || 0)}</span>
                          </div>
                          <div className="flex justify-end">
                            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                              Margem Final: {cmvSummary?.marginPercent.toFixed(1) || 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <button onClick={() => handleImportOrders()} disabled={importingProducts} className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 transition">
                    <RefreshCw size={18} className={importingProducts ? 'animate-spin' : ''} />
                    Processar Pedidos
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Total Pedidos</p>
                    <p className="text-lg font-black text-navy">{ordersSummary?.count || 0}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Volume Bruto</p>
                    <p className="text-lg font-black text-navy">{currencyFormatter.format(ordersSummary?.totalValue || 0)}</p>
                  </div>
                  <div className="p-4 bg-red-50/50 rounded-2xl">
                    <p className="text-[10px] text-red-500 font-bold uppercase">Taxas Pagas</p>
                    <p className="text-lg font-black text-red-600">- {currencyFormatter.format(ordersSummary?.totalFees || 0)}</p>
                  </div>
                  <div className="p-4 bg-green-50/50 rounded-2xl border border-green-100">
                    <p className="text-[10px] text-green-600 font-bold uppercase">Rec. Líquido</p>
                    <p className="text-lg font-black text-green-700">{currencyFormatter.format(ordersSummary?.totalNetValue || 0)}</p>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <p className="text-[10px] text-primary font-bold uppercase">Lucro Bruto Est.</p>
                    <p className="text-lg font-black text-primary">
                      {cmvSummary?.grossProfit !== null
                        ? currencyFormatter.format(cmvSummary?.grossProfit || 0)
                        : <span className="text-[10px] text-slate-400 font-medium">Custo ausente</span>
                      }
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Margem iFood</p>
                    <p className="text-lg font-black text-slate-700">
                      {cmvSummary?.marginPercent !== null
                        ? `${cmvSummary?.marginPercent.toFixed(1)}%`
                        : <span className="text-[10px] text-slate-300 font-medium">-</span>
                      }
                    </p>
                  </div>
                </div>

                {loadingOrders ? (
                  <div className="text-center py-20"><RefreshCw className="animate-spin mx-auto text-slate-300" size={32} /></div>
                ) : (
                  <div className="space-y-2">
                    {orders.map(o => (
                      <div key={o.id} onClick={() => setSelectedOrder(o)} className="p-4 bg-white rounded-xl border border-slate-100 hover:border-primary/20 transition cursor-pointer flex items-center gap-4 group">
                        <div className={`p-2 rounded-lg ${o.status === 'CONCLUDED' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                          <ShoppingBag size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-navy">#{o.shortCode}</span>
                            <span className="text-xs text-slate-400 truncate">{o.customer.name}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1"><Clock size={10} /> {new Date(o.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-navy">{currencyFormatter.format(o.total.order)}</p>
                          <div className="flex flex-col items-end mt-0.5">
                            <span className="text-[10px] text-green-600 font-black">Líquido: {currencyFormatter.format(o.total.netValue || (o.total.order * 0.88))}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'produtos' && (
              <div className="space-y-6">
                <h3 className="font-bold text-navy">Produtos Sincronizados no Aequi</h3>
                {loadingSavedProducts ? (
                  <div className="text-center py-20"><RefreshCw className="animate-spin mx-auto text-slate-300" size={32} /></div>
                ) : savedProducts.length === 0 ? (
                  <div className="text-center py-20 text-slate-400 bg-slate-50 rounded-2xl">Ainda não há produtos sincronizados. Use a aba "Cardápio" para importar.</div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {savedProducts.map(p => (
                      <div key={p.id} className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-navy truncate flex-1">{p.name}</h4>
                            <button className="text-slate-400 hover:text-navy p-1"><Pencil size={14} /></button>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2 min-h-[2.5rem]">{p.description}</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center text-xs">
                          <span className="text-slate-400 uppercase font-black tracking-tighter">{p.category}</span>
                          <span className="font-bold text-navy">{currencyFormatter.format(p.price)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODALS / OVERLAYS TO BE RE-INTEGRATED AS NEEDED */}
    </div>
  );
}
