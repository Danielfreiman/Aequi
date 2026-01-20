import { Link } from 'react-router-dom';

export function Cookies() {
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
        <h1 className="text-3xl font-black text-[#0c261b] mb-8">Política de Cookies</h1>
        
        <div className="prose prose-slate max-w-none space-y-6">
          <p className="text-[#3f4d46]">
            <strong>Última atualização:</strong> Janeiro de 2026
          </p>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#0c261b]">1. O que são Cookies?</h2>
            <p className="text-[#3f4d46]">
              Cookies são pequenos arquivos de texto armazenados no seu dispositivo quando você visita nosso site. Eles nos ajudam a lembrar suas preferências, entender como você usa nossa plataforma e melhorar sua experiência.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#0c261b]">2. Tipos de Cookies que Usamos</h2>
            
            <div className="bg-white/90 rounded-2xl border border-[#d9d1c3] p-5 space-y-4">
              <h3 className="font-bold text-[#0c261b]">Cookies Essenciais</h3>
              <p className="text-[#3f4d46] text-sm">
                Necessários para o funcionamento básico do site. Incluem cookies de sessão e autenticação.
              </p>
              <ul className="list-disc pl-6 text-[#3f4d46] text-sm space-y-1">
                <li><strong>sb-auth-token:</strong> Autenticação do usuário (Supabase)</li>
                <li><strong>session_id:</strong> Identificação da sessão</li>
              </ul>
            </div>

            <div className="bg-white/90 rounded-2xl border border-[#d9d1c3] p-5 space-y-4">
              <h3 className="font-bold text-[#0c261b]">Cookies de Preferências</h3>
              <p className="text-[#3f4d46] text-sm">
                Permitem que o site lembre suas escolhas e preferências.
              </p>
              <ul className="list-disc pl-6 text-[#3f4d46] text-sm space-y-1">
                <li><strong>theme:</strong> Tema visual preferido</li>
                <li><strong>sidebar_collapsed:</strong> Estado da barra lateral</li>
                <li><strong>selected_store:</strong> Loja selecionada</li>
              </ul>
            </div>

            <div className="bg-white/90 rounded-2xl border border-[#d9d1c3] p-5 space-y-4">
              <h3 className="font-bold text-[#0c261b]">Cookies de Análise</h3>
              <p className="text-[#3f4d46] text-sm">
                Nos ajudam a entender como os visitantes interagem com o site.
              </p>
              <ul className="list-disc pl-6 text-[#3f4d46] text-sm space-y-1">
                <li><strong>_ga:</strong> Google Analytics - identificador único</li>
                <li><strong>_gid:</strong> Google Analytics - sessão do usuário</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#0c261b]">3. Duração dos Cookies</h2>
            <p className="text-[#3f4d46]">
              Os cookies podem ser:
            </p>
            <ul className="list-disc pl-6 text-[#3f4d46] space-y-2">
              <li><strong>Cookies de sessão:</strong> Excluídos quando você fecha o navegador</li>
              <li><strong>Cookies persistentes:</strong> Permanecem por um período definido (geralmente 30 dias a 2 anos)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#0c261b]">4. Como Gerenciar Cookies</h2>
            <p className="text-[#3f4d46]">
              Você pode controlar e/ou excluir cookies através das configurações do seu navegador:
            </p>
            <ul className="list-disc pl-6 text-[#3f4d46] space-y-2">
              <li><strong>Chrome:</strong> Configurações → Privacidade e segurança → Cookies</li>
              <li><strong>Firefox:</strong> Opções → Privacidade e Segurança → Cookies</li>
              <li><strong>Safari:</strong> Preferências → Privacidade → Cookies</li>
              <li><strong>Edge:</strong> Configurações → Privacidade → Cookies</li>
            </ul>
            <p className="text-[#3f4d46] mt-4">
              <strong>Atenção:</strong> Desabilitar cookies essenciais pode afetar o funcionamento da plataforma, incluindo a impossibilidade de manter sua sessão ativa.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#0c261b]">5. Cookies de Terceiros</h2>
            <p className="text-[#3f4d46]">
              Utilizamos serviços de terceiros que podem definir seus próprios cookies:
            </p>
            <ul className="list-disc pl-6 text-[#3f4d46] space-y-2">
              <li><strong>Supabase:</strong> Autenticação e banco de dados</li>
              <li><strong>AbacatePay:</strong> Processamento de pagamentos</li>
              <li><strong>Google Analytics:</strong> Análise de uso (opcional)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#0c261b]">6. Atualizações desta Política</h2>
            <p className="text-[#3f4d46]">
              Podemos atualizar esta política periodicamente. Recomendamos verificar esta página regularmente para estar ciente de quaisquer mudanças.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#0c261b]">7. Contato</h2>
            <p className="text-[#3f4d46]">
              Para dúvidas sobre nossa política de cookies:<br />
              <strong>E-mail:</strong> privacidade@aequi.com.br
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
