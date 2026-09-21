import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

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
        <Link
          to="/login"
          className="inline-flex mt-6 bg-accent hover:bg-accenthover transition text-white font-semibold text-sm rounded-btn px-5 py-3"
        >
          Log In
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-[500px] mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-display font-bold text-[26px]">Your Profile</h1>
      <div className="border border-bordercol rounded-card p-5 mt-6">
        <p className="font-semibold">{user.name}</p>
        <p className="text-sm text-textmuted mt-0.5">{user.email}</p>
        {user.role === 'dealer' && (
          <div className="mt-3 pt-3 border-t border-bordersoft">
            <p className="text-sm text-textmuted">{user.businessName} · {user.city}</p>
            <span
              className={`inline-block mt-2 text-[11px] font-bold px-2 py-0.5 rounded-badge ${
                user.subscriptionTier === 'pro' ? 'text-accent bg-accentsoftbg' : 'text-textmuted bg-sunken'
              }`}
            >
              {user.subscriptionTier === 'pro' ? 'Pro Dealer' : 'Free Dealer'}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-4">
        <Link
          to="/dashboard"
          className="flex-1 text-center bg-accent hover:bg-accenthover transition text-white font-semibold text-sm rounded-btn px-5 py-3"
        >
          Go to Dashboard
        </Link>
        <Link
          to="/sell"
          className="flex-1 text-center border border-bordercol font-semibold text-sm rounded-btn px-5 py-3"
        >
          Add a Vehicle
        </Link>
      </div>

      {user.role === 'dealer' && user.subscriptionTier !== 'pro' && (
        <div className="mt-4">
          <button
            onClick={handleUpgrade}
            disabled={upgrading}
            className="w-full bg-accent hover:bg-accenthover transition text-white font-semibold text-sm rounded-btn px-5 py-3 disabled:opacity-50"
          >
            {upgrading ? 'Upgrading...' : 'Upgrade to Pro (unlimited listings)'}
          </button>
          <p className="text-xs text-textfaint mt-1.5 text-center">
            This is a mock upgrade for the prototype — no real payment is processed.
          </p>
          {upgradeError && (
            <p className="text-sm text-danger bg-dangerbg rounded-ctl px-3 py-2 mt-2">{upgradeError}</p>
          )}
        </div>
      )}

      <button onClick={logout} className="mt-4 text-sm font-semibold px-4 py-2 rounded-btn border border-bordercol">
        Log Out
      </button>
    </div>
  )
}

export default Profile