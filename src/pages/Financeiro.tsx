import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { usePersistentFilter } from '../hooks/usePersistentFilter';
import { PeriodKey, quickPeriods } from '../services/dateFilters';

type FinTransaction = {
  id: string;
  type: string;
  description: string | null;
  date: string;
  category: string | null;
  value: number;
  is_paid: boolean;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-BR');
};

export function Financeiro() {
  const [transactions, setTransactions] = useState<FinTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = usePersistentFilter<'todos' | 'pendente' | 'pago'>(
    'filter.financeiro.status',
    'todos'
  );
  const [categoryFilter, setCategoryFilter] = usePersistentFilter<string>('filter.financeiro.categoria', 'todas');
  const [period, setPeriod] = usePersistentFilter<PeriodKey>('filter.financeiro.period', 'mes_atual');
  const [customStart, setCustomStart] = usePersistentFilter<string>('filter.financeiro.customStart', '');
  const [customEnd, setCustomEnd] = usePersistentFilter<string>('filter.financeiro.customEnd', '');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('fin_transactions')
        .select('id,type,description,date,category,value,is_paid')
        .order('date', { ascending: false })
        .limit(80);

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setTransactions(data || []);
      }
      setLoading(false);
    };

    loadData();
  }, []);

  const handleDelete = async (tx: FinTransaction) => {
    const ok = window.confirm(`Excluir lançamento "${tx.description || 'Sem descrição'}"? Esta ação não pode ser desfeita.`);
    if (!ok) return;

    setError(null);
    const { error: deleteError } = await supabase.from('fin_transactions').delete().eq('id', tx.id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setTransactions((prev) => prev.filter((t) => t.id !== tx.id));
  };

  const { start, end } = quickPeriods[period].range();
  const startDate = period === 'custom' && customStart ? new Date(customStart) : start;
  const endDate = period === 'custom' && customEnd ? new Date(customEnd) : end;

  if (endDate) {
    endDate.setHours(23, 59, 59, 999);
  }

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const byStatus = statusFilter === 'todos' ? true : statusFilter === 'pago' ? tx.is_paid : !tx.is_paid;
      const byCategory = categoryFilter === 'todas' ? true : tx.category === categoryFilter;
      const d = new Date(tx.date);
      const byStart = startDate ? d >= startDate : true;
      const byEnd = endDate ? d <= endDate : true;
      return byStatus && byCategory && byStart && byEnd;
    });
  }, [transactions, statusFilter, categoryFilter, startDate, endDate]);

  const summary = useMemo(() => {
    const contasPagar = filtered.filter((tx) => tx.type === 'Despesa');
    const contasReceber = filtered.filter((tx) => tx.type === 'Receita');
    const totalPagar = contasPagar.reduce((sum, tx) => sum - (tx.value || 0), 0); // despesas negativas
    const totalReceber = contasReceber.reduce((sum, tx) => sum + (tx.value || 0), 0);
    const saldo = totalReceber + totalPagar;
    const pendentes = filtered.filter((tx) => !tx.is_paid).length;
    return { totalPagar, totalReceber, saldo, pendentes };
  }, [filtered]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => t.category && set.add(t.category));
    return Array.from(set);
  }, [transactions]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-navy">Financeiro</h2>
          <p className="text-slate-600 text-sm">Visao geral filtravel por status, categoria e periodo.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/app/contas-pagar"
            className="px-4 py-2 rounded-xl border border-navy/20 text-navy text-sm font-semibold hover:bg-navy/5 transition"
          >
            Contas a pagar
          </Link>
          <Link
            to="/app/contas-receber"
            className="px-4 py-2 rounded-xl border border-navy/20 text-navy text-sm font-semibold hover:bg-navy/5 transition"
          >
            Contas a receber
          </Link>
          <Link
            to="/app/operacoes"
            className="px-4 py-2 rounded-xl border border-navy/20 text-navy text-sm font-semibold hover:bg-navy/5 transition"
          >
            Cadastrar operacao
          </Link>
          <Link
            to="/app/dre"
            className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:brightness-110 transition"
          >
            Ver DRE
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-600">Status</label>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="todos">Todos</option>
            <option value="pendente">Pendentes</option>
            <option value="pago">Pagos</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-600">Categoria</label>
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="todas">Todas</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-600">Periodo rapido</label>
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value as PeriodKey)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            {Object.entries(quickPeriods).map(([key, item]) => (
              <option key={key} value={key}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-600">Datas personalizadas</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              disabled={period !== 'custom'}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50"
            />
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              disabled={period !== 'custom'}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50"
            />
          </div>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

      <div className="grid md:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
          <p className="text-xs uppercase text-slate-500 font-semibold">Contas a pagar</p>
          <p className="text-2xl font-black text-red-600">{formatCurrency(summary.totalPagar)}</p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
          <p className="text-xs uppercase text-slate-500 font-semibold">Contas a receber</p>
          <p className="text-2xl font-black text-primary">{formatCurrency(summary.totalReceber)}</p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
          <p className="text-xs uppercase text-slate-500 font-semibold">Pendencias</p>
          <p className="text-2xl font-black text-navy">{summary.pendentes}</p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
          <p className="text-xs uppercase text-slate-500 font-semibold">Saldo (receber - pagar)</p>
          <p className={`text-2xl font-black ${summary.saldo >= 0 ? 'text-primary' : 'text-red-500'}`}>
            {formatCurrency(summary.saldo)}
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-100 shadow-soft overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-navy">Ultimas movimentacoes</h3>
          <p className="text-sm text-slate-500">{loading ? 'Carregando dados...' : `${filtered.length} registros`}</p>
        </div>
        <div className="divide-y divide-slate-100">
          {filtered.slice(0, 20).map((tx) => (
            <div key={tx.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-4 text-sm items-center">
              <div className="font-semibold text-navy">{tx.description || 'Sem descricao'}</div>
              <div className="text-slate-500">{tx.category || 'Sem categoria'}</div>
              <div className="text-slate-500">{formatDate(tx.date)}</div>
              <div className="text-slate-500">{tx.type}</div>
              <div className={`font-semibold ${tx.type === 'Despesa' ? 'text-red-600' : 'text-navy'}`}>
                {tx.type === 'Despesa' ? `-${formatCurrency(tx.value)}` : formatCurrency(tx.value)}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => handleDelete(tx)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                  Excluir
                </button>
              </div>
            </div>
          ))}
          {!loading && filtered.length === 0 && (
            <div className="p-6 text-sm text-slate-500">Nenhuma movimentacao encontrada.</div>
          )}
        </div>
      </div>
    </section>
  );
}
