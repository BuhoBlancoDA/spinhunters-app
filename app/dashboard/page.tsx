// app/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabaseServer'

export default async function Dashboard() {
  const supabase = createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login?next=/dashboard')

  // A partir de aquí, tu código actual:
  const { data: { user } } = await supabase.auth.getUser()
  const { data: me } = await supabase
    .from('users')
    .select('id, name, username, alternate_email, discord_nickname, ggpoker_username')
    .eq('auth_user_id', user?.id)
    .single()

  let membership = null as any
  if (me) {
    const { data } = await supabase
      .from('memberships_view')
      .select('*')
      .eq('user_id', me.id)
      .order('updated_at', { ascending: false })
      .limit(1)
    membership = data?.[0] ?? null
  }

  return (
    <section className="space-y-6">
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-2">Perfil</h2>
        <div className="text-sm">
          <div><b>Nombre:</b> {me?.name ?? '—'}</div>
          <div><b>Username:</b> {me?.username ?? '—'}</div>
          <div><b>Email (login):</b> {user?.email}</div>
          <div><b>Gmail (Classroom):</b> {me?.alternate_email ?? '—'}</div>
          <div><b>Discord:</b> {me?.discord_nickname ?? '—'}</div>
          <div><b>GGpoker:</b> {me?.ggpoker_username ?? '—'}</div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-bold mb-2">Membresía</h2>
        {membership?.plan === 'ultimate' && membership?.status === 'active' ? (
          <div className="inline-flex items-center gap-2 rounded-xl bg-brand/15 text-brand px-3 py-2">
            Ultimate activa — vence <span suppressHydrationWarning>{new Date(membership.expires_at).toLocaleDateString()}</span>
          </div>
        ) : (
          <div className="muted">No tienes una membresía activa.</div>
        )}
      </div>
    </section>
  )
}
