import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { usePersistentFilter } from '../hooks/usePersistentFilter';
import { quickPeriods, type PeriodKey } from '../services/dateFilters';

type FinTransaction = {
  id: string;
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

export function ContasReceber() {
  const [transactions, setTransactions] = useState<FinTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaid, setShowPaid] = usePersistentFilter<boolean>('filter.receber.showPaid', false);
  const [categoryFilter, setCategoryFilter] = usePersistentFilter<string>('filter.receber.categoria', 'todas');
  const [period, setPeriod] = usePersistentFilter<PeriodKey>('filter.receber.period', 'mes_atual');
  const [customStart, setCustomStart] = usePersistentFilter<string>('filter.receber.customStart', '');
  const [customEnd, setCustomEnd] = usePersistentFilter<string>('filter.receber.customEnd', '');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('fin_transactions')
        .select('id,description,date,category,value,is_paid')
        .eq('type', 'Receita')
        .order('date', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setTransactions(data || []);
      }
      setLoading(false);
    };

    loadData();
  }, []);

  const { start, end } = quickPeriods[period].range();
  const startDate = period === 'custom' && customStart ? new Date(customStart) : start;
  const endDate = period === 'custom' && customEnd ? new Date(customEnd) : end;

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const statusOk = showPaid ? tx.is_paid : !tx.is_paid;
      const catOk = categoryFilter === 'todas' ? true : tx.category === categoryFilter;
      const d = new Date(tx.date);
      const startOk = startDate ? d >= startDate : true;
      const endOk = endDate ? d <= endDate : true;
      return statusOk && catOk && startOk && endOk;
    });
  }, [transactions, showPaid, categoryFilter, startDate, endDate]);

  const total = useMemo(() => filtered.reduce((sum, tx) => sum + (tx.value || 0), 0), [filtered]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => t.category && set.add(t.category));
    return Array.from(set);
  }, [transactions]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-navy">Contas a receber</h2>
          <p className="text-slate-600 text-sm">Receitas pendentes e recebidas.</p>
        </div>
        <button
          onClick={() => setShowPaid((prev) => !prev)}
          className="px-4 py-2 rounded-xl border border-navy/20 text-navy text-sm font-semibold hover:bg-navy/5 transition"
        >
          {showPaid ? 'Ver pendentes' : 'Ver recebidas'}
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
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
          <label className="text-xs font-semibold text-slate-600">Período</label>
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
              onChange={(event) => setCustomStart(event.target.value)}
              disabled={period !== 'custom'}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50"
            />
            <input
              type="date"
              value={customEnd}
              onChange={(event) => setCustomEnd(event.target.value)}
              disabled={period !== 'custom'}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50"
            />
          </div>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

      <div className="rounded-2xl bg-white border border-slate-100 shadow-soft overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-navy">Resumo</h3>
            <p className="text-sm text-slate-500">{loading ? 'Carregando...' : `${filtered.length} registros`}</p>
          </div>
          <span className="text-lg font-bold text-primary">{formatCurrency(total)}</span>
        </div>
        <div className="divide-y divide-slate-100">
          {filtered.map((tx) => (
            <div key={tx.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 text-sm">
              <div className="font-semibold text-navy">{tx.description || 'Sem descrição'}</div>
              <div className="text-slate-500">{tx.category || 'Sem categoria'}</div>
              <div className="text-slate-500">{formatDate(tx.date)}</div>
              <div className="font-semibold text-navy">{formatCurrency(tx.value)}</div>
            </div>
          ))}
          {!loading && filtered.length === 0 && (
            <div className="p-6 text-sm text-slate-500">Nenhuma receita encontrada.</div>
          )}
        </div>
      </div>
    </section>
  );
}
