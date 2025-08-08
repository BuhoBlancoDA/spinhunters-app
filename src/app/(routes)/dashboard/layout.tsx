import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/api'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if user is authenticated
  const user = await getCurrentUser()

  // If not authenticated, redirect to login
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-black">
      <nav className="bg-gray-900 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <span className="text-xl font-bold text-[#CA2227]">SpinHunters</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center border-b-2 border-[#CA2227] px-1 pt-1 text-sm font-medium text-white"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/profile"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-300 hover:border-gray-700 hover:text-white"
                >
                  Profile
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="relative ml-3">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-white mr-2">
                    {user.name || user.email}
                  </span>
                  <form action="/auth/signout" method="post">
                    <button
                      type="submit"
                      className="text-sm font-medium text-gray-300 hover:text-white"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <main>
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
