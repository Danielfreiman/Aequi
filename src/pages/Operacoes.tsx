import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { format, addMonths } from 'date-fns';
import { Upload, FileText, Check, AlertCircle, Trash2, RefreshCw, X, Settings, Plus, Save } from 'lucide-react';
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
  error?: string;
};

type ImportStatus = 'idle' | 'loading' | 'success' | 'error' | 'validation';

type CategoryRule = {
  id: string;
  pattern: string;
  category: string;
  matchType: 'contains' | 'equals' | 'startsWith';
};

type TabType = 'lancamento' | 'regras';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

// Categoria padrão quando não encontra regra
const DEFAULT_CATEGORY = 'Custos (CMV/CMV)';

const STORAGE_KEY_RULES = 'aequi_category_rules';

export function Operacoes() {
  const { session } = useAuthSession();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('lancamento');
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

  // Estados para importação de extrato
  const [extractLines, setExtractLines] = useState<ExtractLine[]>([]);
  const [importStatus, setImportStatus] = useState<ImportStatus>('idle');
  const [importMessage, setImportMessage] = useState('');
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  // Regras de categorização
  const [categoryRules, setCategoryRules] = useState<CategoryRule[]>([]);
  const [newRulePattern, setNewRulePattern] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState(DEFAULT_CATEGORY);
  const [newRuleMatchType, setNewRuleMatchType] = useState<'contains' | 'equals' | 'startsWith'>('contains');

  const banks = [
    { id: 'nubank', name: 'Nubank' },
    { id: 'itau', name: 'Itaú' },
    { id: 'bradesco', name: 'Bradesco' },
    { id: 'santander', name: 'Santander' },
    { id: 'bb', name: 'Banco do Brasil' },
    { id: 'caixa', name: 'Caixa' },
    { id: 'inter', name: 'Banco Inter' },
    { id: 'c6', name: 'C6 Bank' },
    { id: 'stone', name: 'Stone' },
    { id: 'outros', name: 'Outros' },
  ];

  // Carregar regras do localStorage
  useEffect(() => {
    const savedRules = localStorage.getItem(STORAGE_KEY_RULES);
    if (savedRules) {
      try {
        setCategoryRules(JSON.parse(savedRules));
      } catch (e) {
        console.error('Erro ao carregar regras:', e);
      }
    }
  }, []);

  // Salvar regras no localStorage
  const saveRules = (rules: CategoryRule[]) => {
    localStorage.setItem(STORAGE_KEY_RULES, JSON.stringify(rules));
    setCategoryRules(rules);
  };

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

  // Funções para importação de extrato
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Função para aplicar regras de categorização
  const applyRules = (desc: string): string => {
    const descLower = desc.toLowerCase().trim();
    
    for (const rule of categoryRules) {
      const patternLower = rule.pattern.toLowerCase().trim();
      
      let matches = false;
      switch (rule.matchType) {
        case 'equals':
          matches = descLower === patternLower;
          break;
        case 'startsWith':
          matches = descLower.startsWith(patternLower);
          break;
        case 'contains':
        default:
          matches = descLower.includes(patternLower);
          break;
      }
      
      if (matches) {
        return rule.category;
      }
    }
    
    return '';
  };

  // Parser melhorado para decimais brasileiros
  const parseValue = (valueStr: string): number => {
    if (!valueStr) return 0;
    
    // Remove espaços e caracteres não numéricos exceto vírgula, ponto e sinal
    let cleaned = valueStr.trim();
    
    // Detectar formato brasileiro (1.234,56) vs americano (1,234.56)
    const hasCommaAsDecimal = /\d,\d{2}$/.test(cleaned);
    const hasDotAsThousand = /\d\.\d{3}/.test(cleaned);
    
    if (hasCommaAsDecimal || hasDotAsThousand) {
      // Formato brasileiro: remove pontos de milhar e troca vírgula por ponto
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    }
    
    // Remove tudo exceto números, ponto e sinal de menos
    cleaned = cleaned.replace(/[^\d.\-]/g, '');
    
    const value = parseFloat(cleaned);
    return isNaN(value) ? 0 : value;
  };

  const parseCSV = (content: string): { lines: ExtractLine[]; errors: string[] } => {
    const rawLines = content.split(/\r?\n/).filter((line) => line.trim());
    const parsed: ExtractLine[] = [];
    const errors: string[] = [];
    
    if (rawLines.length === 0) {
      errors.push('O arquivo está vazio.');
      return { lines: [], errors };
    }

    if (rawLines.length === 1) {
      errors.push('O arquivo contém apenas o cabeçalho. Nenhuma transação encontrada.');
      return { lines: [], errors };
    }

    // Detectar separador
    const firstDataLine = rawLines[1] || '';
    const separator = firstDataLine.includes(';') ? ';' : ',';
    
    for (let i = 1; i < rawLines.length; i++) {
      const cols = rawLines[i].split(separator).map(c => c.trim().replace(/"/g, ''));
      
      if (cols.length < 3) {
        const lineError = `Linha ${i + 1}: Formato inválido - esperado pelo menos 3 colunas (data, descrição, valor), encontrado ${cols.length}.`;
        errors.push(lineError);
        continue;
      }

      const rawValueStr = cols[2] || '';
      const value = parseValue(rawValueStr);
      
      // Na fatura/extrato:
      // - Valores POSITIVOS = gastos (dinheiro saiu da conta) → importar
      // - Valores NEGATIVOS = recebimentos (dinheiro entrou) → ignorar
      if (value <= 0) {
        // Pular valores negativos ou zero (são recebimentos/entradas)
        continue;
      }

      const description = cols[1] || 'Sem descrição';
      const dateValue = cols[0] || '';
      let formattedDate = format(new Date(), 'yyyy-MM-dd');
      
      // Tentar parsear a data
      if (dateValue) {
        const dateParts = dateValue.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
        if (dateParts) {
          const day = dateParts[1].padStart(2, '0');
          const month = dateParts[2].padStart(2, '0');
          const year = dateParts[3].length === 2 ? `20${dateParts[3]}` : dateParts[3];
          formattedDate = `${year}-${month}-${day}`;
        } else {
          errors.push(`Linha ${i + 1}: Data inválida "${dateValue}" - usando data atual.`);
        }
      }
      
      // Aplicar regras de categorização
      let category = applyRules(description);
      
      // Se não encontrar regra, usar categoria padrão
      if (!category) {
        category = DEFAULT_CATEGORY;
      }

      parsed.push({
        id: `line-${i}`,
        date: formattedDate,
        description,
        value: Math.abs(value),
        type: 'debit',
        category,
        matched: category !== DEFAULT_CATEGORY, // Só marca como matched se encontrou regra específica
        error: undefined,
      });
    }
    
    return { lines: parsed, errors };
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [categoryRules]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    setImportStatus('loading');
    setImportMessage('Processando arquivo...');
    setImportErrors([]);

    try {
      const content = await file.text();
      const { lines, errors } = parseCSV(content);
      
      setExtractLines(lines);
      setImportErrors(errors);
      
      const matchedCount = lines.filter(l => l.matched).length;
      
      if (lines.length === 0) {
        setImportStatus('error');
        setImportMessage('Nenhuma saída (débito) encontrada no arquivo.');
      } else if (errors.length > 0) {
        setImportStatus('validation');
        setImportMessage(`${lines.length} saídas encontradas. ${errors.length} avisos. ${matchedCount} com regra aplicada.`);
      } else {
        setImportStatus('success');
        setImportMessage(`${lines.length} saídas importadas. ${matchedCount} com regra aplicada, ${lines.length - matchedCount} como CMV.`);
      }
      
      setShowImportModal(true);
    } catch (err) {
      setImportStatus('error');
      setImportMessage('Erro ao processar arquivo. Verifique se é um arquivo CSV válido.');
      setImportErrors([
        'O arquivo não pôde ser lido.',
        'Verifique se o formato é CSV com colunas: Data, Descrição, Valor',
        'Exemplo: 01/01/2026;Pagamento Fornecedor;-500,00'
      ]);
      setShowImportModal(true);
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

  // Criar regra a partir de uma linha importada
  const createRuleFromLine = (line: ExtractLine) => {
    if (line.category && line.category !== 'cmv') {
      const newRule: CategoryRule = {
        id: crypto.randomUUID(),
        pattern: line.description,
        category: line.category,
        matchType: 'contains',
      };
      const updatedRules = [...categoryRules, newRule];
      saveRules(updatedRules);
    }
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

    setImportStatus('loading');
    setImportMessage('Salvando transações...');

    try {
      // Converte linhas do extrato em itens da fatura
      const items = extractLines.map((line) => ({
        id: line.id,
        description: line.description,
        category: categories.find(c => c.id === line.category || c.name === line.category)?.name || line.category || DEFAULT_CATEGORY,
        value: line.value,
      }));

      setInvoiceItems(items);
      
      // Calcula total
      const total = extractLines.reduce((sum, l) => sum + l.value, 0);
      setValue(total.toString());
      setUseInvoice(true);
      setDescription(`Importação Extrato ${format(new Date(), 'dd/MM/yyyy')}`);

      setImportStatus('success');
      setImportMessage(`${extractLines.length} itens adicionados à fatura. Total: ${currencyFormatter.format(total)}`);
      
      setTimeout(() => {
        setShowImportModal(false);
        setExtractLines([]);
      }, 1500);
    } catch (err) {
      setImportStatus('error');
      setImportMessage('Erro ao processar importação.');
      console.error(err);
    }
  };

  const totalDebits = extractLines.reduce((sum, l) => sum + l.value, 0);

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
        items: useInvoice ? invoiceItems : undefined,
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

  const clearImport = () => {
    setExtractLines([]);
    setImportStatus('idle');
    setImportMessage('');
    setImportErrors([]);
    setShowImportModal(false);
  };

  // Funções para gerenciar regras
  const handleAddRule = () => {
    if (!newRulePattern.trim()) return;
    
    const newRule: CategoryRule = {
      id: crypto.randomUUID(),
      pattern: newRulePattern.trim(),
      category: newRuleCategory,
      matchType: newRuleMatchType,
    };
    
    const updatedRules = [...categoryRules, newRule];
    saveRules(updatedRules);
    setNewRulePattern('');
  };

  const handleDeleteRule = (id: string) => {
    const updatedRules = categoryRules.filter(r => r.id !== id);
    saveRules(updatedRules);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-navy">Cadastro de operações</h2>
          <p className="text-slate-600 text-sm">
            Lance saídas manualmente ou importe extratos bancários.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('lancamento')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
            activeTab === 'lancamento'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Lançamento
        </button>
        <button
          onClick={() => setActiveTab('regras')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'regras'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Settings size={16} />
          Regras de Categorização
        </button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}
      {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{success}</div>}

      {/* Tab: Lançamento */}
      {activeTab === 'lancamento' && (
        <>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Formulário principal */}
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

            {/* Fatura detalhada */}
            <div className="rounded-2xl bg-white border border-slate-100 shadow-soft p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-navy">Fatura detalhada</p>
                  <p className="text-xs text-slate-500">Lance múltiplos itens ou importe extrato.</p>
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
                <div className="space-y-4">
                  {/* Botão para importar extrato */}
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-600">Banco (opcional)</label>
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      >
                        <option value="">Selecione...</option>
                        {banks.map(bank => (
                          <option key={bank.id} value={bank.id}>{bank.name}</option>
                        ))}
                      </select>
                    </div>

                    <div
                      className={`rounded-xl border-2 border-dashed p-4 text-center transition cursor-pointer ${
                        dragActive 
                          ? 'border-primary bg-primary/5' 
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('file-input')?.click()}
                    >
                      <FileText size={32} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-xs text-slate-500 mb-2">
                        Arraste um CSV ou clique para importar
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Apenas saídas (débitos) serão importadas
                      </p>
                      <input
                        id="file-input"
                        type="file"
                        accept=".csv,.txt,.ofx"
                        onChange={handleFileInput}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Itens manuais da fatura */}
                  <div className="border-t border-slate-100 pt-3">
                    <p className="text-xs font-semibold text-slate-600 mb-2">Itens da fatura:</p>
                  </div>
                  {invoiceItems.map((item) => (
                    <div key={item.id} className="grid grid-cols-1 gap-2 border border-slate-100 rounded-xl p-3">
                      <input
                        value={item.description}
                        onChange={(event) => handleUpdateInvoiceItem(item.id, { description: event.target.value })}
                        placeholder="Descrição do item"
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      />
                      <select
                        value={item.category}
                        onChange={(event) => handleUpdateInvoiceItem(item.id, { category: event.target.value })}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
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
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm flex-1"
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
                    className="w-full px-3 py-2 rounded-xl border border-primary/40 text-primary text-sm font-semibold hover:bg-primary/10"
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
        </>
      )}

      {/* Tab: Regras de Categorização */}
      {activeTab === 'regras' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white border border-slate-100 shadow-soft p-6">
            <h3 className="text-lg font-bold text-navy mb-4">Criar nova regra</h3>
            <p className="text-sm text-slate-500 mb-4">
              Defina padrões para categorizar automaticamente as transações importadas.
            </p>
            
            <div className="grid md:grid-cols-4 gap-4 items-end">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600">Quando a descrição</label>
                <select
                  value={newRuleMatchType}
                  onChange={(e) => setNewRuleMatchType(e.target.value as 'contains' | 'equals' | 'startsWith')}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="contains">Contém</option>
                  <option value="equals">For igual a</option>
                  <option value="startsWith">Começar com</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600">Texto</label>
                <input
                  value={newRulePattern}
                  onChange={(e) => setNewRulePattern(e.target.value)}
                  placeholder="Ex: Hortifrut J J"
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600">Categorizar como</label>
                <select
                  value={newRuleCategory}
                  onChange={(e) => setNewRuleCategory(e.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleAddRule}
                disabled={!newRulePattern.trim()}
                className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:brightness-110 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Adicionar Regra
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-100 shadow-soft overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-navy">Regras ativas</h3>
              <p className="text-sm text-slate-500">{categoryRules.length} regras configuradas</p>
            </div>
            
            {categoryRules.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Settings size={48} className="mx-auto mb-3 opacity-30" />
                <p>Nenhuma regra configurada.</p>
                <p className="text-sm">Crie regras para categorizar automaticamente suas importações.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {categoryRules.map((rule) => (
                  <div key={rule.id} className="p-4 flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-navy">
                        {rule.matchType === 'contains' && 'Contém'}
                        {rule.matchType === 'equals' && 'Igual a'}
                        {rule.matchType === 'startsWith' && 'Começa com'}
                        : <span className="text-primary">"{rule.pattern}"</span>
                      </p>
                      <p className="text-xs text-slate-500">
                        → {categories.find(c => c.id === rule.category || c.name === rule.category)?.name || rule.category}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Importação (tela expandida) */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-navy">Importar Extrato</h2>
                <p className="text-sm text-slate-500">Apenas saídas (débitos) são importadas</p>
              </div>
              <button
                onClick={clearImport}
                className="p-2 text-slate-400 hover:text-slate-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Status */}
            {importStatus !== 'idle' && (
              <div className={`mx-6 mt-4 rounded-xl p-4 ${
                importStatus === 'loading' ? 'bg-blue-50 border border-blue-200 text-blue-700' :
                importStatus === 'success' ? 'bg-green-50 border border-green-200 text-green-700' :
                importStatus === 'validation' ? 'bg-amber-50 border border-amber-200 text-amber-700' :
                'bg-red-50 border border-red-200 text-red-700'
              }`}>
                <div className="flex items-center gap-2">
                  {importStatus === 'loading' && <RefreshCw size={18} className="animate-spin" />}
                  {importStatus === 'success' && <Check size={18} />}
                  {(importStatus === 'error' || importStatus === 'validation') && <AlertCircle size={18} />}
                  <span className="font-medium">{importMessage}</span>
                </div>
                {importErrors.length > 0 && (
                  <ul className="mt-2 text-sm space-y-1 pl-6 list-disc">
                    {importErrors.slice(0, 5).map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                    {importErrors.length > 5 && (
                      <li>... e mais {importErrors.length - 5} avisos</li>
                    )}
                  </ul>
                )}
              </div>
            )}

            {/* Resumo */}
            {extractLines.length > 0 && (
              <div className="px-6 py-4 grid grid-cols-3 gap-4">
                <div className="rounded-xl bg-slate-100 p-4 text-center">
                  <p className="text-xs uppercase text-slate-500 font-semibold">Total de itens</p>
                  <p className="text-2xl font-black text-navy">{extractLines.length}</p>
                </div>
                <div className="rounded-xl bg-red-50 p-4 text-center">
                  <p className="text-xs uppercase text-red-600 font-semibold">Total em saídas</p>
                  <p className="text-2xl font-black text-red-600">{currencyFormatter.format(totalDebits)}</p>
                </div>
                <div className="rounded-xl bg-primary/10 p-4 text-center">
                  <p className="text-xs uppercase text-primary font-semibold">Com regra aplicada</p>
                  <p className="text-2xl font-black text-primary">{extractLines.filter(l => l.matched).length}</p>
                </div>
              </div>
            )}

            {/* Lista de transações */}
            <div className="flex-1 overflow-y-auto px-6">
              {extractLines.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <FileText size={48} className="mx-auto mb-3 opacity-30" />
                  <p>Nenhuma saída encontrada no arquivo.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-2 font-semibold text-slate-600">Data</th>
                      <th className="text-left py-3 px-2 font-semibold text-slate-600">Descrição</th>
                      <th className="text-right py-3 px-2 font-semibold text-slate-600">Valor</th>
                      <th className="text-left py-3 px-2 font-semibold text-slate-600">Categoria</th>
                      <th className="text-center py-3 px-2 font-semibold text-slate-600">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {extractLines.map((line) => (
                      <tr key={line.id} className={line.error ? 'bg-red-50' : !line.matched ? 'bg-amber-50' : ''}>
                        <td className="py-3 px-2 text-slate-600">{line.date}</td>
                        <td className="py-3 px-2">
                          <input
                            value={line.description}
                            onChange={(e) => updateExtractDescription(line.id, e.target.value)}
                            className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-primary focus:outline-none py-1"
                          />
                          {line.error && (
                            <p className="text-xs text-red-500 mt-1">{line.error}</p>
                          )}
                        </td>
                        <td className="py-3 px-2 text-right font-bold text-red-600">
                          -{currencyFormatter.format(line.value)}
                        </td>
                        <td className="py-3 px-2">
                          <select
                            value={line.category}
                            onChange={(e) => updateExtractCategory(line.id, e.target.value)}
                            className={`w-full px-2 py-1 rounded-lg border text-sm ${
                              line.matched 
                                ? 'border-green-200 bg-green-50 text-green-700' 
                                : 'border-amber-300 bg-amber-50 text-amber-700'
                            }`}
                          >
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => createRuleFromLine(line)}
                              className="p-1.5 text-slate-400 hover:text-primary transition"
                              title="Criar regra a partir deste item"
                            >
                              <Save size={14} />
                            </button>
                            <button
                              onClick={() => removeExtractLine(line.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 transition"
                              title="Remover"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Dica: Clique em <Save size={12} className="inline" /> para criar uma regra automática a partir do item.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={clearImport}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveExtract}
                  disabled={importStatus === 'loading' || extractLines.length === 0}
                  className="px-5 py-2 rounded-xl bg-primary text-white font-semibold hover:brightness-110 transition disabled:opacity-60 flex items-center gap-2"
                >
                  {importStatus === 'loading' ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                  Adicionar {extractLines.length} itens à Fatura
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}




















