import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { format, addMonths } from 'date-fns';

type Category = { id: string; name: string };

type OperationType = 'Receita' | 'Despesa';
type RepeatEvery = 'mensal' | 'semanal' | 'nenhum';

type InvoiceItem = {
  id: string;
  category: string;
  value: number;
  description: string;
};

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function Operacoes() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [type, setType] = useState<OperationType>('Despesa');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState<string>(() => format(new Date(), 'yyyy-MM-dd'));
  const [isPaid, setIsPaid] = useState(false);
  const [repeatEvery, setRepeatEvery] = useState<RepeatEvery>('nenhum');
  const [repeatCount, setRepeatCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [useInvoice, setUseInvoice] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      const { data } = await supabase.from('finance_categories').select('id,name').order('name', { ascending: true });
      setCategories(data || []);
    };
    loadCategories();
  }, []);

  const totalInvoice = useMemo(
    () => invoiceItems.reduce((sum, item) => sum + (Number(item.value) || 0), 0),
    [invoiceItems]
  );

  const handleAddInvoiceItem = () => {
    setInvoiceItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        category: '',
        value: 0,
        description: '',
      },
    ]);
  };

  const handleUpdateInvoiceItem = (id: string, patch: Partial<InvoiceItem>) => {
    setInvoiceItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const handleRemoveInvoiceItem = (id: string) => {
    setInvoiceItems((prev) => prev.filter((item) => item.id !== id));
  };

  const createRows = () => {
    const baseDate = new Date(date);
    const occurrences = repeatEvery === 'nenhum' ? 1 : repeatCount;
    const rows = Array.from({ length: occurrences }).map((_, idx) => {
      const targetDate = repeatEvery === 'mensal' ? addMonths(baseDate, idx) : baseDate;
      const subtotal = useInvoice ? totalInvoice : Number(value || 0);
      return {
        type,
        description: useInvoice ? `${description || 'Fatura'} (detalhada)` : description,
        category: useInvoice ? 'Fatura detalhada' : category,
        value: subtotal,
        date: format(targetDate, 'yyyy-MM-dd'),
        is_paid: isPaid,
      };
    });
    return rows;
  };

  const handleSubmit = async () => {
    if (!description || (!value && !useInvoice) || !date) {
      setError('Preencha descrição, valor (ou fatura detalhada) e data.');
      return;
    }
    if (useInvoice && totalInvoice <= 0) {
      setError('Adicione itens na fatura detalhada.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const rows = createRows();
      const { error: insertError } = await supabase.from('fin_transactions').insert(rows);
      if (insertError) throw insertError;
      setSuccess('Operação salva com sucesso.');
      setDescription('');
      setCategory('');
      setValue('');
      setInvoiceItems([]);
      setUseInvoice(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar operação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-navy">Cadastro de operações</h2>
          <p className="text-slate-600 text-sm">
            Lance entradas e saídas, configure recorrência e use fatura detalhada para manter o DRE por categoria.
          </p>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}
      {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{success}</div>}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-white border border-slate-100 shadow-soft p-5 space-y-4 lg:col-span-2">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600">Tipo</label>
              <select
                value={type}
                onChange={(event) => setType(event.target.value as OperationType)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="Despesa">Saída</option>
                <option value="Receita">Entrada</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600">Data</label>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600">Descrição</label>
              <input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Ex: Fatura cartão"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600">Categoria</label>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                disabled={useInvoice}
              >
                <option value="">Selecione</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600">Valor</label>
              <input
                type="number"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="0,00"
                disabled={useInvoice}
              />
              {useInvoice && (
                <span className="text-xs text-slate-500">Valor é calculado pela fatura detalhada.</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input
                id="isPaid"
                type="checkbox"
                checked={isPaid}
                onChange={(event) => setIsPaid(event.target.checked)}
                className="size-4"
              />
              <label htmlFor="isPaid" className="text-sm text-slate-600">Já está pago/recebido</label>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600">Repetir</label>
              <select
                value={repeatEvery}
                onChange={(event) => setRepeatEvery(event.target.value as RepeatEvery)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="nenhum">Não repetir</option>
                <option value="mensal">Mensal</option>
                <option value="semanal">Semanal (fixa a mesma data)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600">Quantidade</label>
              <input
                type="number"
                min={1}
                value={repeatCount}
                onChange={(event) => setRepeatCount(Number(event.target.value) || 1)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                disabled={repeatEvery === 'nenhum'}
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-100 shadow-soft p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-navy">Fatura detalhada</p>
              <p className="text-xs text-slate-500">Use para lançar um único pagamento com categorias detalhadas para o DRE.</p>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={useInvoice}
                onChange={(event) => setUseInvoice(event.target.checked)}
                className="size-4"
              />
              Ativar
            </label>
          </div>

          {useInvoice && (
            <div className="space-y-3">
              {invoiceItems.map((item) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center border border-slate-100 rounded-xl p-3">
                  <input
                    value={item.description}
                    onChange={(event) => handleUpdateInvoiceItem(item.id, { description: event.target.value })}
                    placeholder="Descrição do item"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                  <select
                    value={item.category}
                    onChange={(event) => handleUpdateInvoiceItem(item.id, { category: event.target.value })}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  >
                    <option value="">Categoria</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={item.value}
                      onChange={(event) => handleUpdateInvoiceItem(item.id, { value: Number(event.target.value) })}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm flex-1"
                      placeholder="0,00"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveInvoiceItem(item.id)}
                      className="text-xs text-red-600 font-semibold"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddInvoiceItem}
                className="px-3 py-2 rounded-xl border border-primary/40 text-primary text-sm font-semibold hover:bg-primary/10"
              >
                Adicionar item
              </button>
              <div className="text-sm text-slate-600">
                Total da fatura: <span className="font-bold text-navy">{currencyFormatter.format(totalInvoice || 0)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-5 py-3 rounded-xl bg-primary text-white font-semibold hover:brightness-110 transition disabled:opacity-60"
        >
          {loading ? 'Salvando...' : 'Salvar operação'}
        </button>
      </div>
    </section>
  );
}
