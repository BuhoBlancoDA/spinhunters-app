'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabaseClient'

export default function Register() {
  const supabase = createClient()
  const [form, setForm] = useState({
    username: '',
    gmail: '',
    name: '',
    discord: '',
    ggpoker: '',
    email: '',
    password: '',
    confirm: ''
  })
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const onChange = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)

    if (form.password !== form.confirm) {
      setErr('Las contraseñas no coinciden.')
      return
    }
    if (!form.gmail.endsWith('@gmail.com')) {
      setErr('El correo para Classroom debe ser de Gmail.')
      return
    }

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          username: form.username,
          gmail: form.gmail,
          name: form.name,
          discord: form.discord,
          ggpoker: form.ggpoker || null
        }
      }
    })
    if (error) setErr(error.message)
    else setSent(true)
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-md">
        <div className="card p-8">
          <h2 className="text-2xl font-bold mb-2">Confirma tu correo</h2>
          <p className="muted">Te enviamos un enlace para confirmar tu cuenta. Después te llevaremos a tu panel.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="card p-8 space-y-4">
        <h1 className="text-2xl font-bold">Crear cuenta</h1>
        {err && <div className="rounded-xl border border-brand/40 bg-brand/10 p-3 text-brand">{err}</div>}
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="rounded-xl bg-white/5 border border-white/10 px-4 py-3" placeholder="Username" value={form.username} onChange={onChange('username')} required />
          <input className="rounded-xl bg-white/5 border border-white/10 px-4 py-3" placeholder="Gmail (para Classroom)" value={form.gmail} onChange={onChange('gmail')} required />
          <input className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 md:col-span-2" placeholder="Nombre" value={form.name} onChange={onChange('name')} required />
          <input className="rounded-xl bg-white/5 border border-white/10 px-4 py-3" placeholder="Nick de Discord" value={form.discord} onChange={onChange('discord')} required />
          <input className="rounded-xl bg-white/5 border border-white/10 px-4 py-3" placeholder="Usuario de GGpoker (opcional)" value={form.ggpoker} onChange={onChange('ggpoker')} />
          <input type="email" className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 md:col-span-2" placeholder="Correo de acceso (login)" value={form.email} onChange={onChange('email')} required />
          <input type="password" className="rounded-xl bg-white/5 border border-white/10 px-4 py-3" placeholder="Contraseña" value={form.password} onChange={onChange('password')} required />
          <input type="password" className="rounded-xl bg-white/5 border border-white/10 px-4 py-3" placeholder="Confirmar contraseña" value={form.confirm} onChange={onChange('confirm')} required />
          <button className="btn-primary md:col-span-2">Crear cuenta</button>
        </form>
      </div>
    </div>
  )
}