import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function verifyAdmin(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return { error: 'Unauthorized', status: 401 };
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return { error: 'Invalid token', status: 401 };
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (!profile || profile.role !== 'admin') {
    return { error: 'Full Admin access required', status: 403 };
  }
  return { user };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const authResult = await verifyAdmin(req);
  if (authResult.error) {
    return res.status(authResult.status).json({ error: authResult.error });
  }

  try {
    if (req.method === 'GET') {
      const { data: authUsers, error: authErr } = await supabaseAdmin.auth.admin.listUsers();
      if (authErr) throw authErr;

      const { data: profiles } = await supabase.from('profiles').select('*');
      const usersWithRoles = authUsers.users.map(u => {
        const profile = profiles?.find(p => p.id === u.id);
        return {
          id: u.id,
          email: u.email,
          full_name: profile?.full_name || u.user_metadata?.name || '',
          role: profile?.role || 'user',
          created_at: u.created_at
        };
      });
      return res.status(200).json(usersWithRoles);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
      if (error) throw error;
      await supabase.from('profiles').delete().eq('id', id);
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'PUT') {
      const { id, role } = req.body;
      const { error } = await supabase
        .from('profiles')
        .upsert({ id, role }, { onConflict: 'id' });
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Admin users API error:', err);
    res.status(500).json({ error: err.message });
  }
}
