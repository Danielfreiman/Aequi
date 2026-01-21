import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type Product = {
  id: string;
  name: string;
  price: number;
  category: string | null;
  cost: number | null;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

const IFOOD_MARKETPLACE_FEE = 0.23; // 23%
const IFOOD_ENTREGA_PROPRIA_FEE = 0.12; // 12%
const IFOOD_FIXED_FEE = 1.30; // Exemplo de taxa fixa transacional

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
        .select('id,name,price,category,cost')
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
          {products.map((product) => {
            const markup = product.cost && product.cost > 0
              ? ((product.price - product.cost) / product.cost)
              : null;

            // Simulação iFood (23%)
            const ifoodNetPrice = product.price * (1 - IFOOD_MARKETPLACE_FEE) - IFOOD_FIXED_FEE;
            const ifoodNetMargin = product.cost && product.cost > 0
              ? ((ifoodNetPrice - product.cost) / product.cost)
              : null;

            return (
              <div key={product.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-4 text-sm items-center hover:bg-slate-50 transition">
                <div className="font-semibold text-navy">{product.name}</div>
                <div className="text-slate-500">{product.category || 'Sem categoria'}</div>
                <div className="text-slate-500">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Preço PDV</span>
                  {formatCurrency(product.price)}
                </div>
                <div className="text-slate-500">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Custo</span>
                  {product.cost ? formatCurrency(product.cost) : '--'}
                </div>
                <div className="text-slate-500">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Markup Bruto</span>
                  <span className={markup && markup < 1 ? 'text-amber-600 font-bold' : ''}>
                    {markup ? `${(markup * 100).toFixed(0)}%` : '--'}
                  </span>
                </div>
                <div className="bg-red-50 p-2 rounded-lg">
                  <span className="block text-[10px] font-bold text-red-400 uppercase">iFood (Margem Líquida)</span>
                  <div className="flex flex-col">
                    <span className="font-bold text-red-700">
                      {ifoodNetMargin ? `${(ifoodNetMargin * 100).toFixed(0)}%` : '--'}
                    </span>
                    <span className="text-[10px] text-red-500">
                      Sobra: {ifoodNetPrice > 0 ? formatCurrency(ifoodNetPrice - (product.cost || 0)) : '--'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {!loading && products.length === 0 && (
            <div className="p-6 text-sm text-slate-500">Nenhum produto encontrado.</div>
          )}
        </div>
      </div>
    </section>
  );
}
