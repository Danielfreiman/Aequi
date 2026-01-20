import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type FinTransaction = {
  id: string;
  type: string;
  category: string | null;
  value: number;
  date: string;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

export function Dre() {
  const [transactions, setTransactions] = useState<FinTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('fin_transactions')
        .select('id,type,category,value,date')
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

  const summary = useMemo(() => {
    const receitas = transactions.filter((tx) => tx.type === 'Receita');
    const despesas = transactions.filter((tx) => tx.type === 'Despesa');
    const totalReceitas = receitas.reduce((sum, tx) => sum + (tx.value || 0), 0);
    const totalDespesas = despesas.reduce((sum, tx) => sum + (tx.value || 0), 0);
    const resultado = totalReceitas - totalDespesas;

    const groupByCategory = (items: FinTransaction[]) =>
      items.reduce<Record<string, number>>((acc, item) => {
        const key = item.category || 'Sem categoria';
        acc[key] = (acc[key] || 0) + (item.value || 0);
        return acc;
      }, {});

    return {
      totalReceitas,
      totalDespesas,
      resultado,
      receitasPorCategoria: groupByCategory(receitas),
      despesasPorCategoria: groupByCategory(despesas),
    };
  }, [transactions]);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-navy">DRE</h2>
        <p className="text-slate-600 text-sm">
          Demonstrativo de resultados com base nas transações importadas.
        </p>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
          <p className="text-xs uppercase text-slate-500 font-semibold">Receitas</p>
          <p className="text-2xl font-black text-primary">{formatCurrency(summary.totalReceitas)}</p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
          <p className="text-xs uppercase text-slate-500 font-semibold">Despesas</p>
          <p className="text-2xl font-black text-navy">{formatCurrency(summary.totalDespesas)}</p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
          <p className="text-xs uppercase text-slate-500 font-semibold">Resultado</p>
          <p className={`text-2xl font-black ${summary.resultado >= 0 ? 'text-primary' : 'text-red-500'}`}>
            {formatCurrency(summary.resultado)}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white border border-slate-100 shadow-soft overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-lg font-bold text-navy">Receitas por categoria</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {Object.entries(summary.receitasPorCategoria).map(([category, value]) => (
              <div key={category} className="flex items-center justify-between p-4 text-sm">
                <span className="text-slate-600">{category}</span>
                <span className="font-semibold text-navy">{formatCurrency(Number(value))}</span>
              </div>
            ))}
            {!loading && Object.keys(summary.receitasPorCategoria).length === 0 && (
              <div className="p-6 text-sm text-slate-500">Sem receitas registradas.</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-100 shadow-soft overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-lg font-bold text-navy">Despesas por categoria</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {Object.entries(summary.despesasPorCategoria).map(([category, value]) => (
              <div key={category} className="flex items-center justify-between p-4 text-sm">
                <span className="text-slate-600">{category}</span>
                <span className="font-semibold text-navy">{formatCurrency(Number(value))}</span>
              </div>
            ))}
            {!loading && Object.keys(summary.despesasPorCategoria).length === 0 && (
              <div className="p-6 text-sm text-slate-500">Sem despesas registradas.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
