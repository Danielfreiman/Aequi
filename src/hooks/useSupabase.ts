import { useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useSupabase = () => useMemo(() => supabase, []);
