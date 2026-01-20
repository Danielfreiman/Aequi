import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type TimeCard = {
  id: string;
  employee_external_id: string | null;
  date: string;
  check_in: string | null;
  check_out: string | null;
  hours_worked: number | null;
  notes: string | null;
};

type Employee = {
  id: string;
  external_id: string | null;
  name: string | null;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-BR');
};

export function Ponto() {
  const [timeCards, setTimeCards] = useState<TimeCard[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthTotal, setMonthTotal] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      const [{ data: timeData, error: timeError }, { data: empData, error: empError }] = await Promise.all([
        supabase
          .from('hr_time_cards')
          .select('id,employee_external_id,date,check_in,check_out,hours_worked,notes')
          .order('date', { ascending: false }),
        supabase.from('hr_employees').select('id,external_id,name'),
      ]);

      if (timeError || empError) {
        setError(timeError?.message || empError?.message || 'Erro ao carregar dados.');
      } else {
        setTimeCards(timeData || []);
        setEmployees(empData || []);
        // calcula total de horas por funcionário no mês corrente
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const totals = (timeData || []).reduce<Record<string, number>>((acc, card) => {
          const d = new Date(card.date);
          if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            const hours = card.hours_worked || 0;
            const key = card.employee_external_id || 'sem-id';
            acc[key] = (acc[key] || 0) + hours;
          }
          return acc;
        }, {});
        setMonthTotal(totals);
      }
      setLoading(false);
    };

    loadData();
  }, []);

  const employeeMap = useMemo(() => {
    return employees.reduce<Record<string, string>>((acc, employee) => {
      if (employee.external_id && employee.name) {
        acc[employee.external_id] = employee.name;
      }
      return acc;
    }, {});
  }, [employees]);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-navy">Ponto</h2>
        <p className="text-slate-600 text-sm">Registros de entrada/saída e horas trabalhadas, com total do mês por colaborador.</p>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

      <div className="rounded-2xl bg-white border border-slate-100 shadow-soft overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-navy">Horas no mês</h3>
          <div className="mt-3 grid md:grid-cols-3 gap-3">
            {Object.entries(monthTotal).map(([employeeId, total]) => (
              <div key={employeeId} className="p-4 rounded-xl border border-slate-100 bg-slate-50 text-sm">
                <p className="font-semibold text-navy">{employeeMap[employeeId] || 'Funcionário'}</p>
                <p className="text-slate-600">{total.toFixed(1)} horas</p>
              </div>
            ))}
            {!loading && Object.keys(monthTotal).length === 0 && (
              <div className="text-sm text-slate-500">Sem lançamentos no mês atual.</div>
            )}
          </div>
        </div>
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-navy">Últimos registros</h3>
          <p className="text-sm text-slate-500">{loading ? 'Carregando...' : `${timeCards.length} registros`}</p>
        </div>
        <div className="divide-y divide-slate-100">
          {timeCards.map((card) => (
            <div key={card.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-4 text-sm">
              <div className="font-semibold text-navy">
                {employeeMap[card.employee_external_id || ''] || 'Funcionário'}
              </div>
              <div className="text-slate-500">{formatDate(card.date)}</div>
              <div className="text-slate-500">Entrada: {card.check_in || '--'}</div>
              <div className="text-slate-500">Saída: {card.check_out || '--'}</div>
              <div className="text-slate-500">Horas: {card.hours_worked ?? '--'}</div>
              <div className="text-slate-500">{card.notes || 'Sem observações'}</div>
            </div>
          ))}
          {!loading && timeCards.length === 0 && (
            <div className="p-6 text-sm text-slate-500">Nenhum registro de ponto encontrado.</div>
          )}
        </div>
      </div>
    </section>
  );
}
