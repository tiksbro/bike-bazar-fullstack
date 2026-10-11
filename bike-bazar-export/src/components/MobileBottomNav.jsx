import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// The bottom bar on phones and tablets (hidden from lg = 1024px up).
//
// IMPORTANT: the bar is 64px tall (h-16). Two other files count on that:
//   MainLayout.jsx  pb-16 leaves room at the bottom of every page
//   CompareBar.jsx  bottom-16 puts the Compare bar just above this bar
// So if you ever change the height, change those two as well.

// flex-1: every tab takes an equal share of the width, so the whole
// area is tappable, not only the small icon.
const tabClass = ({ isActive }) =>
  `flex-1 flex flex-col items-center justify-center gap-1 h-full text-[11.5px] transition ${
    isActive ? 'text-accent font-semibold' : 'text-textmuted font-medium'
  }`

// Each icon gets `active`. When the tab is open, the icon is filled in
// (like the mockup's blue Home icon). Otherwise it is just an outline.
function HomeIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" />
    </svg>
  )
}

function SearchIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 1.8} strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  )
}

function DashboardIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  )
}

function ProfileIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  )
}

function MobileBottomNav() {
  const { user } = useAuth()

  return (
    <nav
      aria-label="Main"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 flex items-center bg-white/95 backdrop-blur-md border-t border-bordercol shadow-[0_-6px_20px_rgba(14,17,22,0.06)]"
    >
      {/* NavLink can take a FUNCTION as its children. React Router calls it
          with { isActive }, so the icon can know if its tab is open. */}
      <NavLink to="/" end className={tabClass}>
        {({ isActive }) => (
          <>
            <HomeIcon active={isActive} />
            Home
          </>
        )}
      </NavLink>

      <NavLink to="/vehicles" className={tabClass}>
        {({ isActive }) => (
          <>
            <SearchIcon active={isActive} />
            Search
          </>
        )}
      </NavLink>

      {/* The big round Sell button. -mt-7 lifts it above the bar, and the
          white ring makes a small gap between the button and the bar. */}
      <Link to="/sell" className="flex-1 flex flex-col items-center -mt-7" aria-label="Sell your vehicle">
        <span className="w-14 h-14 rounded-full bg-accent hover:bg-accenthover transition ring-4 ring-white shadow-btn flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
        <span className="text-[11.5px] font-semibold text-ink mt-0.5">Sell</span>
      </Link>

      <NavLink to="/dashboard" className={tabClass}>
        {({ isActive }) => (
          <>
            <DashboardIcon active={isActive} />
            Dashboard
          </>
        )}
      </NavLink>

      <NavLink to={user ? '/profile' : '/login'} className={tabClass}>
        {({ isActive }) => (
          <>
            <ProfileIcon active={isActive} />
            {user ? 'Profile' : 'Log in'}
          </>
        )}
      </NavLink>
    </nav>
  )
}

export default MobileBottomNav
