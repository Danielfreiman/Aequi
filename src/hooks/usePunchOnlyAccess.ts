import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuthSession } from './useAuthSession';

type PunchEmployee = {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  external_id: string | null;
  status: string | null;
};

type PunchAccessState = {
  loading: boolean;
  isPunchOnly: boolean;
  employee: PunchEmployee | null;
  profileId: string | null;
};

export function usePunchOnlyAccess(): PunchAccessState {
  const { session } = useAuthSession();
  const [state, setState] = useState<PunchAccessState>({
    loading: true,
    isPunchOnly: false,
    employee: null,
    profileId: null,
  });

  useEffect(() => {
    const load = async () => {
      const email = session?.user?.email || null;
      if (!email) {
        setState({ loading: false, isPunchOnly: false, employee: null, profileId: null });
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
        .maybeSingle();

      const profileId = profileData?.id || null;
      if (!profileId) {
        setState({ loading: false, isPunchOnly: false, employee: null, profileId: null });
        return;
      }

      const { data: employeeData } = await supabase
        .from('hr_employees')
        .select('id,name,email,role,external_id,status')
        .eq('profile_id', profileId)
        .eq('email', email)
        .maybeSingle();

      const isPunchOnly = employeeData?.role === 'ponto_only';

      setState({
        loading: false,
        isPunchOnly,
        employee: employeeData || null,
        profileId,
      });
    };

    load();
  }, [session?.user?.email]);

  return state;
}
