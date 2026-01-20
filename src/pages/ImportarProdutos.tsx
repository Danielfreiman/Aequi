import { useState } from 'react';
import { Upload, Package, Plus, Search, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuthSession } from '../hooks/useAuthSession';

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  status: 'active' | 'paused';
  complements?: Complement[];
};

type Complement = {
  id: string;
  name: string;
  price: number;
  required: boolean;
  max_quantity: number;
};

type ImportStatus = 'idle' | 'loading' | 'success' | 'error';

export function ImportarProdutos() {
  const { userId } = useAuthSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [importStatus, setImportStatus] = useState<ImportStatus>('idle');
  const [importMessage, setImportMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Simulação de categorias do iFood
  const categories = [
    { id: 'all', name: 'Todas' },
    { id: 'pratos', name: 'Pratos Principais' },
    { id: 'bebidas', name: 'Bebidas' },
    { id: 'sobremesas', name: 'Sobremesas' },
    { id: 'combos', name: 'Combos' },
    { id: 'acompanhamentos', name: 'Acompanhamentos' },
  ];

  const handleImportFromIFood = async () => {
    setImportStatus('loading');
    setImportMessage('Conectando à API do iFood...');

    // Simular chamada à API do iFood
    await new Promise(resolve => setTimeout(resolve, 1500));
    setImportMessage('Buscando cardápio...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setImportMessage('Processando produtos e complementos...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Dados simulados do iFood
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Hambúrguer Artesanal',
        description: 'Blend 180g, queijo cheddar, bacon crocante, alface e tomate',
        price: 32.90,
        category: 'pratos',
        status: 'active',
        complements: [
          { id: 'c1', name: 'Bacon extra', price: 5.00, required: false, max_quantity: 2 },
          { id: 'c2', name: 'Queijo extra', price: 4.00, required: false, max_quantity: 2 },
          { id: 'c3', name: 'Ovo', price: 3.00, required: false, max_quantity: 1 },
        ]
      },
      {
        id: '2',
        name: 'Pizza Margherita',
        description: 'Molho de tomate, mussarela, tomate e manjericão fresco',
        price: 45.90,
        category: 'pratos',
        status: 'active',
        complements: [
          { id: 'c4', name: 'Borda recheada', price: 8.00, required: false, max_quantity: 1 },
        ]
      },
      {
        id: '3',
        name: 'Coca-Cola 350ml',
        description: 'Refrigerante gelado',
        price: 6.00,
        category: 'bebidas',
        status: 'active',
      },
      {
        id: '4',
        name: 'Suco Natural 500ml',
        description: 'Laranja, limão ou maracujá',
        price: 12.00,
        category: 'bebidas',
        status: 'active',
      },
      {
        id: '5',
        name: 'Petit Gâteau',
        description: 'Bolinho de chocolate com sorvete de creme',
        price: 22.00,
        category: 'sobremesas',
        status: 'active',
      },
      {
        id: '6',
        name: 'Combo Família',
        description: '2 hambúrgueres + 2 batatas + 4 refrigerantes',
        price: 89.90,
        category: 'combos',
        status: 'active',
      },
      {
        id: '7',
        name: 'Batata Frita',
        description: 'Porção 300g com molho especial',
        price: 18.00,
        category: 'acompanhamentos',
        status: 'active',
      },
    ];

    setProducts(mockProducts);
    setImportStatus('success');
    setImportMessage(`${mockProducts.length} produtos importados com sucesso!`);
  };

  const handleSaveToDatabase = async () => {
    if (!userId) {
      setImportStatus('error');
      setImportMessage('Você precisa estar logado para salvar os produtos.');
      return;
    }

    setImportStatus('loading');
    setImportMessage('Salvando produtos no banco de dados...');

    try {
      // Inserir produtos na tabela menu_items
      for (const product of products) {
        const { error } = await supabase.from('menu_items').upsert({
          profile_id: userId,
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          status: product.status,
          ifood_id: product.id,
          complements: product.complements || [],
        }, { onConflict: 'ifood_id,profile_id' });

        if (error) throw error;
      }

      setImportStatus('success');
      setImportMessage('Produtos salvos com sucesso no banco de dados!');
    } catch (error) {
      setImportStatus('error');
      setImportMessage('Erro ao salvar produtos. Tente novamente.');
      console.error(error);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black text-navy">Importar Produtos</h2>
          <p className="text-slate-600 text-sm">Importe produtos e complementos diretamente da API do iFood.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleImportFromIFood}
            disabled={importStatus === 'loading'}
            className="flex items-center gap-2 px-4 py-2 bg-[#EA1D2C] text-white rounded-xl font-semibold hover:bg-[#c9171f] transition disabled:opacity-50"
          >
            {importStatus === 'loading' ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <Upload size={18} />
            )}
            Importar do iFood
          </button>
          {products.length > 0 && (
            <button
              onClick={handleSaveToDatabase}
              disabled={importStatus === 'loading'}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition disabled:opacity-50"
            >
              <Check size={18} />
              Salvar no Banco
            </button>
          )}
        </div>
      </div>

      {/* Status da importação */}
      {importStatus !== 'idle' && (
        <div className={`rounded-xl p-4 flex items-center gap-3 ${
          importStatus === 'loading' ? 'bg-blue-50 border border-blue-200 text-blue-700' :
          importStatus === 'success' ? 'bg-green-50 border border-green-200 text-green-700' :
          'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {importStatus === 'loading' && <RefreshCw size={18} className="animate-spin" />}
          {importStatus === 'success' && <Check size={18} />}
          {importStatus === 'error' && <AlertCircle size={18} />}
          <span className="text-sm font-medium">{importMessage}</span>
        </div>
      )}

      {/* Estatísticas */}
      {products.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
            <p className="text-xs uppercase text-slate-500 font-semibold">Total de Produtos</p>
            <p className="text-2xl font-black text-navy">{products.length}</p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
            <p className="text-xs uppercase text-slate-500 font-semibold">Com Complementos</p>
            <p className="text-2xl font-black text-primary">
              {products.filter(p => p.complements && p.complements.length > 0).length}
            </p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
            <p className="text-xs uppercase text-slate-500 font-semibold">Categorias</p>
            <p className="text-2xl font-black text-navy">
              {new Set(products.map(p => p.category)).size}
            </p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
            <p className="text-xs uppercase text-slate-500 font-semibold">Ticket Médio</p>
            <p className="text-2xl font-black text-primary">
              {formatCurrency(products.reduce((sum, p) => sum + p.price, 0) / products.length || 0)}
            </p>
          </div>
        </div>
      )}

      {/* Filtros */}
      {products.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Lista de produtos */}
      {products.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-100 shadow-soft p-12 text-center">
          <Package size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-navy mb-2">Nenhum produto importado</h3>
          <p className="text-slate-500 text-sm mb-6">
            Clique em "Importar do iFood" para buscar seu cardápio automaticamente.
          </p>
          <button
            onClick={handleImportFromIFood}
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#EA1D2C] text-white rounded-xl font-semibold hover:bg-[#c9171f] transition"
          >
            <Upload size={18} />
            Importar do iFood
          </button>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-slate-100 shadow-soft overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-lg font-bold text-navy">Produtos Importados</h3>
            <p className="text-sm text-slate-500">{filteredProducts.length} de {products.length} produtos</p>
          </div>
          <div className="divide-y divide-slate-100">
            {filteredProducts.map((product) => (
              <div key={product.id} className="p-5 hover:bg-slate-50 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold text-navy">{product.name}</h4>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        product.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {product.status === 'active' ? 'Ativo' : 'Pausado'}
                      </span>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600">
                        {categories.find(c => c.id === product.category)?.name || product.category}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mb-2">{product.description}</p>
                    
                    {product.complements && product.complements.length > 0 && (
                      <div className="mt-3 pl-4 border-l-2 border-slate-200">
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                          Complementos ({product.complements.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {product.complements.map(comp => (
                            <span key={comp.id} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-lg text-xs text-slate-600">
                              <Plus size={12} />
                              {comp.name} ({formatCurrency(comp.price)})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-primary">{formatCurrency(product.price)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
