'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const [searchEmail, setSearchEmail] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  // Mock function to simulate user search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would call an API endpoint
    setSearchResults([
      { id: '1', email: 'user@example.com', name: 'Example User', membership: { status: 'active', plan: 'Ultimate', expires_at: '2025-12-31' } },
      { id: '2', email: 'test@example.com', name: 'Test User', membership: null }
    ].filter(user => user.email.includes(searchEmail)))
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Panel de Administración</h1>

      {/* User Search */}
      <div className="card p-6 hover:bg-white/7 hover:border-white/20 transition">
        <h2 className="text-xl font-bold mb-4">Buscar Usuario</h2>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-3">
            <input
              type="email"
              placeholder="Email del usuario"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-2 outline-none focus:border-brand"
            />
            <button type="submit" className="btn-primary">
              Buscar
            </button>
          </div>
        </form>

        {searchResults.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Resultados</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-2 px-3 text-left text-sm muted">Email</th>
                    <th className="py-2 px-3 text-left text-sm muted">Nombre</th>
                    <th className="py-2 px-3 text-left text-sm muted">Membresía</th>
                    <th className="py-2 px-3 text-left text-sm muted">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map(user => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-3">{user.email}</td>
                      <td className="py-3 px-3">{user.name}</td>
                      <td className="py-3 px-3">
                        {user.membership ? (
                          <div className="flex items-center gap-2">
                            <span className={`inline-block w-2 h-2 rounded-full ${
                              user.membership.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                            }`}></span>
                            <span>{user.membership.plan}</span>
                          </div>
                        ) : (
                          <span className="text-white/60">Sin membresía</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <Link 
                          href={`/admin/users/${user.id}`}
                          className="btn-ghost text-sm"
                        >
                          Ver detalles
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card p-6 hover:bg-white/7 hover:border-white/20 transition">
        <h2 className="text-xl font-bold mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link href="/admin/users" className="btn-primary text-center">
            Gestionar Usuarios
          </Link>
          <div className="btn-ghost text-center cursor-not-allowed opacity-70">
            Gestionar Membresías
            <div className="text-xs muted mt-1">Solo en POS</div>
          </div>
          <div className="btn-ghost text-center cursor-not-allowed opacity-70">
            Registrar Pago
            <div className="text-xs muted mt-1">Solo en POS</div>
          </div>
          <div className="btn-ghost text-center cursor-not-allowed opacity-70">
            Configuración
            <div className="text-xs muted mt-1">Solo en POS</div>
          </div>
        </div>
      </div>

      {/* Note about POS */}
      <div className="rounded-xl border border-brand/40 bg-brand/10 p-4 text-brand">
        <p className="font-medium">Nota importante:</p>
        <p className="text-sm mt-1">La creación y gestión de membresías se realiza exclusivamente en el POS. Esta interfaz es solo de consulta.</p>
      </div>
    </div>
  )
}