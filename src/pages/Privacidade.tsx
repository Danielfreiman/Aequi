import { Link } from 'react-router-dom';

export function Privacidade() {
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
        <h1 className="text-3xl font-black text-[#0c261b] mb-8">Política de Privacidade</h1>
        
        <div className="prose prose-slate max-w-none space-y-6">
          <p className="text-[#3f4d46]">
            <strong>Última atualização:</strong> Janeiro de 2026
          </p>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#0c261b]">1. Informações que Coletamos</h2>
            <p className="text-[#3f4d46]">
              A Aequi coleta informações que você nos fornece diretamente, como nome, e-mail, dados da empresa e informações financeiras necessárias para a prestação dos nossos serviços de gestão financeira para restaurantes.
            </p>
            <ul className="list-disc pl-6 text-[#3f4d46] space-y-2">
              <li>Dados de cadastro: nome, e-mail, telefone, CNPJ</li>
              <li>Dados financeiros: transações, extratos, contas a pagar e receber</li>
              <li>Dados de integração: informações do iFood e outros parceiros</li>
              <li>Dados de uso: logs de acesso, preferências e configurações</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#0c261b]">2. Como Usamos suas Informações</h2>
            <p className="text-[#3f4d46]">
              Utilizamos suas informações para:
            </p>
            <ul className="list-disc pl-6 text-[#3f4d46] space-y-2">
              <li>Fornecer e manter nossos serviços de gestão financeira</li>
              <li>Processar transações e conciliações bancárias</li>
              <li>Enviar comunicações sobre o serviço e atualizações</li>
              <li>Melhorar nossos produtos e desenvolver novos recursos</li>
              <li>Cumprir obrigações legais e regulatórias</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#0c261b]">3. Compartilhamento de Dados</h2>
            <p className="text-[#3f4d46]">
              Não vendemos suas informações pessoais. Podemos compartilhar dados com:
            </p>
            <ul className="list-disc pl-6 text-[#3f4d46] space-y-2">
              <li>Provedores de serviço que nos auxiliam na operação (hospedagem, pagamentos)</li>
              <li>Parceiros de integração (iFood, bancos) mediante sua autorização</li>
              <li>Autoridades legais quando exigido por lei</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#0c261b]">4. Segurança dos Dados</h2>
            <p className="text-[#3f4d46]">
              Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações, incluindo criptografia, controles de acesso e monitoramento contínuo.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#0c261b]">5. Seus Direitos (LGPD)</h2>
            <p className="text-[#3f4d46]">
              Conforme a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
            </p>
            <ul className="list-disc pl-6 text-[#3f4d46] space-y-2">
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos ou desatualizados</li>
              <li>Solicitar a exclusão de seus dados</li>
              <li>Revogar consentimento a qualquer momento</li>
              <li>Portabilidade dos dados</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#0c261b]">6. Contato</h2>
            <p className="text-[#3f4d46]">
              Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato:
            </p>
            <p className="text-[#3f4d46]">
              <strong>E-mail:</strong> privacidade@aequi.com.br<br />
              <strong>Encarregado de Dados (DPO):</strong> dpo@aequi.com.br
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
