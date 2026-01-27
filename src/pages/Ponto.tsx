import { FormEvent, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { usePunchOnlyAccess } from '../hooks/usePunchOnlyAccess';
type TimeCard = {
  id: string;
  employee_id: string | null;
  employee_external_id: string | null;
  date: string;
  check_in: string | null;
  check_out: string | null;
  lunch_start: string | null;
  lunch_end: string | null;
  hours_worked: number | null;
  notes: string | null;
};
type Employee = {
  id: string;
  external_id: string | null;
  name: string | null;
  email: string | null;
  role: string | null;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-BR');
};

const formatMonthLabel = (value: string) => {
  const [year, month] = value.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
};

const timeToMinutes = (time: string | null) => {
  if (!time) return null;
  const [hours, minutes] = time.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
};

const calculateHours = (checkIn: string | null, checkOut: string | null, lunchStart: string | null, lunchEnd: string | null) => {
  const start = timeToMinutes(checkIn);
  const end = timeToMinutes(checkOut);
  if (start === null || end === null) return null;
  let totalMinutes = Math.max(end - start, 0);
  const lunchStartMin = timeToMinutes(lunchStart);
  const lunchEndMin = timeToMinutes(lunchEnd);
  if (lunchStartMin !== null && lunchEndMin !== null) {
    totalMinutes -= Math.max(lunchEndMin - lunchStartMin, 0);
  }
  return Math.round((totalMinutes / 60) * 100) / 100;
};

const todayISO = () => new Date().toISOString().slice(0, 10);
const nowTime = () => new Date().toTimeString().slice(0, 5);

export function Ponto() {
  const { isPunchOnly, employee, profileId } = usePunchOnlyAccess();
  const [timeCards, setTimeCards] = useState<TimeCard[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    employeeId: '',
    dateFrom: '',
    dateTo: '',
  });

  const [monthRef, setMonthRef] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  const [punchMonthRef, setPunchMonthRef] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  const [newEntry, setNewEntry] = useState({
    employeeId: '',
    date: todayISO(),
    checkIn: '',
    checkOut: '',
    lunchStart: '',
    lunchEnd: '',
    hoursWorked: '',
    notes: '',
  });

  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      const [{ data: timeData, error: timeError }, { data: empData, error: empError }] = await Promise.all([
        supabase
          .from('hr_time_cards')
          .select('id,employee_id,employee_external_id,date,check_in,check_out,lunch_start,lunch_end,hours_worked,notes')
          .order('date', { ascending: false }),
        supabase.from('hr_employees').select('id,external_id,name,email,role'),
      ]);

      if (timeError || empError) {
        setError(timeError?.message || empError?.message || 'Erro ao carregar dados.');
      } else {
        setTimeCards(timeData || []);
        setEmployees(empData || []);
      }
      setLoading(false);
    };

    loadData();
  }, []);

  const employeeById = useMemo(() => {
    return employees.reduce<Record<string, Employee>>((acc, employee) => {
      acc[employee.id] = employee;
      return acc;
    }, {});
  }, [employees]);

  const employeeByExternal = useMemo(() => {
    return employees.reduce<Record<string, Employee>>((acc, employee) => {
      if (employee.external_id) {
        acc[employee.external_id] = employee;
      }
      return acc;
    }, {});
  }, [employees]);

  const getEmployeeLabel = (card: TimeCard) => {
    if (card.employee_id && employeeById[card.employee_id]?.name) {
      return employeeById[card.employee_id].name || 'Funcionário';
    }
    if (card.employee_external_id && employeeByExternal[card.employee_external_id]?.name) {
      return employeeByExternal[card.employee_external_id].name || 'Funcionário';
    }
    return 'Funcionário';
  };

  const filteredTimeCards = useMemo(() => {
    return timeCards.filter((card) => {
      if (filters.employeeId) {
        const matchesId = card.employee_id === filters.employeeId;
        const matchesExternal = card.employee_external_id && employeeById[filters.employeeId]?.external_id
          ? card.employee_external_id === employeeById[filters.employeeId]?.external_id
          : false;
        if (!matchesId && !matchesExternal) return false;
      }
      if (filters.dateFrom && card.date < filters.dateFrom) return false;
      if (filters.dateTo && card.date > filters.dateTo) return false;
      return true;
    });
  }, [timeCards, filters, employeeById]);

  const monthTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    const [year, month] = monthRef.split('-').map(Number);
    filteredTimeCards.forEach((card) => {
      const d = new Date(card.date);
      if (d.getFullYear() === year && d.getMonth() + 1 === month) {
        const key = card.employee_id || card.employee_external_id || 'sem-id';
        totals[key] = (totals[key] || 0) + (card.hours_worked || 0);
      }
    });
    return totals;
  }, [filteredTimeCards, monthRef]);

  const monthlySeries = useMemo(() => {
    const totals: Record<string, number> = {};
    filteredTimeCards.forEach((card) => {
      const d = new Date(card.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      totals[key] = (totals[key] || 0) + (card.hours_worked || 0);
    });
    return Object.entries(totals)
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .slice(0, 8);
  }, [filteredTimeCards]);

  const handleAddEntry = async (event: FormEvent) => {
    event.preventDefault();
    setActionMessage(null);

    if (!profileId) {
      setActionMessage('Perfil não encontrado para salvar lançamento.');
      return;
    }
    if (!newEntry.employeeId || !newEntry.date) {
      setActionMessage('Informe funcionário e data.');
      return;
    }

    const selectedEmployee = employeeById[newEntry.employeeId];
    const computedHours = newEntry.hoursWorked
      ? Number(newEntry.hoursWorked)
      : calculateHours(
          newEntry.checkIn || null,
          newEntry.checkOut || null,
          newEntry.lunchStart || null,
          newEntry.lunchEnd || null,
        );

    const payload = {
      profile_id: profileId,
      employee_id: newEntry.employeeId,
      employee_external_id: selectedEmployee?.external_id || null,
      date: newEntry.date,
      check_in: newEntry.checkIn || null,
      check_out: newEntry.checkOut || null,
      lunch_start: newEntry.lunchStart || null,
      lunch_end: newEntry.lunchEnd || null,
      hours_worked: computedHours,
      notes: newEntry.notes || null,
    };

    const { data, error: insertError } = await supabase
      .from('hr_time_cards')
      .insert(payload)
      .select('id,employee_id,employee_external_id,date,check_in,check_out,lunch_start,lunch_end,hours_worked,notes')
      .single();

    if (insertError) {
      setActionMessage(insertError.message);
      return;
    }

    setTimeCards((prev) => [data, ...prev]);
    setNewEntry({
      employeeId: '',
      date: todayISO(),
      checkIn: '',
      checkOut: '',
      lunchStart: '',
      lunchEnd: '',
      hoursWorked: '',
      notes: '',
    });
    setActionMessage('Lançamento registrado.');
  };

  const handlePunch = async (type: 'check_in' | 'check_out') => {
    setActionMessage(null);
    if (!profileId || !employee?.id) {
      setActionMessage('Funcionário não identificado para bater ponto.');
      return;
    }

    const date = todayISO();
    const time = nowTime();

    const { data: existing, error: fetchError } = await supabase
      .from('hr_time_cards')
      .select('id,check_in,check_out,lunch_start,lunch_end')
      .eq('profile_id', profileId)
      .eq('employee_id', employee.id)
      .eq('date', date)
      .maybeSingle();

    if (fetchError) {
      setActionMessage(fetchError.message);
      return;
    }

    if (existing?.id) {
      const updated = {
        [type]: time,
      } as Record<string, string>;

      const computedHours = calculateHours(
        type === 'check_in' ? time : existing.check_in,
        type === 'check_out' ? time : existing.check_out,
        existing.lunch_start,
        existing.lunch_end,
      );

      const { data, error: updateError } = await supabase
        .from('hr_time_cards')
        .update({ ...updated, hours_worked: computedHours })
        .eq('id', existing.id)
        .select('id,employee_id,employee_external_id,date,check_in,check_out,lunch_start,lunch_end,hours_worked,notes')
        .single();

      if (updateError) {
        setActionMessage(updateError.message);
        return;
      }

      setTimeCards((prev) => prev.map((card) => (card.id === data.id ? data : card)));
      setActionMessage(type === 'check_in' ? 'Entrada registrada.' : 'Saída registrada.');
      return;
    }

    const { data, error: insertError } = await supabase
      .from('hr_time_cards')
      .insert({
        profile_id: profileId,
        employee_id: employee.id,
        employee_external_id: employee.external_id,
        date,
        check_in: type === 'check_in' ? time : null,
        check_out: type === 'check_out' ? time : null,
      })
      .select('id,employee_id,employee_external_id,date,check_in,check_out,lunch_start,lunch_end,hours_worked,notes')
      .single();

    if (insertError) {
      setActionMessage(insertError.message);
      return;
    }

    setTimeCards((prev) => [data, ...prev]);
    setActionMessage(type === 'check_in' ? 'Entrada registrada.' : 'Saída registrada.');
  };

  const punchCards = useMemo(() => {
    if (!employee?.id) return [] as TimeCard[];
    return timeCards.filter((card) => card.employee_id === employee.id).slice(0, 10);
  }, [timeCards, employee?.id]);

  const punchMonthCards = useMemo(() => {
    if (!employee?.id) return [] as TimeCard[];
    const [year, month] = punchMonthRef.split('-').map(Number);
    return timeCards.filter((card) => {
      if (card.employee_id !== employee.id) return false;
      const d = new Date(card.date);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });
  }, [timeCards, employee?.id, punchMonthRef]);

  if (isPunchOnly) {
    return (
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-navy">Bater ponto</h2>
          <p className="text-slate-600 text-sm">Registre sua entrada e saída de forma rápida.</p>
        </div>

        {actionMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {actionMessage}
          </div>
        )}

        {!employee && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            Seu usuário ainda não está vinculado a um colaborador no RH.
          </div>
        )}

        <div className="rounded-2xl bg-white border border-slate-100 shadow-soft p-6 flex flex-col gap-4">
          <div>
            <p className="text-sm text-slate-500">Funcionário</p>
            <p className="text-lg font-semibold text-navy">{employee?.name || '—'}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handlePunch('check_in')}
              className="px-5 py-3 rounded-xl bg-[#103826] text-white font-semibold hover:brightness-110 transition"
              disabled={!employee}
            >
              Registrar entrada
            </button>
            <button
              type="button"
              onClick={() => handlePunch('check_out')}
              className="px-5 py-3 rounded-xl bg-[#2ecc71] text-white font-semibold hover:brightness-110 transition"
              disabled={!employee}
            >
              Registrar saída
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-100 shadow-soft overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-navy">Marcações do mês</h3>
                <p className="text-sm text-slate-500">
                  {loading ? 'Carregando...' : `${punchMonthCards.length} registros`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-500">Mês</label>
                <input
                  type="month"
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={punchMonthRef}
                  onChange={(event) => setPunchMonthRef(event.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {punchMonthCards.map((card) => (
              <div key={card.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 text-sm">
                <div className="font-semibold text-navy">{formatDate(card.date)}</div>
                <div className="text-slate-500">Entrada: {card.check_in || '--'}</div>
                <div className="text-slate-500">Saída: {card.check_out || '--'}</div>
                <div className="text-slate-500">Horas: {card.hours_worked ?? '--'}</div>
              </div>
            ))}
            {!loading && punchMonthCards.length === 0 && (
              <div className="p-6 text-sm text-slate-500">Nenhum registro ainda.</div>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-navy">Ponto</h2>
        <p className="text-slate-600 text-sm">
          Registros de entrada/saída, filtros por colaborador e resumo mensal das horas trabalhadas.
        </p>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}
      {actionMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {actionMessage}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-100 shadow-soft p-5">
          <h3 className="text-lg font-bold text-navy">Novo lançamento</h3>
          <form className="mt-4 grid md:grid-cols-2 gap-4" onSubmit={handleAddEntry}>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">Funcionário</label>
              <select
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={newEntry.employeeId}
                onChange={(event) => setNewEntry({ ...newEntry, employeeId: event.target.value })}
              >
                <option value="">Selecione...</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">Data</label>
              <input
                type="date"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={newEntry.date}
                onChange={(event) => setNewEntry({ ...newEntry, date: event.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">Entrada</label>
              <input
                type="time"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={newEntry.checkIn}
                onChange={(event) => setNewEntry({ ...newEntry, checkIn: event.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">Saída</label>
              <input
                type="time"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={newEntry.checkOut}
                onChange={(event) => setNewEntry({ ...newEntry, checkOut: event.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">Início almoço</label>
              <input
                type="time"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={newEntry.lunchStart}
                onChange={(event) => setNewEntry({ ...newEntry, lunchStart: event.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">Fim almoço</label>
              <input
                type="time"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={newEntry.lunchEnd}
                onChange={(event) => setNewEntry({ ...newEntry, lunchEnd: event.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">Horas trabalhadas</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={newEntry.hoursWorked}
                onChange={(event) => setNewEntry({ ...newEntry, hoursWorked: event.target.value })}
                placeholder="Auto"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">Observações</label>
              <input
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={newEntry.notes}
                onChange={(event) => setNewEntry({ ...newEntry, notes: event.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full md:w-auto px-5 py-3 rounded-xl bg-[#103826] text-white font-semibold hover:brightness-110 transition"
              >
                Salvar lançamento
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-2xl bg-white border border-slate-100 shadow-soft p-5 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-navy">Filtros</h3>
            <p className="text-sm text-slate-500">Refine por colaborador e período.</p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">Funcionário</label>
              <select
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={filters.employeeId}
                onChange={(event) => setFilters({ ...filters, employeeId: event.target.value })}
              >
                <option value="">Todos</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">De</label>
              <input
                type="date"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={filters.dateFrom}
                onChange={(event) => setFilters({ ...filters, dateFrom: event.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">Até</label>
              <input
                type="date"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={filters.dateTo}
                onChange={(event) => setFilters({ ...filters, dateTo: event.target.value })}
              />
            </div>
            <button
              type="button"
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              onClick={() => setFilters({ employeeId: '', dateFrom: '', dateTo: '' })}
            >
              Limpar filtros
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-100 shadow-soft overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-navy">Horas no mês</h3>
            <p className="text-sm text-slate-500">Total por colaborador no mês selecionado.</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-500">Mês</label>
            <input
              type="month"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={monthRef}
              onChange={(event) => setMonthRef(event.target.value)}
            />
          </div>
        </div>
        <div className="p-5 grid md:grid-cols-3 gap-3">
          {Object.entries(monthTotals).map(([employeeKey, total]) => {
            const name = employeeById[employeeKey]?.name || employeeByExternal[employeeKey]?.name || 'Funcionário';
            return (
              <div key={employeeKey} className="p-4 rounded-xl border border-slate-100 bg-slate-50 text-sm">
                <p className="font-semibold text-navy">{name}</p>
                <p className="text-slate-600">{total.toFixed(2)} horas</p>
              </div>
            );
          })}
          {!loading && Object.keys(monthTotals).length === 0 && (
            <div className="text-sm text-slate-500">Sem lançamentos no mês selecionado.</div>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-100 shadow-soft overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-navy">Totais mês a mês</h3>
          <p className="text-sm text-slate-500">Resumo consolidado (últimos 8 meses com dados).</p>
        </div>
        <div className="p-5 grid md:grid-cols-4 gap-3">
          {monthlySeries.map(([month, total]) => (
            <div key={month} className="p-4 rounded-xl border border-slate-100 bg-slate-50 text-sm">
              <p className="font-semibold text-navy capitalize">{formatMonthLabel(month)}</p>
              <p className="text-slate-600">{total.toFixed(2)} horas</p>
            </div>
          ))}
          {!loading && monthlySeries.length === 0 && (
            <div className="text-sm text-slate-500">Sem dados disponíveis.</div>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-100 shadow-soft overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-navy">Registros filtrados</h3>
          <p className="text-sm text-slate-500">{loading ? 'Carregando...' : `${filteredTimeCards.length} registros`}</p>
        </div>
        <div className="divide-y divide-slate-100">
          {filteredTimeCards.map((card) => (
            <div key={card.id} className="grid grid-cols-1 md:grid-cols-7 gap-3 p-4 text-sm">
              <div className="font-semibold text-navy">{getEmployeeLabel(card)}</div>
              <div className="text-slate-500">{formatDate(card.date)}</div>
              <div className="text-slate-500">Entrada: {card.check_in || '--'}</div>
              <div className="text-slate-500">Saída: {card.check_out || '--'}</div>
              <div className="text-slate-500">Almoço: {card.lunch_start ? `${card.lunch_start} - ${card.lunch_end || '--'}` : '--'}</div>
              <div className="text-slate-500">Horas: {card.hours_worked ?? '--'}</div>
              <div className="text-slate-500">{card.notes || 'Sem observações'}</div>
            </div>
          ))}
          {!loading && filteredTimeCards.length === 0 && (
            <div className="p-6 text-sm text-slate-500">Nenhum registro encontrado com os filtros atuais.</div>
          )}
        </div>
      </div>
    </section>
  );
}



