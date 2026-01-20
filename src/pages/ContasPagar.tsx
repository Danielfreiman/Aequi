import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

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

export function ContasPagar() {
  const [transactions, setTransactions] = useState<FinTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaid, setShowPaid] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('fin_transactions')
        .select('id,description,date,category,value,is_paid')
        .eq('type', 'Despesa')
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

  const filtered = useMemo(
    () => transactions.filter((tx) => (showPaid ? tx.is_paid : !tx.is_paid)),
    [transactions, showPaid]
  );

  const total = useMemo(() => filtered.reduce((sum, tx) => sum + (tx.value || 0), 0), [filtered]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-navy">Contas a pagar</h2>
          <p className="text-slate-600 text-sm">Despesas pendentes e pagas.</p>
        </div>
        <button
          onClick={() => setShowPaid((prev) => !prev)}
          className="px-4 py-2 rounded-xl border border-navy/20 text-navy text-sm font-semibold hover:bg-navy/5 transition"
        >
          {showPaid ? 'Ver pendentes' : 'Ver pagas'}
        </button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

      <div className="rounded-2xl bg-white border border-slate-100 shadow-soft overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-navy">Resumo</h3>
            <p className="text-sm text-slate-500">{loading ? 'Carregando...' : `${filtered.length} registros`}</p>
          </div>
          <span className="text-lg font-bold text-navy">{formatCurrency(total)}</span>
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
            <div className="p-6 text-sm text-slate-500">Nenhuma despesa encontrada.</div>
          )}
        </div>
      </div>
    </section>
  );
}
