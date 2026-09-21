import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const tabClass = ({ isActive }) =>
  `flex flex-col items-center gap-1 text-[11px] font-medium ${isActive ? 'text-accent' : 'text-textmuted'}`

function MobileBottomNav() {
  const { user } = useAuth()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-bordercol flex justify-around items-center h-16 z-40">
      <NavLink to="/" end className={tabClass}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" />
        </svg>
        Home
      </NavLink>

      <NavLink to="/vehicles" className={tabClass}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        Search
      </NavLink>

      <Link to="/sell" className="flex flex-col items-center -mt-6">
        <span className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shadow-lg">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
        <span className="text-[11px] font-medium text-textmuted mt-1">Sell</span>
      </Link>

      <NavLink to="/dashboard" className={tabClass}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="7" height="9" rx="1.5" />
          <rect x="14" y="3" width="7" height="5" rx="1.5" />
          <rect x="14" y="12" width="7" height="9" rx="1.5" />
          <rect x="3" y="16" width="7" height="5" rx="1.5" />
        </svg>
        Dashboard
      </NavLink>

      <NavLink to={user ? '/profile' : '/login'} className={tabClass}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
        </svg>
        {user ? 'Profile' : 'Log in'}
      </NavLink>
    </nav>
  )
}

export default MobileBottomNav