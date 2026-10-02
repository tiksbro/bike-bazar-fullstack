import { Link, useLocation } from 'react-router-dom'
import { useCompare } from '../context/CompareContext'

function CompareBar() {
  const { compareIds, compareError } = useCompare()
  const { pathname } = useLocation()

  if (compareIds.length === 0) return null

  // No need for a "Compare Now" bar when you're already on the Compare page.
  if (pathname === '/compare') return null

  // On a vehicle's page, phones already have the "Make Offer" bar at the
  // bottom. Showing this bar too would stack 3 bars (about a quarter of
  // the screen), so on phones (`max-md:hidden`) it hides on that page.
  const hideOnPhone = pathname.startsWith('/vehicle/') ? 'max-md:hidden' : ''

  return (
    <>
      {/* An invisible box the same height as the bar. The bar is "fixed"
          (it floats over the page), so without this box it would cover the
          last part of the page, like the bottom of the footer. */}
      <div aria-hidden="true" className={`h-[60px] ${hideOnPhone}`} />

      <div className={`fixed bottom-16 lg:bottom-0 left-0 right-0 bg-ink text-white px-4 sm:px-6 py-3 z-50 ${hideOnPhone}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm">
            {compareIds.length} vehicle{compareIds.length > 1 ? 's' : ''} selected
          </span>
          <Link
            to="/compare"
            className="bg-accent hover:bg-accenthover transition text-sm font-semibold px-4 py-2 rounded-btn"
          >
            Compare Now
          </Link>
        </div>
        {/* Only renders when there's actually an error to show — e.g.
            trying to add a 5th vehicle past the server's 4-vehicle limit. */}
        {compareError && <p className="text-xs text-red-300 mt-1.5">{compareError}</p>}
      </div>
    </>
  )
}

export default CompareBar
