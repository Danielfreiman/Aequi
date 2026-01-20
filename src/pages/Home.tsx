import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuthSession } from '../hooks/useAuthSession';

type Tx = { type: 'Receita' | 'Despesa'; value: number; is_paid: boolean };

const formatCurrency = (value?: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

export function Home() {
  const { session, loading: authLoading, logout } = useAuthSession();
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [stores, setStores] = useState<number | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      const [{ data: txData, error: txError }, { data: storeData, error: storeError }, { data: profileData }] =
        await Promise.all([
          supabase.from('fin_transactions').select('type,value,is_paid'),
          supabase.from('stores').select('id'),
          supabase.from('profiles').select('nome_restaurante').limit(1).maybeSingle(),
        ]);

      if (txError || storeError) {
        setError(txError?.message || storeError?.message || 'Erro ao carregar dados');
      }
      setTransactions((txData as Tx[]) || []);
      setStores(storeData ? storeData.length : null);
      setProfileName(profileData?.nome_restaurante || null);
      setLoading(false);
    };
    load();
  }, []);

  const receberPendente = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'Receita' && !t.is_paid)
        .reduce((sum, t) => sum + (t.value || 0), 0),
    [transactions]
  );
  const pagarPendente = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'Despesa' && !t.is_paid)
        .reduce((sum, t) => sum + (t.value || 0), 0),
    [transactions]
  );

  const headerName = profileName || 'Aequi';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary text-white font-black text-lg flex items-center justify-center">A</div>
            <div>
              <p className="text-lg font-black">{headerName}</p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">saude financeira</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!authLoading && session ? (
              <>
                <span className="text-xs sm:text-sm text-slate-600">{session.user.email}</span>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold hover:bg-slate-50 transition"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className="hidden sm:inline-flex px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold hover:bg-slate-50 transition"
                >
                  Entrar
                </a>
                <a
                  href="/assinar"
                  className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold shadow hover:translate-y-[-1px] transition"
                >
                  Teste gratis
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-slate-500">Visao geral</p>
              <h1 className="text-2xl font-black text-slate-900">{profileName || 'Sem informacoes'}</h1>
            </div>
            <div className="flex gap-3">
              <a
                href="/app/financeiro"
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold hover:bg-slate-50 transition"
              >
                Financeiro
              </a>
              <a
                href="/app/dre"
                className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold shadow hover:translate-y-[-1px] transition"
              >
                DRE
              </a>
            </div>
          </div>

          {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {loading ? (
            <div className="text-sm text-slate-500">Carregando dados...</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500">A receber (pendente)</p>
                <p className="text-2xl font-black text-primary mt-1">
                  {transactions.length ? formatCurrency(receberPendente) : 'Sem informacoes'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500">A pagar (pendente)</p>
                <p className="text-2xl font-black text-amber-600 mt-1">
                  {transactions.length ? formatCurrency(pagarPendente) : 'Sem informacoes'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500">Lojas ativas</p>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {stores !== null ? stores : 'Sem informacoes'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-500">Planos</p>
              <h2 className="text-xl font-bold text-slate-900">Escolha o volume de lojas</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: 'Base', price: '7 dias gratis', after: 'R$ 89/mes', stores: '1 loja' },
              { name: 'Growth', price: 'R$ 149/mes', after: 'Mensal', stores: 'ate 3 lojas' },
              { name: 'Scale', price: 'R$ 249/mes', after: 'Mensal', stores: 'ate 5 lojas' },
            ].map((plan) => (
              <div key={plan.name} className="rounded-xl border border-slate-200 p-4 space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase">{plan.name}</p>
                <p className="text-lg font-black text-slate-900">{plan.price}</p>
                <p className="text-sm text-slate-500">{plan.after} • {plan.stores}</p>
                <a
                  href="/assinar"
                  className="inline-flex px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold shadow hover:translate-y-[-1px] transition"
                >
                  Escolher plano
                </a>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
