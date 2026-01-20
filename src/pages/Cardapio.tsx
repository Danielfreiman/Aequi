import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type Product = {
  id: string;
  nome: string;
  preco_venda: number;
  categoria: string | null;
  markup: number | null;
  custo_fixo: number | null;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

export function Cardapio() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('id,nome,preco_venda,categoria,markup,custo_fixo')
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };

    loadData();
  }, []);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-navy">Engenharia de Cardápio</h2>
        <p className="text-slate-600 text-sm">Produtos cadastrados, preços e markup atual.</p>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

      <div className="rounded-2xl bg-white border border-slate-100 shadow-soft overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-navy">Produtos</h3>
          <p className="text-sm text-slate-500">{loading ? 'Carregando...' : `${products.length} itens`}</p>
        </div>
        <div className="divide-y divide-slate-100">
          {products.map((product) => (
            <div key={product.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 text-sm">
              <div className="font-semibold text-navy">{product.nome}</div>
              <div className="text-slate-500">{product.categoria || 'Sem categoria'}</div>
              <div className="text-slate-500">Preço: {formatCurrency(product.preco_venda)}</div>
              <div className="text-slate-500">Markup: {product.markup ? `${(product.markup * 100).toFixed(0)}%` : '--'}</div>
              <div className="text-slate-500">Custo fixo: {product.custo_fixo ? formatCurrency(product.custo_fixo) : '--'}</div>
            </div>
          ))}
          {!loading && products.length === 0 && (
            <div className="p-6 text-sm text-slate-500">Nenhum produto encontrado.</div>
          )}
        </div>
      </div>
    </section>
  );
}
