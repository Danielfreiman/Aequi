import { useEffect, useState, useMemo } from 'react';
import { AlertTriangle, ArrowRight, Banknote, Bell, Calendar, Download, Receipt, TrendingUp, Loader2 } from 'lucide-react';
import { FinancialChart } from '../../components/FinancialChart';
import { DishList } from '../../components/DishList';
import { supabase } from '../lib/supabaseClient';
import { useAuthSession } from '../hooks/useAuthSession';

type Transaction = {
  id: string;
  type: 'Receita' | 'Despesa';
  value: number;
  date: string;
  is_paid: boolean;
  category: string;
};

type Profile = {
  nome_restaurante: string;
  owner_name: string;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export function Dashboard() {
  const { userId, session } = useAuthSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!userId) return;
      
      setLoading(true);
      
      const [{ data: txData }, { data: profileData }] = await Promise.all([
        supabase
          .from('fin_transactions')
          .select('id,type,value,date,is_paid,category')
          .eq('profile_id', userId)
          .gte('date', new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]),
        supabase
          .from('profiles')
          .select('nome_restaurante,owner_name')
          .eq('id', userId)
          .maybeSingle(),
      ]);

      setTransactions(txData || []);
      setProfile(profileData);
      setLoading(false);
    };

    loadData();
  }, [userId]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayTx = transactions.filter(t => t.date === today);
    
    const vendasHoje = todayTx
      .filter(t => t.type === 'Receita')
      .reduce((sum, t) => sum + (t.value || 0), 0);
    
    const totalReceitas = transactions
      .filter(t => t.type === 'Receita')
      .reduce((sum, t) => sum + (t.value || 0), 0);
    
    const totalDespesas = transactions
      .filter(t => t.type === 'Despesa')
      .reduce((sum, t) => sum + (t.value || 0), 0);
    
    const pendentesReceber = transactions
      .filter(t => t.type === 'Receita' && !t.is_paid)
      .reduce((sum, t) => sum + (t.value || 0), 0);
    
    const pendentesPagar = transactions
      .filter(t => t.type === 'Despesa' && !t.is_paid)
      .reduce((sum, t) => sum + (t.value || 0), 0);

    const taxasIfood = transactions
      .filter(t => t.category?.toLowerCase().includes('taxa') || t.category?.toLowerCase().includes('ifood'))
      .reduce((sum, t) => sum + (t.value || 0), 0);

    return {
      vendasHoje,
      totalReceitas,
      totalDespesas,
      pendentesReceber,
      pendentesPagar,
      taxasIfood,
      saldo: totalReceitas - totalDespesas,
    };
  }, [transactions]);

  const userName = profile?.owner_name || profile?.nome_restaurante || session?.user?.email?.split('@')[0] || 'Chef';

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
    <section className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl md:text-4xl font-black text-navy tracking-tight leading-tight">
            Olá, {userName}! <br className="hidden md:block" /> Sua conta está fechando hoje?
          </h2>
          <p className="text-gray-500 font-medium">Visão geral do desempenho diário do seu restaurante.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center justify-center size-12 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-navy hover:border-navy/30 transition-all shadow-sm">
            <Calendar size={20} />
          </button>
          <button className="relative flex items-center justify-center size-12 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-navy hover:border-navy/30 transition-all shadow-sm">
            <Bell size={20} />
            {stats.pendentesPagar > 0 && (
              <span className="absolute top-3 right-3 size-2 bg-red-500 rounded-full ring-2 ring-white" />
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-light p-6 rounded-2xl shadow-soft border border-gray-100 flex flex-col justify-between h-40 group hover:border-primary/30 transition-all">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-green-50 rounded-lg text-primary">
              <Banknote size={24} />
            </div>
            {stats.vendasHoje > 0 && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                <TrendingUp size={14} /> Hoje
              </span>
            )}
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Vendas Totais (Hoje)</p>
            <h3 className="text-2xl font-bold text-navy mt-1">{formatCurrency(stats.vendasHoje)}</h3>
          </div>
        </div>

        <div className="bg-surface-light p-6 rounded-2xl shadow-soft border border-gray-100 flex flex-col justify-between h-40 group hover:border-primary/30 transition-all">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Receipt size={24} />
            </div>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">Mês atual</span>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">A Receber (Pendente)</p>
            <h3 className="text-2xl font-bold text-navy mt-1">{formatCurrency(stats.pendentesReceber)}</h3>
          </div>
        </div>

        {stats.pendentesPagar > 0 ? (
          <div className="relative bg-alert-bg p-6 rounded-2xl shadow-soft border border-alert-border flex flex-col justify-center gap-4 h-40 overflow-hidden">
            <div className="absolute -right-4 -top-4 text-yellow-500/10 rotate-12 pointer-events-none">
              <AlertTriangle size={140} />
            </div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="size-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div className="flex flex-col">
                <h4 className="text-navy font-bold text-lg leading-tight">Contas a Pagar</h4>
                <p className="text-yellow-800 text-sm leading-snug opacity-90">{formatCurrency(stats.pendentesPagar)} pendentes</p>
              </div>
            </div>
            <button className="relative z-10 w-fit px-4 py-2 bg-white/80 hover:bg-white text-yellow-800 text-sm font-bold rounded-lg border border-yellow-200/50 shadow-sm transition-all flex items-center gap-2">
              Ver Contas
              <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <div className="bg-green-50 p-6 rounded-2xl shadow-soft border border-green-200 flex flex-col justify-center h-40">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                <TrendingUp size={24} />
              </div>
              <div className="flex flex-col">
                <h4 className="text-navy font-bold text-lg leading-tight">Tudo em dia!</h4>
                <p className="text-green-700 text-sm leading-snug">Nenhuma conta pendente</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[420px]">
        <div className="lg:col-span-2 bg-surface-light p-6 rounded-2xl shadow-soft border border-gray-100 flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
            <div>
              <h3 className="text-lg font-bold text-navy">Saúde Financeira</h3>
              <p className="text-sm text-gray-500">Vendas vs. Pagamento Líquido (Últimos 7 Dias)</p>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-100">
              <button className="px-3 py-1.5 bg-white text-navy text-xs font-bold rounded shadow-sm border border-gray-100">
                Semanal
              </button>
              <button className="px-3 py-1.5 text-gray-500 hover:text-navy text-xs font-medium rounded transition-colors">
                Mensal
              </button>
            </div>
          </div>

          <FinancialChart />

          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-[#2ECC71]" />
              <span className="text-xs text-gray-500 font-medium">Vendas Totais</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-navy" />
              <span className="text-xs text-gray-500 font-medium">Pagamento Líquido</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-light rounded-2xl shadow-soft border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-6 pb-2">
            <h3 className="text-lg font-bold text-navy">Pratos mais Lucrativos</h3>
            <p className="text-sm text-gray-500">Itens com maior margem esta semana</p>
          </div>
          <DishList />
          <div className="p-4 border-t border-gray-100">
            <button className="w-full py-2 text-sm text-primary font-bold hover:bg-green-50 rounded-lg transition-colors">
              Ver Análise Completa do Menu
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-navy to-slate-800 rounded-2xl p-6 text-white flex items-center justify-between shadow-lg">
          <div>
            <h3 className="text-lg font-bold mb-1">Baixar Relatório Mensal</h3>
            <p className="text-slate-300 text-sm">Obtenha um PDF detalhado das suas conciliações.</p>
          </div>
          <button className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl transition-colors">
            <Download size={24} />
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-red-50 p-3 rounded-xl text-red-500">
              <Receipt size={24} />
            </div>
            <div>
              <h3 className="text-navy font-bold text-base">Taxas iFood</h3>
              <p className="text-gray-500 text-sm">Dedução do período atual</p>
            </div>
          </div>
          <span className="text-xl font-bold text-navy">- {formatCurrency(stats.taxasIfood)}</span>
        </div>
      </div>
    </section>
  );
}
