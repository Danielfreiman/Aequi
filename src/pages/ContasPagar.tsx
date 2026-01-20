import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { usePersistentFilter } from '../hooks/usePersistentFilter';
import { quickPeriods, type PeriodKey } from '../services/dateFilters';

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
  const [showPaid, setShowPaid] = usePersistentFilter<boolean>('filter.pagar.showPaid', false);
  const [categoryFilter, setCategoryFilter] = usePersistentFilter<string>('filter.pagar.categoria', 'todas');
  const [period, setPeriod] = usePersistentFilter<PeriodKey>('filter.pagar.period', 'mes_atual');
  const [customStart, setCustomStart] = usePersistentFilter<string>('filter.pagar.customStart', '');
  const [customEnd, setCustomEnd] = usePersistentFilter<string>('filter.pagar.customEnd', '');
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<FinTransaction>>({});
  const [saving, setSaving] = useState(false);

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
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditData({});
  };

  const handleSave = async () => {
    if (!editId) return;
    setSaving(true);
    const { error: updateError } = await supabase
      .from('fin_transactions')
      .update({
        description: editData.description,
        category: editData.category,
        date: editData.date,
        value: editData.value,
        is_paid: editData.is_paid,
      })
      .eq('id', editId);
    if (updateError) {
      setError(updateError.message);
    } else {
      setTransactions((prev) =>
        prev.map((tx) => (tx.id === editId ? { ...tx, ...editData } as FinTransaction : tx))
      );
      cancelEdit();
    }
    setSaving(false);
  };

  const markPaid = async (tx: FinTransaction) => {
    const { error: updateError } = await supabase.from('fin_transactions').update({ is_paid: true }).eq('id', tx.id);
    if (updateError) {
      setError(updateError.message);
    } else {
      setTransactions((prev) => prev.map((t) => (t.id === tx.id ? { ...t, is_paid: true } : t)));
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
            return (
              <div key={tx.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 text-sm items-center">
                <div className="font-semibold text-navy">
                  {isEditing ? (
                    <input
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      value={data.description || ''}
                      onChange={(e) => setEditData((prev) => ({ ...prev, description: e.target.value }))}
                    />
                  ) : (
                    tx.description || 'Sem descrição'
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
                    tx.category || 'Sem categoria'
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
                  {isEditing ? (
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
                    </>
                  )}
                </div>
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
