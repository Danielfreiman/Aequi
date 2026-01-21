import { GrossProfitWidget } from '../components/dashboard/GrossProfitWidget';

// ... (existing imports)

export function Dashboard() {
  // ... (existing component logic)

  return (
    <section className="flex flex-col gap-6">
      {/* ... (existing jsx) */}
      
      {/* Cards principais */}
      {/* ... */}
      
      {/* Inserir widget aqui ou junto com o grid principal */}
      <GrossProfitWidget userId={userId} />

      {/* Alertas de contas e Grid Principal */}
      <div className="grid lg:grid-cols-3 gap-6">

import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Calendar,
  TrendingUp,
  TrendingDown,
  Loader2,
  Wallet,
  Receipt,
  Package,
  PieChart,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuthSession } from '../hooks/useAuthSession';
import { usePersistentFilter } from '../hooks/usePersistentFilter';

type Transaction = {
  id: string;
  type: 'Receita' | 'Despesa';
  description: string;
  value: number;
  date: string;
  is_paid: boolean;
  category: string;
  items?: any;
};

type Product = {
  id: string;
  name: string;
  product_type: string;
  price: number;
  cost: number | null;
  category: string;
  is_active: boolean;
};

type Profile = {
  id: string;
  nome_restaurante: string;
  owner_name: string;
};

type PeriodType = 'hoje' | 'semana' | 'mes' | 'trimestre' | 'ano' | 'custom';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

const formatDateFull = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};

const getPeriodDates = (period: PeriodType): { start: Date; end: Date } => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case 'hoje':
      return { start: today, end: new Date(today.getTime() + 86400000) };
    case 'semana': {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
      return { start: startOfWeek, end: endOfWeek };
    }
    case 'mes': {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { start: startOfMonth, end: endOfMonth };
    }
    case 'trimestre': {
      const quarter = Math.floor(now.getMonth() / 3);
      const startOfQuarter = new Date(now.getFullYear(), quarter * 3, 1);
      const endOfQuarter = new Date(now.getFullYear(), quarter * 3 + 3, 0);
      return { start: startOfQuarter, end: endOfQuarter };
    }
    case 'ano': {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31);
      return { start: startOfYear, end: endOfYear };
    }
    default:
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: now };
  }
};

const PERIOD_LABELS: Record<PeriodType, string> = {
  hoje: 'Hoje',
  semana: 'Esta Semana',
  mes: 'Este Mês',
  trimestre: 'Este Trimestre',
  ano: 'Este Ano',
  custom: 'Personalizado',
};

export function Dashboard() {
  const { userId, session } = useAuthSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = usePersistentFilter<PeriodType>('dashboard.period', 'mes');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Fetch all data in parallel
      const [{ data: txData, error: txError }, { data: productsData, error: prodError }, { data: profileData }] = await Promise.all([
        supabase
          .from('fin_transactions')
          .select('id,type,description,value,date,is_paid,category,items')
          .order('date', { ascending: false }),
        supabase
          .from('products')
          .select('id,name,product_type,price,cost,category,is_active')
          .eq('is_active', true),
        supabase
          .from('profiles')
          .select('id, nome_restaurante, owner_name')
          .limit(1)
          .maybeSingle(),
      ]);

      if (txError) console.error('Error fetching transactions:', txError);
      if (prodError) console.error('Error fetching products:', prodError);

      setTransactions(txData || []);
      setProducts(productsData || []);

      if (profileData) {
        setProfile(profileData);
      }

      setLoading(false);
    };

    if (session) { // Load if session exists
      loadData();
    }
  }, [userId]);

  const { start, end } = getPeriodDates(period);

  // Contas a pagar nos próximos 7 dias
  const upcomingBills = useMemo(() => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 86400000);

    return transactions
      .filter(t => {
        const txDate = new Date(t.date);
        return t.type === 'Despesa' && !t.is_paid && txDate >= now && txDate <= nextWeek;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  // Contas vencidas
  const overdueBills = useMemo(() => {
    const now = new Date();
    return transactions.filter(t => {
      const txDate = new Date(t.date);
      return t.type === 'Despesa' && !t.is_paid && txDate < now;
    });
  }, [transactions]);

  // Estatísticas do período
  const stats = useMemo(() => {
    const periodTx = transactions.filter(t => {
      const txDate = new Date(t.date);
      return txDate >= start && txDate <= end;
    });

    const receitas = periodTx
      .filter(t => t.type === 'Receita')
      .reduce((sum, t) => sum + (t.value || 0), 0);

    const despesas = periodTx
      .filter(t => t.type === 'Despesa')
      .reduce((sum, t) => sum + (t.value || 0), 0);

    const receitasPagas = periodTx
      .filter(t => t.type === 'Receita' && t.is_paid)
      .reduce((sum, t) => sum + (t.value || 0), 0);

    const despesasPagas = periodTx
      .filter(t => t.type === 'Despesa' && t.is_paid)
      .reduce((sum, t) => sum + (t.value || 0), 0);

    const pendentesReceber = periodTx
      .filter(t => t.type === 'Receita' && !t.is_paid)
      .reduce((sum, t) => sum + (t.value || 0), 0);

    const pendentesPagar = periodTx
      .filter(t => t.type === 'Despesa' && !t.is_paid)
      .reduce((sum, t) => sum + (t.value || 0), 0);

    // Despesas por categoria
    const despesasPorCategoria = periodTx
      .filter(t => t.type === 'Despesa')
      .reduce((acc, t) => {
        // Se for Fatura Detalhada, quebra nos itens
        if (t.category === 'Fatura Detalhada' && t.items && Array.isArray(t.items)) {
          t.items.forEach((item: any) => {
            const itemCat = item.category || 'Outros';
            const itemValue = Number(item.value) || 0;
            acc[itemCat] = (acc[itemCat] || 0) + itemValue;
          });
        } else {
          const cat = t.category || 'Outros';
          acc[cat] = (acc[cat] || 0) + (t.value || 0);
        }
        return acc;
      }, {} as Record<string, number>);

    return {
      receitas,
      despesas,
      receitasPagas,
      despesasPagas,
      pendentesReceber,
      pendentesPagar,
      saldo: receitas - despesas,
      saldoRealizado: receitasPagas - despesasPagas,
      despesasPorCategoria,
      totalPendente: pendentesReceber - pendentesPagar,
    };
  }, [transactions, start, end]);

  // CMV dos produtos
  const cmvStats = useMemo(() => {
    const finalProducts = products.filter(p => p.product_type === 'final' && p.price > 0);

    const productsWithMargin = finalProducts.map(p => {
      const cost = p.cost || 0;
      const margin = p.price > 0 ? ((p.price - cost) / p.price) * 100 : 0;
      const cmv = p.price > 0 ? (cost / p.price) * 100 : 0;
      return { ...p, margin, cmv };
    });

    const avgCmv = productsWithMargin.length > 0
      ? productsWithMargin.reduce((sum, p) => sum + p.cmv, 0) / productsWithMargin.length
      : 0;

    const avgMargin = productsWithMargin.length > 0
      ? productsWithMargin.reduce((sum, p) => sum + p.margin, 0) / productsWithMargin.length
      : 0;

    // Top 5 com melhor margem
    const topMargin = [...productsWithMargin]
      .sort((a, b) => b.margin - a.margin)
      .slice(0, 5);

    // Top 5 com pior margem (maior CMV)
    const worstMargin = [...productsWithMargin]
      .sort((a, b) => a.margin - b.margin)
      .slice(0, 5);

    return { avgCmv, avgMargin, topMargin, worstMargin, total: finalProducts.length };
  }, [products]);

  // Despesas por categoria (top 5)
  const topExpenseCategories = useMemo(() => {
    return Object.entries(stats.despesasPorCategoria)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [stats.despesasPorCategoria]);

  const userName = profile?.owner_name || profile?.nome_restaurante || session?.user?.email?.split('@')[0] || 'Usuário';

  if (loading) {
    return (
      <section className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-slate-500">Carregando dados...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl md:text-3xl font-black text-navy tracking-tight">
            Dashboard Financeiro
          </h2>
          <p className="text-gray-500 text-sm">Olá, {userName}! Acompanhe a saúde financeira do seu negócio.</p>
        </div>

        {/* Filtro de período */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          {(['hoje', 'semana', 'mes', 'trimestre'] as PeriodType[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${period === p
                ? 'bg-primary text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Receitas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <TrendingUp size={20} />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              {period === 'mes' ? 'Mês' : PERIOD_LABELS[period]}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Receitas</p>
          <p className="text-xl font-black text-navy">{formatCurrency(stats.receitas)}</p>
          <p className="text-xs text-slate-400 mt-1">
            {formatCurrency(stats.receitasPagas)} realizado
          </p>
        </div>

        {/* Despesas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-red-50 rounded-lg text-red-500">
              <TrendingDown size={20} />
            </div>
            <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-full">
              {period === 'mes' ? 'Mês' : PERIOD_LABELS[period]}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Despesas</p>
          <p className="text-xl font-black text-navy">{formatCurrency(stats.despesas)}</p>
          <p className="text-xs text-slate-400 mt-1">
            {formatCurrency(stats.despesasPagas)} pago
          </p>
        </div>

        {/* Saldo */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-lg ${stats.saldo >= 0 ? 'bg-primary/10 text-primary' : 'bg-red-50 text-red-500'}`}>
              <Wallet size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium">Saldo Previsto</p>
          <p className={`text-xl font-black ${stats.saldo >= 0 ? 'text-primary' : 'text-red-500'}`}>
            {formatCurrency(stats.saldo)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Realizado: {formatCurrency(stats.saldoRealizado)}
          </p>
        </div>

        {/* CMV Médio */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <PieChart size={20} />
            </div>
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
              {cmvStats.total} produtos
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">CMV Médio</p>
          <p className="text-xl font-black text-navy">{cmvStats.avgCmv.toFixed(1)}%</p>
          <p className="text-xs text-slate-400 mt-1">
            Margem média: {cmvStats.avgMargin.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Alertas de contas */}
      {(overdueBills.length > 0 || upcomingBills.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Contas vencidas */}
          {overdueBills.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg text-red-600">
                  <XCircle size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-red-800">Contas Vencidas</h3>
                  <p className="text-xs text-red-600">{overdueBills.length} contas em atraso</p>
                </div>
                <span className="ml-auto text-lg font-black text-red-600">
                  {formatCurrency(overdueBills.reduce((s, t) => s + t.value, 0))}
                </span>
              </div>
              <Link
                to="/app/contas-pagar"
                className="flex items-center justify-center gap-2 w-full py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition"
              >
                Ver todas
                <ArrowRight size={16} />
              </Link>
            </div>
          )}

          {/* Próximas contas */}
          {upcomingBills.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-amber-800">Próximos 7 dias</h3>
                  <p className="text-xs text-amber-600">{upcomingBills.length} contas a vencer</p>
                </div>
              </div>
              <div className="space-y-2 mb-3">
                {upcomingBills.slice(0, 3).map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between text-sm bg-white/50 px-3 py-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-amber-700 font-semibold">{formatDate(bill.date)}</span>
                      <span className="text-slate-700 truncate max-w-[150px]">{bill.description}</span>
                    </div>
                    <span className="font-semibold text-amber-800">{formatCurrency(bill.value)}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/app/contas-pagar"
                className="flex items-center justify-center gap-2 w-full py-2 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition"
              >
                Ver todas
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Grid principal */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Despesas por categoria */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-navy">Despesas por Categoria</h3>
              <p className="text-xs text-slate-500">{PERIOD_LABELS[period]}</p>
            </div>
            <BarChart3 size={20} className="text-slate-400" />
          </div>

          {topExpenseCategories.length > 0 ? (
            <div className="space-y-3">
              {topExpenseCategories.map(([category, value]) => {
                const percentage = stats.despesas > 0 ? (value / stats.despesas) * 100 : 0;
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-700 truncate max-w-[150px]">{category}</span>
                      <span className="font-semibold text-navy">{formatCurrency(value)}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 text-right">{percentage.toFixed(1)}%</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">Nenhuma despesa no período</p>
          )}
        </div>

        {/* CMV dos produtos */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-soft p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-navy">Análise de CMV dos Produtos</h3>
              <p className="text-xs text-slate-500">Margem de lucro por produto cadastrado</p>
            </div>
            <Link
              to="/app/produtos"
              className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
            >
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>

          {cmvStats.total > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {/* Melhores margens */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={16} className="text-green-500" />
                  <span className="text-sm font-semibold text-slate-700">Melhores Margens</span>
                </div>
                <div className="space-y-2">
                  {cmvStats.topMargin.map((p) => (
                    <div key={p.id} className="flex items-center justify-between bg-green-50 px-3 py-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-green-600" />
                        <span className="text-sm text-slate-700 truncate max-w-[120px]">{p.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-green-600">+{p.margin.toFixed(0)}%</span>
                        <p className="text-xs text-slate-400">CMV {p.cmv.toFixed(0)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Piores margens */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={16} className="text-amber-500" />
                  <span className="text-sm font-semibold text-slate-700">Menores Margens</span>
                </div>
                <div className="space-y-2">
                  {cmvStats.worstMargin.map((p) => (
                    <div key={p.id} className="flex items-center justify-between bg-amber-50 px-3 py-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-amber-600" />
                        <span className="text-sm text-slate-700 truncate max-w-[120px]">{p.name}</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-bold ${p.margin >= 0 ? 'text-amber-600' : 'text-red-600'}`}>
                          {p.margin >= 0 ? '+' : ''}{p.margin.toFixed(0)}%
                        </span>
                        <p className="text-xs text-slate-400">CMV {p.cmv.toFixed(0)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Package size={40} className="text-slate-300 mb-3" />
              <p className="text-slate-500 text-sm">Nenhum produto cadastrado</p>
              <Link
                to="/app/produtos"
                className="mt-3 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:brightness-110 transition"
              >
                Cadastrar Produtos
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Resumo de pendências */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link
          to="/app/contas-receber"
          className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5 hover:border-primary/30 transition group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-100 transition">
              <Receipt size={24} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500 font-medium">A Receber (Pendente)</p>
              <p className="text-xl font-black text-navy">{formatCurrency(stats.pendentesReceber)}</p>
            </div>
            <ArrowRight size={20} className="text-slate-300 group-hover:text-primary transition" />
          </div>
        </Link>

        <Link
          to="/app/contas-pagar"
          className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5 hover:border-primary/30 transition group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-xl text-red-500 group-hover:bg-red-100 transition">
              <Banknote size={24} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500 font-medium">A Pagar (Pendente)</p>
              <p className="text-xl font-black text-navy">{formatCurrency(stats.pendentesPagar)}</p>
            </div>
            <ArrowRight size={20} className="text-slate-300 group-hover:text-primary transition" />
          </div>
        </Link>

        <Link
          to="/app/operacoes"
          className="bg-gradient-to-r from-primary to-emerald-600 rounded-2xl p-5 text-white hover:brightness-110 transition group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <DollarSign size={24} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-white/80 font-medium">Novo Lançamento</p>
              <p className="text-lg font-bold">Registrar Operação</p>
            </div>
            <ArrowRight size={20} className="text-white/60 group-hover:text-white transition" />
          </div>
        </Link>
      </div>
    </section>
  );
}
