import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuthSession } from './useAuthSession';

type PunchEmployee = {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  access_level: string | null;
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
  const { session, userId } = useAuthSession();
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

      let profileId: string | null = null;

      if (userId) {
        const { data: ownedProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('owner_id', userId)
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle();

        profileId = ownedProfile?.id || null;

        if (!profileId) {
          const { data: membership } = await supabase
            .from('profile_users')
            .select('profile_id')
            .eq('user_id', userId)
            .limit(1)
            .maybeSingle();

          profileId = membership?.profile_id || null;
        }
      }
      if (!profileId) {
        setState({ loading: false, isPunchOnly: false, employee: null, profileId: null });
        return;
      }

      const { data: employeeData } = await supabase
        .from('hr_employees')
        .select('id,name,email,role,access_level,external_id,status')
        .eq('profile_id', profileId)
        .eq('email', email)
        .maybeSingle();

      const isPunchOnly =
        employeeData?.access_level === 'ponto_only' || employeeData?.role === 'ponto_only';

      setState({
        loading: false,
        isPunchOnly,
        employee: employeeData || null,
        profileId,
      });
    };

    load();
  }, [session?.user?.email, userId]);

  return state;
}
