import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { FinancialChart } from '../components/FinancialChart';
import { DishList } from '../components/DishList';
import { 
  Calendar, 
  Bell, 
  Menu, 
  Banknote, 
  TrendingUp, 
  AlertTriangle, 
  ArrowRight,
  Download,
  Receipt
} from 'lucide-react';

const App: React.FC = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-surface-light border-b border-gray-100 z-10">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="font-bold text-navy">Aequi</span>
          </div>
          <button className="text-navy p-2">
            <Menu size={24} />
          </button>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:px-12 pb-24">
          <div className="max-w-7xl mx-auto flex flex-col gap-8">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-3xl md:text-4xl font-black text-navy tracking-tight leading-tight">
                  Olá, Chef! <br className="hidden md:block"/> Sua conta está fechando hoje?
                </h2>
                <p className="text-gray-500 font-medium">Visão geral do desempenho diário do seu restaurante.</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center justify-center size-12 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-navy hover:border-navy/30 transition-all shadow-sm">
                  <Calendar size={20} />
                </button>
                <button className="relative flex items-center justify-center size-12 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-navy hover:border-navy/30 transition-all shadow-sm">
                  <Bell size={20} />
                  <span className="absolute top-3 right-3 size-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                </button>
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Sales Card */}
              <div className="bg-surface-light p-6 rounded-2xl shadow-soft border border-gray-100 flex flex-col justify-between h-40 group hover:border-primary/30 transition-all">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-green-50 rounded-lg text-primary">
                    <Banknote size={24} />
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                    <TrendingUp size={14} /> 12%
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium">Vendas Totais (Hoje)</p>
                  <h3 className="text-2xl font-bold text-navy mt-1">R$ 12.450,00</h3>
                </div>
              </div>

              {/* Net Payment Card */}
              <div className="bg-surface-light p-6 rounded-2xl shadow-soft border border-gray-100 flex flex-col justify-between h-40 group hover:border-primary/30 transition-all">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <Receipt size={24} />
                  </div>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
                    Previsto: Amanhã
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium">Pagamento Líquido</p>
                  <h3 className="text-2xl font-bold text-navy mt-1">R$ 3.200,00</h3>
                </div>
              </div>

              {/* Divergence Alert Card */}
              <div className="relative bg-alert-bg p-6 rounded-2xl shadow-soft border border-alert-border flex flex-col justify-center gap-4 h-40 overflow-hidden">
                <div className="absolute -right-4 -top-4 text-yellow-500/10 rotate-12 pointer-events-none">
                  <AlertTriangle size={140} />
                </div>
                <div className="flex items-center gap-3 relative z-10">
                  <div className="size-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 shrink-0">
                    <AlertTriangle size={24} />
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-navy font-bold text-lg leading-tight">Alerta de Divergência</h4>
                    <p className="text-yellow-800 text-sm leading-snug opacity-90">Diferença de R$ 14,50 no repasse.</p>
                  </div>
                </div>
                <button className="relative z-10 w-fit px-4 py-2 bg-white/80 hover:bg-white text-yellow-800 text-sm font-bold rounded-lg border border-yellow-200/50 shadow-sm transition-all flex items-center gap-2">
                  Revisar Divergência
                  <ArrowRight size={14} />
                </button>
              </div>

            </div>

            {/* Main Content Split: Chart and Menu */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[420px]">
              
              {/* Financial Health Chart */}
              <div className="lg:col-span-2 bg-surface-light p-6 rounded-2xl shadow-soft border border-gray-100 flex flex-col">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-navy">Saúde Financeira</h3>
                    <p className="text-sm text-gray-500">Vendas vs. Pagamento Líquido (Últimos 7 Dias)</p>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-100">
                    <button className="px-3 py-1.5 bg-white text-navy text-xs font-bold rounded shadow-sm border border-gray-100">Semanal</button>
                    <button className="px-3 py-1.5 text-gray-500 hover:text-navy text-xs font-medium rounded transition-colors">Mensal</button>
                  </div>
                </div>
                
                <FinancialChart />
                
                <div className="flex items-center justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-[#2ECC71]"></span>
                    <span className="text-xs text-gray-500 font-medium">Vendas Totais</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-navy"></span>
                    <span className="text-xs text-gray-500 font-medium">Pagamento Líquido</span>
                  </div>
                </div>
              </div>

              {/* Profitable Dishes List */}
              <div className="bg-surface-light rounded-2xl shadow-soft border border-gray-100 flex flex-col overflow-hidden">
                <div className="p-6 pb-2">
                  <h3 className="text-lg font-bold text-navy">Pratos mais Lucrativos</h3>
                  <p className="text-sm text-gray-500">Itens com maior margem esta semana</p>
                </div>
                <DishList />
                <div className="p-4 border-t border-gray-100">
                  <button className="w-full py-2 text-sm text-primary font-bold hover:bg-green-50 rounded-lg transition-colors">
                    Ver Análise Completa do Menu
                  </button>
                </div>
              </div>

            </div>

            {/* Bottom Banners */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-navy to-slate-800 rounded-2xl p-6 text-white flex items-center justify-between shadow-lg">
                <div>
                  <h3 className="text-lg font-bold mb-1">Baixar Relatório Mensal</h3>
                  <p className="text-slate-300 text-sm">Obtenha um PDF detalhado das suas conciliações.</p>
                </div>
                <button className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl transition-colors">
                  <Download size={24} />
                </button>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-red-50 p-3 rounded-xl text-red-500">
                    <Receipt size={24} />
                  </div>
                  <div>
                    <h3 className="text-navy font-bold text-base">Taxas iFood</h3>
                    <p className="text-gray-500 text-sm">Dedução do período atual</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-navy">- R$ 845,20</span>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;