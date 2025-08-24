'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    alternateEmail: '',
    discordNickname: '',
    ggpokerUsername: '',
    username: ''
  })
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true)
        
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/login')
          return
        }
        
        // Get the user profile from the database - FIX: use auth_user_id instead of id
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('auth_user_id', session.user.id)
          .single()
        
        if (error) {
          throw error
        }
        
        setProfile(userData)
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          alternateEmail: userData.alternate_email || '',
          discordNickname: userData.discord_nickname || '',
          ggpokerUsername: userData.ggpoker_username || '',
          username: userData.username || ''
        })
      } catch (error: any) {
        console.error('Error loading user:', error.message)
      } finally {
        setLoading(false)
      }
    }
    
    loadUser()
  }, [router, supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setMessage(null)
      
      if (!profile) {
        throw new Error('No se pudo cargar el perfil')
      }
      
      // Update the user profile in the database - FIX: use profile.id
      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name,
          alternate_email: formData.alternateEmail,
          discord_nickname: formData.discordNickname,
          ggpoker_username: formData.ggpokerUsername,
          username: formData.username
        })
        .eq('id', profile.id)
      
      if (error) {
        throw error
      }
      
      setMessage({
        text: '¡Perfil actualizado correctamente!',
        type: 'success',
      })
    } catch (error: any) {
      setMessage({
        text: error.message || 'Ocurrió un error al actualizar tu perfil',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading && !profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="muted">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-xl font-bold mb-4">Tu Perfil</h2>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Nombre Completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 outline-none focus:border-brand"
              />
            </div>
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium">
                Nombre de Usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className="mt-1 block w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 outline-none focus:border-brand"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email (Login)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                disabled
                className="mt-1 block w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 outline-none opacity-70"
              />
              <p className="mt-1 text-xs muted">
                El email de login no se puede cambiar. Contacta con soporte si necesitas actualizarlo.
              </p>
            </div>
            
            <div>
              <label htmlFor="alternateEmail" className="block text-sm font-medium">
                Email Alternativo (Gmail para Classroom)
              </label>
              <input
                id="alternateEmail"
                name="alternateEmail"
                type="email"
                value={formData.alternateEmail}
                onChange={handleChange}
                className="mt-1 block w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 outline-none focus:border-brand"
              />
            </div>
            
            <div>
              <label htmlFor="discordNickname" className="block text-sm font-medium">
                Discord
              </label>
              <input
                id="discordNickname"
                name="discordNickname"
                type="text"
                value={formData.discordNickname}
                onChange={handleChange}
                className="mt-1 block w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 outline-none focus:border-brand"
              />
            </div>
            
            <div>
              <label htmlFor="ggpokerUsername" className="block text-sm font-medium">
                GGPoker Username
              </label>
              <input
                id="ggpokerUsername"
                name="ggpokerUsername"
                type="text"
                value={formData.ggpokerUsername}
                onChange={handleChange}
                className="mt-1 block w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 outline-none focus:border-brand"
              />
            </div>
            
            {message && (
              <div
                className={`rounded-xl p-4 ${
                  message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-brand/10 text-brand'
                }`}
              >
                <p>{message.text}</p>
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}