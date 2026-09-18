import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Profile() {
  const { user, logout } = useAuth()

  if (!user) {
    return (
      <div className="max-w-[500px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
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
    <div className="max-w-[500px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-display font-bold text-[26px]">Your Profile</h1>
      <div className="border border-bordercol rounded-card p-5 mt-6">
        <p className="font-semibold">{user.name}</p>
        <p className="text-sm text-textmuted mt-0.5">{user.email}</p>
      </div>
      <button onClick={logout} className="mt-4 text-sm font-semibold px-4 py-2 rounded-btn border border-bordercol">
        Log Out
      </button>
    </div>
  )
}

export default Profile