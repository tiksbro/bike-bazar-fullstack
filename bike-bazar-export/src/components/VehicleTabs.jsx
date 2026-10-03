import { useRef } from 'react'

// The "Bikes | Cars" switch.
// Used at the top of the Browse page and above the Home page search box,
// so both places look and behave the same.
//
// It does NOT remember which tab is picked by itself. The page that uses it
// keeps the value (for Browse, that is the ?vehicle= part of the URL) and
// passes it in. This is called a "controlled" component:
//   value     'bike' or 'car', the tab that is picked right now
//   onChange  called with 'bike' or 'car' when someone picks a tab
//   tone      'light' on a white page (default), 'dark' on the dark Home banner

const VEHICLE_TABS = [
  { value: 'bike', label: 'Bikes' },
  { value: 'car', label: 'Cars' },
]

// Small line icons, drawn with the text color (currentColor),
// so they turn the same color as the label.
function BikeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="5.5" cy="16" r="3.5" />
      <circle cx="18.5" cy="16" r="3.5" />
      <path d="M5.5 16l4-7h5l4 7" />
      <path d="M9.5 9L8 6.5H6" />
      <path d="M14.5 9l1.5-3h2" />
    </svg>
  )
}

function CarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 16v-3.5l2-4.5h9l4 4.5 3 .8V16" />
      <path d="M3 16h1.5M9.5 16h5M19.5 16H21" />
      <circle cx="7" cy="16.5" r="2.2" />
      <circle cx="17" cy="16.5" r="2.2" />
      <path d="M6.5 12.5h11" />
    </svg>
  )
}

const icons = { bike: BikeIcon, car: CarIcon }

// Colors for the two looks. "track" is the bar behind the buttons,
// "on" is the picked button, "off" is the other one.
// Light: white bar, picked tab in our blue (same as the Type switch on Browse).
// Dark: see-through bar, picked tab in white, so it shows up on the dark banner.
const tones = {
  light: {
    track: 'bg-white ring-1 ring-inset ring-bordercol shadow-card',
    on: 'bg-accent text-white shadow-btn',
    off: 'text-textmuted hover:text-ink hover:bg-sunken',
  },
  dark: {
    track: 'bg-white/10 ring-1 ring-inset ring-white/20',
    on: 'bg-white text-ink shadow-card',
    off: 'text-white/80 hover:text-white',
  },
}

function VehicleTabs({ value, onChange, tone = 'light', className = '' }) {
  const t = tones[tone] ?? tones.light
  // Anything other than 'car' (missing, empty, a typo in the URL) counts as Bikes,
  // the same rule the backend uses for old listings.
  const current = value === 'car' ? 'car' : 'bike'

  // We keep a reference to each button so the arrow keys can move focus.
  const buttonRefs = useRef({})

  // Keyboard support, the usual way for tabs:
  // Left/Right arrow moves to the other tab and picks it.
  // Tab key then leaves the switch (only the picked tab is in the Tab order).
  function handleKeyDown(e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    const index = VEHICLE_TABS.findIndex((tab) => tab.value === current)
    const step = e.key === 'ArrowRight' ? 1 : -1
    const next = VEHICLE_TABS[(index + step + VEHICLE_TABS.length) % VEHICLE_TABS.length]
    onChange(next.value)
    buttonRefs.current[next.value]?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label="Bikes or cars"
      onKeyDown={handleKeyDown}
      className={`inline-flex gap-1 rounded-btn p-1 ${t.track} ${className}`}
    >
      {VEHICLE_TABS.map((tab) => {
        const selected = tab.value === current
        const Icon = icons[tab.value]
        return (
          <button
            key={tab.value}
            ref={(el) => (buttonRefs.current[tab.value] = el)}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => {
              // Clicking the tab that is already picked does nothing,
              // so the page doesn't reload the same list for no reason.
              if (!selected) onChange(tab.value)
            }}
            className={`flex items-center justify-center gap-2 min-w-[104px] rounded-[8px] px-4 py-2 text-sm font-semibold transition ${
              selected ? t.on : t.off
            }`}
          >
            <Icon />
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

export default VehicleTabs
