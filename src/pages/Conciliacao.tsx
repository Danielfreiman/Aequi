import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type IfoodReconciliation = {
  order_id: string;
  valor_bruto: number;
  taxas_ifood: number;
  repasse_liquido: number;
  status_conferido: boolean;
  created_at: string | null;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

export function Conciliacao() {
  const [items, setItems] = useState<IfoodReconciliation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('ifood_reconciliation')
        .select('order_id,valor_bruto,taxas_ifood,repasse_liquido,status_conferido,created_at')
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setItems(data || []);
      }
      setLoading(false);
    };

    loadData();
  }, []);

  const summary = useMemo(() => {
    const totalBruto = items.reduce((sum, item) => sum + (item.valor_bruto || 0), 0);
    const totalTaxas = items.reduce((sum, item) => sum + (item.taxas_ifood || 0), 0);
    const totalLiquido = items.reduce((sum, item) => sum + (item.repasse_liquido || 0), 0);
    return { totalBruto, totalTaxas, totalLiquido };
  }, [items]);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-navy">Conciliação iFood</h2>
        <p className="text-slate-600 text-sm">Conferência de repasses e taxas importadas.</p>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
          <p className="text-xs uppercase text-slate-500 font-semibold">Valor bruto</p>
          <p className="text-2xl font-black text-navy">{formatCurrency(summary.totalBruto)}</p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
          <p className="text-xs uppercase text-slate-500 font-semibold">Taxas iFood</p>
          <p className="text-2xl font-black text-red-500">{formatCurrency(summary.totalTaxas)}</p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
          <p className="text-xs uppercase text-slate-500 font-semibold">Repasse líquido</p>
          <p className="text-2xl font-black text-primary">{formatCurrency(summary.totalLiquido)}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-100 shadow-soft overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-navy">Pedidos conciliados</h3>
          <p className="text-sm text-slate-500">{loading ? 'Carregando...' : `${items.length} registros`}</p>
        </div>
        <div className="divide-y divide-slate-100">
          {items.map((item) => (
            <div key={item.order_id} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 text-sm">
              <div className="font-semibold text-navy">#{item.order_id}</div>
              <div className="text-slate-500">Bruto: {formatCurrency(item.valor_bruto)}</div>
              <div className="text-slate-500">Taxas: {formatCurrency(item.taxas_ifood)}</div>
              <div className="text-slate-500">Líquido: {formatCurrency(item.repasse_liquido)}</div>
              <div className={`font-semibold ${item.status_conferido ? 'text-primary' : 'text-yellow-600'}`}>
                {item.status_conferido ? 'Conferido' : 'Pendente'}
              </div>
            </div>
          ))}
          {!loading && items.length === 0 && (
            <div className="p-6 text-sm text-slate-500">Nenhum pedido conciliado encontrado.</div>
          )}
        </div>
      </div>
    </section>
  );
}
