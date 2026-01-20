export function Home() {
  const receivable = 3200; // contas a receber (iFood) simulado
  const payable = 1850; // contas a pagar (fornecedores) simulado

  return (
    <section className="grid gap-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white shadow-sm border">
          <p className="text-sm text-slate-500">Contas a Receber (iFood)</p>
          <p className="text-3xl font-black text-primary">R$ {receivable.toFixed(2)}</p>
        </div>
        <div className="p-4 rounded-xl bg-white shadow-sm border">
          <p className="text-sm text-slate-500">Contas a Pagar (Fornecedores)</p>
          <p className="text-3xl font-black text-navy">R$ {payable.toFixed(2)}</p>
        </div>
      </div>
      <div className="p-4 rounded-xl bg-gradient-to-r from-navy to-slate-800 text-white shadow">
        <p className="text-sm opacity-80">Saldo projetado</p>
        <p className="text-4xl font-black">R$ {(receivable - payable).toFixed(2)}</p>
        <p className="text-xs opacity-80 mt-1">Baseado em repasse iFood previsto e contas a pagar abertas.</p>
      </div>
    </section>
  );
}
