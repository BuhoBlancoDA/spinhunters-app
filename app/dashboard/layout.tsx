import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabaseServer'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if user is authenticated
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  // If not authenticated, redirect to login
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="font-bold text-white tracking-wide">SpinHunters</Link>
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="text-white/90 hover:text-white transition"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/profile"
                  className="text-white/70 hover:text-white transition"
                >
                  Perfil
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden md:inline text-sm text-white/80">
                {user.user_metadata?.name || user.email}
              </span>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="btn-ghost text-sm"
                >
                  Cerrar sesión
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {children}
      </main>
    </div>
  )
}