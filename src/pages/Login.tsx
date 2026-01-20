import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { createAbacatePayCheckout } from '../services/abacatepay';

const plans = [
  { id: 'base', name: 'Base', price: 'R$ 89/mês', description: 'Até 1 loja' },
  { id: 'growth', name: 'Growth', price: 'R$ 149/mês', description: 'Até 3 lojas' },
  { id: 'scale', name: 'Scale', price: 'R$ 249/mês', description: 'Até 5 lojas' },
] as const;

type PlanId = (typeof plans)[number]['id'];

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('base');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
    } else {
      navigate('/app');
    }

    setLoading(false);
  };

  const handleCheckout = async () => {
    if (!email) {
      setError('Informe seu email para iniciar o checkout.');
      return;
    }

    try {
      setCheckoutLoading(true);
      setError(null);
      const { checkoutUrl } = await createAbacatePayCheckout({
        plan: selectedPlan,
        email,
      });

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        setError('Checkout não retornou a URL de pagamento.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao iniciar checkout.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8">
        <div className="rounded-3xl bg-white border border-slate-100 shadow-soft p-8 space-y-6">
          <div>
            <span className="text-xs font-bold rounded-full bg-primary/10 text-primary px-3 py-1">Área do parceiro</span>
            <h1 className="text-3xl font-black text-navy mt-3">Entrar na Aequi</h1>
            <p className="text-slate-500 text-sm">Acesse seu painel financeiro e gerencie as lojas.</p>
          </div>

          {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

          <form className="space-y-4" onSubmit={handleLogin}>
            <label className="block text-sm font-semibold text-slate-600">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="voce@restaurante.com"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-600">
              Senha
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="********"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary text-white font-semibold py-3 hover:brightness-110 transition disabled:opacity-60"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <div className="rounded-3xl bg-white border border-slate-100 shadow-soft p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-black text-navy">Assine com AbacatePay</h2>
            <p className="text-slate-500 text-sm">
              Escolha seu plano e finalize o pagamento em segundos.
            </p>
          </div>

          <div className="grid gap-3">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`w-full text-left border rounded-2xl p-4 transition ${
                  selectedPlan === plan.id
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-slate-200 hover:border-primary/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{plan.description}</p>
                    <p className="text-lg font-bold text-navy">{plan.name}</p>
                  </div>
                  <span className="text-sm font-semibold text-primary">{plan.price}</span>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handleCheckout}
            disabled={checkoutLoading}
            className="w-full rounded-xl bg-navy text-white font-semibold py-3 hover:brightness-110 transition disabled:opacity-60"
          >
            {checkoutLoading ? 'Redirecionando...' : 'Pagar com AbacatePay'}
          </button>
          <p className="text-xs text-slate-500">
            O checkout será aberto em uma nova página. Você poderá cancelar quando quiser.
          </p>
        </div>
      </div>
    </div>
  );
}
