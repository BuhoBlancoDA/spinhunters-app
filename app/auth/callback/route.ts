import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'
export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value } }
  )

  if (code) {
    // crea sesión con el código del email
    await supabase.auth.exchangeCodeForSession(code)

    // asegurar perfil (crea o reclama por email) y upsert de campos de user_metadata
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const meta = user.user_metadata || {}
      // claim/create perfil
      await supabase.rpc('ensure_profile_for_current_user', { p_name: meta.name ?? null })
      // upsert de perfil con metadatos capturados en el registro
      await supabase.from('users').update({
        username: meta.username ?? null,
        alternate_email: meta.gmail ?? null,
        name: meta.name ?? null,
        discord_nickname: meta.discord ?? null,
        ggpoker_username: meta.ggpoker ?? null
      }).eq('auth_user_id', user.id)
    }
  }

  // redirige al dashboard
  return NextResponse.redirect(new URL('/dashboard', url.origin))
}
