'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabaseClient'

export default function UsersPage() {
  const router = useRouter()
  const supabase = createClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!searchQuery.trim()) {
      setError('Por favor ingresa un término de búsqueda')
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      // Search for users by email
      const { data, error: searchError } = await supabase
        .from('users')
        .select('*')
        .ilike('email', `%${searchQuery}%`)
        .order('created_at', { ascending: false })
      
      if (searchError) {
        throw searchError
      }
      
      setUsers(data || [])
      
      if (data?.length === 0) {
        setError('No se encontraron usuarios que coincidan con tu búsqueda')
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al buscar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const handleViewUser = (userId: string) => {
    router.push(`/admin/users/${userId}`)
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-2">Gestión de Usuarios</h2>
        <p className="muted mb-4">
          Busca usuarios por dirección de correo electrónico para ver y gestionar sus perfiles.
        </p>
        
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="w-full">
            <label htmlFor="searchQuery" className="sr-only">
              Buscar por email
            </label>
            <input
              type="text"
              name="searchQuery"
              id="searchQuery"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 outline-none focus:border-brand"
              placeholder="Buscar por email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary whitespace-nowrap"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
        
        {error && (
          <div className="mt-4 rounded-xl border border-brand/40 bg-brand/10 p-4 text-brand">
            <p>{error}</p>
          </div>
        )}
      </div>
      
      {users.length > 0 && (
        <div className="card overflow-hidden">
          <ul className="divide-y divide-white/10">
            {users.map((user) => (
              <li key={user.id}>
                <div className="px-4 py-4 flex items-center sm:px-6">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-brand truncate">{user.name || 'Sin nombre'}</p>
                      <p className="mt-1 text-sm text-white/80">{user.email}</p>
                      {user.alternate_email && (
                        <p className="mt-1 text-sm muted">Alt: {user.alternate_email}</p>
                      )}
                    </div>
                    <div className="mt-4 flex-shrink-0 sm:mt-0">
                      <p className="text-sm muted">
                        Creado: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="ml-5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleViewUser(user.id)}
                      className="btn-primary text-xs"
                    >
                      Ver Detalles
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="flex justify-end">
        <Link
          href="/admin"
          className="btn-ghost"
        >
          Volver al Dashboard
        </Link>
      </div>
    </div>
  )
}