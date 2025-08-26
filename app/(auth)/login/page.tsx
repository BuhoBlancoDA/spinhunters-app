'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

export default function Login() {
  const supabase = createClient()
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') || '/dashboard'

  const [activeTab, setActiveTab] = useState<'password' | 'magic'>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // ✅ Sesión creada → vamos al panel
    router.replace(next)
  }

  async function handleMagicLinkLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const origin = window.location.origin
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // ✅ Magic link vuelve a nuestra ruta de callback
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-8">
        <h2 className="text-2xl font-bold mb-2">Accede a tu cuenta</h2>
        <p className="muted mb-4">Elige tu método de acceso preferido.</p>

        {/* Tabs */}
        <div className="flex border-b border-white/10 mb-6">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'password'
              ? 'text-brand border-b-2 border-brand'
              : 'text-white/60 hover:text-white'}`}
            onClick={() => setActiveTab('password')}
            type="button"
          >
            Contraseña
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'magic'
              ? 'text-brand border-b-2 border-brand'
              : 'text-white/60 hover:text-white'}`}
            onClick={() => setActiveTab('magic')}
            type="button"
          >
            Enlace Mágico
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-brand/40 bg-brand/10 p-4 text-brand mb-4">
            {error}
          </div>
        )}

        {activeTab === 'password' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label htmlFor="email-password" className="block text-sm font-medium mb-1">Email</label>
              <input
                id="email-password"
                type="email"
                required
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-brand"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">Contraseña</label>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-brand"
              />
            </div>
            <button disabled={loading} className="btn-primary w-full">
              {loading ? 'Accediendo…' : 'Acceder'}
            </button>
          </form>
        )}

        {activeTab === 'magic' && (
          sent ? (
            <div className="rounded-xl border border-green-500/40 bg-green-500/10 p-4 text-green-400">
              Revisa tu correo para continuar.
            </div>
          ) : (
            <form onSubmit={handleMagicLinkLogin} className="space-y-4">
              <div>
                <label htmlFor="email-magic" className="block text-sm font-medium mb-1">Email</label>
                <input
                  id="email-magic"
                  type="email"
                  required
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-brand"
                />
              </div>
              <button disabled={loading} className="btn-primary w-full">
                {loading ? 'Enviando…' : 'Enviar enlace mágico'}
              </button>
            </form>
          )
        )}
      </div>
    </div>
  )
}

