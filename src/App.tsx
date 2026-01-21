import { BrowserRouter, Navigate, Route, Routes, Outlet } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { Sidebar } from './components/layout/Sidebar';
import { Home } from './pages/Home.tsx';
import { Login } from './pages/Login.tsx';
import { Dashboard } from './pages/Dashboard.tsx';
import { Conciliacao } from './pages/Conciliacao.tsx';
import { Cardapio } from './pages/Cardapio.tsx';
import { Financeiro } from './pages/Financeiro.tsx';
import { Dre } from './pages/Dre.tsx';
import { ContasPagar } from './pages/ContasPagar.tsx';
import { ContasReceber } from './pages/ContasReceber.tsx';
import { Ponto } from './pages/Ponto.tsx';
import { Rh } from './pages/Rh.tsx';
import { Ajustes } from './pages/Ajustes.tsx';
import { Assinatura } from './pages/Assinatura.tsx';
import { Operacoes } from './pages/Operacoes.tsx';
import { Privacidade } from './pages/Privacidade.tsx';
import { Termos } from './pages/Termos.tsx';
import { Cookies } from './pages/Cookies.tsx';
import { ImportarProdutos } from './pages/ImportarProdutos.tsx';
import { IntegracaoIFood } from './pages/IntegracaoIFood';
import { Produtos } from './pages/Produtos.tsx';
import { useAuthSession } from './hooks/useAuthSession';

const DashboardLayout = () => {
  const { logout, session } = useAuthSession();

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-[#f7f4ec] text-[#0f1720]">
      <div className="absolute inset-0 opacity-[0.55]" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(46,204,113,0.12),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(12,54,36,0.16),transparent_32%),radial-gradient(circle_at_15%_70%,rgba(255,255,255,0.75),transparent_40%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(19,32,24,0.04)_0%,rgba(19,32,24,0)_40%,rgba(19,32,24,0.04)_70%)]" />
      </div>
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="sticky top-0 flex items-center justify-between p-4 backdrop-blur bg-[#f7f4ec]/85 border-b border-[#d9d1c3] z-10">
          <div className="flex items-center gap-2 md:hidden">
            <div className="size-8 rounded-lg bg-[#103826] flex items-center justify-center shadow-[0_12px_30px_rgba(11,44,31,0.18)]">
              <span className="text-white font-black text-lg">A</span>
            </div>
            <span className="font-black text-[#0f2c1f]">Aequi</span>
          </div>
          <div className="hidden md:block" />
          <div className="flex items-center gap-4">
            {session && (
              <span className="text-sm text-[#3f4d46] hidden sm:block">
                {session.user?.email}
              </span>
            )}
            <button 
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
          <button className="md:hidden text-[#0f2c1f] p-2" aria-label="Abrir menu">
            <Menu size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:px-12 pb-24 relative">
          <div className="max-w-7xl mx-auto flex flex-col gap-8 relative">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/assinar" element={<Assinatura />} />
      <Route path="/privacidade" element={<Privacidade />} />
      <Route path="/termos" element={<Termos />} />
      <Route path="/cookies" element={<Cookies />} />
      <Route path="/app" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="conciliacao" element={<Conciliacao />} />
        <Route path="cardapio" element={<Cardapio />} />
        <Route path="importar-produtos" element={<ImportarProdutos />} />
        <Route path="integracao-ifood" element={<IntegracaoIFood />} />
        <Route path="produtos" element={<Produtos />} />
        <Route path="financeiro" element={<Financeiro />} />
        <Route path="dre" element={<Dre />} />
        <Route path="contas-pagar" element={<ContasPagar />} />
        <Route path="contas-receber" element={<ContasReceber />} />
        <Route path="ponto" element={<Ponto />} />
        <Route path="rh" element={<Rh />} />
        <Route path="ajustes" element={<Ajustes />} />
        <Route path="operacoes" element={<Operacoes />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;