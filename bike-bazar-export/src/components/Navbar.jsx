import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// whitespace-nowrap keeps two-word links like "Buy Vehicle" on ONE line.
// Before, they broke into two lines when the screen got narrower.
const navLinkClass = ({ isActive }) =>
  `whitespace-nowrap ${isActive ? 'text-accent font-semibold' : 'text-textmuted hover:text-ink transition'}`

// Dashboard / Favorites / account links on the right side.
const rightLinkClass =
  'flex items-center gap-2 text-[14px] font-medium text-textmuted hover:text-ink transition whitespace-nowrap'

const mobileLinkClass = ({ isActive }) =>
  `flex items-center gap-2.5 px-4 py-3 rounded-ctl text-sm ${
    isActive ? 'bg-accentsoftbg text-accentsofttext font-semibold' : 'text-textbody hover:bg-sunken'
  }`

function IconBadge({ children, tone = 'accent' }) {
  const tones = {
    accent: 'bg-accentsoftbg text-accent',
    muted: 'bg-sunken text-textmuted',
  }
  return (
    <span className={`w-7 h-7 rounded-full flex items-center justify-center ${tones[tone]}`}>
      {children}
    </span>
  )
}

function Navbar() {
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  // Only the first name in the top bar ("Hi, Tikaram"), so a long full
  // name can't push the other links off the screen.
  const firstName = user?.name?.split(' ')[0]

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-bordercol">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* The full menu needs about 1280px of width. Below that (xl = 1280px)
            the hamburger menu is used instead, so nothing gets squashed. */}
        <div className="flex items-center h-[64px] lg:h-[72px] gap-4 xl:gap-6 2xl:gap-8">
          <Link to="/" className="flex items-center gap-2.5 shrink-0" onClick={closeMenu}>
            <span className="w-8 h-8 rounded-[9px] bg-accent flex items-center justify-center text-white font-display font-bold text-base">
              B
            </span>
            <span className="font-display font-bold text-[17px] lg:text-[19px] text-ink">Bike Bazar</span>
          </Link>

          <nav className="hidden xl:flex items-center gap-5 2xl:gap-[26px] text-[14.5px]">
            <NavLink to="/vehicles" className={navLinkClass}>Buy Vehicle</NavLink>
            <NavLink to="/sell" className={navLinkClass}>Sell</NavLink>
            <NavLink to="/new-bikes" className={navLinkClass}>New Bikes</NavLink>
            <NavLink to="/compare" className={navLinkClass}>Compare</NavLink>
            <NavLink to="/dealers" className={navLinkClass}>Dealers</NavLink>
            <NavLink to="/services" className={navLinkClass}>Services</NavLink>
            <NavLink to="/guides" className={navLinkClass}>Guides</NavLink>
          </nav>

          {/* Between 1280px and 1536px, Dashboard and Favorites show just their
              icon (the words appear from 2xl = 1536px up). aria-label and
              title still give the name to screen readers and on hover. */}
          <div className="hidden xl:flex items-center gap-4 ml-auto">
            <Link to="/dashboard" className={rightLinkClass} aria-label="Dashboard" title="Dashboard">
              <IconBadge tone="muted">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="9" rx="1.5" />
                  <rect x="14" y="3" width="7" height="5" rx="1.5" />
                  <rect x="14" y="12" width="7" height="9" rx="1.5" />
                  <rect x="3" y="16" width="7" height="5" rx="1.5" />
                </svg>
              </IconBadge>
              <span className="hidden 2xl:inline">Dashboard</span>
            </Link>

            <Link to="/favorites" className={rightLinkClass} aria-label="Favorites" title="Favorites">
              <IconBadge tone="muted">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.8 4.6c-1.8-1.5-4.5-1.3-6.1.4L12 7.7l-2.7-2.7c-1.6-1.7-4.3-1.9-6.1-.4-2 1.7-2.1 4.8-.3 6.6l8.4 8.6a1 1 0 0 0 1.4 0l8.4-8.6c1.8-1.8 1.7-4.9-.3-6.6z" />
                </svg>
              </IconBadge>
              <span className="hidden 2xl:inline">Favorites</span>
            </Link>

            <Link to={user ? '/profile' : '/login'} className={rightLinkClass}>
              <IconBadge tone="accent">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
                </svg>
              </IconBadge>
              {/* max-w + truncate: a very long first name ends with "..." */}
              <span className="max-w-[120px] truncate">{user ? `Hi, ${firstName}` : 'Log in'}</span>
            </Link>
          </div>

          <Link
            to="/sell"
            className="hidden sm:inline-flex items-center bg-accent hover:bg-accenthover transition text-white font-semibold text-sm rounded-btn px-[14px] py-[9px] xl:px-[18px] xl:py-[11px] whitespace-nowrap ml-auto xl:ml-0"
          >
            Sell Your Vehicle
          </Link>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="xl:hidden w-9 h-9 flex items-center justify-center text-ink ml-auto sm:ml-0"
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {menuOpen && (
          <nav className="xl:hidden pb-4 flex flex-col gap-1 border-t border-bordercol pt-3">
            <NavLink to="/vehicles" className={mobileLinkClass} onClick={closeMenu}>Buy Vehicle</NavLink>
            <NavLink to="/sell" className={mobileLinkClass} onClick={closeMenu}>Sell</NavLink>
            <NavLink to="/new-bikes" className={mobileLinkClass} onClick={closeMenu}>New Bikes</NavLink>
            <NavLink to="/compare" className={mobileLinkClass} onClick={closeMenu}>Compare</NavLink>
            <NavLink to="/dealers" className={mobileLinkClass} onClick={closeMenu}>Dealers</NavLink>
            <NavLink to="/services" className={mobileLinkClass} onClick={closeMenu}>Services</NavLink>
            <NavLink to="/guides" className={mobileLinkClass} onClick={closeMenu}>Guides</NavLink>
            <div className="h-px bg-bordercol my-2" />
            <NavLink to="/dashboard" className={mobileLinkClass} onClick={closeMenu}>Dashboard</NavLink>
            <NavLink to="/favorites" className={mobileLinkClass} onClick={closeMenu}>♡ Favorites</NavLink>
            <NavLink to={user ? '/profile' : '/login'} className={mobileLinkClass} onClick={closeMenu}>
              {user ? `Hi, ${user.name}` : 'Log in'}
            </NavLink>
            <Link
              to="/sell"
              onClick={closeMenu}
              className="sm:hidden mt-2 text-center bg-accent text-white font-semibold text-sm rounded-btn px-4 py-3"
            >
              Sell Your Vehicle
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}

export default Navbar