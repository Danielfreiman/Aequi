import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { usePersistentFilter } from '../hooks/usePersistentFilter';
import { quickPeriods, type PeriodKey } from '../services/dateFilters';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';

type InvoiceItem = {
  id?: string;
  description: string;
  category: string;
  value: number;
};

type FinTransaction = {
  id: string;
  description: string | null;
  date: string;
  category: string | null;
  value: number;
  is_paid: boolean;
  items?: InvoiceItem[] | InvoiceItem | null;
};

type Category = { id: string; name: string };

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
  const [showPaid, setShowPaid] = usePersistentFilter<boolean>('filter.pagar.showPaid', false);
  const [categoryFilter, setCategoryFilter] = usePersistentFilter<string>('filter.pagar.categoria', 'todas');
  const [period, setPeriod] = usePersistentFilter<PeriodKey>('filter.pagar.period', 'mes_atual');
  const [customStart, setCustomStart] = usePersistentFilter<string>('filter.pagar.customStart', '');
  const [customEnd, setCustomEnd] = usePersistentFilter<string>('filter.pagar.customEnd', '');
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<FinTransaction>>({});
  const [editItems, setEditItems] = useState<InvoiceItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dbCategories, setDbCategories] = useState<Category[]>([]);

  // Normaliza items para sempre ser array
  const normalizeItems = (items: InvoiceItem[] | InvoiceItem | null | undefined): InvoiceItem[] => {
    if (!items) return [];
    if (Array.isArray(items)) return items;
    return [items];
  };

  // Verifica se é fatura detalhada
  const isDetailedInvoice = (tx: FinTransaction): boolean => {
    return tx.category === 'Fatura detalhada' || tx.category === 'Fatura Detalhada' || normalizeItems(tx.items).length > 0;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('fin_transactions')
        .select('id,description,date,category,value,is_paid,items')
        .eq('type', 'Despesa')
        .order('date', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setTransactions(data || []);
      }
      setLoading(false);
    };

    const loadCategories = async () => {
      const { data } = await supabase.from('finance_categories').select('id,name').order('name', { ascending: true });
      setDbCategories(data || []);
    };

    loadData();
    loadCategories();
  }, []);

  const { start, end } = quickPeriods[period].range();
  const startDate = period === 'custom' && customStart ? new Date(customStart) : start;
  const endDate = period === 'custom' && customEnd ? new Date(customEnd) : end;

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const statusOk = showPaid ? tx.is_paid : !tx.is_paid;
      const catOk = categoryFilter === 'todas' ? true : tx.category === categoryFilter;
      const d = new Date(tx.date);
      const startOk = startDate ? d >= startDate : true;
      const endOk = endDate ? d <= endDate : true;
      return statusOk && catOk && startOk && endOk;
    });
  }, [transactions, showPaid, categoryFilter, startDate, endDate]);

  const total = useMemo(() => filtered.reduce((sum, tx) => sum + (tx.value || 0), 0), [filtered]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => t.category && set.add(t.category));
    return Array.from(set);
  }, [transactions]);

  const startEdit = (tx: FinTransaction) => {
    setEditId(tx.id);
    setEditData({ ...tx });
    setEditItems(normalizeItems(tx.items).map((item, idx) => ({
      ...item,
      id: item.id || `item-${idx}`,
    })));
    setExpandedId(tx.id);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditData({});
    setEditItems([]);
  };

  const handleSave = async () => {
    if (!editId) return;
    setSaving(true);

    // Recalcula valor total se for fatura detalhada
    const isDetailed = isDetailedInvoice(editData as FinTransaction);
    const totalValue = isDetailed && editItems.length > 0
      ? editItems.reduce((sum, item) => sum + (Number(item.value) || 0), 0)
      : editData.value;

    const { error: updateError } = await supabase
      .from('fin_transactions')
      .update({
        description: editData.description,
        category: editData.category,
        date: editData.date,
        value: totalValue,
        is_paid: editData.is_paid,
        items: isDetailed ? editItems : null,
      })
      .eq('id', editId);
    if (updateError) {
      setError(updateError.message);
    } else {
      setTransactions((prev) =>
        prev.map((tx) => (tx.id === editId ? { ...tx, ...editData, value: totalValue, items: isDetailed ? editItems : null } as FinTransaction : tx))
      );
      cancelEdit();
    }
    setSaving(false);
  };

  // Funções para editar itens
  const handleAddItem = () => {
    setEditItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        description: '',
        category: dbCategories[0]?.name || 'Custos (CMV/CMV)',
        value: 0,
      },
    ]);
  };

  const handleUpdateItem = (itemId: string, patch: Partial<InvoiceItem>) => {
    setEditItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, ...patch } : item)));
  };

  const handleRemoveItem = (itemId: string) => {
    setEditItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const editItemsTotal = useMemo(
    () => editItems.reduce((sum, item) => sum + (Number(item.value) || 0), 0),
    [editItems]
  );

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const markPaid = async (tx: FinTransaction) => {
    const { error: updateError } = await supabase.from('fin_transactions').update({ is_paid: true }).eq('id', tx.id);
    if (updateError) {
      setError(updateError.message);
    } else {
      setTransactions((prev) => prev.map((t) => (t.id === tx.id ? { ...t, is_paid: true } : t)));
    }
  };

  const handleDelete = async (tx: FinTransaction) => {
    const ok = window.confirm(`Excluir lançamento "${tx.description || 'Sem descrição'}"? Esta ação não pode ser desfeita.`);
    if (!ok) return;

    setError(null);
    const { error: deleteError } = await supabase.from('fin_transactions').delete().eq('id', tx.id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setTransactions((prev) => prev.filter((t) => t.id !== tx.id));
    if (editId === tx.id) {
      cancelEdit();
    }
  };

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

      <div className="grid md:grid-cols-3 gap-3">
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
          <label className="text-xs font-semibold text-slate-600">Período</label>
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value as PeriodKey)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            {Object.entries(quickPeriods).map(([key, item]) => (
              <option key={key} value={key}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-600">Datas personalizadas</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={customStart}
              onChange={(event) => setCustomStart(event.target.value)}
              disabled={period !== 'custom'}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50"
            />
            <input
              type="date"
              value={customEnd}
              onChange={(event) => setCustomEnd(event.target.value)}
              disabled={period !== 'custom'}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50"
            />
          </div>
        </div>
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
          {filtered.map((tx) => {
            const isEditing = editId === tx.id;
            const data = isEditing ? editData : tx;
            const isDetailed = isDetailedInvoice(tx);
            const txItems = normalizeItems(tx.items);
            const isExpanded = expandedId === tx.id;
            
            return (
              <div key={tx.id} className="flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 text-sm items-center">
                  <div className="font-semibold text-navy flex items-center gap-2">
                    {isDetailed && !isEditing && (
                      <button
                        onClick={() => toggleExpand(tx.id)}
                        className="p-1 hover:bg-slate-100 rounded"
                        title={isExpanded ? 'Recolher itens' : 'Expandir itens'}
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    )}
                    {isEditing ? (
                      <input
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        value={data.description || ''}
                        onChange={(e) => setEditData((prev) => ({ ...prev, description: e.target.value }))}
                      />
                    ) : (
                      <span>{tx.description || 'Sem descrição'}</span>
                    )}
                  </div>
                  <div className="text-slate-500">
                    {isEditing ? (
                      <input
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        value={data.category || ''}
                        onChange={(e) => setEditData((prev) => ({ ...prev, category: e.target.value }))}
                      />
                    ) : (
                      <>
                        {tx.category || 'Sem categoria'}
                        {isDetailed && <span className="ml-1 text-xs text-primary">({txItems.length} itens)</span>}
                      </>
                    )}
                  </div>
                  <div className="text-slate-500">
                    {isEditing ? (
                      <input
                        type="date"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        value={(data.date || '').slice(0, 10)}
                        onChange={(e) => setEditData((prev) => ({ ...prev, date: e.target.value }))}
                      />
                    ) : (
                      formatDate(tx.date)
                    )}
                  </div>
                  <div className="font-semibold text-navy">
                    {isEditing && isDetailed ? (
                      <span className="text-sm">{formatCurrency(editItemsTotal)}</span>
                    ) : isEditing ? (
                      <input
                        type="number"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        value={data.value ?? 0}
                        onChange={(e) => setEditData((prev) => ({ ...prev, value: Number(e.target.value) }))}
                      />
                    ) : (
                      formatCurrency(tx.value)
                    )}
                  </div>
                  <div className="flex gap-2 justify-end">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="px-3 py-2 rounded-lg bg-primary text-white text-xs font-semibold disabled:opacity-60"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(tx)}
                          className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold"
                        >
                          Editar
                        </button>
                        {!tx.is_paid && (
                          <button
                            onClick={() => markPaid(tx)}
                            className="px-3 py-2 rounded-lg bg-primary text-white text-xs font-semibold"
                          >
                            Dar baixa
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(tx)}
                          className="px-3 py-2 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition"
                        >
                          Excluir
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Itens da fatura (visualização expandida) */}
                {isDetailed && isExpanded && !isEditing && txItems.length > 0 && (
                  <div className="bg-slate-50 px-6 py-3 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-600 mb-2">Itens da fatura:</p>
                    <div className="space-y-1">
                      {txItems.map((item, idx) => (
                        <div key={item.id || idx} className="grid grid-cols-3 gap-4 text-xs py-1 border-b border-slate-200 last:border-0">
                          <span className="text-slate-700">{item.description || 'Sem descrição'}</span>
                          <span className="text-slate-500">{item.category || 'Sem categoria'}</span>
                          <span className="text-navy font-semibold text-right">{formatCurrency(item.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Itens da fatura (modo edição) */}
                {isEditing && isDetailed && (
                  <div className="bg-slate-50 px-6 py-4 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold text-navy">Itens da fatura</p>
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary text-white text-xs font-semibold hover:brightness-110"
                      >
                        <Plus size={14} />
                        Adicionar item
                      </button>
                    </div>
                    
                    {editItems.length === 0 ? (
                      <p className="text-xs text-slate-500">Nenhum item. Clique em "Adicionar item" para começar.</p>
                    ) : (
                      <div className="space-y-2">
                        {editItems.map((item) => (
                          <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded-lg border border-slate-200">
                            <input
                              className="col-span-4 rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                              placeholder="Descrição"
                              value={item.description}
                              onChange={(e) => handleUpdateItem(item.id!, { description: e.target.value })}
                            />
                            <select
                              className="col-span-4 rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                              value={item.category}
                              onChange={(e) => handleUpdateItem(item.id!, { category: e.target.value })}
                            >
                              <option value="">Selecione...</option>
                              {dbCategories.map((cat) => (
                                <option key={cat.id} value={cat.name}>
                                  {cat.name}
                                </option>
                              ))}
                            </select>
                            <input
                              type="number"
                              step="0.01"
                              className="col-span-3 rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-right"
                              placeholder="Valor"
                              value={item.value || ''}
                              onChange={(e) => handleUpdateItem(item.id!, { value: Number(e.target.value) })}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id!)}
                              className="col-span-1 flex justify-center p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                              title="Remover item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                        <div className="flex justify-end pt-2 border-t border-slate-200 mt-2">
                          <span className="text-sm font-bold text-navy">
                            Total: {formatCurrency(editItemsTotal)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {!loading && filtered.length === 0 && (
            <div className="p-6 text-sm text-slate-500">Nenhuma despesa encontrada.</div>
          )}
        </div>
      </div>
    </section>
  );
}
