'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function UsersPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!searchQuery.trim()) {
      setError('Please enter a search query')
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
        setError('No users found matching your search criteria')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while searching for users')
    } finally {
      setLoading(false)
    }
  }

  const handleViewUser = (userId: string) => {
    router.push(`/admin/users/${userId}`)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium leading-6 text-gray-900">User Management</h2>
          <p className="mt-1 text-sm text-gray-500">
            Search for users by email address to view and manage their profiles and memberships.
          </p>
          
          <form onSubmit={handleSearch} className="mt-5 sm:flex sm:items-center">
            <div className="w-full sm:max-w-xs">
              <label htmlFor="searchQuery" className="sr-only">
                Search by email
              </label>
              <input
                type="text"
                name="searchQuery"
                id="searchQuery"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Search by email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-3 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
          
          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {users.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {users.map((user) => (
              <li key={user.id}>
                <div className="px-4 py-4 flex items-center sm:px-6">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-blue-600 truncate">{user.name || 'No name'}</p>
                      <p className="mt-1 text-sm text-gray-500">{user.email}</p>
                      {user.alternate_email && (
                        <p className="mt-1 text-sm text-gray-500">Alt: {user.alternate_email}</p>
                      )}
                    </div>
                    <div className="mt-4 flex-shrink-0 sm:mt-0">
                      <p className="text-sm text-gray-500">
                        Created: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="ml-5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleViewUser(user.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      View Details
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
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}