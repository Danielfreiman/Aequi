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

  const summary = useMemo(() => {
    const contasPagar = transactions.filter((tx) => tx.type === 'Despesa');
    const contasReceber = transactions.filter((tx) => tx.type === 'Receita');
    const totalPagar = contasPagar.reduce((sum, tx) => sum + (tx.value || 0), 0);
    const totalReceber = contasReceber.reduce((sum, tx) => sum + (tx.value || 0), 0);
    const pendentes = transactions.filter((tx) => !tx.is_paid).length;
    return { totalPagar, totalReceber, pendentes };
  }, [transactions]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-navy">Financeiro</h2>
          <p className="text-slate-600 text-sm">Visão geral das movimentações importadas do Firebase.</p>
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
            to="/app/dre"
            className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:brightness-110 transition"
          >
            Ver DRE
          </Link>
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
          <p className="text-sm text-slate-500">{loading ? 'Carregando dados...' : `${transactions.length} registros`}</p>
        </div>
        <div className="divide-y divide-slate-100">
          {transactions.slice(0, 10).map((tx) => (
            <div key={tx.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 text-sm">
              <div className="font-semibold text-navy">{tx.description || 'Sem descrição'}</div>
              <div className="text-slate-500">{tx.category || 'Sem categoria'}</div>
              <div className="text-slate-500">{formatDate(tx.date)}</div>
              <div className="text-slate-500">{tx.type}</div>
              <div className="font-semibold text-navy">{formatCurrency(tx.value)}</div>
            </div>
          ))}
          {!loading && transactions.length === 0 && (
            <div className="p-6 text-sm text-slate-500">Nenhuma movimentação encontrada.</div>
          )}
        </div>
      </div>
    </section>
  );
}
