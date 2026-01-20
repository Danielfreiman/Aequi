import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

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
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pendente' | 'pago'>('todos');
  const [categoryFilter, setCategoryFilter] = useState<string>('todas');
  const [dateStart, setDateStart] = useState<string>('');
  const [dateEnd, setDateEnd] = useState<string>('');
  const [customDateStart, setCustomDateStart] = useState<string>('');
  const [customDateEnd, setCustomDateEnd] = useState<string>('');

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

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const byStatus =
        statusFilter === 'todos' ? true : statusFilter === 'pago' ? tx.is_paid : !tx.is_paid;
      const byCategory = categoryFilter === 'todas' ? true : tx.category === categoryFilter;
      const byDateStart = dateStart ? new Date(tx.date) >= new Date(dateStart) : true;
      const byDateEnd = dateEnd ? new Date(tx.date) <= new Date(dateEnd) : true;
      return byStatus && byCategory && byDateStart && byDateEnd;
    });
  }, [transactions, statusFilter, categoryFilter, dateStart, dateEnd]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      const startDate = customDateStart ? new Date(customDateStart) : null;
      const endDate = customDateEnd ? new Date(customDateEnd) : null;

      if (startDate && transactionDate < startDate) return false;
      if (endDate && transactionDate > endDate) return false;

      return true;
    });
  }, [transactions, customDateStart, customDateEnd]);

  const summary = useMemo(() => {
    const contasPagar = filtered.filter((tx) => tx.type === 'Despesa');
    const contasReceber = filtered.filter((tx) => tx.type === 'Receita');
    const totalPagar = contasPagar.reduce((sum, tx) => sum + (tx.value || 0), 0);
    const totalReceber = contasReceber.reduce((sum, tx) => sum + (tx.value || 0), 0);
    const pendentes = filtered.filter((tx) => !tx.is_paid).length;
    return { totalPagar, totalReceber, pendentes };
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
          <p className="text-slate-600 text-sm">Visão geral filtrável por status, categoria e período.</p>
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
            Cadastrar operação
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
          <label className="text-xs font-semibold text-slate-600">De</label>
          <input
            type="date"
            value={dateStart}
            onChange={(event) => setDateStart(event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-600">Até</label>
          <input
            type="date"
            value={dateEnd}
            onChange={(event) => setDateEnd(event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-600">Data Personalizada - De</label>
          <input
            type="date"
            value={customDateStart}
            onChange={(e) => setCustomDateStart(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-600">Data Personalizada - Até</label>
          <input
            type="date"
            value={customDateEnd}
            onChange={(e) => setCustomDateEnd(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
          <p className="text-xs uppercase text-slate-500 font-semibold">Contas a pagar</p>
          <p className="text-2xl font-black text-navy">{formatCurrency(summary.totalPagar)}</p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
          <p className="text-xs uppercase text-slate-500 font-semibold">Contas a receber</p>
          <p className="text-2xl font-black text-primary">{formatCurrency(summary.totalReceber)}</p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
          <p className="text-xs uppercase text-slate-500 font-semibold">Pendências</p>
          <p className="text-2xl font-black text-navy">{summary.pendentes}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-100 shadow-soft overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-navy">Últimas movimentações</h3>
          <p className="text-sm text-slate-500">{loading ? 'Carregando dados...' : `${filtered.length} registros`}</p>
        </div>
        <div className="divide-y divide-slate-100">
          {filtered.slice(0, 20).map((tx) => (
            <div key={tx.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 text-sm">
              <div className="font-semibold text-navy">{tx.description || 'Sem descrição'}</div>
              <div className="text-slate-500">{tx.category || 'Sem categoria'}</div>
              <div className="text-slate-500">{formatDate(tx.date)}</div>
              <div className="text-slate-500">{tx.type}</div>
              <div className="font-semibold text-navy">{formatCurrency(tx.value)}</div>
            </div>
          ))}
          {!loading && filtered.length === 0 && (
            <div className="p-6 text-sm text-slate-500">Nenhuma movimentação encontrada.</div>
          )}
        </div>
      </div>
    </section>
  );
}
