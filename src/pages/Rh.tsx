import { FormEvent, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { usePunchOnlyAccess } from '../hooks/usePunchOnlyAccess';

 type Employee = {
  id: string;
  name: string;
  email: string | null;
  role: string | null;
  status: string | null;
  created_at: string | null;
  external_id: string | null;
};

const formatDate = (value: string | null) => {
  if (!value) return '--';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-BR');
};

export function Rh() {
  const { profileId } = usePunchOnlyAccess();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [filters, setFilters] = useState({ status: '', search: '' });

  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    role: '',
    status: 'active',
    externalId: '',
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('hr_employees')
        .select('id,name,email,role,status,created_at,external_id')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setEmployees(data || []);
      }
      setLoading(false);
    };

      if (profileId) {
        loadData();
      }
  }, [profileId]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      if (filters.status && employee.status !== filters.status) return false;
      if (filters.search) {
        const term = filters.search.toLowerCase();
        const name = employee.name?.toLowerCase() || '';
        const email = employee.email?.toLowerCase() || '';
        if (!name.includes(term) && !email.includes(term)) return false;
      }
      return true;
    });
  }, [employees, filters]);

  const summary = useMemo(() => {
    const ativos = employees.filter((employee) => employee.status === 'active').length;
    return { total: employees.length, ativos };
  }, [employees]);

  const handleAddEmployee = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);

    if (!profileId) {
      setMessage('Perfil não encontrado para salvar colaborador.');
      return;
    }

    if (!newEmployee.name.trim()) {
      setMessage('Informe o nome do colaborador.');
      return;
    }

    const payload = {
      profile_id: profileId,
      name: newEmployee.name.trim(),
      email: newEmployee.email.trim() || null,
      role: newEmployee.role.trim() || null,
      status: newEmployee.status || null,
      external_id: newEmployee.externalId.trim() || null,
    };

    const { data, error: insertError } = await supabase
      .from('hr_employees')
      .insert(payload)
      .select('id,name,email,role,status,created_at,external_id')
      .single();

    if (insertError) {
      setMessage(insertError.message);
      return;
    }

    setEmployees((prev) => [data, ...prev]);
    setNewEmployee({ name: '', email: '', role: '', status: 'active', externalId: '' });
    setMessage('Colaborador adicionado.');
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-navy">RH</h2>
        <p className="text-slate-600 text-sm">Cadastre colaboradores e gerencie o status da equipe.</p>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}
      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
          <p className="text-xs uppercase text-slate-500 font-semibold">Total de colaboradores</p>
          <p className="text-2xl font-black text-navy">{summary.total}</p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-soft">
          <p className="text-xs uppercase text-slate-500 font-semibold">Ativos</p>
          <p className="text-2xl font-black text-primary">{summary.ativos}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-100 shadow-soft p-5">
          <h3 className="text-lg font-bold text-navy">Novo colaborador</h3>
          <form className="mt-4 grid md:grid-cols-2 gap-4" onSubmit={handleAddEmployee}>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">Nome</label>
              <input
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={newEmployee.name}
                onChange={(event) => setNewEmployee({ ...newEmployee, name: event.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">Email (login)</label>
              <input
                type="email"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={newEmployee.email}
                onChange={(event) => setNewEmployee({ ...newEmployee, email: event.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">Função / Cargo</label>
              <input
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={newEmployee.role}
                onChange={(event) => setNewEmployee({ ...newEmployee, role: event.target.value })}
                placeholder="Ex: Cozinha, Caixa, ponto_only"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">Status</label>
              <select
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={newEmployee.status}
                onChange={(event) => setNewEmployee({ ...newEmployee, status: event.target.value })}
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">ID externo (opcional)</label>
              <input
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={newEmployee.externalId}
                onChange={(event) => setNewEmployee({ ...newEmployee, externalId: event.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full md:w-auto px-5 py-3 rounded-xl bg-[#103826] text-white font-semibold hover:brightness-110 transition"
              >
                Salvar colaborador
              </button>
            </div>
          </form>
          <p className="mt-3 text-xs text-slate-500">
            Para acesso apenas ao ponto, use o cargo como <strong>ponto_only</strong>.
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-100 shadow-soft p-5 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-navy">Filtros</h3>
            <p className="text-sm text-slate-500">Busque por status ou nome/email.</p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">Status</label>
              <select
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={filters.status}
                onChange={(event) => setFilters({ ...filters, status: event.target.value })}
              >
                <option value="">Todos</option>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">Busca</label>
              <input
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={filters.search}
                onChange={(event) => setFilters({ ...filters, search: event.target.value })}
                placeholder="Nome ou email"
              />
            </div>
            <button
              type="button"
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              onClick={() => setFilters({ status: '', search: '' })}
            >
              Limpar filtros
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-100 shadow-soft overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-navy">Lista de colaboradores</h3>
          <p className="text-sm text-slate-500">{loading ? 'Carregando...' : `${filteredEmployees.length} registros`}</p>
        </div>
        <div className="divide-y divide-slate-100">
          {filteredEmployees.map((employee) => (
            <div key={employee.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-4 text-sm">
              <div className="font-semibold text-navy">{employee.name}</div>
              <div className="text-slate-500">{employee.email || 'Sem email'}</div>
              <div className="text-slate-500">{employee.role || 'Sem função'}</div>
              <div className="text-slate-500">{employee.status || 'Sem status'}</div>
              <div className="text-slate-500">{employee.external_id || '--'}</div>
              <div className="text-slate-500">{formatDate(employee.created_at)}</div>
            </div>
          ))}
          {!loading && filteredEmployees.length === 0 && (
            <div className="p-6 text-sm text-slate-500">Nenhum colaborador encontrado.</div>
          )}
        </div>
      </div>
    </section>
  );
}

