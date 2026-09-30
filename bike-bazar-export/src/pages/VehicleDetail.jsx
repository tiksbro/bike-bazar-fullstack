import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import VehicleCard, { VehicleArt } from '../components/VehicleCard'
import { getVehicleBySlug, getSimilar, getHealthScore } from '../services/vehicleService'
import { getUserContact, getUserRatings } from '../services/userService'
import HealthScoreGauge from '../components/HealthScoreGauge'
import HealthScoreBreakdown from '../components/HealthScoreBreakdown'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import MakeOfferModal from '../components/MakeOfferModal'
import Badge, { PriceBadge } from '../components/Badge'
import Button from '../components/Button'
import Card from '../components/Card'
import { useCompare } from '../context/CompareContext'

const artBackgrounds = {
  orange: 'linear-gradient(160deg,#FDECE0,#F6C79B)',
  blue: 'linear-gradient(160deg,#E7EDFB,#B9C8F0)',
  graphite: 'linear-gradient(160deg,#EDEEF0,#C7CACF)',
  teal: 'linear-gradient(160deg,#E1F4EE,#A9DCCB)',
}

function VehicleDetail() {
  const { slug } = useParams()
  const [vehicle, setVehicle] = useState(null)
  const [similar, setSimilar] = useState([])
  const [sellerContact, setSellerContact] = useState(null)
  const [sellerRating, setSellerRating] = useState(null)
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
        setSellerRating(null)

        if (data) {
          const [similarData, contactData, ratingData] = await Promise.all([
            getSimilar(data),
            getUserContact(data.owner),
            getUserRatings(data.owner),
          ])
          setSimilar(similarData)
          setSellerContact(contactData)
          setSellerRating(ratingData)
        }
      } catch {
        setError("Couldn't load this vehicle. Check your connection and try again.")
      } finally {
        setLoading(false)
      }
    }
    loadVehicle()
  }, [slug, retryCount])

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
        <div className="mt-6">
          <Button onClick={() => setRetryCount((c) => c + 1)}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="font-display font-bold text-2xl">Vehicle Not Found</h1>
        <p className="text-textmuted mt-2">This listing may have been removed or the link is incorrect.</p>
        <Button to="/vehicles" className="mt-6">
          Browse Other Vehicles
        </Button>
      </div>
    )
  }

  const healthScore = getHealthScore(vehicle)

  // One mailto link shared by the desktop buttons and the phone action bar.
  // It stays null until the seller's email has loaded.
  const contactHref = sellerContact
    ? `mailto:${sellerContact.email}?subject=${encodeURIComponent(
        `Interested in your ${vehicle.brand} ${vehicle.model} listing on Bike Bazar`
      )}`
    : null

  return (
    // Extra bottom padding on phones (pb-28) so the sticky action bar
    // never covers the last bit of the page.
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-28 md:pb-8">
      <Link to="/vehicles" className="text-sm text-accent font-semibold hover:underline">← Back to results</Link>

      <div className="grid md:grid-cols-2 gap-8 mt-4">
        <div
          className="relative rounded-card overflow-hidden shadow-card h-[260px] md:h-[340px]"
          style={{ background: artBackgrounds[vehicle.artColor] }}
        >
          <VehicleArt type={vehicle.type} color={vehicle.artColor} />
        </div>

        <div>
          <h1 className="font-display font-bold text-[28px]">{vehicle.brand} {vehicle.model}</h1>
          <p className="text-textmuted mt-1">
            {[
              vehicle.year,
              `${vehicle.mileageKm.toLocaleString()} KM`,
              vehicle.fuelType !== 'Electric' && `${vehicle.engineCc}cc`,
              vehicle.fuelType,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
          <p className="text-textmuted">{vehicle.location}</p>

          <p className="font-display font-bold text-[32px] mt-4">
            Rs. {vehicle.price.toLocaleString('en-IN')}{' '}
            <span className="font-body font-normal text-sm text-textfaint">
              {vehicle.negotiable ? 'Negotiable' : 'Fixed'}
            </span>
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            {vehicle.verifiedSeller && (
              <Badge variant="success">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Verified Seller
              </Badge>
            )}
            <PriceBadge insight={vehicle.priceInsight} />
          </div>

          {/* Tablet/desktop buttons. On phones (`hidden md:flex`) the same
              two actions live in the sticky bar at the bottom instead. */}
          <div className="hidden md:flex gap-3 mt-6">
            <Button onClick={() => setOfferModalOpen(true)}>Make an Offer</Button>
            {contactHref ? (
              <Button variant="secondary" href={contactHref}>
                Contact Seller
              </Button>
            ) : (
              <Button variant="secondary" disabled>
                Contact Seller
              </Button>
            )}
          </div>

          <Card padding="sm" className="mt-8">
            <p className="text-xs font-bold uppercase tracking-wide text-textfaint">Seller</p>
            <p className="font-semibold mt-1">
              {vehicle.verifiedSeller ? 'Verified Individual Seller' : 'Unverified Seller'}
            </p>
            <p className="text-sm text-textmuted mt-0.5">{vehicle.location}</p>
            {sellerRating && sellerRating.totalCount > 0 && (
              <p className="text-sm mt-1.5">
                <span className="text-warning">★</span> {sellerRating.averageStars}{' '}
                <span className="text-textfaint">
                  ({sellerRating.totalCount} rating{sellerRating.totalCount > 1 ? 's' : ''})
                </span>
              </p>
            )}
          </Card>
          <ReportListingBox vehicleId={vehicle.id} />
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-display font-bold text-xl">Bike Health Score</h2>
        <Card className="flex flex-col sm:flex-row gap-6 items-center sm:items-start mt-4">
          <HealthScoreGauge score={healthScore.overall} />
          <HealthScoreBreakdown items={[
            { label: 'Engine', score: healthScore.engine },
            { label: 'Brakes', score: healthScore.brakes },
            { label: 'Tyres', score: healthScore.tyres },
            { label: 'Electrical', score: healthScore.electrical },
            { label: 'Documents', score: healthScore.documents },
          ]} />
        </Card>
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

      <MobileActionBar
        vehicle={vehicle}
        contactHref={contactHref}
        onMakeOffer={() => setOfferModalOpen(true)}
      />

      {offerModalOpen && <MakeOfferModal vehicle={vehicle} onClose={() => setOfferModalOpen(false)} />}
    </div>
  )
}

// Phone-only bar pinned to the bottom of the screen, so "Make Offer" and
// "Contact" are always one tap away while you scroll the specs.
// It sits just above the bottom menu (bottom-16 = 64px, the menu's height).
// If the Compare bar is showing, it moves up again so the two don't overlap.
function MobileActionBar({ vehicle, contactHref, onMakeOffer }) {
  const { compareIds } = useCompare()
  const compareBarShowing = compareIds.length > 0

  return (
    <div
      className={`md:hidden fixed left-0 right-0 z-30 bg-white border-t border-bordercol shadow-pop px-4 py-3 ${
        compareBarShowing ? 'bottom-[124px]' : 'bottom-16'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-display font-bold text-lg leading-tight truncate">
            Rs. {vehicle.price.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-textfaint">{vehicle.negotiable ? 'Negotiable' : 'Fixed price'}</p>
        </div>
        {contactHref ? (
          <Button variant="secondary" size="sm" className="py-2.5" href={contactHref}>
            Contact
          </Button>
        ) : (
          <Button variant="secondary" size="sm" className="py-2.5" disabled>
            Contact
          </Button>
        )}
        <Button size="sm" className="py-2.5" onClick={onMakeOffer}>
          Make Offer
        </Button>
      </div>
    </div>
  )
}

function ReportListingBox({ vehicleId }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!reason) return
    setSubmitting(true)
    setError('')
    try {
      const token = localStorage.getItem('bikebazar_token')
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/reports/${vehicleId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit report')
      }
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
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
    <Card as="form" padding="sm" onSubmit={handleSubmit} className="mt-4">
      <label className="text-sm font-semibold block mb-1.5">Why are you reporting this listing?</label>
      <select
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full border border-bordercol rounded-ctl px-3 py-2 text-sm bg-white"
      >
        <option value="">Select a reason</option>
        <option value="fake">Fake listing</option>
        <option value="scam">Scam</option>
        <option value="incorrect">Incorrect information</option>
        <option value="duplicate">Duplicate listing</option>
        <option value="sold">Already sold</option>
        <option value="other">Other</option>
      </select>

      {error && <p className="text-sm text-danger bg-dangerbg rounded-ctl px-3 py-2 mt-2">{error}</p>}

      <div className="flex gap-2 mt-3">
        <Button type="submit" variant="dark" size="sm" disabled={!reason} loading={submitting}>
          {submitting ? 'Submitting...' : 'Submit Report'}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </Card>
  )
}

function Spec({ label, value }) {
  return (
    <Card padding="sm">
      <p className="text-xs text-textfaint">{label}</p>
      <p className="font-semibold text-sm mt-0.5">{value}</p>
    </Card>
  )
}

export default VehicleDetail