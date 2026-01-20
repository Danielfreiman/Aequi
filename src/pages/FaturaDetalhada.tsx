import { useState, useCallback } from 'react';
import { Upload, FileText, Check, AlertCircle, Trash2, Download, RefreshCw, Plus } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuthSession } from '../hooks/useAuthSession';

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

const CATEGORIES = [
  { id: 'receita_ifood', name: 'Repasse iFood', type: 'credit' },
  { id: 'receita_cartao', name: 'Vendas Cartão', type: 'credit' },
  { id: 'receita_pix', name: 'Vendas PIX', type: 'credit' },
  { id: 'receita_dinheiro', name: 'Vendas Dinheiro', type: 'credit' },
  { id: 'despesa_fornecedor', name: 'Fornecedores', type: 'debit' },
  { id: 'despesa_aluguel', name: 'Aluguel', type: 'debit' },
  { id: 'despesa_energia', name: 'Energia', type: 'debit' },
  { id: 'despesa_agua', name: 'Água', type: 'debit' },
  { id: 'despesa_gas', name: 'Gás', type: 'debit' },
  { id: 'despesa_folha', name: 'Folha de Pagamento', type: 'debit' },
  { id: 'despesa_impostos', name: 'Impostos', type: 'debit' },
  { id: 'despesa_marketing', name: 'Marketing', type: 'debit' },
  { id: 'despesa_manutencao', name: 'Manutenção', type: 'debit' },
  { id: 'despesa_outros', name: 'Outras Despesas', type: 'debit' },
  { id: 'transferencia', name: 'Transferência', type: 'both' },
];

export function FaturaDetalhada() {
  const { userId } = useAuthSession();
  const [extractLines, setExtractLines] = useState<ExtractLine[]>([]);
  const [importStatus, setImportStatus] = useState<ImportStatus>('idle');
  const [importMessage, setImportMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');

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
    
    // Pular cabeçalho
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(';').map(c => c.trim().replace(/"/g, ''));
      if (cols.length >= 3) {
        const value = parseFloat(cols[2]?.replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
        parsed.push({
          id: `line-${i}`,
          date: cols[0] || new Date().toISOString().split('T')[0],
          description: cols[1] || 'Sem descrição',
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
      
      // Regras de classificação automática
      if (desc.includes('ifood') || desc.includes('i food')) {
        category = 'receita_ifood';
      } else if (desc.includes('pix')) {
        category = line.type === 'credit' ? 'receita_pix' : 'transferencia';
      } else if (desc.includes('cartao') || desc.includes('cartão') || desc.includes('maquininha')) {
        category = 'receita_cartao';
      } else if (desc.includes('aluguel') || desc.includes('locacao')) {
        category = 'despesa_aluguel';
      } else if (desc.includes('energia') || desc.includes('enel') || desc.includes('cemig') || desc.includes('cpfl')) {
        category = 'despesa_energia';
      } else if (desc.includes('agua') || desc.includes('sabesp') || desc.includes('copasa')) {
        category = 'despesa_agua';
      } else if (desc.includes('gas') || desc.includes('comgas') || desc.includes('ultragaz')) {
        category = 'despesa_gas';
      } else if (desc.includes('folha') || desc.includes('salario') || desc.includes('salário') || desc.includes('funcionario')) {
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
      setImportMessage(`${classified.length} transações importadas. ${matchedCount} classificadas automaticamente.`);
    } catch (error) {
      setImportStatus('error');
      setImportMessage('Erro ao processar arquivo. Verifique o formato.');
    }
  };

  const updateCategory = (id: string, category: string) => {
    setExtractLines(lines => 
      lines.map(line => 
        line.id === id ? { ...line, category, matched: true } : line
      )
    );
  };

  const removeLine = (id: string) => {
    setExtractLines(lines => lines.filter(line => line.id !== id));
  };

  const handleSaveToDatabase = async () => {
    if (!userId) {
      setImportStatus('error');
      setImportMessage('Você precisa estar logado para salvar as transações.');
      return;
    }

    const unclassified = extractLines.filter(l => !l.category);
    if (unclassified.length > 0) {
      setImportStatus('error');
      setImportMessage(`${unclassified.length} transações ainda precisam ser classificadas.`);
      return;
    }

    setImportStatus('loading');
    setImportMessage('Salvando transações...');

    try {
      const transactions = extractLines.map(line => ({
        profile_id: userId,
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

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const totalCredits = extractLines.filter(l => l.type === 'credit').reduce((sum, l) => sum + l.value, 0);
  const totalDebits = extractLines.filter(l => l.type === 'debit').reduce((sum, l) => sum + l.value, 0);
  const balance = totalCredits - totalDebits;

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black text-navy">Fatura Detalhada</h2>
          <p className="text-slate-600 text-sm">Importe extratos bancários e classifique transações automaticamente.</p>
        </div>
        {extractLines.length > 0 && (
          <button
            onClick={handleSaveToDatabase}
            disabled={importStatus === 'loading'}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition disabled:opacity-50"
          >
            {importStatus === 'loading' ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <Check size={18} />
            )}
            Salvar Transações
          </button>
        )}
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

      {/* Seleção de banco e upload */}
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
              Selecionar o banco ajuda na classificação automática das transações.
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

      {/* Instruções de exportação */}
      {extractLines.length === 0 && (
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6">
          <h3 className="font-bold text-navy mb-4 flex items-center gap-2">
            <Download size={18} />
            Como exportar o extrato do seu banco
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-white rounded-xl border border-slate-100">
              <p className="font-semibold text-navy mb-1">Nubank</p>
              <p className="text-slate-500">App → Extrato → Exportar → CSV</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-100">
              <p className="font-semibold text-navy mb-1">Itaú</p>
              <p className="text-slate-500">Internet Banking → Extrato → Exportar OFX</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-100">
              <p className="font-semibold text-navy mb-1">Bradesco</p>
              <p className="text-slate-500">App → Extrato → Salvar → CSV</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-100">
              <p className="font-semibold text-navy mb-1">Stone</p>
              <p className="text-slate-500">Dashboard → Extrato → Exportar CSV</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-100">
              <p className="font-semibold text-navy mb-1">Inter</p>
              <p className="text-slate-500">App → Extrato → Compartilhar → CSV</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-100">
              <p className="font-semibold text-navy mb-1">C6 Bank</p>
              <p className="text-slate-500">App → Extrato → Baixar → CSV</p>
            </div>
          </div>
        </div>
      )}

      {/* Resumo */}
      {extractLines.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
            <p className="text-xs uppercase text-slate-500 font-semibold">Total Créditos</p>
            <p className="text-2xl font-black text-green-600">{formatCurrency(totalCredits)}</p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
            <p className="text-xs uppercase text-slate-500 font-semibold">Total Débitos</p>
            <p className="text-2xl font-black text-red-600">{formatCurrency(totalDebits)}</p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
            <p className="text-xs uppercase text-slate-500 font-semibold">Saldo</p>
            <p className={`text-2xl font-black ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(balance)}
            </p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
            <p className="text-xs uppercase text-slate-500 font-semibold">Classificadas</p>
            <p className="text-2xl font-black text-primary">
              {extractLines.filter(l => l.matched).length}/{extractLines.length}
            </p>
          </div>
        </div>
      )}

      {/* Lista de transações */}
      {extractLines.length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-100 shadow-soft overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-navy">Transações do Extrato</h3>
              <p className="text-sm text-slate-500">Classifique cada transação para importar</p>
            </div>
            <button
              onClick={() => setExtractLines([])}
              className="text-sm text-red-600 hover:underline"
            >
              Limpar tudo
            </button>
          </div>
          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
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
                  <p className="font-medium text-navy truncate">{line.description}</p>
                  <p className="text-xs text-slate-500">{line.date}</p>
                </div>
                <div className="flex-shrink-0 w-48">
                  <select
                    value={line.category}
                    onChange={(e) => updateCategory(line.id, e.target.value)}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      line.matched 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-amber-300 bg-amber-50'
                    } focus:outline-none focus:ring-2 focus:ring-primary/20`}
                  >
                    <option value="">Classificar...</option>
                    {CATEGORIES
                      .filter(cat => cat.type === 'both' || cat.type === line.type)
                      .map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))
                    }
                  </select>
                </div>
                <div className="flex-shrink-0 w-28 text-right">
                  <p className={`font-bold ${line.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {line.type === 'credit' ? '+' : '-'} {formatCurrency(line.value)}
                  </p>
                </div>
                <button
                  onClick={() => removeLine(line.id)}
                  className="flex-shrink-0 p-2 text-slate-400 hover:text-red-500 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Adicionar transação manual */}
      {extractLines.length > 0 && (
        <button className="flex items-center gap-2 text-sm text-primary hover:underline">
          <Plus size={16} />
          Adicionar transação manualmente
        </button>
      )}
    </section>
  );
}
