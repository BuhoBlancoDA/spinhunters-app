import { getCurrentUser, getUserMembership } from '@/lib/api'

export default async function DashboardPage() {
  // Get the current user
  const user = await getCurrentUser()

  // Get the user's membership if they have one
  const membership = user ? await getUserMembership(user.id) : null

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium leading-6 text-white">Welcome to your Dashboard</h2>
          <div className="mt-3 text-sm text-gray-300">
            <p>Hello, {user?.name || user?.email}!</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-white">Your Membership</h3>
          <div className="mt-5">
            {membership ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-400">Plan:</span>
                  <span className="text-sm text-white">{membership.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-400">Status:</span>
                  <span className={`text-sm ${membership.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                    {membership.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-400">Expires:</span>
                  <span className="text-sm text-white">
                    {membership.expires_at ? new Date(membership.expires_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                {membership.ggpoker_username && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-400">GGPoker Username:</span>
                    <span className="text-sm text-white">{membership.ggpoker_username}</span>
                  </div>
                )}
                {membership.discord_nickname && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-400">Discord Nickname:</span>
                    <span className="text-sm text-white">{membership.discord_nickname}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-300">
                <p>You don't have an active membership yet.</p>
                <p className="mt-2">
                  Contact support or wait for admin approval if you've recently registered.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
