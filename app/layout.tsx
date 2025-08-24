import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SpinHunters',
  description: 'Membership portal',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const year = new Date().getFullYear(); // SSR-only
  return (
    <html lang="es">
      <body className={inter.className}>
        {/* Fondo fijo */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-black" />
          <div
            className="absolute -top-20 -left-20 h-[60vh] w-[60vw] rounded-full opacity-40 blur-3xl"
            style={{ background: 'radial-gradient(50% 50% at 50% 50%, rgba(202,34,39,0.35), transparent 70%)' }}
          />
          <div
            className="absolute top-0 right-0 h-[40vh] w-[40vw] opacity-30 blur-2xl"
            style={{ background: 'radial-gradient(50% 50% at 50% 50%, rgba(202,34,39,0.2), transparent 70%)' }}
          />
        </div>

        <div className="min-h-screen">
          <header className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur">
            <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
              <div className="font-bold text-white tracking-wide">SpinHunters</div>
              <nav className="flex items-center gap-3">
                <Link href="/login" className="btn-ghost">Login</Link>
                <Link href="/register" className="btn-primary">Register</Link>
              </nav>
            </div>
          </header>

          <main className="mx-auto max-w-6xl px-4 py-12">{children}</main>

          <footer className="border-t border-white/10 py-6 text-center text-white/50">
            <span suppressHydrationWarning>© {year} SpinHunters</span>
          </footer>
        </div>
      </body>
    </html>
  )
}
