'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabaseClient'

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const userId = params.id
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [memberships, setMemberships] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function loadUserData() {
      try {
        setLoading(true)
        setError(null)
        
        // Get user data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()
        
        if (userError) {
          throw userError
        }
        
        setUser(userData)
        
        // Get user memberships (read-only)
        const { data: membershipData, error: membershipError } = await supabase
          .from('memberships_view')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
        
        if (membershipError) {
          throw membershipError
        }
        
        setMemberships(membershipData || [])
      } catch (err: any) {
        setError(err.message || 'Ocurrió un error al cargar los datos del usuario')
      } finally {
        setLoading(false)
      }
    }
    
    if (userId) {
      loadUserData()
    }
  }, [userId, supabase])

  if (loading && !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="muted">Cargando...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-6">
        <h3 className="text-xl font-bold text-brand mb-2">Error</h3>
        <div className="mt-2 text-white/80">
          <p>{error}</p>
        </div>
        <div className="mt-5">
          <Link
            href="/admin/users"
            className="btn-ghost"
          >
            Volver a Usuarios
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* User Information */}
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Información del Usuario</h2>
        <div className="mt-5 border-t border-white/10">
          <dl className="divide-y divide-white/10">
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm muted">Nombre</dt>
              <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">{user?.name || 'N/A'}</dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm muted">Email</dt>
              <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">{user?.email}</dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm muted">Email Alternativo</dt>
              <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">{user?.alternate_email || 'N/A'}</dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm muted">Discord</dt>
              <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">{user?.discord_nickname || 'N/A'}</dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm muted">GGPoker</dt>
              <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">{user?.ggpoker_username || 'N/A'}</dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm muted">Creado</dt>
              <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">
                {new Date(user?.created_at).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      {/* Memberships - Read Only */}
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Membresías</h2>
        
        {memberships.length > 0 ? (
          <div className="mt-5 border-t border-white/10">
            <ul className="divide-y divide-white/10">
              {memberships.map((membership) => (
                <li key={membership.id} className="py-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <div>
                      <p className="font-medium text-brand">{membership.plan.toUpperCase()}</p>
                      <p className="mt-1 text-sm muted">
                        Estado: <span className={`font-medium ${membership.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>
                          {membership.status === 'active' ? 'ACTIVA' : 'INACTIVA'}
                        </span>
                      </p>
                      <p className="mt-1 text-sm muted">
                        Vence: {new Date(membership.expires_at).toLocaleDateString()}
                      </p>
                      {membership.notes && (
                        <p className="mt-1 text-sm muted">Notas: {membership.notes}</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mt-5 border-t border-white/10 pt-4">
            <p className="muted">No se encontraron membresías para este usuario.</p>
          </div>
        )}

        {/* Note about POS */}
        <div className="mt-6 rounded-xl border border-brand/40 bg-brand/10 p-4 text-brand">
          <p className="font-medium">Nota importante:</p>
          <p className="text-sm mt-1">La creación y gestión de membresías se realiza exclusivamente en el POS. Esta interfaz es solo de consulta.</p>
        </div>
      </div>
      
      {/* Back Button */}
      <div className="flex justify-end">
        <Link
          href="/admin/users"
          className="btn-ghost"
        >
          Volver a Usuarios
        </Link>
      </div>
    </div>
  )
}