import { Link } from 'react-router-dom';

export function Termos() {
  return (
    <div className="min-h-screen bg-[#f7f4ec] text-[#0f1720]">
      <header className="sticky top-0 z-20 backdrop-blur bg-[#f7f4ec]/85 border-b border-[#d9d1c3]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-[#103826] text-white font-black text-lg flex items-center justify-center">
              A
            </div>
            <span className="text-lg font-black tracking-tight">Aequi</span>
          </Link>
          <Link to="/" className="text-sm text-[#103826] hover:underline">
            ← Voltar
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-black text-[#0c261b] mb-8">Termos de Uso</h1>
        
        <div className="prose prose-slate max-w-none space-y-6">
          <p className="text-[#3f4d46]">
            <strong>Última atualização:</strong> Janeiro de 2026
          </p>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#0c261b]">1. Aceitação dos Termos</h2>
            <p className="text-[#3f4d46]">
              Ao acessar e usar a plataforma Aequi, você concorda com estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não poderá acessar o serviço.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#0c261b]">2. Descrição do Serviço</h2>
            <p className="text-[#3f4d46]">
              A Aequi é uma plataforma de gestão financeira especializada para restaurantes, oferecendo:
            </p>
            <ul className="list-disc pl-6 text-[#3f4d46] space-y-2">
              <li>Conciliação automática de repasses iFood</li>
              <li>Controle de contas a pagar e receber</li>
              <li>Gestão de CMV e ficha técnica</li>
              <li>Relatórios financeiros (DRE)</li>
              <li>Importação de extratos bancários</li>
              <li>Integração com plataformas de delivery</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#0c261b]">3. Cadastro e Conta</h2>
            <p className="text-[#3f4d46]">
              Para utilizar nossos serviços, você deve:
            </p>
            <ul className="list-disc pl-6 text-[#3f4d46] space-y-2">
              <li>Ter pelo menos 18 anos de idade</li>
              <li>Fornecer informações verdadeiras e completas</li>
              <li>Manter suas credenciais de acesso em sigilo</li>
              <li>Notificar imediatamente sobre uso não autorizado</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#0c261b]">4. Planos e Pagamentos</h2>
            <p className="text-[#3f4d46]">
              A Aequi oferece diferentes planos de assinatura:
            </p>
            <ul className="list-disc pl-6 text-[#3f4d46] space-y-2">
              <li><strong>Base:</strong> R$ 89/mês (até 1 loja) - inclui 7 dias grátis</li>
              <li><strong>Growth:</strong> R$ 149/mês (até 3 lojas)</li>
              <li><strong>Scale:</strong> R$ 249/mês (até 5 lojas)</li>
            </ul>
            <p className="text-[#3f4d46]">
              Os pagamentos são processados mensalmente via AbacatePay. O cancelamento pode ser feito a qualquer momento, com acesso até o fim do período pago.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#0c261b]">5. Uso Aceitável</h2>
            <p className="text-[#3f4d46]">
              Você concorda em não:
            </p>
            <ul className="list-disc pl-6 text-[#3f4d46] space-y-2">
              <li>Violar leis ou regulamentos aplicáveis</li>
              <li>Compartilhar sua conta com terceiros não autorizados</li>
              <li>Tentar acessar sistemas ou dados sem autorização</li>
              <li>Usar o serviço para fins ilegais ou fraudulentos</li>
              <li>Realizar engenharia reversa do software</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#0c261b]">6. Propriedade Intelectual</h2>
            <p className="text-[#3f4d46]">
              Todo o conteúdo, design, código e funcionalidades da plataforma Aequi são de propriedade exclusiva da empresa. Você recebe uma licença limitada e não exclusiva para uso pessoal do serviço.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#0c261b]">7. Limitação de Responsabilidade</h2>
            <p className="text-[#3f4d46]">
              A Aequi não se responsabiliza por:
            </p>
            <ul className="list-disc pl-6 text-[#3f4d46] space-y-2">
              <li>Decisões financeiras tomadas com base nos dados da plataforma</li>
              <li>Interrupções temporárias do serviço para manutenção</li>
              <li>Erros em dados importados de terceiros (iFood, bancos)</li>
              <li>Perdas indiretas ou consequenciais</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#0c261b]">8. Rescisão</h2>
            <p className="text-[#3f4d46]">
              Podemos suspender ou encerrar sua conta em caso de violação destes termos. Você pode cancelar sua conta a qualquer momento através das configurações ou entrando em contato conosco.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#0c261b]">9. Alterações nos Termos</h2>
            <p className="text-[#3f4d46]">
              Podemos atualizar estes termos periodicamente. Notificaremos sobre mudanças significativas por e-mail ou através da plataforma. O uso continuado após alterações constitui aceitação dos novos termos.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#0c261b]">10. Contato</h2>
            <p className="text-[#3f4d46]">
              Para dúvidas sobre estes termos:<br />
              <strong>E-mail:</strong> contato@aequi.com.br<br />
              <strong>Suporte:</strong> suporte@aequi.com.br
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#0c261b]">11. Foro</h2>
            <p className="text-[#3f4d46]">
              Estes termos são regidos pelas leis brasileiras. Fica eleito o foro da comarca de São Paulo/SP para dirimir quaisquer controvérsias.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-[#d9d1c3] bg-white/80 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-xs text-[#6a756e]">
          © 2026 Aequi. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
