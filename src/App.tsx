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
import { IntegracaoIFood } from './pages/IntegracaoIFood.tsx';
import { useAuthSession } from './hooks/useAuthSession';

const DashboardLayout = () => {
  const { logout, session } = useAuthSession();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="flex items-center justify-between p-4 bg-surface-light border-b border-gray-100 z-10">
          <div className="flex items-center gap-2 md:hidden">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="font-bold text-navy">Aequi</span>
          </div>
          <div className="hidden md:block" />
          <div className="flex items-center gap-4">
            {session && (
              <span className="text-sm text-slate-600 hidden sm:block">
                {session.user?.email}
              </span>
            )}
            <button 
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
          <button className="md:hidden text-navy p-2" aria-label="Abrir menu">
            <Menu size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:px-12 pb-24">
          <div className="max-w-7xl mx-auto flex flex-col gap-8">
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