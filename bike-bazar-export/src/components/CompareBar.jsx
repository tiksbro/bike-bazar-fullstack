import { Link } from 'react-router-dom'
import { useCompare } from '../context/CompareContext'

function CompareBar() {
  const { compareIds, compareError } = useCompare()

  if (compareIds.length === 0) return null

  return (
    <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 bg-ink text-white px-4 sm:px-6 py-3 z-50">
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
  )
}

export default CompareBar