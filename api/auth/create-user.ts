import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Token ausente' });
  }

  const { data: authUser, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !authUser?.user) {
    return res.status(401).json({ error: 'Token inválido' });
  }

  const { email, password, name, profileId } = req.body || {};

  if (!email || !password || !profileId) {
    return res.status(400).json({ error: 'Email, senha e perfil são obrigatórios' });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id,owner_id')
    .eq('id', profileId)
    .maybeSingle();

  if (profileError || !profile) {
    return res.status(400).json({ error: 'Perfil inválido' });
  }

  const requesterId = authUser.user.id;
  if (profile.owner_id !== requesterId) {
    const { data: membership } = await supabaseAdmin
      .from('profile_users')
      .select('user_id')
      .eq('profile_id', profileId)
      .eq('user_id', requesterId)
      .maybeSingle();

    if (!membership) {
      return res.status(403).json({ error: 'Sem permissão para criar usuários' });
    }
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: name ? { name } : undefined,
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({ userId: data.user?.id, email: data.user?.email });
}
