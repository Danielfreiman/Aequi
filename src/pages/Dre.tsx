import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type FinTransaction = {
  id: string;
  type: string;
  category: string | null;
  value: number;
  date: string;
  store_id?: string | null;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

export function Dre() {
  const [transactions, setTransactions] = useState<FinTransaction[]>([]);
  const [stores, setStores] = useState<{ id: string; name: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storeFilter, setStoreFilter] = useState<string>('todas');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      const [{ data, error: fetchError }, { data: storeData, error: storeError }] = await Promise.all([
        supabase.from('fin_transactions').select('id,type,category,value,date,store_id').order('date', { ascending: false }),
        supabase.from('stores').select('id,name').order('name', { ascending: true }),
      ]);

      if (fetchError || storeError) {
        setError(fetchError?.message || storeError?.message || 'Erro ao carregar dados.');
      } else {
        setTransactions(data || []);
        setStores(storeData || []);
      }
      setLoading(false);
    };

    loadData();
  }, []);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      return storeFilter === 'todas' ? true : tx.store_id === storeFilter;
    });
  }, [transactions, storeFilter]);

  const summary = useMemo(() => {
    const receitas = filtered.filter((tx) => tx.type === 'Receita');
    const despesas = filtered.filter((tx) => tx.type === 'Despesa');
    const totalReceitas = receitas.reduce((sum, tx) => sum + (tx.value || 0), 0);
    const totalDespesas = despesas.reduce((sum, tx) => sum + (tx.value || 0), 0);
    const resultado = totalReceitas - totalDespesas;

    const groupByCategory = (items: FinTransaction[]) =>
      items.reduce<Record<string, number>>((acc, item) => {
        const key = item.category || 'Sem categoria';
        acc[key] = (acc[key] || 0) + (item.value || 0);
        return acc;
      }, {});

    const groupByMonth = (items: FinTransaction[]) =>
      items.reduce<Record<string, { receitas: number; despesas: number }>>((acc, item) => {
        const d = new Date(item.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const current = acc[key] || { receitas: 0, despesas: 0 };
        if (item.type === 'Receita') current.receitas += item.value || 0;
        if (item.type === 'Despesa') current.despesas += item.value || 0;
        acc[key] = current;
        return acc;
      }, {});

    return {
      totalReceitas,
      totalDespesas,
      resultado,
      receitasPorCategoria: groupByCategory(receitas),
      despesasPorCategoria: groupByCategory(despesas),
      porMes: groupByMonth(filtered),
    };
  }, [filtered]);

  const storeName = useMemo(() => {
    if (storeFilter === 'todas') return 'Todas as lojas';
    return stores.find((s) => s.id === storeFilter)?.name || 'Loja';
  }, [storeFilter, stores]);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-navy">DRE</h2>
        <p className="text-slate-600 text-sm">
          Demonstrativo mês a mês, com opção de filtrar por loja ou consolidar todas.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-600">Loja</label>
          <select
            value={storeFilter}
            onChange={(event) => setStoreFilter(event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="todas">Todas</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name || 'Loja'}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col justify-end text-sm text-slate-500">
          <span>Exibindo: {storeName}</span>
          <span>Período: últimos lançamentos</span>
        </div>
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

      <div className="rounded-2xl bg-white border border-slate-100 shadow-soft overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-navy">Mês a mês</h3>
          <p className="text-sm text-slate-500">Consolidado por mês {storeFilter === 'todas' ? '(todas as lojas)' : '(loja filtrada)'}</p>
        </div>
        <div className="divide-y divide-slate-100">
          {Object.entries(summary.porMes)
            .sort(([a], [b]) => (a > b ? -1 : 1))
            .map(([month, values]) => {
              const resultado = values.receitas - values.despesas;
              return (
                <div key={month} className="grid grid-cols-4 gap-3 p-4 text-sm items-center">
                  <div className="font-semibold text-navy">{month}</div>
                  <div className="text-primary font-semibold">{formatCurrency(values.receitas)}</div>
                  <div className="text-navy font-semibold">{formatCurrency(values.despesas)}</div>
                  <div className={`font-bold ${resultado >= 0 ? 'text-primary' : 'text-red-500'}`}>{formatCurrency(resultado)}</div>
                </div>
              );
            })}
          {!loading && Object.keys(summary.porMes).length === 0 && (
            <div className="p-6 text-sm text-slate-500">Sem movimentações para exibir.</div>
          )}
        </div>
      </div>
    </section>
  );
}
