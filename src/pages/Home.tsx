import { Link } from 'react-router-dom';
import { useAuthSession } from '../hooks/useAuthSession';

const plans = [
  {
    name: 'Base',
    price: '7 dias grátis',
    priceAfter: 'R$ 89/mês após o teste',
    stores: 'Até 1 loja',
    cta: 'Começar teste grátis',
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
    priceAfter: 'Cobrança mensal',
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
    priceAfter: 'Cobrança mensal',
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
  const { session } = useAuthSession();
  return (
    <div className="min-h-screen bg-[#f7f4ec] text-[#0f1720]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.55]" aria-hidden>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(46,204,113,0.14),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(12,54,36,0.18),transparent_32%),radial-gradient(circle_at_15%_70%,rgba(255,255,255,0.8),transparent_40%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(19,32,24,0.04)_0%,rgba(19,32,24,0)_40%,rgba(19,32,24,0.04)_70%)]" />
        </div>

        <header className="sticky top-0 z-20 backdrop-blur bg-[#f7f4ec]/85 border-b border-[#d9d1c3]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-xl bg-[#103826] text-white font-black text-lg flex items-center justify-center shadow-[0_15px_40px_rgba(11,44,31,0.2)]">
                A
              </div>
              <div>
                <p className="text-lg font-black tracking-tight">Aequi</p>
                <div className="flex items-center gap-2">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[#4c5b52]">Parceiro do operador</p>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">BETA</span>
                </div>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#3c4a42]">
              <a href="#beneficios" className="hover:text-[#103826]">Benefícios</a>
              <a href="#planos" className="hover:text-[#103826]">Planos</a>
              <a href="#resultados" className="hover:text-[#103826]">Resultados</a>
            </nav>
            <div className="flex items-center gap-3">
              <Link
                to={session ? "/app" : "/login"}
                className="hidden sm:inline-flex px-4 py-2 rounded-xl border border-[#103826]/30 text-[#103826] text-sm font-semibold hover:bg-[#103826]/5 transition"
              >
                {session ? "Minha Conta" : "Entrar"}
              </Link>
              <Link
                to="/assinar"
                className="px-4 py-2 rounded-xl bg-[#0f2c1f] text-[#e7f6eb] text-sm font-semibold shadow-[0_10px_35px_rgba(13,38,28,0.28)] hover:translate-y-[-1px] transition"
              >
                Teste grátis
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-14 relative">
          <section className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-6 space-y-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 text-[11px] font-semibold rounded-full bg-[#103826]/10 text-[#103826] border border-[#103826]/20">
                Gastos na linha • CMV enxuto
              </span>
              <h1 className="text-4xl lg:text-5xl font-black leading-tight tracking-tight text-[#0c261b]">
                Painel para segurar custos e aumentar margem.
              </h1>
              <p className="text-lg text-[#3f4d46] leading-relaxed">
                Integra direto ao iFood para puxar repasses, pedidos e taxas automaticamente. Controle gastos, CMV e
                despesas fixas num fluxo diário. Defina preço certo, corte desperdício e saiba onde cada real está indo antes de virar prejuízo.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/assinar"
                  className="px-5 py-3 rounded-xl bg-[#103826] text-[#f2f7f0] font-semibold shadow-[0_10px_35px_rgba(11,44,31,0.3)] hover:translate-y-[-1px] transition"
                >
                  Começar teste grátis
                </Link>
                <Link
                  to="/app/financeiro"
                  className="px-5 py-3 rounded-xl border border-[#103826]/25 text-[#0f2c1f] font-semibold hover:bg-[#103826]/5 transition"
                >
                  Ver controle de gastos
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-[#3f4d46]">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-[#d9d1c3] shadow-[0_6px_18px_rgba(16,56,38,0.08)]">
                  <span className="size-2 rounded-full bg-[#2ecc71]" /> Fechamento diário sem planilha
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-[#d9d1c3] shadow-[0_6px_18px_rgba(16,56,38,0.08)]">
                  <span className="size-2 rounded-full bg-[#0f2c1f]" /> Integração iFood: repasses automáticos
                </span>
              </div>
            </div>

            <div className="lg:col-span-6 relative">
              <div className="absolute -top-6 -right-6 w-48 h-48 border border-dashed border-[#103826]/30 rounded-full" aria-hidden />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#103826]/10 blur-3xl rounded-full" aria-hidden />
              <div className="relative space-y-5">
                <div className="p-6 rounded-3xl bg-white/90 border border-[#d9d1c3] shadow-[0_18px_40px_rgba(12,38,27,0.12)] space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase font-semibold text-[#4c5b52]">iFood + Caixa</p>
                      <p className="text-3xl font-black text-[#0f2c1f]">R$ 54.800 projetado</p>
                      <p className="text-sm text-[#4c5b52]">Repasses, pedidos e taxas entram automático. Fixos e insumos já mapeados.</p>
                    </div>
                    <span className="px-3 py-1 text-[11px] font-bold rounded-full bg-[#2ecc71]/15 text-[#0f2c1f] border border-[#2ecc71]/30">
                      -8% vs mês anterior
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-[#0f2c1f] text-[#e7f6eb]">
                      <p className="text-[11px] uppercase tracking-wide opacity-80">Variável (CMV)</p>
                      <p className="text-2xl font-black">R$ 18.900</p>
                      <p className="text-xs opacity-85">Ficha técnica e custo por produto.</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white border border-[#d9d1c3] text-[#103826]">
                      <p className="text-[11px] uppercase tracking-wide text-[#4c5b52]">Fixos</p>
                      <p className="text-2xl font-black">R$ 11.200</p>
                      <p className="text-xs text-[#4c5b52]">Aluguel, folha, energia e taxas.</p>
                    </div>
                  </div>
                  <div className="border-t border-[#e4dbce] pt-4 grid sm:grid-cols-3 gap-3 text-sm">
                    {[{
                      label: 'Margem prevista',
                      value: '18,5%',
                      note: 'pós CMV e fixos',
                    }, {
                      label: 'Desvios mapeados',
                      value: '6 itens',
                      note: 'fora do orçamento',
                    }, {
                      label: 'Tempo diário',
                      value: '4 min',
                      note: 'fechamento D+1',
                    }].map((item) => (
                      <div key={item.label} className="p-4 rounded-2xl bg-[#f0eadf] text-[#0f2c1f] border border-[#d9d1c3]">
                        <p className="text-[11px] uppercase tracking-wide text-[#4c5b52]">{item.label}</p>
                        <p className="text-xl font-black">{item.value}</p>
                        <p className="text-[12px] text-[#4c5b52]">{item.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {[{
                    title: 'Margem restaurada',
                    value: '+8,7%',
                    detail: 'após ajustar preço e CMV',
                  }, {
                    title: 'Rotina enxuta',
                    value: 'D+1',
                    detail: 'saldo de caixa previsível',
                  }].map((metric) => (
                    <div key={metric.title} className="p-4 rounded-2xl bg-white/90 border border-[#d9d1c3] shadow-[0_10px_30px_rgba(12,38,27,0.08)]">
                      <p className="text-[11px] uppercase tracking-wide text-[#4c5b52]">{metric.title}</p>
                      <p className="text-xl font-black text-[#0f2c1f]">{metric.value}</p>
                      <p className="text-sm text-[#4c5b52]">{metric.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="resultados" className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5 space-y-3">
              <h2 className="text-2xl font-black text-[#0c261b]">O trilho para controlar gastos.</h2>
              <p className="text-sm text-[#3f4d46] leading-relaxed">
                Cadência diária focada em CMV, despesas fixas e preço certo. Menos ruído, mais disciplina financeira para manter a margem.
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-4 rounded-2xl bg-white border border-[#d9d1c3] shadow-[0_10px_25px_rgba(12,38,27,0.06)]">
                  <p className="text-[11px] uppercase tracking-wide text-[#4c5b52]">Implantação</p>
                  <p className="text-lg font-black text-[#0f2c1f]">Em 1 semana</p>
                  <p className="text-[12px] text-[#4c5b52]">Dados iFood + plano de contas.</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-[#d9d1c3] shadow-[0_10px_25px_rgba(12,38,27,0.06)]">
                  <p className="text-[11px] uppercase tracking-wide text-[#4c5b52]">Suporte</p>
                  <p className="text-lg font-black text-[#0f2c1f]">Operação real</p>
                  <p className="text-[12px] text-[#4c5b52]">Equipe que já geriu delivery.</p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-7 grid gap-3">
              {[{
                label: 'Conciliação iFood',
                title: 'Repasses e extratos entram automáticos',
                desc: 'Integração puxa pedidos/taxas; importação de extrato CSV/PDF fecha o D+1.',
              }, {
                label: 'Preço & CMV',
                title: 'Ficha técnica que conversa com fluxo de caixa',
                desc: 'Markup considera CMV e fixos, evitando preços que corroem margem.',
              }, {
                label: 'Caixa diário',
                title: 'Saldo projetado D+1',
                desc: 'Visão única de pagar/receber com alertas de atraso e gastos acima do teto.',
              }].map((item, idx) => (
                <div
                  key={item.label}
                  className="relative overflow-hidden rounded-3xl border border-[#d9d1c3] bg-white/95 shadow-[0_14px_32px_rgba(12,38,27,0.08)]"
                >
                  <div className="absolute inset-y-0 left-0 w-1.5 bg-[#0f2c1f]" aria-hidden />
                  <div className="p-5 pl-7 flex flex-col gap-2">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-[#4c5b52]">{item.label}</div>
                    <p className="text-lg font-bold text-[#0f2c1f]">{item.title}</p>
                    <p className="text-sm text-[#3f4d46]">{item.desc}</p>
                  </div>
                  <div className="absolute right-4 top-4 text-[11px] text-[#4c5b52]">{idx + 1}/3</div>
                </div>
              ))}
            </div>
          </section>

          <section id="planos" className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 space-y-3">
              <h2 className="text-2xl font-black text-[#0c261b]">Planos pensados para margem.</h2>
              <p className="text-sm text-[#3f4d46]">
                Plano Base com 7 dias de teste. Após o trial, escolha o pacote que acompanha seu número de lojas e ritmo
                de crescimento.
              </p>
              <div className="p-4 rounded-2xl bg-[#0f2c1f] text-[#e7f6eb]">
                <p className="text-[11px] uppercase tracking-[0.2em] opacity-80">Dica</p>
                <p className="text-lg font-black">Base resolve 80% dos casos.</p>
                <p className="text-sm opacity-85">Growth e Scale liberam multi-loja, exportações e prioridade.</p>
              </div>
            </div>
            <div className="lg:col-span-8 grid md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`p-6 rounded-3xl border flex flex-col gap-4 transition shadow-[0_12px_30px_rgba(12,38,27,0.08)] bg-white/95 ${plan.highlight ? 'border-[#0f2c1f] translate-y-[-4px]' : 'border-[#d9d1c3]'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#4c5b52]">{plan.stores}</p>
                      <h3 className="text-xl font-black text-[#0f2c1f]">{plan.name}</h3>
                    </div>
                    {plan.highlight && (
                      <span className="px-3 py-1 text-[11px] font-bold rounded-full bg-[#0f2c1f] text-[#e7f6eb]">
                        Recomendado
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-3xl font-black text-[#0f2c1f]">{plan.price}</p>
                    <p className="text-xs text-[#4c5b52] mt-1">{plan.priceAfter}</p>
                  </div>
                  <ul className="space-y-2 text-sm text-[#3f4d46]">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2">
                        <span className="mt-1 size-2 rounded-full bg-[#0f2c1f]" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/assinar"
                    className={`w-full mt-auto px-4 py-3 rounded-xl font-semibold text-center transition ${plan.highlight
                        ? 'bg-[#0f2c1f] text-[#e7f6eb] hover:translate-y-[-1px]'
                        : 'border border-[#103826]/25 text-[#0f2c1f] hover:bg-[#103826]/5'
                      }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </section>

          <section id="beneficios" className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-6 space-y-4">
              <h3 className="text-2xl font-black text-[#0c261b]">Operação de verdade, não só UI bonita.</h3>
              <div className="space-y-3">
                {[{
                  title: 'Cadência diária',
                  desc: 'Checklist de fechamento com conciliação, contas a pagar e fluxo de caixa no mesmo painel.',
                }, {
                  title: 'Cardápio que sustenta margem',
                  desc: 'Ficha técnica, CMV e preço sugerido considerando taxas iFood e promoções.',
                }, {
                  title: 'Alertas que importam',
                  desc: 'Divergências de taxas, atrasos de pagamento e repasses fora do padrão.',
                }].map((item) => (
                  <div key={item.title} className="p-5 rounded-3xl bg-white/95 border border-[#d9d1c3] shadow-[0_14px_32px_rgba(12,38,27,0.08)]">
                    <p className="text-lg font-bold text-[#0f2c1f]">{item.title}</p>
                    <p className="text-sm text-[#3f4d46]">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-6 space-y-4">
              <div className="p-6 rounded-3xl bg-[#0f2c1f] text-[#e7f6eb] shadow-[0_18px_40px_rgba(11,44,31,0.4)]">
                <p className="text-[11px] uppercase tracking-[0.2em] opacity-80">Manifesto Aequi</p>
                <p className="text-2xl font-black mt-2">Menos vibezinha, mais caixa em ordem.</p>
                <p className="text-sm opacity-90 mt-3">
                  Priorizamos contraste, clareza e rituais diários. Cada tela foi desenhada para caber na rotina do
                  operador, não na estética de pitch deck.
                </p>
                <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
                  <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/20">Onboarding guiado</span>
                  <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/20">Treinamento de equipe</span>
                  <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/20">Playbook de centro de custos</span>
                  <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/20">Atualizações sem rebuliço visual</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/assinar"
                  className="px-5 py-3 rounded-xl bg-white text-[#0f2c1f] font-semibold border border-[#d9d1c3] shadow-[0_12px_28px_rgba(12,38,27,0.12)] hover:translate-y-[-1px] transition"
                >
                  Iniciar teste agora
                </Link>
                <Link
                  to="/app/ajustes"
                  className="px-5 py-3 rounded-xl border border-[#103826]/25 text-[#0f2c1f] font-semibold hover:bg-[#103826]/5 transition"
                >
                  Ver categorias e ajustes
                </Link>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-[#d9d1c3] bg-white/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="size-10 rounded-xl bg-[#103826] text-white font-black text-lg flex items-center justify-center">
                    A
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0f2c1f]">Aequi</p>
                    <p className="text-xs text-[#4c5b52]">Saúde Financeira para Restaurantes</p>
                  </div>
                </div>
                <p className="text-xs text-[#6a756e] max-w-xs">
                  Conciliação e controle financeiro para restaurantes iFood. Simplifique sua gestão e aumente sua margem.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
                <div>
                  <p className="font-semibold text-[#0f2c1f] mb-3">Produto</p>
                  <ul className="space-y-2 text-[#3f4d46]">
                    <li><a href="#beneficios" className="hover:text-[#0f2c1f]">Benefícios</a></li>
                    <li><a href="#planos" className="hover:text-[#0f2c1f]">Planos</a></li>
                    <li><a href="#resultados" className="hover:text-[#0f2c1f]">Resultados</a></li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-[#0f2c1f] mb-3">Conta</p>
                  <ul className="space-y-2 text-[#3f4d46]">
                    <li><Link to="/login" className="hover:text-[#0f2c1f]">Entrar</Link></li>
                    <li><Link to="/assinar" className="hover:text-[#0f2c1f]">Criar conta</Link></li>
                    <li><Link to="/app" className="hover:text-[#0f2c1f]">Painel</Link></li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-[#0f2c1f] mb-3">Legal</p>
                  <ul className="space-y-2 text-[#3f4d46]">
                    <li><Link to="/privacidade" className="hover:text-[#0f2c1f]">Privacidade</Link></li>
                    <li><Link to="/termos" className="hover:text-[#0f2c1f]">Termos de Uso</Link></li>
                    <li><Link to="/cookies" className="hover:text-[#0f2c1f]">Política de Cookies</Link></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-t border-[#d9d1c3] mt-8 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <p className="text-xs text-[#6a756e]">© 2026 Aequi. Todos os direitos reservados.</p>
              <div className="flex items-center gap-4 text-xs text-[#6a756e]">
                <span>CNPJ: 00.000.000/0001-00</span>
                <span>contato@aequi.com.br</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
