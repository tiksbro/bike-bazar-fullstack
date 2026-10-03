import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import VehicleCard from '../components/VehicleCard'
import { VehicleGridSkeleton } from '../components/Skeleton'
import { listVehicles, getBrands } from '../services/vehicleService'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { citiesByProvince } from '../data/cities'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import VehicleTabs from '../components/VehicleTabs'

// Only used if the real brand list can't be loaded (for example, the
// backend is down). Normally each tab asks the backend for its own brands.
const fallbackBikeBrands = ['Yamaha', 'Honda', 'Bajaj', 'TVS', 'Royal Enfield', 'KTM', 'Hero', 'Suzuki', 'NIU', 'Yezdi']

// The "Type" choices for each tab. Same values the backend allows
// (bike-bazar-api/models/Vehicle.js BIKE_TYPES and CAR_TYPES).
const bikeTypes = ['motorcycle', 'scooter']
const carTypes = ['hatchback', 'sedan', 'suv', 'muv', 'pickup']

const typeLabels = {
  '': 'All',
  motorcycle: 'Motorcycle',
  scooter: 'Scooter',
  hatchback: 'Hatchback',
  sedan: 'Sedan',
  suv: 'SUV',
  muv: 'MUV',
  pickup: 'Pickup',
}

// Car-only filter choices.
const carFuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid']
const transmissionLabels = { '': 'All', manual: 'Manual', automatic: 'Automatic' }
const seatOptions = [2, 4, 5, 6, 7, 8]

// Words used in the page text, so "12 cars found" and "1 bike found" read right.
const vehicleWords = {
  bike: { one: 'bike', many: 'bikes', sell: 'Sell Your Bike' },
  car: { one: 'car', many: 'cars', sell: 'Sell Your Car' },
}

// fuelType, transmission and seats are only used on the Cars tab.
const emptyFilters = {
  q: '', brand: '', type: '', location: '', minPrice: '', maxPrice: '', sortBy: '',
  fuelType: '', transmission: '', seats: '',
}

// Turns a price like 100000 into "Rs. 1 Lakh" (or "Rs. 1.5 Lakh").
function formatLakh(amount) {
  return `Rs. ${Number(amount) / 100000} Lakh`
}

// The budget buttons on the Home page send a min and/or max price.
// This turns them back into the same words people clicked, like
// "Under Rs. 1 Lakh", so the price filter can be shown as a chip.
function priceLabel(minPrice, maxPrice) {
  if (minPrice && maxPrice) return `${formatLakh(minPrice)} – ${formatLakh(maxPrice)}`
  if (maxPrice) return `Under ${formatLakh(maxPrice)}`
  if (minPrice) return `Above ${formatLakh(minPrice)}`
  return ''
}

// A list of every filter that is ON right now, as { key, label } pairs.
// Used for the removable chips and for the count on the phone button.
// Sort is left out on purpose: it changes the order, not which vehicles show.
function getActiveFilters(filters) {
  const active = []
  if (filters.q) active.push({ key: 'q', label: `"${filters.q}"` })
  if (filters.type) active.push({ key: 'type', label: typeLabels[filters.type] })
  if (filters.brand) active.push({ key: 'brand', label: filters.brand })
  if (filters.fuelType) active.push({ key: 'fuelType', label: filters.fuelType })
  if (filters.transmission) active.push({ key: 'transmission', label: transmissionLabels[filters.transmission] })
  if (filters.seats) active.push({ key: 'seats', label: `${filters.seats} seats` })
  if (filters.location) active.push({ key: 'location', label: filters.location })
  if (filters.minPrice || filters.maxPrice) {
    active.push({ key: 'price', label: priceLabel(filters.minPrice, filters.maxPrice) })
  }
  return active
}

// Shared look for every text box and dropdown. A field that is
// actually filtering gets a soft blue tint, so you can spot it quickly.
function fieldClasses(isActive) {
  return `w-full border rounded-ctl py-2.5 text-sm outline-none transition focus:border-accent ${
    isActive ? 'border-accentsoftborder bg-accentsoftbg/60' : 'border-bordercol bg-white hover:border-borderstrong'
  }`
}

// A dropdown with our own arrow icon instead of the browser's default one.
// `appearance-none` hides the browser arrow; the SVG sits on top of the
// right edge, and `pointer-events-none` lets clicks pass through it.
function SelectField({ id, value, onChange, isActive, children }) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={onChange}
        className={`${fieldClasses(isActive)} appearance-none pl-3 pr-9`}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-textmuted"
        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  )
}

// A joined row of buttons where only one can be picked
// (used for bike Type and car Transmission).
//   options  the values, '' means "All"
//   labels   what each value says on screen
function SegmentedChoice({ labelId, options, labels, value, onChange }) {
  return (
    <div role="group" aria-labelledby={labelId} className="flex p-1 bg-sunken rounded-ctl">
      {options.map((option) => (
        <button
          key={option || 'all'}
          type="button"
          aria-pressed={value === option}
          onClick={() => onChange(option)}
          className={`flex-1 text-[12px] py-1.5 rounded-[7px] transition ${
            value === option
              ? 'bg-accent text-white font-semibold shadow-card'
              : 'text-textmuted hover:text-ink'
          }`}
        >
          {labels[option]}
        </button>
      ))}
    </div>
  )
}

// Reads the starting filters from the URL, like /vehicles?vehicle=car&type=suv
// (the Home page links here this way). Anything that doesn't belong to this
// tab is ignored, so ?type=scooter on the Cars tab can't hide every car.
function filtersFromUrl(searchParams, vehicle) {
  const isCar = vehicle === 'car'
  const allowedTypes = isCar ? carTypes : bikeTypes
  const type = searchParams.get('type') || ''
  const fuelType = searchParams.get('fuelType') || ''
  const transmission = searchParams.get('transmission') || ''
  const seats = searchParams.get('seats') || ''

  return {
    ...emptyFilters,
    q: searchParams.get('q') || '',
    brand: searchParams.get('brand') || '',
    type: allowedTypes.includes(type) ? type : '',
    location: searchParams.get('location') || '',
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : '',
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : '',
    fuelType: isCar && carFuelTypes.includes(fuelType) ? fuelType : '',
    transmission: isCar && ['manual', 'automatic'].includes(transmission) ? transmission : '',
    seats: isCar && seatOptions.includes(Number(seats)) ? seats : '',
  }
}

// The actual filter inputs, in one place. Rendered twice — once inside
// the always-visible desktop sidebar, once inside the mobile slide-up
// panel — so both stay in sync without duplicating the fields.
// `idPrefix` keeps the two copies' ids different ("desktop-brand" vs
// "mobile-brand"), because two elements on one page must never share an id.
// The Bikes tab and the Cars tab share Search, Brand, Location and Sort.
// Bikes get the Motorcycle/Scooter switch. Cars get Body type, Fuel,
// Transmission and Seats instead.
function FilterFields({ vehicle, brands, filters, updateFilter, idPrefix }) {
  const labelClasses = 'text-[13px] font-semibold text-textbody block mb-1.5'
  const isCar = vehicle === 'car'

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label htmlFor={`${idPrefix}-q`} className={labelClasses}>Search</label>
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-textfaint"
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            id={`${idPrefix}-q`}
            type="text"
            value={filters.q}
            onChange={(e) => updateFilter('q', e.target.value)}
            placeholder="Brand or model"
            className={`${fieldClasses(Boolean(filters.q))} pl-9 pr-3`}
          />
        </div>
      </div>

      {isCar ? (
        <div>
          {/* Five body types are too many for one joined switch in the
              narrow sidebar, so cars use a dropdown here. */}
          <label htmlFor={`${idPrefix}-type`} className={labelClasses}>Body type</label>
          <SelectField
            id={`${idPrefix}-type`}
            value={filters.type}
            onChange={(e) => updateFilter('type', e.target.value)}
            isActive={Boolean(filters.type)}
          >
            <option value="">All body types</option>
            {carTypes.map((t) => (
              <option key={t} value={t}>{typeLabels[t]}</option>
            ))}
          </SelectField>
        </div>
      ) : (
        <div>
          <span id={`${idPrefix}-type-label`} className={labelClasses}>Type</span>
          {/* One joined "segmented" control: a grey track with the chosen
              option lifted out in blue. aria-pressed tells screen readers
              which one is picked. */}
          <SegmentedChoice
            labelId={`${idPrefix}-type-label`}
            options={['', ...bikeTypes]}
            labels={typeLabels}
            value={filters.type}
            onChange={(t) => updateFilter('type', t)}
          />
        </div>
      )}

      <div>
        <label htmlFor={`${idPrefix}-brand`} className={labelClasses}>Brand</label>
        <SelectField
          id={`${idPrefix}-brand`}
          value={filters.brand}
          onChange={(e) => updateFilter('brand', e.target.value)}
          isActive={Boolean(filters.brand)}
        >
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </SelectField>
      </div>

      {isCar && (
        <>
          <div>
            <label htmlFor={`${idPrefix}-fuelType`} className={labelClasses}>Fuel</label>
            <SelectField
              id={`${idPrefix}-fuelType`}
              value={filters.fuelType}
              onChange={(e) => updateFilter('fuelType', e.target.value)}
              isActive={Boolean(filters.fuelType)}
            >
              <option value="">All fuel types</option>
              {carFuelTypes.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </SelectField>
          </div>

          <div>
            <span id={`${idPrefix}-transmission-label`} className={labelClasses}>Transmission</span>
            <SegmentedChoice
              labelId={`${idPrefix}-transmission-label`}
              options={['', 'manual', 'automatic']}
              labels={transmissionLabels}
              value={filters.transmission}
              onChange={(t) => updateFilter('transmission', t)}
            />
          </div>

          <div>
            <label htmlFor={`${idPrefix}-seats`} className={labelClasses}>Seats</label>
            <SelectField
              id={`${idPrefix}-seats`}
              value={filters.seats}
              onChange={(e) => updateFilter('seats', e.target.value)}
              isActive={Boolean(filters.seats)}
            >
              <option value="">Any number</option>
              {seatOptions.map((n) => (
                <option key={n} value={String(n)}>{n} seats</option>
              ))}
            </SelectField>
          </div>
        </>
      )}

      <div>
        <label htmlFor={`${idPrefix}-location`} className={labelClasses}>Location</label>
        <SelectField
          id={`${idPrefix}-location`}
          value={filters.location}
          onChange={(e) => updateFilter('location', e.target.value)}
          isActive={Boolean(filters.location)}
        >
          <option value="">All locations</option>
          {Object.entries(citiesByProvince).map(([province, provinceCities]) => (
            <optgroup key={province} label={province}>
              {provinceCities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </optgroup>
          ))}
        </SelectField>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-sortBy`} className={labelClasses}>Sort by</label>
        {/* Never tinted blue: sorting isn't a filter, "Newest" is just the default order. */}
        <SelectField
          id={`${idPrefix}-sortBy`}
          value={filters.sortBy}
          onChange={(e) => updateFilter('sortBy', e.target.value)}
          isActive={false}
        >
          <option value="">Newest</option>
          <option value="priceLowHigh">Price: Low → High</option>
          <option value="priceHighLow">Price: High → Low</option>
          <option value="lowestKm">Lowest KM</option>
        </SelectField>
      </div>
    </div>
  )
}

// The small blue "Yamaha ✕" pills at the top of the desktop sidebar.
// Clicking the ✕ removes just that one filter.
function ActiveFilterChips({ activeFilters, onRemove }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {activeFilters.map((f) => (
        <span
          key={f.key}
          className="inline-flex items-center gap-1 max-w-full text-xs font-semibold pl-2.5 pr-1 py-1 rounded-full bg-accentsoftbg text-accentsofttext ring-1 ring-inset ring-accentsoftborder"
        >
          <span className="truncate">{f.label}</span>
          <button
            type="button"
            onClick={() => onRemove(f.key)}
            aria-label={`Remove ${f.label} filter`}
            className="shrink-0 p-0.5 rounded-full hover:bg-accentsoftborder"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </span>
      ))}
    </div>
  )
}

// The page itself. Its only jobs: read which tab is in the URL, and
// change the URL when someone picks the other tab.
//
// The tab lives in the URL (/vehicles = Bikes, /vehicles?vehicle=car = Cars)
// instead of in useState, so:
//   - the Back button goes back to the tab you were on,
//   - a shared link opens the same tab for your friend,
//   - refreshing the page keeps the tab.
function Browse() {
  const [searchParams, setSearchParams] = useSearchParams()
  const vehicle = searchParams.get('vehicle') === 'car' ? 'car' : 'bike'

  // Picking a tab starts that tab fresh, with no filters. Bikes is the
  // default, so its URL is just /vehicles with nothing after it.
  // setSearchParams adds a new entry to the browser history, which is
  // what makes the Back button work.
  function switchTab(nextVehicle) {
    setSearchParams(nextVehicle === 'car' ? { vehicle: 'car' } : {})
  }

  // `key` is a React trick: when the key changes, React throws the old
  // BrowseTab away and builds a new one from scratch. The key is the URL's
  // ?... part, so whenever the URL changes (picking a tab, Back button,
  // a link from the Home page) the filters start again from the new URL.
  // Changing a filter does NOT change the URL, so typing in the search
  // box never restarts anything.
  return (
    <BrowseTab
      key={searchParams.toString()}
      vehicle={vehicle}
      searchParams={searchParams}
      onSwitchTab={switchTab}
    />
  )
}

// One tab of the Browse page: its filters, its brand list and its results.
function BrowseTab({ vehicle, searchParams, onSwitchTab }) {
  const words = vehicleWords[vehicle]
  useDocumentTitle(vehicle === 'car' ? 'Browse Cars' : 'Browse Bikes')

  // The function form of useState runs filtersFromUrl only once, when
  // this tab is first built, not again on every re-render.
  const [filters, setFilters] = useState(() => filtersFromUrl(searchParams, vehicle))

  // Each tab has its own brands (Hyundai, Suzuki... for cars), taken from
  // real listings. Until they arrive (or if loading fails), bikes show the
  // old fixed list and cars show just "All brands".
  const [brands, setBrands] = useState(vehicle === 'bike' ? fallbackBikeBrands : [])

  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // `(current) => ...` form: React hands us the newest filters, so two
  // quick changes in a row can never overwrite each other.
  function updateFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value }))
  }

  // Removes one filter (used by the chips). Price is stored as two
  // fields (min + max) but shown as one chip, so it clears both.
  function removeFilter(key) {
    if (key === 'price') {
      setFilters((current) => ({ ...current, minPrice: '', maxPrice: '' }))
    } else {
      updateFilter(key, '')
    }
  }

  // Clears every filter but keeps the chosen sort order, since sorting
  // isn't a filter.
  function clearFilters() {
    setFilters((current) => ({ ...emptyFilters, sortBy: current.sortBy }))
  }

  // Every filter that is narrowing the results right now. Its length is
  // shown as a small count on the phone "Filters" button, and on the
  // desktop sidebar heading. Price now counts too (before, a budget
  // search from the Home page was invisible here).
  const activeFilters = getActiveFilters(filters)
  const activeFilterCount = activeFilters.length

  useEffect(() => {
    // `ignore` stops a late answer from an old tab overwriting this one.
    let ignore = false
    getBrands(vehicle)
      .then((list) => {
        if (!ignore && list.length > 0) setBrands(list)
      })
      .catch(() => {
        // Keep the fallback list. The results below still load on their own.
      })
    return () => {
      ignore = true
    }
  }, [vehicle])

  // A brand that came from a link (like ?brand=Honda) but has no listings
  // yet still needs to show as picked in the dropdown, so we add it.
  const brandOptions =
    filters.brand && !brands.includes(filters.brand) ? [filters.brand, ...brands] : brands

  // Pressing Escape closes the mobile filter panel, same as the offer window.
  useEffect(() => {
    if (!showMobileFilters) return
    function onKey(e) {
      if (e.key === 'Escape') setShowMobileFilters(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [showMobileFilters])

  // Dependency array is [filters] this time, not [] — every time ANY
  // filter changes (typing in search, picking a brand, etc.), `filters`
  // becomes a new object, so this runs again and asks the backend for
  // freshly filtered results. This is actually how it SHOULD work with
  // a real API: filtering happens on the server, not in the browser.
  useEffect(() => {
    async function loadResults() {
      setLoading(true)
      setError('')
      try {
        // `vehicle` tells the backend which tab: only bikes, or only cars.
        const data = await listVehicles({ ...filters, vehicle })
        setResults(data)
      } catch {
        setError("Couldn't load vehicles. Check your connection and try again.")
      } finally {
        setLoading(false)
      }
    }
    loadResults()
  }, [filters, vehicle, retryCount])

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display font-bold text-[26px]">Browse Vehicles</h1>

      <VehicleTabs value={vehicle} onChange={onSwitchTab} className="mt-4" />

      <p className="text-textmuted text-sm mt-3" aria-live="polite">
        {loading
          ? 'Searching...'
          : `${results.length} ${results.length === 1 ? words.one : words.many} found`}
      </p>

      {/* Phone only: a single "Filters" button instead of the long list
          of fields, so real listings show up right away without
          scrolling past every filter first. */}
      <div className="flex items-center gap-2 md:hidden mt-4">
        <Button variant="secondary" size="sm" onClick={() => setShowMobileFilters(true)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </Button>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-[260px_1fr] gap-8 mt-4 md:mt-6">
        {/* Desktop only: the filter sidebar, in a white card.
            `sticky` keeps it in view while you scroll the results; the top
            value is the navbar's height (64px, or 72px on large screens)
            plus a little gap, so it stops just under the navbar. */}
        <aside className="hidden md:block">
          <Card
            padding="md"
            className="sticky top-[88px] lg:top-[96px] max-h-[calc(100vh-7rem)] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-base flex items-center gap-2">
                Filters
                {activeFilterCount > 0 && (
                  <span className="min-w-5 h-5 px-1.5 rounded-full bg-accent text-white text-[11px] font-bold inline-flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </h2>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-[13px] font-semibold text-accent hover:text-accenthover hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            {activeFilterCount > 0 && (
              <div className="mt-3">
                <ActiveFilterChips activeFilters={activeFilters} onRemove={removeFilter} />
              </div>
            )}

            <div className="border-t border-bordersoft mt-4 pt-4">
              <FilterFields vehicle={vehicle} brands={brandOptions} filters={filters} updateFilter={updateFilter} idPrefix="desktop" />
            </div>
          </Card>
        </aside>

        <div>
          {loading ? (
            <VehicleGridSkeleton count={6} />
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-sm text-danger bg-dangerbg rounded-ctl px-3 py-2 inline-block">{error}</p>
              <div className="mt-4">
                <Button onClick={() => setRetryCount((c) => c + 1)}>Try Again</Button>
              </div>
            </div>
          ) : results.length === 0 ? (
            activeFilterCount > 0 ? (
              <EmptyState
                title={`No ${words.many} match these filters`}
                message="Try clearing a filter to see more results."
                actionLabel="Clear Filters"
                onAction={clearFilters}
              />
            ) : (
              // No filters on and still nothing: this tab has no listings yet
              // (likely on the Cars tab while cars are new).
              <EmptyState
                title={`No ${words.many} listed yet`}
                message="Be the first to list one. It only takes a few minutes."
                actionLabel={words.sell}
                actionTo="/sell"
              />
            )
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} variant="result" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Phone only: the filter panel, slides up from the bottom. */}
      {showMobileFilters && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-filters-title"
          className="fixed inset-0 z-[60] md:hidden"
        >
          <div className="absolute inset-0 bg-ink/50" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-[20px] shadow-pop max-h-[85vh] overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 id="mobile-filters-title" className="font-display font-bold text-lg">
                Filters
              </h2>
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                aria-label="Close filters"
                className="p-1.5 text-textmuted hover:text-ink"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <FilterFields vehicle={vehicle} brands={brandOptions} filters={filters} updateFilter={updateFilter} idPrefix="mobile" />

            <div className="flex gap-2 mt-6">
              {activeFilterCount > 0 && (
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    clearFilters()
                    setShowMobileFilters(false)
                  }}
                >
                  Clear all
                </Button>
              )}
              <Button className="flex-1" onClick={() => setShowMobileFilters(false)}>
                {loading
                  ? 'Show results'
                  : `Show ${results.length} ${results.length === 1 ? 'result' : 'results'}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Browse
