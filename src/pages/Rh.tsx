import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuthSession } from '../hooks/useAuthSession';

type Employee = {
  id: string;
  name: string;
  email: string | null;
  role: string | null;
  status: string | null;
  created_at: string | null;
};

const formatDate = (value: string | null) => {
  if (!value) return '--';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-BR');
};

export function Rh() {
  const { userId } = useAuthSession();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('hr_employees')
        .select('id,name,email,role,status,created_at')
        .eq('profile_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setEmployees(data || []);
      }
      setLoading(false);
    };

    if (userId) {
      loadData();
    }
  }, [userId]);

  const summary = useMemo(() => {
    const ativos = employees.filter((employee) => employee.status === 'active').length;
    return { total: employees.length, ativos };
  }, [employees]);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-navy">RH</h2>
        <p className="text-slate-600 text-sm">Equipe cadastrada no Firebase e importada no Supabase.</p>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

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

      <div className="rounded-2xl bg-white border border-slate-100 shadow-soft overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-navy">Lista de colaboradores</h3>
          <p className="text-sm text-slate-500">{loading ? 'Carregando...' : `${employees.length} registros`}</p>
        </div>
        <div className="divide-y divide-slate-100">
          {employees.map((employee) => (
            <div key={employee.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 text-sm">
              <div className="font-semibold text-navy">{employee.name}</div>
              <div className="text-slate-500">{employee.email || 'Sem email'}</div>
              <div className="text-slate-500">{employee.role || 'Sem função'}</div>
              <div className="text-slate-500">{employee.status || 'Sem status'}</div>
              <div className="text-slate-500">{formatDate(employee.created_at)}</div>
            </div>
          ))}
          {!loading && employees.length === 0 && (
            <div className="p-6 text-sm text-slate-500">Nenhum colaborador encontrado.</div>
          )}
        </div>
      </div>
    </section>
  );
}
