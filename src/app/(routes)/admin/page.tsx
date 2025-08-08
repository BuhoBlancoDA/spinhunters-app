import Link from 'next/link'

export default async function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="bg-gray-900 shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium leading-6 text-white">Admin Dashboard</h2>
          <p className="mt-1 text-sm text-gray-300">
            Welcome to the SpinHunters admin panel. Here you can manage users, memberships, and system settings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* User Management Card */}
        <div className="bg-gray-900 overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-white">User Management</h3>
            <p className="mt-1 text-sm text-gray-300">
              Search for users, view their profiles, and manage their memberships.
            </p>
            <div className="mt-4">
              <Link
                href="/admin/users"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#CA2227] hover:bg-[#b01e22] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#CA2227]"
              >
                Manage Users
              </Link>
            </div>
          </div>
        </div>

        {/* Membership Management Card */}
        <div className="bg-gray-900 overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-white">Membership Management</h3>
            <p className="mt-1 text-sm text-gray-300">
              Activate memberships, set expiration dates, and manage subscription plans.
            </p>
            <div className="mt-4">
              <Link
                href="/admin/memberships"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#CA2227] hover:bg-[#b01e22] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#CA2227]"
              >
                Manage Memberships
              </Link>
            </div>
          </div>
        </div>

        {/* System Settings Card */}
        <div className="bg-gray-900 overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-white">System Settings</h3>
            <p className="mt-1 text-sm text-gray-300">
              Configure system settings, email templates, and notification preferences.
            </p>
            <div className="mt-4">
              <Link
                href="/admin/settings"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#CA2227] hover:bg-[#b01e22] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#CA2227]"
              >
                System Settings
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-900 shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-white">Quick Actions</h3>
          <div className="mt-4 space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            <Link
              href="/admin/users/search"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#CA2227] hover:bg-[#b01e22] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#CA2227]"
            >
              Search Users
            </Link>
            <Link
              href="/admin/memberships/activate"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Activate Membership
            </Link>
            <Link
              href="/admin/payments/record"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Record Payment
            </Link>
            <Link
              href="/admin/notifications/send"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Send Notification
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
