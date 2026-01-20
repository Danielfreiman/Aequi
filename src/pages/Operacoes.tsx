import { useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { format, addMonths } from 'date-fns';
import { Upload, FileText, Check, AlertCircle, Trash2, RefreshCw } from 'lucide-react';
import { useAuthSession } from '../hooks/useAuthSession';

type Category = { id: string; name: string };

type OperationType = 'Receita' | 'Despesa';
type RepeatEvery = 'mensal' | 'semanal' | 'nenhum';

type InvoiceItem = {
  id: string;
  category: string;
  value: number;
  description: string;
};

type ExtractLine = {
  id: string;
  date: string;
  description: string;
  value: number;
  type: 'credit' | 'debit';
  category: string;
  matched: boolean;
};

type ImportStatus = 'idle' | 'loading' | 'success' | 'error';

type TabType = 'manual' | 'extrato';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const EXTRACT_CATEGORIES = [
  { id: 'receita_ifood', name: 'Repasse iFood', type: 'credit' },
  { id: 'receita_cartao', name: 'Vendas CartÃ£o', type: 'credit' },
  { id: 'receita_pix', name: 'Vendas PIX', type: 'credit' },
  { id: 'receita_dinheiro', name: 'Vendas Dinheiro', type: 'credit' },
  { id: 'despesa_fornecedor', name: 'Fornecedores', type: 'debit' },
  { id: 'despesa_aluguel', name: 'Aluguel', type: 'debit' },
  { id: 'despesa_energia', name: 'Energia', type: 'debit' },
  { id: 'despesa_agua', name: 'Ãgua', type: 'debit' },
  { id: 'despesa_gas', name: 'GÃ¡s', type: 'debit' },
  { id: 'despesa_folha', name: 'Folha de Pagamento', type: 'debit' },
  { id: 'despesa_impostos', name: 'Impostos', type: 'debit' },
  { id: 'despesa_marketing', name: 'Marketing', type: 'debit' },
  { id: 'despesa_manutencao', name: 'ManutenÃ§Ã£o', type: 'debit' },
  { id: 'despesa_outros', name: 'Outras Despesas', type: 'debit' },
  { id: 'transferencia', name: 'TransferÃªncia', type: 'both' },
];

export function Operacoes() {
  const { session } = useAuthSession();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('manual');
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

  // Estados para importaÃ§Ã£o de extrato
  const [extractLines, setExtractLines] = useState<ExtractLine[]>([]);
  const [importStatus, setImportStatus] = useState<ImportStatus>('idle');
  const [importMessage, setImportMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');

  const banks = [
    { id: 'nubank', name: 'Nubank' },
    { id: 'itau', name: 'ItaÃº' },
    { id: 'bradesco', name: 'Bradesco' },
    { id: 'santander', name: 'Santander' },
    { id: 'bb', name: 'Banco do Brasil' },
    { id: 'caixa', name: 'Caixa' },
    { id: 'inter', name: 'Banco Inter' },
    { id: 'c6', name: 'C6 Bank' },
    { id: 'stone', name: 'Stone' },
    { id: 'outros', name: 'Outros' },
  ];

  useEffect(() => {
    const loadProfile = async () => {
      const { data, error } = await supabase.from('profiles').select('id').limit(1).maybeSingle();
      if (!error && data?.id) setProfileId(data.id);
    };

    const loadCategories = async () => {
      const { data } = await supabase.from('finance_categories').select('id,name').order('name', { ascending: true });
      setCategories(data || []);
    };
    loadProfile();
    loadCategories();
  }, []);

  const totalInvoice = useMemo(
    () => invoiceItems.reduce((sum, item) => sum + (Number(item.value) || 0), 0),
    [invoiceItems]
  );

  // FunÃ§Ãµes para importaÃ§Ã£o de extrato
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const parseCSV = (content: string): ExtractLine[] => {
    const lines = content.split('\n').filter(line => line.trim());
    const parsed: ExtractLine[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(';').map(c => c.trim().replace(/"/g, ''));
      if (cols.length >= 3) {
        const value = parseFloat(cols[2]?.replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
        parsed.push({
          id: `line-${i}`,
          date: cols[0] || format(new Date(), 'yyyy-MM-dd'),
          description: cols[1] || 'Sem descriÃ§Ã£o',
          value: Math.abs(value),
          type: value >= 0 ? 'credit' : 'debit',
          category: '',
          matched: false,
        });
      }
    }
    return parsed;
  };

  const autoClassify = (lines: ExtractLine[]): ExtractLine[] => {
    return lines.map(line => {
      const desc = line.description.toLowerCase();
      let category = '';
      
      if (desc.includes('ifood') || desc.includes('i food')) {
        category = 'receita_ifood';
      } else if (desc.includes('pix')) {
        category = line.type === 'credit' ? 'receita_pix' : 'transferencia';
      } else if (desc.includes('cartao') || desc.includes('cartÃ£o') || desc.includes('maquininha')) {
        category = 'receita_cartao';
      } else if (desc.includes('aluguel') || desc.includes('locacao')) {
        category = 'despesa_aluguel';
      } else if (desc.includes('energia') || desc.includes('enel') || desc.includes('cemig') || desc.includes('cpfl')) {
        category = 'despesa_energia';
      } else if (desc.includes('agua') || desc.includes('sabesp') || desc.includes('copasa')) {
        category = 'despesa_agua';
      } else if (desc.includes('gas') || desc.includes('comgas') || desc.includes('ultragaz')) {
        category = 'despesa_gas';
      } else if (desc.includes('folha') || desc.includes('salario') || desc.includes('salÃ¡rio') || desc.includes('funcionario')) {
        category = 'despesa_folha';
      } else if (desc.includes('darf') || desc.includes('das') || desc.includes('imposto') || desc.includes('tributo')) {
        category = 'despesa_impostos';
      } else if (desc.includes('fornecedor') || desc.includes('atacado') || desc.includes('distribuid')) {
        category = 'despesa_fornecedor';
      }

      return { ...line, category, matched: category !== '' };
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    setImportStatus('loading');
    setImportMessage('Processando arquivo...');

    try {
      const content = await file.text();
      const lines = parseCSV(content);
      const classified = autoClassify(lines);
      
      setExtractLines(classified);
      const matchedCount = classified.filter(l => l.matched).length;
      setImportStatus('success');
      setImportMessage(`${classified.length} transaÃ§Ãµes importadas. ${matchedCount} classificadas automaticamente.`);
    } catch (error) {
      setImportStatus('error');
      setImportMessage('Erro ao processar arquivo. Verifique o formato.');
    }
  };

  const updateExtractCategory = (id: string, category: string) => {
    setExtractLines(lines => 
      lines.map(line => 
        line.id === id ? { ...line, category, matched: true } : line
      )
    );
  };

  const updateExtractDescription = (id: string, description: string) => {
    setExtractLines((lines) => lines.map((line) => (line.id === id ? { ...line, description } : line)));
  };

  const removeExtractLine = (id: string) => {
    setExtractLines(lines => lines.filter(line => line.id !== id));
  };

  const handleSaveExtract = async () => {
    if (!session?.user?.id) {
      setImportStatus('error');
      setImportMessage('Você precisa estar logado para salvar as transações.');
      return;
    }
    if (!profileId) {
      setImportStatus('error');
      setImportMessage('Nenhum perfil encontrado para associar as transações.');
      return;
    }
    if (!selectedBank) {
      setImportStatus('error');
      setImportMessage('Selecione o banco antes de salvar.');
      return;
    }

    const unclassified = extractLines.filter((l) => !l.category);
    if (unclassified.length > 0) {
      setImportStatus('error');
      setImportMessage(`${unclassified.length} transações ainda precisam ser classificadas.`);
      return;
    }

    setImportStatus('loading');
    setImportMessage('Salvando transações...');

    try {
      const transactions = extractLines.map((line) => ({
        profile_id: profileId,
        date: line.date,
        description: line.description,
        value: line.value,
        type: line.type === 'credit' ? 'Receita' : 'Despesa',
        category: line.category,
        is_paid: true,
        source: 'extrato_bancario',
        bank: selectedBank,
      }));

      const { error } = await supabase.from('fin_transactions').insert(transactions);
      if (error) throw error;

      setImportStatus('success');
      setImportMessage(`${transactions.length} transações salvas com sucesso!`);
      setExtractLines([]);
    } catch (error) {
      setImportStatus('error');
      setImportMessage('Erro ao salvar transações. Tente novamente.');
      console.error(error);
    }
  };

  const totalCredits = extractLines.filter(l => l.type === 'credit').reduce((sum, l) => sum + l.value, 0);
  const totalDebits = extractLines.filter(l => l.type === 'debit').reduce((sum, l) => sum + l.value, 0);
  const extractBalance = totalCredits - totalDebits;

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
      setError('Preencha descriÃ§Ã£o, valor (ou fatura detalhada) e data.');
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
      setSuccess('OperaÃ§Ã£o salva com sucesso.');
      setDescription('');
      setCategory('');
      setValue('');
      setInvoiceItems([]);
      setUseInvoice(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar operaÃ§Ã£o.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-navy">Cadastro de operaÃ§Ãµes</h2>
          <p className="text-slate-600 text-sm">
            Lance entradas e saÃ­das manualmente ou importe extratos bancÃ¡rios.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('manual')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
            activeTab === 'manual'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          LanÃ§amento Manual
        </button>
        <button
          onClick={() => setActiveTab('extrato')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'extrato'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Upload size={16} />
          Importar Extrato
        </button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}
      {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{success}</div>}

      {/* Tab: LanÃ§amento Manual */}
      {activeTab === 'manual' && (
        <>
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
                <option value="Despesa">SaÃ­da</option>
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
              <label className="text-xs font-semibold text-slate-600">DescriÃ§Ã£o</label>
              <input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Ex: Fatura cartÃ£o"
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
                <span className="text-xs text-slate-500">Valor Ã© calculado pela fatura detalhada.</span>
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
              <label htmlFor="isPaid" className="text-sm text-slate-600">JÃ¡ estÃ¡ pago/recebido</label>
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
                <option value="nenhum">NÃ£o repetir</option>
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
              <p className="text-xs text-slate-500">Use para lanÃ§ar um Ãºnico pagamento com categorias detalhadas para o DRE.</p>
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
                    placeholder="DescriÃ§Ã£o do item"
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
          {loading ? 'Salvando...' : 'Salvar operaÃ§Ã£o'}
        </button>
      </div>
        </>
      )}

      {/* Tab: Importar Extrato */}
      {activeTab === 'extrato' && (
        <div className="space-y-6">
          {/* Status da importaÃ§Ã£o */}
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

          {/* Upload e seleÃ§Ã£o de banco */}
          {extractLines.length === 0 && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-white border border-slate-100 shadow-soft p-6">
                <h3 className="font-bold text-navy mb-4">1. Selecione o Banco</h3>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Selecione...</option>
                  {banks.map(bank => (
                    <option key={bank.id} value={bank.id}>{bank.name}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-2">
                  Selecionar o banco ajuda na classificaÃ§Ã£o automÃ¡tica.
                </p>
              </div>

              <div
                className={`rounded-2xl border-2 border-dashed p-8 text-center transition ${
                  dragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="font-bold text-navy mb-2">2. Importe o Extrato</h3>
                <p className="text-slate-500 text-sm mb-4">
                  Arraste um arquivo CSV ou clique para selecionar
                </p>
                <label className="inline-flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold cursor-pointer hover:bg-slate-200 transition">
                  <Upload size={18} />
                  Selecionar Arquivo
                  <input
                    type="file"
                    accept=".csv,.txt,.ofx"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-slate-400 mt-4">
                  Formatos aceitos: CSV, TXT, OFX
                </p>
              </div>
            </div>
          )}

          {/* Resumo do extrato */}
          {extractLines.length > 0 && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
                  <p className="text-xs uppercase text-slate-500 font-semibold">Total CrÃ©ditos</p>
                  <p className="text-2xl font-black text-green-600">{currencyFormatter.format(totalCredits)}</p>
                </div>
                <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
                  <p className="text-xs uppercase text-slate-500 font-semibold">Total DÃ©bitos</p>
                  <p className="text-2xl font-black text-red-600">{currencyFormatter.format(totalDebits)}</p>
                </div>
                <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
                  <p className="text-xs uppercase text-slate-500 font-semibold">Saldo</p>
                  <p className={`text-2xl font-black ${extractBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {currencyFormatter.format(extractBalance)}
                  </p>
                </div>
                <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
                  <p className="text-xs uppercase text-slate-500 font-semibold">Classificadas</p>
                  <p className="text-2xl font-black text-primary">
                    {extractLines.filter(l => l.matched).length}/{extractLines.length}
                  </p>
                </div>
              </div>

              {/* Lista de transaÃ§Ãµes */}
              <div className="rounded-2xl bg-white border border-slate-100 shadow-soft overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-navy">TransaÃ§Ãµes do Extrato</h3>
                    <p className="text-sm text-slate-500">Classifique cada transaÃ§Ã£o para importar</p>
                  </div>
                  <button
                    onClick={() => setExtractLines([])}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Limpar tudo
                  </button>
                </div>
                <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                  {extractLines.map((line) => (
                    <div key={line.id} className={`p-4 flex items-center gap-4 ${!line.matched ? 'bg-amber-50' : ''}`}>
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${
                          line.type === 'credit' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {line.type === 'credit' ? '+' : '-'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <input
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mb-1"
                          value={line.description}
                          onChange={(e) => updateExtractDescription(line.id, e.target.value)}
                        />
                        <p className="text-xs text-slate-500">{line.date}</p>
                      </div>
                      <div className="flex-shrink-0 w-40">
                        <select
                          value={line.category}
                          onChange={(e) => updateExtractCategory(line.id, e.target.value)}
                          className={`w-full px-3 py-2 text-sm rounded-lg border ${
                            line.matched 
                              ? 'border-green-200 bg-green-50' 
                              : 'border-amber-300 bg-amber-50'
                          } focus:outline-none focus:ring-2 focus:ring-primary/20`}
                        >
                          <option value="">Classificar...</option>
                          {EXTRACT_CATEGORIES
                            .filter(cat => cat.type === 'both' || cat.type === line.type)
                            .map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))
                          }
                        </select>
                      </div>
                      <div className="flex-shrink-0 w-28 text-right">
                        <p className={`font-bold ${line.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                          {line.type === 'credit' ? '+' : '-'} {currencyFormatter.format(line.value)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeExtractLine(line.id)}
                        className="flex-shrink-0 p-2 text-slate-400 hover:text-red-500 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveExtract}
                  disabled={importStatus === 'loading'}
                  className="px-5 py-3 rounded-xl bg-primary text-white font-semibold hover:brightness-110 transition disabled:opacity-60 flex items-center gap-2"
                >
                  {importStatus === 'loading' ? (
                    <RefreshCw size={18} className="animate-spin" />
                  ) : (
                    <Check size={18} />
                  )}
                  Salvar TransaÃ§Ãµes
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}




