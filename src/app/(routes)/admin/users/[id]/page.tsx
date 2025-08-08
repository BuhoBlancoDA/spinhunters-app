'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const userId = params.id
  
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [memberships, setMemberships] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  
  // Form state for creating/updating membership
  const [membershipForm, setMembershipForm] = useState({
    plan: 'ultimate',
    expiresAt: '',
    status: 'active',
    notes: '',
  })
  const [formLoading, setFormLoading] = useState(false)

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
        
        // Get user memberships
        const { data: membershipData, error: membershipError } = await supabase
          .from('memberships')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
        
        if (membershipError) {
          throw membershipError
        }
        
        setMemberships(membershipData || [])
        
        // Set default expiration date to 1 year from now
        const oneYearFromNow = new Date()
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
        setMembershipForm({
          ...membershipForm,
          expiresAt: oneYearFromNow.toISOString().split('T')[0],
        })
      } catch (err: any) {
        setError(err.message || 'An error occurred while loading user data')
      } finally {
        setLoading(false)
      }
    }
    
    if (userId) {
      loadUserData()
    }
  }, [userId])

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setMembershipForm({
      ...membershipForm,
      [name]: value,
    })
  }

  const handleCreateMembership = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setFormLoading(true)
      setMessage(null)
      
      // Create a new membership
      const { error } = await supabase
        .from('memberships')
        .insert({
          user_id: userId,
          plan: membershipForm.plan,
          expires_at: membershipForm.expiresAt,
          status: membershipForm.status,
          notes: membershipForm.notes,
          start_date: new Date().toISOString().split('T')[0],
          eva: false,
        })
      
      if (error) {
        throw error
      }
      
      // Refresh memberships
      const { data: membershipData, error: membershipError } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (membershipError) {
        throw membershipError
      }
      
      setMemberships(membershipData || [])
      
      setMessage({
        text: 'Membership created successfully!',
        type: 'success',
      })
    } catch (err: any) {
      setMessage({
        text: err.message || 'An error occurred while creating the membership',
        type: 'error',
      })
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateMembership = async (membershipId: string, status: string) => {
    try {
      setLoading(true)
      setMessage(null)
      
      // Update the membership status
      const { error } = await supabase
        .from('memberships')
        .update({ status })
        .eq('id', membershipId)
      
      if (error) {
        throw error
      }
      
      // Refresh memberships
      const { data: membershipData, error: membershipError } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (membershipError) {
        throw membershipError
      }
      
      setMemberships(membershipData || [])
      
      setMessage({
        text: `Membership ${status === 'active' ? 'activated' : 'deactivated'} successfully!`,
        type: 'success',
      })
    } catch (err: any) {
      setMessage({
        text: err.message || 'An error occurred while updating the membership',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading && !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-red-800">Error</h3>
          <div className="mt-2 max-w-xl text-sm text-red-700">
            <p>{error}</p>
          </div>
          <div className="mt-5">
            <Link
              href="/admin/users"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Users
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* User Information */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium leading-6 text-gray-900">User Information</h2>
          <div className="mt-5 border-t border-gray-200">
            <dl className="divide-y divide-gray-200">
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user?.name || 'N/A'}</dd>
              </div>
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user?.email}</dd>
              </div>
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Alternate Email</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user?.alternate_email || 'N/A'}</dd>
              </div>
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Created At</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {new Date(user?.created_at).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
      
      {/* Memberships */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium leading-6 text-gray-900">Memberships</h2>
          
          {memberships.length > 0 ? (
            <div className="mt-5 border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {memberships.map((membership) => (
                  <li key={membership.id} className="py-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <div>
                        <p className="font-medium text-blue-600">{membership.plan.toUpperCase()}</p>
                        <p className="mt-1 text-sm text-gray-500">
                          Status: <span className={`font-medium ${membership.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                            {membership.status.toUpperCase()}
                          </span>
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          Expires: {new Date(membership.expires_at).toLocaleDateString()}
                        </p>
                        {membership.notes && (
                          <p className="mt-1 text-sm text-gray-500">Notes: {membership.notes}</p>
                        )}
                      </div>
                      <div className="mt-4 sm:mt-0 flex space-x-2">
                        {membership.status !== 'active' ? (
                          <button
                            type="button"
                            onClick={() => handleUpdateMembership(membership.id, 'active')}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            Activate
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleUpdateMembership(membership.id, 'inactive')}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Deactivate
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="mt-5 border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-500">No memberships found for this user.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Create Membership Form */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Create New Membership</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Create a new membership for this user.</p>
          </div>
          
          <form onSubmit={handleCreateMembership} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="plan" className="block text-sm font-medium text-gray-700">
                  Plan
                </label>
                <select
                  id="plan"
                  name="plan"
                  value={membershipForm.plan}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="ultimate">Ultimate</option>
                  <option value="premium">Premium</option>
                  <option value="basic">Basic</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={membershipForm.status}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700">
                  Expires At
                </label>
                <input
                  type="date"
                  id="expiresAt"
                  name="expiresAt"
                  value={membershipForm.expiresAt}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={membershipForm.notes}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Add any notes about this membership"
                />
              </div>
            </div>
            
            {message && (
              <div
                className={`rounded-md p-4 ${
                  message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}
              >
                <p className="text-sm">{message.text}</p>
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={formLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {formLoading ? 'Creating...' : 'Create Membership'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Back Button */}
      <div className="flex justify-end">
        <Link
          href="/admin/users"
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back to Users
        </Link>
      </div>
    </div>
  )
}