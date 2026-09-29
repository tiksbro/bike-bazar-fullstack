import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'
import Card from '../components/Card'
import Badge from '../components/Badge'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

function Profile() {
  const { user, logout, updateUser } = useAuth()
  const [upgrading, setUpgrading] = useState(false)
  const [upgradeError, setUpgradeError] = useState('')

  async function handleUpgrade() {
    setUpgrading(true)
    setUpgradeError('')
    try {
      const token = localStorage.getItem('bikebazar_token')
      const res = await fetch(`${API_URL}/auth/upgrade`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upgrade failed')
      updateUser(data)
    } catch (err) {
      setUpgradeError(err.message)
    } finally {
      setUpgrading(false)
    }
  }

  if (!user) {
    return (
      <div className="max-w-[500px] mx-auto px-4 sm:px-6 py-24 text-center">
        <h1 className="font-display font-bold text-2xl">You're not logged in</h1>
        <Button to="/login" className="mt-6">
          Log In
        </Button>
      </div>
    )
  }

  const isDealer = user.role === 'dealer'
  const isPro = user.subscriptionTier === 'pro'
  const initial = user.name ? user.name.trim().charAt(0).toUpperCase() : '?'

  return (
    <div className="max-w-[500px] mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-display font-bold text-[26px]">Your Profile</h1>

      <Card className="mt-6">
        <div className="flex items-center gap-3.5">
          <div
            aria-hidden="true"
            className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center font-display font-bold text-lg shrink-0"
          >
            {initial}
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate">{user.name}</p>
            <p className="text-sm text-textmuted truncate">{user.email}</p>
          </div>
        </div>

        {isDealer && (
          <div className="mt-4 pt-4 border-t border-bordersoft">
            <p className="text-sm text-textmuted">
              {user.businessName} · {user.city}
            </p>
            <div className="mt-2">
              <Badge variant={isPro ? 'info' : 'neutral'} dot>
                {isPro ? 'Pro Dealer' : 'Free Dealer'}
              </Badge>
            </div>
          </div>
        )}
      </Card>

      <div className="flex gap-3 mt-4">
        <Button to="/dashboard" className="flex-1">
          Go to Dashboard
        </Button>
        <Button to="/sell" variant="secondary" className="flex-1">
          Add a Vehicle
        </Button>
      </div>

      {isDealer && !isPro && (
        <div className="mt-4">
          <Button fullWidth loading={upgrading} onClick={handleUpgrade}>
            {upgrading ? 'Upgrading...' : 'Upgrade to Pro (unlimited listings)'}
          </Button>
          <p className="text-xs text-textfaint mt-1.5 text-center">
            This is a mock upgrade for the prototype — no real payment is processed.
          </p>
          {upgradeError && (
            <p className="text-sm text-danger bg-dangerbg rounded-ctl px-3 py-2 mt-2">{upgradeError}</p>
          )}
        </div>
      )}

      <Button variant="danger" size="sm" onClick={logout} className="mt-4">
        Log Out
      </Button>
    </div>
  )
}

export default Profile