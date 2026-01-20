import { useState } from 'react';
import { createCheckoutSession, createCustomer } from '../services/payments';

const plans = [
  {
    id: 'base',
    name: 'Base',
    price: 'R$ 89/mês',
    description: 'Até 1 loja • inclui conciliação, contas e ficha técnica',
    trialDays: 7,
    badge: 'Teste grátis (cartão obrigatório)',
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 'R$ 149/mês',
    description: 'Até 3 lojas • dashboards multi-loja e exportações',
    trialDays: 0,
  },
  {
    id: 'scale',
    name: 'Scale',
    price: 'R$ 249/mês',
    description: 'Até 5 lojas • alertas avançados e suporte prioritário',
    trialDays: 0,
  },
  {
    id: 'teste',
    name: 'Teste',
    price: 'R$ 1,00',
    description: 'Plano para validar fluxo de pagamento',
    trialDays: 0,
    badge: 'QA',
    testMode: true,
  },
] as const;

type PlanId = (typeof plans)[number]['id'];

export function Assinatura() {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('base');
  const [name, setName] = useState('');
  const [cellphone, setCellphone] = useState('');
  const [taxId, setTaxId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!email || !name || !cellphone || !taxId) {
      setError('Preencha nome, email, celular e CPF/CNPJ para seguir para o pagamento.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const plan = plans.find((p) => p.id === selectedPlan);
      const checkoutPlanId = selectedPlan === 'teste' ? 'scale' : selectedPlan;

      await createCustomer({
        name,
        email,
        cellphone,
        taxId,
      });

      const { checkoutUrl } = await createCheckoutSession({
        planId: checkoutPlanId,
        email,
        trialDays: plan?.trialDays,
        testMode: plan?.testMode,
        successUrl: `${window.location.origin}/login?from=checkout`,
        cancelUrl: `${window.location.origin}/assinar`,
        metadata: {
          plan_name: plan?.name || selectedPlan,
          customer_name: name,
          customer_cellphone: cellphone,
          customer_taxId: taxId,
          apply_role: selectedPlan === 'teste' ? 'scale' : selectedPlan,
          selected_plan: selectedPlan,
        },
      });

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        setError('Checkout não retornou a URL de pagamento.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao iniciar checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8">
        <div className="rounded-3xl bg-white border border-slate-100 shadow-soft p-8 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold rounded-full bg-primary/10 text-primary px-3 py-1">Assinatura</span>
            <h1 className="text-3xl font-black text-navy">Escolha seu plano</h1>
            <p className="text-slate-500 text-sm">
              Base tem 7 dias grátis, mas solicita cartão para afastar curiosos. O plano teste de R$1 é só para validar o fluxo.
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
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm text-slate-500">{plan.description}</p>
                    <p className="text-lg font-bold text-navy">{plan.name}</p>
                    {plan.trialDays ? (
                      <p className="text-xs text-slate-500">{plan.trialDays} dias de teste • cartão obrigatório</p>
                    ) : null}
                    {plan.testMode ? (
                      <p className="text-xs text-slate-500">Fluxo de teste em ambiente real.</p>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">{plan.price}</p>
                    {plan.badge ? (
                      <span className="inline-flex mt-1 px-2 py-1 text-[11px] font-semibold rounded-full bg-primary/10 text-primary">
                        {plan.badge}
                      </span>
                    ) : null}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-slate-100 shadow-soft p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-navy">Pagamento seguro</h2>
            <p className="text-slate-500 text-sm">Precisamos dos dados para vincular o pagamento e criar a conta.</p>
          </div>

          {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

          <label className="block text-sm font-semibold text-slate-600">
            Nome completo
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Nome do responsável"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-600">
            Email
            {/* Email é usado para criar/ligar a conta após o pagamento */}
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
            Celular
            <input
              value={cellphone}
              onChange={(event) => setCellphone(event.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="(11) 99999-0000"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-600">
            CPF ou CNPJ
            <input
              value={taxId}
              onChange={(event) => setTaxId(event.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="123.456.789-00"
            />
          </label>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full rounded-xl bg-navy text-white font-semibold py-3 hover:brightness-110 transition disabled:opacity-60"
          >
            {loading ? 'Redirecionando...' : 'Ir para pagamento'}
          </button>

          <p className="text-xs text-slate-500">
            Ao finalizar, você será direcionado para o pagamento. Após confirmação, criamos sua conta e você volta para fazer o primeiro acesso.
          </p>
        </div>
      </div>
    </div>
  );
}
