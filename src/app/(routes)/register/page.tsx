'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    alternateEmail: '',
    ggpokerUsername: '',
    discordNickname: '',
    howDidYouHear: '',
    notes: '',
    acceptTerms: false,
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.acceptTerms) {
      setMessage({
        text: 'You must accept the terms and conditions',
        type: 'error',
      })
      return
    }

    try {
      setLoading(true)
      setMessage(null)

      // Sign up with Supabase Auth
      const { error } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: formData.name,
          },
        },
      })

      if (error) {
        throw error
      }

      // Create user record in the database
      // Note: This will be handled in the auth callback route if the user confirms their email

      // Create initial membership record
      // This will be in "pending" status until approved by an admin

      setMessage({
        text: 'Registration successful! Check your email for the confirmation link.',
        type: 'success',
      })
    } catch (error: any) {
      setMessage({
        text: error.error_description || error.message || 'An error occurred',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
            Create a new account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Or{' '}
            <Link href="/login" className="font-medium text-[#CA2227] hover:text-[#b01e22]">
              sign in to your existing account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-0 bg-gray-900 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-[#CA2227] sm:text-sm"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-0 bg-gray-900 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-[#CA2227] sm:text-sm"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label htmlFor="alternateEmail" className="block text-sm font-medium text-white">
                Alternate Email (optional)
              </label>
              <input
                id="alternateEmail"
                name="alternateEmail"
                type="email"
                value={formData.alternateEmail}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-0 bg-gray-900 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-[#CA2227] sm:text-sm"
                placeholder="alternate@example.com"
              />
            </div>

            <div>
              <label htmlFor="ggpokerUsername" className="block text-sm font-medium text-white">
                GGPoker Username (if applicable)
              </label>
              <input
                id="ggpokerUsername"
                name="ggpokerUsername"
                type="text"
                value={formData.ggpokerUsername}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-0 bg-gray-900 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-[#CA2227] sm:text-sm"
                placeholder="Your GGPoker username"
              />
            </div>

            <div>
              <label htmlFor="discordNickname" className="block text-sm font-medium text-white">
                Discord Nickname (if applicable)
              </label>
              <input
                id="discordNickname"
                name="discordNickname"
                type="text"
                value={formData.discordNickname}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-0 bg-gray-900 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-[#CA2227] sm:text-sm"
                placeholder="Your Discord nickname"
              />
            </div>

            <div>
              <label htmlFor="howDidYouHear" className="block text-sm font-medium text-white">
                How did you hear about SpinHunters?
              </label>
              <select
                id="howDidYouHear"
                name="howDidYouHear"
                value={formData.howDidYouHear}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-0 bg-gray-900 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-[#CA2227] sm:text-sm"
              >
                <option value="">Select an option</option>
                <option value="friend">Friend or colleague</option>
                <option value="search">Search engine</option>
                <option value="social">Social media</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-white">
                Additional Notes (optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-0 bg-gray-900 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-[#CA2227] sm:text-sm"
                placeholder="Any additional information you'd like to share"
              />
            </div>

            <div className="flex items-center">
              <input
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-700 bg-gray-900 text-[#CA2227] focus:ring-[#CA2227]"
                required
              />
              <label htmlFor="acceptTerms" className="ml-2 block text-sm text-white">
                I accept the terms and conditions
              </label>
            </div>
          </div>

          {message && (
            <div
              className={`rounded-md p-4 ${
                message.type === 'success' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
              }`}
            >
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md bg-[#CA2227] py-2 px-3 text-sm font-semibold text-white hover:bg-[#b01e22] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CA2227] disabled:bg-[#ca222780]"
            >
              {loading ? 'Processing...' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
