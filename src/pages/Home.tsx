import { useEffect, useState } from 'react';

export function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Bem-vindo ao Aequi</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="space-y-6">
          <h2 className="text-xl font-semibold">Saúde Financeira para Restaurantes</h2>
          <p className="text-slate-600">Simplifique a gestão financeira do seu restaurante com o Aequi.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl bg-white border border-slate-100 p-5 shadow-soft">
              <h3 className="text-lg font-bold">Controle de Receitas</h3>
              <p className="text-slate-500">Acompanhe suas receitas e despesas em tempo real.</p>
            </div>
            <div className="rounded-xl bg-white border border-slate-100 p-5 shadow-soft">
              <h3 className="text-lg font-bold">Gestão de Pagamentos</h3>
              <p className="text-slate-500">Organize seus pagamentos e mantenha tudo em dia.</p>
            </div>
            <div className="rounded-xl bg-white border border-slate-100 p-5 shadow-soft">
              <h3 className="text-lg font-bold">Relatórios Detalhados</h3>
              <p className="text-slate-500">Obtenha insights financeiros para tomar decisões estratégicas.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
