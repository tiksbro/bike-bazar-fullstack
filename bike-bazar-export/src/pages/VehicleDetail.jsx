import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import VehicleCard, { VehicleArt } from '../components/VehicleCard'
import VehiclePhoto from '../components/VehiclePhoto'
import { getVehicleBySlug, getSimilar, getHealthScore } from '../services/vehicleService'
import { getUserContact, getUserRatings } from '../services/userService'
import HealthScoreGauge from '../components/HealthScoreGauge'
import HealthScoreBreakdown from '../components/HealthScoreBreakdown'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import MakeOfferModal from '../components/MakeOfferModal'
import Badge, { PriceBadge } from '../components/Badge'
import Button from '../components/Button'
import Card from '../components/Card'
import { Skeleton } from '../components/Skeleton'

const artBackgrounds = {
  orange: 'linear-gradient(160deg,#FDECE0,#F6C79B)',
  blue: 'linear-gradient(160deg,#E7EDFB,#B9C8F0)',
  graphite: 'linear-gradient(160deg,#EDEEF0,#C7CACF)',
  teal: 'linear-gradient(160deg,#E1F4EE,#A9DCCB)',
}

// Nice names for each body type, e.g. 'suv' -> 'SUV'.
const TYPE_LABELS = {
  motorcycle: 'Motorcycle',
  scooter: 'Scooter',
  hatchback: 'Hatchback',
  sedan: 'Sedan',
  suv: 'SUV',
  muv: 'MUV',
  pickup: 'Pickup',
}

function transmissionLabel(transmission) {
  return transmission === 'automatic' ? 'Automatic' : 'Manual'
}

// The short line under the name.
// Bikes: "2022 · 18,000 KM · 155cc · Petrol". Cars add the gearbox: "... · Diesel · Manual".
function headerSpecs(vehicle) {
  const parts = [
    vehicle.year,
    `${vehicle.mileageKm.toLocaleString()} KM`,
    vehicle.fuelType !== 'Electric' && `${vehicle.engineCc}cc`,
    vehicle.fuelType,
  ]
  if (vehicle.vehicleType === 'car' && vehicle.transmission) parts.push(transmissionLabel(vehicle.transmission))
  return parts.filter(Boolean).join(' · ')
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
    return <VehicleDetailSkeleton />
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
  // Old listings have no vehicleType, so anything that is not 'car' is a bike.
  const isCar = vehicle.vehicleType === 'car'

  // One mailto link shared by the desktop buttons and the phone action bar.
  // It stays null until the seller's email has loaded.
  const contactHref = sellerContact
    ? `mailto:${sellerContact.email}?subject=${encodeURIComponent(
        `Interested in your ${vehicle.brand} ${vehicle.model} listing on Bike Bazar`
      )}`
    : null

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/vehicles" className="text-sm text-accent font-semibold hover:underline">← Back to results</Link>

      <div className="grid md:grid-cols-2 gap-6 md:gap-10 mt-4">
        {/* On tablet/desktop the picture column is "sticky": it stays in view while
            you scroll the (taller) details column next to it, so there is no
            big empty gap under the picture. self-start stops it stretching. */}
        <div className="md:sticky md:top-24 self-start">
          {/* New listings show their photos. Old listings have none, so they show a drawing (bike or car, by type). */}
          {vehicle.photos?.length > 0 ? (
            <PhotoGallery photos={vehicle.photos} title={`${vehicle.brand} ${vehicle.model}`} />
          ) : (
            <div
              className="relative rounded-card overflow-hidden shadow-card h-[260px] md:h-[340px]"
              style={{ background: artBackgrounds[vehicle.artColor] }}
            >
              <VehicleArt type={vehicle.type} color={vehicle.artColor} />
            </div>
          )}
        </div>

        <div>
          <h1 className="font-display font-bold text-[26px] sm:text-[30px] leading-tight">
            {vehicle.brand} {vehicle.model}
          </h1>
          <p className="text-textmuted mt-2">{headerSpecs(vehicle)}</p>
          <p className="flex items-center gap-1.5 text-textmuted mt-1">
            <PinIcon />
            {vehicle.location}
          </p>

          {/* Price block: a thin line above it separates "what is it" from "what does it cost". */}
          <p className="font-display font-bold text-[32px] leading-tight mt-5 pt-5 border-t border-bordersoft">
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

          <SellerCard
            vehicle={vehicle}
            sellerName={sellerContact?.name}
            sellerRating={sellerRating}
          />
          <ReportListingBox vehicleId={vehicle.id} />
        </div>
      </div>

      {/* The seller's own words from the Sell form. Only shown if they wrote something.
          whitespace-pre-line keeps the line breaks they typed. */}
      {vehicle.description?.trim() && (
        <section className="mt-12">
          <SectionHeading>About this vehicle</SectionHeading>
          <Card className="mt-4">
            <p className="text-textbody leading-relaxed whitespace-pre-line break-words max-w-[75ch]">
              {vehicle.description.trim()}
            </p>
          </Card>
        </section>
      )}

      <section className="mt-12">
        <SectionHeading>Specifications</SectionHeading>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <Spec label="Brand" value={vehicle.brand} />
          <Spec label="Model" value={vehicle.model} />
          <Spec label="Year" value={vehicle.year} />
          <Spec label="KM Driven" value={vehicle.mileageKm.toLocaleString()} />
          <Spec label="Engine" value={vehicle.engineCc ? `${vehicle.engineCc}cc` : '—'} />
          <Spec label="Fuel Type" value={vehicle.fuelType} />
          <Spec label="Location" value={vehicle.location} />
          <Spec label="Type" value={TYPE_LABELS[vehicle.type] || vehicle.type} />
          {/* Car-only specs. Optional ones only show when the seller filled them in. */}
          {isCar && (
            <>
              <Spec label="Transmission" value={transmissionLabel(vehicle.transmission)} />
              <Spec label="Seats" value={vehicle.seats} />
              {vehicle.driveType && <Spec label="Drive Type" value={vehicle.driveType} />}
              {vehicle.batteryKwh > 0 && <Spec label="Battery" value={`${vehicle.batteryKwh} kWh`} />}
              {vehicle.rangeKm > 0 && <Spec label="Range" value={`${vehicle.rangeKm.toLocaleString()} km`} />}
            </>
          )}
        </div>
      </section>

      <section className="mt-12">
        <SectionHeading>{isCar ? 'Car' : 'Bike'} Health Score</SectionHeading>
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
      </section>

      {similar.length > 0 && (
        <section className="mt-12">
          <SectionHeading>Similar Vehicles</SectionHeading>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {similar.map((v) => (
              <VehicleCard key={v.id} vehicle={v} variant="result" />
            ))}
          </div>
        </section>
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

// Works out when the seller joined, from their user id.
// A MongoDB id starts with the time it was created (first 8 characters, in
// hexadecimal = base 16, counting seconds since 1970). So we can read the
// sign-up date straight out of the id, without asking the backend.
// Grey placeholder shaped like the real page: picture on the left, title,
// price, buttons and seller box on the right (stacked on phones). When the
// real listing arrives, everything lands in the same place, so nothing jumps.
function VehicleDetailSkeleton() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8" role="status" aria-label="Loading vehicle">
      <Skeleton className="h-4 w-32" />

      <div className="grid md:grid-cols-2 gap-6 md:gap-10 mt-4">
        <Skeleton className="h-[260px] md:h-[340px] rounded-card" />

        <div>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-3" />
          <Skeleton className="h-4 w-1/3 mt-2" />

          <div className="mt-5 pt-5 border-t border-bordersoft">
            <Skeleton className="h-9 w-2/5" />
          </div>
          <div className="flex gap-2 mt-3">
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>

          {/* Buttons only on tablet/desktop, same as the real page. */}
          <div className="hidden md:flex gap-3 mt-6">
            <Skeleton className="h-11 w-36 rounded-btn" />
            <Skeleton className="h-11 w-36 rounded-btn" />
          </div>

          {/* Seller box */}
          <div className="bg-white border border-bordersoft rounded-card shadow-card p-5 mt-6 flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-full shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-3.5 w-1/3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getMemberSince(userId) {
  if (typeof userId !== 'string' || userId.length < 8) return null
  const secondsSince1970 = parseInt(userId.substring(0, 8), 16)
  if (Number.isNaN(secondsSince1970)) return null
  return new Date(secondsSince1970 * 1000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

// "Tikaram Chimariya" -> "TC". Shown in the round avatar.
function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}

// The seller box: who is selling, when they joined, and how buyers rated them.
function SellerCard({ vehicle, sellerName, sellerRating }) {
  const memberSince = getMemberSince(vehicle.owner)
  const hasRatings = sellerRating && sellerRating.totalCount > 0

  return (
    <Card padding="sm" className="mt-6">
      <p className="text-xs font-bold uppercase tracking-wide text-textfaint">Seller</p>

      <div className="flex items-center gap-3 mt-3">
        <span
          aria-hidden="true"
          className="w-12 h-12 shrink-0 rounded-full bg-accentsoftbg text-accentsofttext font-display font-bold flex items-center justify-center"
        >
          {sellerName ? getInitials(sellerName) : '?'}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="font-semibold truncate">{sellerName || 'Seller'}</p>
            {vehicle.verifiedSeller ? (
              <Badge variant="success">Verified</Badge>
            ) : (
              <Badge variant="neutral">Not verified</Badge>
            )}
          </div>
          <p className="text-sm text-textmuted mt-0.5">
            {vehicle.location}
            {memberSince && ` · Member since ${memberSince}`}
          </p>
        </div>
      </div>

      {/* Ratings get their own highlighted row so buyers notice them. */}
      <div className="flex items-center gap-3 mt-4 rounded-ctl bg-sunken px-3 py-2.5">
        {hasRatings ? (
          <>
            <StarRow stars={sellerRating.averageStars} />
            <p className="text-sm">
              <span className="font-display font-bold text-lg">{sellerRating.averageStars}</span>
              <span className="text-textmuted">
                {' '}
                from {sellerRating.totalCount} buyer rating{sellerRating.totalCount > 1 ? 's' : ''}
              </span>
            </p>
          </>
        ) : (
          <p className="text-sm text-textmuted">No ratings yet. Buyers can rate this seller after an accepted offer.</p>
        )}
      </div>

    </Card>
  )
}

// 5 stars, filled up to the rounded average (4.4 -> 4 stars, 4.5 -> 5 stars).
function StarRow({ stars }) {
  const filledCount = Math.round(stars)
  return (
    <span className="flex text-lg leading-none" role="img" aria-label={`${stars} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((number) => (
        <span key={number} className={number <= filledCount ? 'text-featured' : 'text-bordercol'}>
          ★
        </span>
      ))}
    </span>
  )
}

// The listing's photos: one big photo at a time, plus small thumbnails under it.
// The big photo row is a sideways-scrolling strip with "scroll snap", so on a
// phone you can simply swipe left/right and it stops neatly on each photo.
// On desktop the arrow buttons and thumbnails move the same strip.
function PhotoGallery({ photos, title }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const stripRef = useRef(null) // lets us talk to the scrolling strip directly
  const hasManyPhotos = photos.length > 1

  // Scrolls the strip so photo number `index` fills the frame.
  function showPhoto(index) {
    const strip = stripRef.current
    strip.scrollTo({ left: index * strip.clientWidth, behavior: 'smooth' })
    setCurrentIndex(index)
  }

  // When the person swipes, work out which photo is now in view.
  function handleScroll() {
    const strip = stripRef.current
    const index = Math.round(strip.scrollLeft / strip.clientWidth)
    if (index !== currentIndex) setCurrentIndex(index)
  }

  return (
    <div>
      <div className="relative rounded-card overflow-hidden shadow-card h-[260px] md:h-[340px] bg-sunken">
        <div
          ref={stripRef}
          onScroll={handleScroll}
          className="flex h-full overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {photos.map((photo, index) => (
            <div key={photo.publicId} className="w-full h-full shrink-0 snap-center">
              <VehiclePhoto
                photo={photo}
                width={1200}
                alt={`${title}, photo ${index + 1} of ${photos.length}`}
                eager={index === 0}
              />
            </div>
          ))}
        </div>

        {hasManyPhotos && (
          <>
            <GalleryArrow direction="previous" disabled={currentIndex === 0} onClick={() => showPhoto(currentIndex - 1)} />
            <GalleryArrow
              direction="next"
              disabled={currentIndex === photos.length - 1}
              onClick={() => showPhoto(currentIndex + 1)}
            />
            <span className="absolute bottom-3 right-3 bg-ink/70 text-white text-xs font-semibold rounded-full px-2.5 py-1">
              {currentIndex + 1} / {photos.length}
            </span>
          </>
        )}
      </div>

      {hasManyPhotos && (
        <div className="flex gap-2 mt-2.5 overflow-x-auto p-0.5 pb-1">
          {photos.map((photo, index) => (
            <button
              key={photo.publicId}
              type="button"
              onClick={() => showPhoto(index)}
              aria-label={`Show photo ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : undefined}
              className={`shrink-0 w-16 h-12 sm:w-20 sm:h-14 rounded-ctl overflow-hidden ring-2 transition ${
                index === currentIndex ? 'ring-accent' : 'ring-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <VehiclePhoto photo={photo} width={160} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// The round < and > buttons on the big photo. Hidden on phones, where you swipe instead.
function GalleryArrow({ direction, disabled, onClick }) {
  const isPrevious = direction === 'previous'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={isPrevious ? 'Previous photo' : 'Next photo'}
      className={`hidden md:flex absolute top-1/2 -translate-y-1/2 ${
        isPrevious ? 'left-3' : 'right-3'
      } w-10 h-10 rounded-full bg-white/90 shadow-card items-center justify-center text-ink hover:bg-white transition disabled:opacity-0 disabled:pointer-events-none`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={isPrevious ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'} />
      </svg>
    </button>
  )
}

// Phone-only bar pinned to the bottom of the screen, so "Make Offer" and
// "Contact" are always one tap away while you scroll the specs.
// It sits just above the bottom menu (bottom-16 = 64px, the menu's height).
// The extra bottom padding (pb-5) keeps the buttons clear of the round
// "Sell" button, which pokes up out of the bottom menu.
// (On phones the Compare bar hides itself on this page, so the two bars
// never stack. See CompareBar.jsx.)
function MobileActionBar({ vehicle, contactHref, onMakeOffer }) {
  return (
    <div
      data-sticky-action-bar
      className="md:hidden fixed left-0 right-0 bottom-16 z-30 bg-white border-t border-bordercol shadow-pop px-4 pt-3 pb-5"
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

// Same heading style for every section below the top area.
function SectionHeading({ children }) {
  return <h2 className="font-display font-bold text-xl">{children}</h2>
}

function PinIcon() {
  return (
    <svg className="shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
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