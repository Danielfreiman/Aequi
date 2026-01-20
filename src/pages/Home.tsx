const plans = [
  {
    name: 'Base',
    price: '7 dias grátis',
    stores: 'Até 1 loja',
    cta: 'Começar teste',
    highlight: true,
    features: [
      'Conciliação iFood automática',
      'Contas a pagar/receber essenciais',
      'Ficha técnica e CMV por produto',
    ],
  },
  {
    name: 'Growth',
    price: 'R$ 149/mês',
    stores: 'Até 3 lojas',
    cta: 'Assinar Growth',
    highlight: false,
    features: [
      'Dashboards multi-loja',
      'Calculadora de preço com taxas iFood',
      'Exportações CSV/PDF',
    ],
  },
  {
    name: 'Scale',
    price: 'R$ 249/mês',
    stores: 'Até 5 lojas',
    cta: 'Assinar Scale',
    highlight: false,
    features: [
      'Alerta de divergência avançado',
      'Equipe/Perfis por loja',
      'Prioridade no suporte',
    ],
  },
];

export function Home() {
  return (
    <section className="flex flex-col gap-10">
      <div className="grid lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-primary/10 text-primary">
            Saúde financeira para restaurantes iFood
          </span>
          <h1 className="text-4xl lg:text-5xl font-black text-navy leading-tight">
            Concilie, precifique e cresça com clareza.
          </h1>
          <p className="text-lg text-slate-600">
            A Aequi conecta conciliação iFood, fluxo de caixa e engenharia de cardápio em um só lugar.
            Veja onde o lucro vaza e reajuste preços com segurança.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/app"
              className="px-5 py-3 rounded-xl bg-primary text-white font-semibold shadow-sm hover:brightness-110 transition"
            >
              Começar teste grátis
            </a>
            <a
              href="/app/conciliacao"
              className="px-5 py-3 rounded-xl border border-navy/20 text-navy font-semibold hover:bg-navy/5 transition"
            >
              Ver conciliação iFood
            </a>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary" />
              Conciliação automática de repasses iFood
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-navy" />
              Calculadora de preço com markup e taxas
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 bg-primary/10 blur-3xl rounded-full" />
          <div className="relative p-6 rounded-2xl bg-white border shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-slate-500">Previsão de repasse iFood</p>
                <p className="text-3xl font-black text-navy">R$ 32.450</p>
              </div>
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-primary/15 text-primary">
                +12% vs semana passada
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border">
                <p className="text-xs uppercase font-semibold text-slate-500">Contas a Receber</p>
                <p className="text-2xl font-black text-primary">R$ 18.900</p>
                <p className="text-xs text-slate-500">Pedidos iFood em conferência</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border">
                <p className="text-xs uppercase font-semibold text-slate-500">Contas a Pagar</p>
                <p className="text-2xl font-black text-navy">R$ 11.200</p>
                <p className="text-xs text-slate-500">Fornecedores e insumos</p>
              </div>
            </div>
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-navy to-slate-800 text-white">
              <p className="text-xs uppercase font-semibold opacity-80">Saldo projetado</p>
              <p className="text-3xl font-black">R$ 7.700</p>
              <p className="text-xs opacity-80">Baseado em repasse líquido previsto e contas a pagar.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-2xl font-black text-navy">Planos para cada fase do seu delivery</h2>
          <p className="text-sm text-slate-500">
            Plano Base: 7 dias de teste grátis. Para mais de 5 lojas, fale com a gente.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-5 rounded-2xl border shadow-sm bg-white flex flex-col gap-4 ${
                plan.highlight ? 'border-primary/40 shadow-primary/20' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{plan.stores}</p>
                  <h3 className="text-xl font-black text-navy">{plan.name}</h3>
                </div>
                {plan.highlight && (
                  <span className="px-3 py-1 text-[11px] font-bold rounded-full bg-primary/15 text-primary">
                    Recomendado
                  </span>
                )}
              </div>
              <p className="text-3xl font-black text-navy">{plan.price}</p>
              <ul className="space-y-2 text-sm text-slate-600">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2">
                    <span className="mt-1 size-2 rounded-full bg-primary" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full mt-auto px-4 py-3 rounded-xl font-semibold transition ${
                  plan.highlight
                    ? 'bg-primary text-white hover:brightness-110'
                    : 'border border-navy/20 text-navy hover:bg-navy/5'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
        <div className="text-sm text-slate-600">
          Precisa de mais de 5 lojas ou integrações adicionais? Entre em contato e montamos um plano custom.
        </div>
      </div>
    </section>
  );
}
