import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

function CategoryCards() {
  const [counts, setCounts] = useState(null)

  useEffect(() => {
    async function loadCounts() {
      try {
        const res = await fetch(`${API_URL}/vehicles/stats/categories`)
        if (res.ok) {
          setCounts(await res.json())
        }
      } catch {
        // Silent failure — cards just keep showing "..." below rather
        // than breaking the whole homepage over one stats call.
      }
    }
    loadCounts()
  }, [])

  const categories = [
    {
      name: 'Motorcycles',
      count: counts ? `${counts.motorcycles.toLocaleString('en-IN')} listings` : '...',
      status: 'live',
    },
    {
      name: 'Scooters',
      count: counts ? `${counts.scooters.toLocaleString('en-IN')} listings` : '...',
      status: 'live',
    },
    {
      name: 'Electric',
      count: counts ? `${counts.electric.toLocaleString('en-IN')} listings` : '...',
      status: 'live',
    },
    { name: 'Cars', count: 'Opening next', status: 'soon' },
  ]

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8" style={{ marginTop: 44 }}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[18px]">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className={`relative bg-white border border-bordercol rounded-card p-[22px] ${cat.status === 'soon' ? 'opacity-70' : ''}`}
            style={{ minHeight: 112 }}
          >
            {cat.status === 'live' ? (
              <span className="absolute top-4 right-4 text-[10.5px] font-bold flex items-center gap-1 text-success">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                Live
              </span>
            ) : (
              <span className="absolute top-4 right-4 text-[10.5px] font-bold px-2 py-0.5 rounded-badge text-neutralbadge bg-neutralbadgebg">
                Coming soon
              </span>
            )}
            <p className="font-display font-semibold text-[18px] mt-6">{cat.name}</p>
            <p className="text-[13.5px] text-textmuted mt-0.5">{cat.count}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default CategoryCards