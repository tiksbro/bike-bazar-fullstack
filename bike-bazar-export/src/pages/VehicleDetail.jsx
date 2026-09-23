import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import VehicleCard, { VehicleArt } from '../components/VehicleCard'
import { getVehicleBySlug, getSimilar, getHealthScore } from '../services/vehicleService'
import { getUserContact } from '../services/userService'
import HealthScoreGauge from '../components/HealthScoreGauge'
import HealthScoreBreakdown from '../components/HealthScoreBreakdown'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import MakeOfferModal from '../components/MakeOfferModal'

const artBackgrounds = {
  orange: 'linear-gradient(160deg,#FDECE0,#F6C79B)',
  blue: 'linear-gradient(160deg,#E7EDFB,#B9C8F0)',
  graphite: 'linear-gradient(160deg,#EDEEF0,#C7CACF)',
  teal: 'linear-gradient(160deg,#E1F4EE,#A9DCCB)',
}

const priceBadgeStyles = {
  good: { label: 'Good Price', color: '#12805C', bg: '#E3F3EC' },
  fair: { label: 'Fair Price', color: '#8A5A12', bg: '#FBF0DA' },
  high: { label: 'High Price', color: '#A23A2C', bg: '#FBE6E2' },
}

function VehicleDetail() {
  const { slug } = useParams()
  const [vehicle, setVehicle] = useState(null)
  const [similar, setSimilar] = useState([])
  const [sellerContact, setSellerContact] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [offerModalOpen, setOfferModalOpen] = useState(false)

  useEffect(() => {
    async function loadVehicle() {
      setLoading(true)
      setError('')
      try {
        const data = await getVehicleBySlug(slug)
        setVehicle(data)
        setSellerContact(null)

        // Only fetch similar vehicles/seller contact if we actually found
        // one — both need a real vehicle to look up.
        if (data) {
          const [similarData, contactData] = await Promise.all([
            getSimilar(data),
            getUserContact(data.owner),
          ])
          setSimilar(similarData)
          setSellerContact(contactData) 
        }
      } catch {
        setError("Couldn't load this vehicle. Check your connection and try again.")
      } finally {
        setLoading(false)
      }
    }
    loadVehicle()
  }, [slug, retryCount])

  // This hook must stay ABOVE any early return (Rules of Hooks, same
  // as before) — it now needs to handle THREE possible states instead
  // of two: still loading, not found, or actually found.
  useDocumentTitle(loading ? 'Loading...' : error ? 'Error' : vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Vehicle Not Found')

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <p className="text-textmuted">Loading vehicle...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <p className="text-sm text-danger bg-dangerbg rounded-ctl px-3 py-2 inline-block">{error}</p>
        <div>
          <button
            onClick={() => setRetryCount((c) => c + 1)}
            className="inline-flex mt-6 bg-accent hover:bg-accenthover transition text-white font-semibold text-sm rounded-btn px-5 py-3"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="font-display font-bold text-2xl">Vehicle Not Found</h1>
        <p className="text-textmuted mt-2">This listing may have been removed or the link is incorrect.</p>
        <Link to="/vehicles" className="inline-flex mt-6 bg-accent hover:bg-accenthover transition text-white font-semibold text-sm rounded-btn px-5 py-3">
          Browse Other Vehicles
        </Link>
      </div>
    )
  }

  const priceBadge = priceBadgeStyles[vehicle.priceInsight]
  const healthScore = getHealthScore(vehicle)

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/vehicles" className="text-sm text-accent font-semibold hover:underline">← Back to results</Link>

      <div className="grid md:grid-cols-2 gap-8 mt-4">
        <div className="relative rounded-card overflow-hidden h-[340px]" style={{ background: artBackgrounds[vehicle.artColor] }}>
          <VehicleArt type={vehicle.type} />
        </div>

        <div>
          <h1 className="font-display font-bold text-[28px]">{vehicle.brand} {vehicle.model}</h1>
          <p className="text-textmuted mt-1">
            {vehicle.year} · {vehicle.mileageKm.toLocaleString()} KM · {vehicle.engineCc}cc · {vehicle.fuelType}
          </p>
          <p className="text-textmuted">{vehicle.location}</p>

          <p className="font-display font-bold text-[32px] mt-4">
            Rs. {vehicle.price.toLocaleString('en-IN')}{' '}
            <span className="font-body font-normal text-sm text-textfaint">
              {vehicle.negotiable ? 'Negotiable' : 'Fixed'}
            </span>
          </p>

          <div className="flex items-center gap-3 mt-3">
            {vehicle.verifiedSeller && (
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-successbg flex items-center justify-center shrink-0">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#12805C" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                <span className="text-xs font-semibold text-success">Verified Seller</span>
              </span>
            )}
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-badge" style={{ color: priceBadge.color, background: priceBadge.bg }}>
              {priceBadge.label}
            </span>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setOfferModalOpen(true)}
              className="bg-accent hover:bg-accenthover transition text-white font-semibold text-sm rounded-btn px-6 py-3"
            >
              Make an Offer
            </button>
            {sellerContact ? (
              <a
                href={`mailto:${sellerContact.email}?subject=${encodeURIComponent(
                  `Interested in your ${vehicle.brand} ${vehicle.model} listing on Bike Bazar`
                )}`}
                className="border border-bordercol font-semibold text-sm rounded-btn px-6 py-3"
              >
                Contact Seller
              </a>
            ) : (
              <button disabled className="border border-bordercol font-semibold text-sm rounded-btn px-6 py-3 opacity-40 cursor-not-allowed">
                Contact Seller
              </button>
            )}
          </div>

          <div className="mt-8 border border-bordercol rounded-card p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-textfaint">Seller</p>
            <p className="font-semibold mt-1">
              {vehicle.verifiedSeller ? 'Verified Individual Seller' : 'Unverified Seller'}
            </p>
            <p className="text-sm text-textmuted mt-0.5">{vehicle.location}</p>
          </div>

          <ReportListingBox />
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-display font-bold text-xl">Bike Health Score</h2>
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start border border-bordercol rounded-card p-5 mt-4">
          <HealthScoreGauge score={healthScore.overall} />
          <HealthScoreBreakdown items={[
            { label: 'Engine', score: healthScore.engine },
            { label: 'Brakes', score: healthScore.brakes },
            { label: 'Tyres', score: healthScore.tyres },
            { label: 'Electrical', score: healthScore.electrical },
            { label: 'Documents', score: healthScore.documents },
          ]} />
        </div>
        <p className="text-xs text-textfaint mt-2">
          This is a platform estimate based on listing details, not a professional mechanical inspection.
        </p>
      </div>



      <div className="mt-10">
        <h2 className="font-display font-bold text-xl">Specifications</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <Spec label="Brand" value={vehicle.brand} />
          <Spec label="Model" value={vehicle.model} />
          <Spec label="Year" value={vehicle.year} />
          <Spec label="KM Driven" value={vehicle.mileageKm.toLocaleString()} />
          <Spec label="Engine" value={vehicle.engineCc ? `${vehicle.engineCc}cc` : '—'} />
          <Spec label="Fuel Type" value={vehicle.fuelType} />
          <Spec label="Location" value={vehicle.location} />
          <Spec label="Type" value={vehicle.type === 'motorcycle' ? 'Motorcycle' : 'Scooter'} />
        </div>
      </div>

      {similar.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display font-bold text-xl">Similar Vehicles</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {similar.map((v) => (
              <VehicleCard key={v.id} vehicle={v} variant="result" />
            ))}
          </div>
        </div>
      )}

     {offerModalOpen && <MakeOfferModal vehicle={vehicle} onClose={() => setOfferModalOpen(false)} />}
    </div>
  )
}

function ReportListingBox() {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!reason) return
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <p className="text-sm text-success font-semibold mt-4">
        ✓ Thanks — this listing has been reported for review.
      </p>
    )
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm text-textfaint hover:text-textmuted mt-4 underline">
        Report this listing
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 border border-bordercol rounded-cardsm p-4">
      <label className="text-sm font-semibold block mb-1.5">Why are you reporting this listing?</label>
      <select
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full border border-bordercol rounded-ctl px-3 py-2 text-sm"
      >
        <option value="">Select a reason</option>
        <option value="fake">Fake listing</option>
        <option value="scam">Scam</option>
        <option value="incorrect">Incorrect information</option>
        <option value="duplicate">Duplicate listing</option>
        <option value="sold">Already sold</option>
        <option value="other">Other</option>
      </select>
      <div className="flex gap-2 mt-3">
        <button
          type="submit"
          disabled={!reason}
          className="bg-ink text-white text-sm font-semibold px-4 py-2 rounded-btn disabled:opacity-40"
        >
          Submit Report
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm font-semibold px-4 py-2 rounded-btn border border-bordercol"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

function Spec({ label, value }) {
  return (
    <div className="border border-bordercol rounded-cardsm p-3">
      <p className="text-xs text-textfaint">{label}</p>
      <p className="font-semibold text-sm mt-0.5">{value}</p>
    </div>
  )
}

export default VehicleDetail