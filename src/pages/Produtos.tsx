import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Plus, Pencil, Trash2, Search, X, Save, Package, Layers, Box, Cookie, History } from 'lucide-react';
import { useAuthSession } from '../hooks/useAuthSession';

type ProductType = 'ingredient' | 'final' | 'complement';

type Product = {
  id: string;
  product_type: ProductType;
  name: string;
  description: string | null;
  price: number;
  cost: number | null;
  category: string | null;
  unit: string;
  stock_quantity: number;
  min_stock: number;
  pdv_code: string | null;
  ifood_code: string | null;
  is_active: boolean;
  user_id?: string;
  created_at: string;
};

type CostHistory = {
  id: string;
  product_id: string;
  cost: number;
  created_at: string;
};

type Composition = {
  id: string;
  product_id: string;
  ingredient_id: string;
  quantity: number;
  unit: string;
  ingredient?: Product;
};

type TabType = 'final' | 'ingredient' | 'complement';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  ingredient: 'Ingrediente',
  final: 'Produto Final',
  complement: 'Complemento',
};

const UNITS = [
  { value: 'un', label: 'Unidade' },
  { value: 'kg', label: 'Quilograma (kg)' },
  { value: 'g', label: 'Grama (g)' },
  { value: 'l', label: 'Litro (l)' },
  { value: 'ml', label: 'Mililitro (ml)' },
];

export function Produtos() {
  const { session } = useAuthSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [compositions, setCompositions] = useState<Composition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todas');
  const [activeTab, setActiveTab] = useState<TabType>('final');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  // Histórico de custo
  const [showHistory, setShowHistory] = useState(false);
  const [costHistory, setCostHistory] = useState<CostHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Composição do produto
  const [editCompositions, setEditCompositions] = useState<{ ingredient_id: string; quantity: string; unit: string }[]>([]);

  // Formulário
  const [formData, setFormData] = useState({
    product_type: 'final' as ProductType,
    name: '',
    description: '',
    price: '',
    cost: '',
    category: '',
    unit: 'un',
    stock_quantity: '',
    min_stock: '',
    pdv_code: '',
    ifood_code: '',
    is_active: true,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setProducts(data || []);
    }

    // Carregar composições
    const { data: comps } = await supabase
      .from('product_compositions')
      .select('*');
    setCompositions(comps || []);

    setLoading(false);
  };

  const ingredients = useMemo(() => products.filter((p) => p.product_type === 'ingredient'), [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesTab = p.product_type === activeTab;
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.pdv_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ifood_code?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'todas' || p.category === categoryFilter;
      return matchesTab && matchesSearch && matchesCategory;
    });
  }, [products, activeTab, searchTerm, categoryFilter]);

  const productCategories = useMemo(() => {
    const set = new Set<string>();
    products.filter((p) => p.product_type === activeTab).forEach((p) => p.category && set.add(p.category));
    return Array.from(set);
  }, [products, activeTab]);

  // Calcular custo baseado na composição
  const calculateCostFromComposition = (comps: { ingredient_id: string; quantity: string; unit: string }[]) => {
    let totalCost = 0;
    for (const comp of comps) {
      const ingredient = ingredients.find((i) => i.id === comp.ingredient_id);
      if (ingredient && ingredient.cost) {
        const qty = parseFloat(comp.quantity) || 0;
        // Converter unidades se necessário
        let unitCost = ingredient.cost;
        if (ingredient.unit === 'kg' && comp.unit === 'g') {
          unitCost = ingredient.cost / 1000;
        } else if (ingredient.unit === 'l' && comp.unit === 'ml') {
          unitCost = ingredient.cost / 1000;
        }
        totalCost += qty * unitCost;
      }
    }
    return totalCost;
  };

  const openNewModal = (type: ProductType = 'final') => {
    setEditingProduct(null);
    setFormData({
      product_type: type,
      name: '',
      description: '',
      price: '',
      cost: '',
      category: type === 'complement' ? 'Complementos' : '',
      unit: type === 'ingredient' ? 'kg' : 'un',
      stock_quantity: '',
      min_stock: '',
      pdv_code: '',
      ifood_code: '',
      is_active: true,
    });
    setEditCompositions([]);
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      product_type: product.product_type,
      name: product.name,
      description: product.description || '',
      price: product.price?.toString() || '',
      cost: product.cost?.toString() || '',
      category: product.category || '',
      unit: product.unit || 'un',
      stock_quantity: product.stock_quantity?.toString() || '',
      min_stock: product.min_stock?.toString() || '',
      pdv_code: product.pdv_code || '',
      ifood_code: product.ifood_code || '',
      is_active: product.is_active,
    });
    // Carregar composições do produto
    const productComps = compositions
      .filter((c) => c.product_id === product.id)
      .map((c) => ({
        ingredient_id: c.ingredient_id,
        quantity: c.quantity.toString(),
        unit: c.unit,
      }));
    setEditCompositions(productComps);
    setShowModal(true);
  };

  const fetchHistory = async (productId: string) => {
    setLoadingHistory(true);
    const { data, error: histError } = await supabase
      .from('product_cost_history')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (histError) {
      setError(histError.message);
    } else {
      setCostHistory(data || []);
    }
    setLoadingHistory(false);
  };

  const toggleHistory = () => {
    if (!showHistory && editingProduct) {
      fetchHistory(editingProduct.id);
    }
    setShowHistory(!showHistory);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setEditCompositions([]);
    setShowHistory(false);
    setCostHistory([]);
  };

  const addCompositionRow = () => {
    setEditCompositions((prev) => [...prev, { ingredient_id: '', quantity: '', unit: 'g' }]);
  };

  const updateCompositionRow = (index: number, field: string, value: string) => {
    setEditCompositions((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const removeCompositionRow = (index: number) => {
    setEditCompositions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Nome do produto é obrigatório.');
      return;
    }

    setSaving(true);
    setError(null);

    // Calcular custo automático se tiver composição
    let finalCost = formData.cost ? parseFloat(formData.cost) : null;
    if (formData.product_type === 'final' && editCompositions.length > 0) {
      finalCost = calculateCostFromComposition(editCompositions);
    }

    const payload = {
      product_type: formData.product_type,
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      price: parseFloat(formData.price) || 0,
      cost: finalCost,
      category: formData.category || null,
      unit: formData.unit,
      stock_quantity: parseFloat(formData.stock_quantity) || 0,
      min_stock: parseFloat(formData.min_stock) || 0,
      pdv_code: formData.pdv_code.trim() || null,
      ifood_code: formData.ifood_code.trim() || null,
      is_active: formData.is_active,
    };

    try {
      if (editingProduct) {
        const { error: updateError } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id);

        if (updateError) throw updateError;

        // Atualizar composições
        if (formData.product_type === 'final') {
          // Deletar composições antigas
          await supabase.from('product_compositions').delete().eq('product_id', editingProduct.id);

          // Inserir novas
          if (editCompositions.length > 0) {
            const validComps = editCompositions.filter((c) => c.ingredient_id && c.quantity);
            if (validComps.length > 0) {
              await supabase.from('product_compositions').insert(
                validComps.map((c) => ({
                  product_id: editingProduct.id,
                  ingredient_id: c.ingredient_id,
                  quantity: parseFloat(c.quantity),
                  unit: c.unit,
                }))
              );
            }
          }
        }

        setSuccess('Produto atualizado com sucesso!');

        // Gravar histórico se o custo mudou
        if (finalCost !== editingProduct.cost) {
          await supabase.from('product_cost_history').insert({
            product_id: editingProduct.id,
            cost: finalCost,
            user_id: session?.user?.id
          });
        }
      } else {
        const { data: newProduct, error: insertError } = await supabase
          .from('products')
          .insert({ ...payload, user_id: session?.user?.id })
          .select()
          .single();

        if (insertError) throw insertError;

        // Gravar histórico inicial
        if (newProduct.cost !== null) {
          await supabase.from('product_cost_history').insert({
            product_id: newProduct.id,
            cost: newProduct.cost,
            user_id: session?.user?.id
          });
        }

        // Inserir composições
        if (formData.product_type === 'final' && editCompositions.length > 0) {
          const validComps = editCompositions.filter((c) => c.ingredient_id && c.quantity);
          if (validComps.length > 0) {
            await supabase.from('product_compositions').insert(
              validComps.map((c) => ({
                product_id: newProduct.id,
                ingredient_id: c.ingredient_id,
                quantity: parseFloat(c.quantity),
                unit: c.unit,
              }))
            );
          }
        }

        setSuccess('Produto cadastrado com sucesso!');
      }

      loadProducts();
      closeModal();
    } catch (err: any) {
      setError(err.message);
    }

    setSaving(false);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleDelete = async (product: Product) => {
    const ok = window.confirm(`Excluir ${PRODUCT_TYPE_LABELS[product.product_type].toLowerCase()} "${product.name}"? Esta ação não pode ser desfeita.`);
    if (!ok) return;

    const { error: deleteError } = await supabase.from('products').delete().eq('id', product.id);
    if (deleteError) {
      setError(deleteError.message);
    } else {
      setSuccess('Item excluído.');
      loadProducts();
    }
    setTimeout(() => setSuccess(null), 3000);
  };

  const toggleActive = async (product: Product) => {
    const { error: updateError } = await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_active: !p.is_active } : p))
      );
    }
  };

  // Obter composições de um produto
  const getProductCompositions = (productId: string) => {
    return compositions
      .filter((c) => c.product_id === productId)
      .map((c) => {
        const ingredient = ingredients.find((i) => i.id === c.ingredient_id);
        return { ...c, ingredient };
      });
  };

  const calculatedCost = useMemo(() => {
    if (formData.product_type === 'final' && editCompositions.length > 0) {
      return calculateCostFromComposition(editCompositions);
    }
    return null;
  }, [editCompositions, formData.product_type, ingredients]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-navy">Produtos</h2>
          <p className="text-slate-600 text-sm">Gerencie ingredientes, produtos e complementos.</p>
        </div>
        <button
          onClick={() => openNewModal(activeTab)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:brightness-110 transition"
        >
          <Plus size={18} />
          {activeTab === 'ingredient' ? 'Novo Ingrediente' : activeTab === 'complement' ? 'Novo Complemento' : 'Novo Produto'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('final')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${activeTab === 'final'
            ? 'border-primary text-primary'
            : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
          <Package size={18} />
          Produtos Finais
        </button>
        <button
          onClick={() => setActiveTab('ingredient')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${activeTab === 'ingredient'
            ? 'border-primary text-primary'
            : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
          <Box size={18} />
          Ingredientes
        </button>
        <button
          onClick={() => setActiveTab('complement')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${activeTab === 'complement'
            ? 'border-primary text-primary'
            : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
          <Cookie size={18} />
          Complementos
        </button>
      </div>

      {/* Filtros */}
      <div className="grid md:grid-cols-2 gap-3">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, código PDV ou iFood..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
        >
          <option value="todas">Todas as categorias</option>
          {productCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
      )}
      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-600">{success}</div>
      )}

      {/* Lista de produtos */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-soft overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-navy">
            {activeTab === 'ingredient' ? 'Ingredientes' : activeTab === 'complement' ? 'Complementos' : 'Catálogo'}
          </h3>
          <p className="text-sm text-slate-500">
            {loading ? 'Carregando...' : `${filteredProducts.length} itens encontrados`}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Nome</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Categoria</th>
                {activeTab === 'final' && (
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Composição</th>
                )}
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Código PDV</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Código iFood</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">
                  {activeTab === 'ingredient' ? 'Custo/Un' : 'Preço'}
                </th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">Custo</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => {
                const productComps = getProductCompositions(product.id);
                return (
                  <tr key={product.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          {product.product_type === 'ingredient' ? (
                            <Box size={18} className="text-slate-400" />
                          ) : product.product_type === 'complement' ? (
                            <Cookie size={18} className="text-slate-400" />
                          ) : (
                            <Package size={18} className="text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-navy">{product.name}</p>
                          {product.description && (
                            <p className="text-xs text-slate-500 truncate max-w-[200px]">{product.description}</p>
                          )}
                          {product.unit !== 'un' && (
                            <p className="text-xs text-slate-400">por {product.unit}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{product.category || '-'}</td>
                    {activeTab === 'final' && (
                      <td className="px-4 py-3">
                        {productComps.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {productComps.slice(0, 3).map((c) => (
                              <span
                                key={c.id}
                                className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-xs"
                                title={`${c.quantity}${c.unit} de ${c.ingredient?.name}`}
                              >
                                {c.ingredient?.name}
                              </span>
                            ))}
                            {productComps.length > 3 && (
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs">
                                +{productComps.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">Sem composição</span>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      {product.pdv_code ? (
                        <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-mono">
                          {product.pdv_code}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {product.ifood_code ? (
                        <span className="px-2 py-1 rounded-lg bg-red-50 text-red-700 text-xs font-mono">
                          {product.ifood_code}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-navy">
                      {activeTab === 'ingredient'
                        ? (product.cost ? formatCurrency(product.cost) : '-')
                        : formatCurrency(product.price)
                      }
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {product.cost ? formatCurrency(product.cost) : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleActive(product)}
                        className={`px-2 py-1 rounded-lg text-xs font-semibold ${product.is_active
                          ? 'bg-green-50 text-green-700'
                          : 'bg-slate-100 text-slate-500'
                          }`}
                      >
                        {product.is_active ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={activeTab === 'final' ? 9 : 8} className="px-4 py-8 text-center text-slate-500">
                    Nenhum item encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de cadastro/edição */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-navy">
                {editingProduct ? `Editar ${PRODUCT_TYPE_LABELS[formData.product_type]}` : `Novo ${PRODUCT_TYPE_LABELS[formData.product_type]}`}
              </h3>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Tipo do produto (só mostra se novo) */}
              {!editingProduct && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tipo</label>
                  <div className="flex gap-2">
                    {(['final', 'ingredient', 'complement'] as ProductType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, product_type: type }))}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold border transition ${formData.product_type === type
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                          }`}
                      >
                        {PRODUCT_TYPE_LABELS[type]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                  placeholder={formData.product_type === 'ingredient' ? 'Ex: Açaí (kg)' : 'Ex: Açaí 500ml'}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm resize-none"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-600">
                      {formData.product_type === 'ingredient' ? 'Custo por unidade' : 'Preço de Venda'}
                    </label>
                    {editingProduct && (
                      <button
                        type="button"
                        onClick={toggleHistory}
                        className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <History size={12} />
                        {showHistory ? 'Ocultar Histórico' : 'Ver Histórico'}
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.product_type === 'ingredient' ? formData.cost : formData.price}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [formData.product_type === 'ingredient' ? 'cost' : 'price']: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Unidade de medida
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData((prev) => ({ ...prev, unit: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                  >
                    {UNITS.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.product_type !== 'ingredient' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Preço de Venda
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Custo {calculatedCost !== null && <span className="text-primary">(calculado)</span>}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculatedCost !== null ? calculatedCost.toFixed(2) : formData.cost}
                      onChange={(e) => setFormData((prev) => ({ ...prev, cost: e.target.value }))}
                      disabled={calculatedCost !== null}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm disabled:bg-slate-50"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Categoria
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                  placeholder="Ex: Açaí, Bebidas, Complementos..."
                  list="category-suggestions"
                />
                <datalist id="category-suggestions">
                  <option value="Açaí" />
                  <option value="Bebidas" />
                  <option value="Sobremesas" />
                  <option value="Complementos" />
                  <option value="Ingredientes" />
                  {productCategories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              {/* Histórico de Custo */}
              {showHistory && (
                <div className="border border-primary/20 bg-primary/5 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2 mb-3">
                    <History size={16} className="text-primary" />
                    <span className="text-sm font-bold text-navy">Histórico de Alterações de Custo</span>
                  </div>

                  {loadingHistory ? (
                    <div className="py-4 text-center text-xs text-slate-500">Carregando histórico...</div>
                  ) : costHistory.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-500">Nenhum registro de histórico encontrado.</div>
                  ) : (
                    <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {costHistory.map((h) => (
                        <div key={h.id} className="flex items-center justify-between text-xs py-2 border-b border-navy/10 last:border-0">
                          <span className="font-medium text-navy">{formatCurrency(h.cost)}</span>
                          <span className="text-slate-500">{new Date(h.created_at).toLocaleString('pt-BR')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Composição (apenas para produtos finais) */}
              {formData.product_type === 'final' && (
                <div className="border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Layers size={18} className="text-primary" />
                      <span className="text-sm font-semibold text-navy">Composição do Produto</span>
                    </div>
                    <button
                      type="button"
                      onClick={addCompositionRow}
                      disabled={ingredients.length === 0}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary text-white text-xs font-semibold hover:brightness-110 disabled:opacity-50"
                    >
                      <Plus size={14} />
                      Adicionar
                    </button>
                  </div>

                  {ingredients.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      Cadastre ingredientes primeiro para criar composições.
                    </p>
                  ) : editCompositions.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      Adicione ingredientes que compõem este produto para calcular o custo automaticamente.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {editCompositions.map((comp, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-center">
                          <select
                            value={comp.ingredient_id}
                            onChange={(e) => updateCompositionRow(index, 'ingredient_id', e.target.value)}
                            className="col-span-5 rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                          >
                            <option value="">Selecione...</option>
                            {ingredients.map((ing) => (
                              <option key={ing.id} value={ing.id}>
                                {ing.name} ({formatCurrency(ing.cost || 0)}/{ing.unit})
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Qtd"
                            value={comp.quantity}
                            onChange={(e) => updateCompositionRow(index, 'quantity', e.target.value)}
                            className="col-span-3 rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                          />
                          <select
                            value={comp.unit}
                            onChange={(e) => updateCompositionRow(index, 'unit', e.target.value)}
                            className="col-span-3 rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                          >
                            <option value="g">g</option>
                            <option value="ml">ml</option>
                            <option value="un">un</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => removeCompositionRow(index)}
                            className="col-span-1 p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      {calculatedCost !== null && (
                        <div className="pt-2 border-t border-slate-200 flex justify-between">
                          <span className="text-xs text-slate-600">Custo calculado:</span>
                          <span className="text-sm font-bold text-primary">{formatCurrency(calculatedCost)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Código PDV
                  </label>
                  <input
                    type="text"
                    value={formData.pdv_code}
                    onChange={(e) => setFormData((prev) => ({ ...prev, pdv_code: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-mono"
                    placeholder="Ex: 001234"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Código iFood
                  </label>
                  <input
                    type="text"
                    value={formData.ifood_code}
                    onChange={(e) => setFormData((prev) => ({ ...prev, ifood_code: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-mono"
                    placeholder="Ex: abc123-xyz"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                  className="size-4 rounded border-slate-300"
                />
                <label htmlFor="is_active" className="text-sm text-slate-600">
                  Produto ativo
                </label>
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-slate-100">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:brightness-110 transition disabled:opacity-60"
              >
                <Save size={16} />
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
