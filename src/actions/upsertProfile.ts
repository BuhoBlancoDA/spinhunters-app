'use server'

import { createServerSupabase } from '@/lib/supabaseServer'

export async function upsertProfile({
  email,
  name,
}: { email: string; name?: string }) {
  const supabase = createServerSupabase()
  const { data: { user }, error: userErr } = await supabase.auth.getUser()
  if (userErr || !user) return { ok: false, error: 'No session' }

  // Busca si ya existe un perfil (por auth_user_id)
  const { data: existing, error: selErr } = await supabase
    .from('users')
    .select('id, auth_user_id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (selErr) return { ok: false, error: selErr.message }

  if (existing) {
    const { error } = await supabase
      .from('users')
      .update({ email, name })
      .eq('id', existing.id)
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  } else {
    // Crea nuevo perfil (id lo genera la BD o el trigger; si no hay default, genera en el cliente)
    const { error } = await supabase.from('users').insert({
      // id: crypto.randomUUID(), // usar si la tabla no tiene default
      email,
      name,
      auth_user_id: user.id,
    })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  }
}