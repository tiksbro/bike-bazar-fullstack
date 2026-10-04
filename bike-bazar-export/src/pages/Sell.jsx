import { useState } from 'react'
import { Link } from 'react-router-dom'
import { citiesByProvince } from '../data/cities'
import { createVehicle, uploadPhotos } from '../services/vehicleService'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import Button from '../components/Button'
import Card from '../components/Card'
import Badge from '../components/Badge'
import VehicleArt from '../components/VehicleArt'

// The 5 steps of the form, in order.
const steps = ['Vehicle Info', 'Price & Condition', 'Location', 'Photos', 'Review']

const currentYear = new Date().getFullYear()

// Body types for each kind of vehicle. The values match the backend
// (bike-bazar-api/models/Vehicle.js BIKE_TYPES and CAR_TYPES).
const BIKE_TYPES = [
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'scooter', label: 'Scooter' },
]
const CAR_TYPES = [
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'muv', label: 'MUV' },
  { value: 'pickup', label: 'Pickup' },
]

// Bikes are only Petrol or Electric. Cars can also be Diesel or Hybrid.
const FUEL_TYPES = {
  bike: ['Petrol', 'Electric'],
  car: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
}

const TRANSMISSIONS = [
  { value: 'manual', label: 'Manual' },
  { value: 'automatic', label: 'Automatic' },
]

// Same limits as the backend (seats: min 2, max 12).
const MIN_SEATS = 2
const MAX_SEATS = 12

// Example values shown inside empty boxes, so the person knows what to type.
const EXAMPLES = {
  bike: { brand: 'Yamaha', model: 'R15 V3', km: '18000', cc: '155', price: '320000' },
  car: { brand: 'Hyundai', model: 'i20', km: '45000', cc: '1197', price: '2800000' },
}

const emptyForm = {
  vehicleType: 'bike', // 'bike' or 'car'
  brand: '',
  model: '',
  year: '',
  type: 'motorcycle',
  mileageKm: '',
  engineCc: '',
  fuelType: 'Petrol',
  price: '',
  negotiable: true,
  location: '',
  description: '',
  // Car-only fields. Bikes leave these empty and they are never sent.
  transmission: '',
  seats: '',
  driveType: '',
  // Electric cars only, both optional.
  batteryKwh: '',
  rangeKm: '',
}

const DESCRIPTION_LIMIT = 500

// Photo rules. These match the backend (bike-bazar-api/routes/uploads.js),
// so the person sees the problem right away instead of after pressing Publish.
const MAX_PHOTOS = 6
const MAX_PHOTO_SIZE_MB = 5
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// Shared look for every text box / dropdown on this page.
// hasError turns the border red so the person can see which box is wrong.
// text-base (16px) on phones: if the text is smaller than 16px, iPhones
// zoom the whole page in when you tap the box. From sm up we use text-sm.
function inputClasses(hasError) {
  return `w-full bg-white border rounded-ctl px-3 py-2.5 text-base sm:text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15 ${
    hasError ? 'border-danger' : 'border-bordercol'
  }`
}

// Turns 320000 into "3,20,000" (Nepali/Indian comma style).
function formatPrice(value) {
  return Number(value || 0).toLocaleString('en-IN')
}

// Turns 'suv' into 'SUV', 'motorcycle' into 'Motorcycle', and so on.
function getTypeLabel(type) {
  const match = [...BIKE_TYPES, ...CAR_TYPES].find((option) => option.value === type)
  return match ? match.label : type
}

function isCar(form) {
  return form.vehicleType === 'car'
}

function isElectric(form) {
  return form.fuelType === 'Electric'
}

// Checks ONE step and returns an object of error messages.
// An empty object {} means the step is fine.
function validateStep(stepNumber, form, photos) {
  const errors = {}

  if (stepNumber === 1) {
    if (!form.brand.trim()) errors.brand = `Enter the brand, like ${EXAMPLES[form.vehicleType].brand}.`
    if (!form.model.trim()) errors.model = `Enter the model, like ${EXAMPLES[form.vehicleType].model}.`
    const year = Number(form.year)
    if (!form.year) errors.year = 'Enter the year it was made.'
    else if (year < 1980 || year > currentYear + 1) errors.year = `Year must be between 1980 and ${currentYear + 1}.`

    if (isCar(form)) {
      if (!form.transmission) errors.transmission = 'Pick Manual or Automatic.'
      const seats = Number(form.seats)
      if (!form.seats) errors.seats = 'Enter how many seats it has.'
      else if (!Number.isInteger(seats) || seats < MIN_SEATS || seats > MAX_SEATS) {
        errors.seats = `Seats must be a whole number from ${MIN_SEATS} to ${MAX_SEATS}.`
      }
    }
  }

  if (stepNumber === 2) {
    if (form.mileageKm === '') errors.mileageKm = 'Enter how many KM it has run.'
    else if (Number(form.mileageKm) < 0) errors.mileageKm = 'KM cannot be negative.'
    // Electric vehicles have no engine, so engine size is only needed for the others.
    if (!isElectric(form)) {
      if (!form.engineCc) errors.engineCc = 'Enter the engine size in cc.'
      else if (Number(form.engineCc) <= 0) errors.engineCc = 'Engine size must be more than 0.'
    }
    // Battery and range are optional, but if typed in they must make sense.
    if (isCar(form) && isElectric(form)) {
      if (form.batteryKwh !== '' && Number(form.batteryKwh) <= 0) errors.batteryKwh = 'Battery size must be more than 0.'
      if (form.rangeKm !== '' && Number(form.rangeKm) <= 0) errors.rangeKm = 'Range must be more than 0.'
    }
    if (!form.price) errors.price = 'Enter your asking price.'
    else if (Number(form.price) < 1000) errors.price = 'Price looks too low. Enter the full amount in rupees.'
  }

  if (stepNumber === 3) {
    if (!form.location) errors.location = 'Pick the city where the vehicle is.'
  }

  if (stepNumber === 4) {
    if (photos.length === 0) errors.photos = 'Add at least 1 photo of your vehicle.'
  }

  return errors
}

// Builds the listing we send to the backend. It only includes the fields
// that make sense for this vehicle: no engine size for electric vehicles,
// no car fields for bikes, and battery/range only for electric cars.
function buildListingData(form, uploadedPhotos) {
  const listing = {
    vehicleType: form.vehicleType,
    type: form.type,
    brand: form.brand.trim(),
    model: form.model.trim(),
    year: Number(form.year),
    mileageKm: Number(form.mileageKm),
    fuelType: form.fuelType,
    price: Number(form.price),
    negotiable: form.negotiable,
    location: form.location,
    description: form.description.trim(),
    photos: uploadedPhotos,
  }

  if (!isElectric(form)) listing.engineCc = Number(form.engineCc)

  if (isCar(form)) {
    listing.transmission = form.transmission
    listing.seats = Number(form.seats)
    if (form.driveType) listing.driveType = form.driveType
    if (isElectric(form)) {
      if (form.batteryKwh !== '') listing.batteryKwh = Number(form.batteryKwh)
      if (form.rangeKm !== '') listing.rangeKm = Number(form.rangeKm)
    }
  }

  return listing
}

function Sell() {
  useDocumentTitle('Sell Your Vehicle')
  const { user } = useAuth()

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState(emptyForm)
  // errors only show AFTER the person presses "Next", not while they type.
  const [errors, setErrors] = useState({})
  const [published, setPublished] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  // photos = the pictures the person picked, still on their device.
  // Each one is { id, file, previewUrl }. photos[0] is the cover photo.
  const [photos, setPhotos] = useState([])
  // 'Uploading photos...' or 'Publishing...' while the Publish button is busy.
  const [submitLabel, setSubmitLabel] = useState('')
  // The "I own this vehicle" box on the Review step, and its error message.
  const [acceptedRules, setAcceptedRules] = useState(false)
  const [rulesError, setRulesError] = useState('')

  // Removes the error messages of the given boxes (if they have one).
  function clearErrors(...fields) {
    const remaining = { ...errors }
    fields.forEach((field) => delete remaining[field])
    setErrors(remaining)
  }

  function updateField(field, value) {
    setFormData({ ...formData, [field]: value })
    // Once they fix a box, remove that box's error message.
    // Changing the fuel can hide the engine / battery / range boxes, so clear those errors too.
    if (field === 'fuelType') clearErrors('fuelType', 'engineCc', 'batteryKwh', 'rangeKm')
    else if (errors[field]) clearErrors(field)
  }

  // Switches between Bike and Car. The body type jumps to the first one in
  // the new list (a car can't be a 'scooter'), and a bike can't stay Diesel or Hybrid.
  function chooseVehicleType(vehicleType) {
    if (vehicleType === formData.vehicleType) return
    const firstType = vehicleType === 'car' ? CAR_TYPES[0].value : BIKE_TYPES[0].value
    const fuelType = FUEL_TYPES[vehicleType].includes(formData.fuelType) ? formData.fuelType : 'Petrol'
    setFormData({ ...formData, vehicleType, type: firstType, fuelType })
    setErrors({})
  }

  // Adds newly picked files, after checking type, size and the 6-photo limit.
  function addPhotos(fileList) {
    const files = Array.from(fileList)
    const goodPhotos = []
    let problem = ''

    for (const file of files) {
      if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
        problem = `"${file.name}" is not a JPG, PNG or WebP photo.`
      } else if (file.size > MAX_PHOTO_SIZE_MB * 1024 * 1024) {
        problem = `"${file.name}" is bigger than ${MAX_PHOTO_SIZE_MB} MB.`
      } else if (photos.length + goodPhotos.length >= MAX_PHOTOS) {
        problem = `You can add at most ${MAX_PHOTOS} photos.`
      } else {
        goodPhotos.push({
          id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
          file,
          // A temporary link to the file on this device, so we can show it before uploading.
          previewUrl: URL.createObjectURL(file),
        })
      }
    }

    setPhotos([...photos, ...goodPhotos])

    // Show the problem (if any). Otherwise clear the old photos error.
    const { photos: _removed, ...otherErrors } = errors
    setErrors(problem ? { ...otherErrors, photos: problem } : otherErrors)
  }

  function removePhoto(photoId) {
    const photo = photos.find((p) => p.id === photoId)
    if (photo) URL.revokeObjectURL(photo.previewUrl) // free the memory used by the preview
    setPhotos(photos.filter((p) => p.id !== photoId))
  }

  // Moves one photo to the front of the list, which makes it the cover.
  function makeCover(photoId) {
    const photo = photos.find((p) => p.id === photoId)
    setPhotos([photo, ...photos.filter((p) => p.id !== photoId)])
  }

  function goNext() {
    const stepErrors = validateStep(step, formData, photos)
    setErrors(stepErrors)
    const errorFields = Object.keys(stepErrors)
    if (errorFields.length > 0) {
      // On a phone the first wrong box may be off screen, so scroll to it.
      document.getElementById(errorFields[0])?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setStep(step + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function goBack() {
    setErrors({})
    if (step > 1) setStep(step - 1)
  }

  // Lets the person jump back to a finished step (from the stepper or the Review page).
  function goToStep(stepNumber) {
    if (stepNumber < step) {
      setErrors({})
      setStep(stepNumber)
    }
  }

  async function handlePublish() {
    setSubmitError('')

    // Stop here if the confirmation box is not ticked. We return BEFORE
    // setSubmitting(true), so no photos are uploaded and no listing is made.
    if (!acceptedRules) {
      setRulesError('Please confirm this before publishing.')
      return
    }
    setRulesError('')

    setSubmitting(true)
    try {
      const token = localStorage.getItem('bikebazar_token')

      // 1. Send the photos first. The backend puts them on Cloudinary and gives back their links.
      setSubmitLabel('Uploading photos...')
      const uploadedPhotos = await uploadPhotos(
        photos.map((photo) => photo.file),
        token
      )

      // 2. Then create the listing, with those photo links inside it.
      setSubmitLabel('Publishing...')
      await createVehicle(buildListingData(formData, uploadedPhotos), token)
      setPublished(true)
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
      setSubmitLabel('')
    }
  }

  function startNewListing() {
    photos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl))
    setPhotos([])
    setFormData(emptyForm)
    setErrors({})
    setStep(1)
    setPublished(false)
    // A new listing needs its own confirmation, so start unticked.
    setAcceptedRules(false)
    setRulesError('')
  }

  // ---------- Screen 1: not logged in ----------
  if (!user) {
    return (
      <div className="max-w-[480px] mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <Card padding="lg" className="text-center">
          <div className="relative h-32 -mx-2">
            <VehicleArt type="motorcycle" color="blue" />
          </div>
          <h1 className="font-display font-bold text-2xl mt-4">Log in to sell your vehicle</h1>
          <p className="text-textmuted text-sm mt-2">
            You need a free account to list a vehicle. It only takes a minute.
          </p>
          <div className="flex justify-center mt-6">
            <Button to="/login">Log In or Sign Up</Button>
          </div>
        </Card>
      </div>
    )
  }

  // ---------- Screen 2: listing published ----------
  if (published) {
    return (
      <div className="max-w-[560px] mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <Card padding="lg" className="text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-successbg text-success flex items-center justify-center">
            <CheckIcon size={28} />
          </div>
          <h1 className="font-display font-bold text-2xl mt-4">Your listing is live!</h1>
          <p className="text-textmuted text-sm mt-2">
            Your {formData.brand} {formData.model} is now on Bike Bazar. Buyers can find it, save it and send you offers.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Button to="/dashboard">View in Dashboard</Button>
            <Button variant="secondary" onClick={startNewListing}>
              Sell Another Vehicle
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // ---------- Screen 3: the form ----------
  const isLastStep = step === steps.length

  return (
    <div className="max-w-[1080px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <h1 className="font-display font-bold text-[26px] sm:text-[30px]">Sell Your Vehicle</h1>
      <p className="text-textmuted text-sm mt-1">Free to list. Fill in {steps.length} short steps and your vehicle goes live.</p>

      <Stepper step={step} onStepClick={goToStep} />

      <div className="grid lg:grid-cols-[1fr_340px] gap-6 mt-6 items-start">
        <Card padding="none" className="p-5 sm:p-6">
          {step === 1 && (
            <VehicleInfoStep
              formData={formData}
              errors={errors}
              updateField={updateField}
              onChooseVehicleType={chooseVehicleType}
            />
          )}
          {step === 2 && <PriceStep formData={formData} errors={errors} updateField={updateField} />}
          {step === 3 && <LocationStep formData={formData} errors={errors} updateField={updateField} />}
          {step === 4 && (
            <PhotosStep
              photos={photos}
              error={errors.photos}
              onAdd={addPhotos}
              onRemove={removePhoto}
              onMakeCover={makeCover}
            />
          )}
          {step === 5 && <ReviewStep formData={formData} photos={photos} onEdit={goToStep} />}

          {/* The confirmation box, only on the Review step. The link opens
              in a new tab so the finished form is not lost. Ticking it
              clears the error straight away. */}
          {isLastStep && (
            <div className="border border-bordercol rounded-cardsm p-3.5 mt-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedRules}
                  onChange={(e) => {
                    setAcceptedRules(e.target.checked)
                    if (e.target.checked) setRulesError('')
                  }}
                  className="mt-0.5 w-4 h-4 accent-accent shrink-0"
                />
                <span className="text-sm text-textmuted">
                  I own this vehicle (or I am allowed to sell it), and this listing follows the{' '}
                  <Link
                    to="/listing-rules"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-accent hover:underline"
                  >
                    Listing Rules
                  </Link>
                  .
                </span>
              </label>
              {rulesError && (
                <p role="alert" className="text-xs text-danger mt-1.5">
                  {rulesError}
                </p>
              )}
            </div>
          )}

          {submitError && (
            <div role="alert" className="mt-6 text-sm text-danger bg-dangerbg rounded-ctl px-4 py-3">
              {submitError}
            </div>
          )}

          {/* On phones the main button stretches (flex-1) so it is easy to tap,
              and says just "Next" so the text never wraps onto 2 lines. */}
          <div className="flex justify-between gap-3 mt-8 pt-6 border-t border-bordersoft">
            <Button variant="secondary" onClick={goBack} disabled={step === 1 || submitting}>
              Back
            </Button>
            {isLastStep ? (
              <Button onClick={handlePublish} loading={submitting} className="flex-1 sm:flex-none">
                {submitting ? submitLabel : 'Publish Listing'}
              </Button>
            ) : (
              <Button onClick={goNext} className="flex-1 sm:flex-none">
                Next<span className="hidden sm:inline">: {steps[step]}</span>
              </Button>
            )}
          </div>
        </Card>

        {/* Live preview: only on big screens, and not on the Review step
            (the Review step already shows the same card). */}
        {!isLastStep && (
          <aside className="hidden lg:block sticky top-24">
            <p className="text-xs font-bold uppercase tracking-wide text-textfaint mb-2">Live preview</p>
            <ListingPreview formData={formData} coverUrl={photos[0]?.previewUrl} />
            <p className="text-xs text-textfaint mt-3">This is how buyers will see your listing.</p>
          </aside>
        )}
      </div>
    </div>
  )
}

// ---------- The step progress bar at the top ----------
function Stepper({ step, onStepClick }) {
  return (
    <div className="mt-6">
      {/* Phone: short text + a progress bar (4 circles don't fit well) */}
      <div className="sm:hidden">
        <p className="text-sm">
          <span className="font-semibold">Step {step} of {steps.length}</span>
          <span className="text-textmuted"> · {steps[step - 1]}</span>
        </p>
        <div className="h-1.5 bg-sunken rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-300"
            style={{ width: `${(step / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Tablet and desktop: numbered circles */}
      <ol className="hidden sm:flex items-center gap-2">
        {steps.map((label, index) => {
          const stepNumber = index + 1
          const isActive = stepNumber === step
          const isDone = stepNumber < step
          return (
            <li key={label} className="flex items-center gap-2 flex-1 last:flex-none">
              <button
                type="button"
                onClick={() => onStepClick(stepNumber)}
                disabled={!isDone}
                aria-current={isActive ? 'step' : undefined}
                className="flex items-center gap-2 disabled:cursor-default"
              >
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    isDone
                      ? 'bg-accent text-white'
                      : isActive
                        ? 'bg-accent text-white ring-4 ring-accent/15'
                        : 'bg-sunken text-textfaint'
                  }`}
                >
                  {isDone ? <CheckIcon size={14} /> : stepNumber}
                </span>
                <span className={`text-sm whitespace-nowrap ${isActive ? 'font-semibold text-ink' : 'text-textfaint'}`}>
                  {label}
                </span>
              </button>
              {stepNumber < steps.length && (
                <span className={`flex-1 h-0.5 rounded-full ${isDone ? 'bg-accent' : 'bg-bordercol'}`} />
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

// ---------- Step 1 ----------
function VehicleInfoStep({ formData, errors, updateField, onChooseVehicleType }) {
  const example = EXAMPLES[formData.vehicleType]
  return (
    <div>
      <StepHeading title="Tell us about your vehicle" subtitle="Start with the basics buyers search for." />

      {/* First choice: Bike or Car. Everything below changes to match it. */}
      <p className="text-sm font-semibold mb-2">What are you selling?</p>
      <div className="grid grid-cols-2 gap-3">
        <PictureTile label="Bike" selected={formData.vehicleType === 'bike'} onSelect={() => onChooseVehicleType('bike')}>
          <VehicleArt type="motorcycle" />
        </PictureTile>
        <PictureTile label="Car" selected={formData.vehicleType === 'car'} onSelect={() => onChooseVehicleType('car')}>
          <VehicleArt type="hatchback" color="blue" />
        </PictureTile>
      </div>

      {isCar(formData) ? (
        <>
          <p className="text-sm font-semibold mt-6 mb-2">Body type</p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2" role="group" aria-label="Body type">
            {CAR_TYPES.map((option) => (
              <ChoiceButton
                key={option.value}
                label={option.label}
                selected={formData.type === option.value}
                onSelect={() => updateField('type', option.value)}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="text-sm font-semibold mt-6 mb-2">Bike type</p>
          <div className="grid grid-cols-2 gap-3">
            {BIKE_TYPES.map((option) => (
              <PictureTile
                key={option.value}
                label={option.label}
                selected={formData.type === option.value}
                onSelect={() => updateField('type', option.value)}
              >
                <VehicleArt type={option.value} />
              </PictureTile>
            ))}
          </div>
        </>
      )}

      <div className="grid sm:grid-cols-2 gap-4 mt-6">
        <Field label="Brand" id="brand" error={errors.brand}>
          <input
            id="brand"
            value={formData.brand}
            onChange={(e) => updateField('brand', e.target.value)}
            className={inputClasses(errors.brand)}
            placeholder={`e.g. ${example.brand}`}
          />
        </Field>
        <Field label="Model" id="model" error={errors.model}>
          <input
            id="model"
            value={formData.model}
            onChange={(e) => updateField('model', e.target.value)}
            className={inputClasses(errors.model)}
            placeholder={`e.g. ${example.model}`}
          />
        </Field>
        <Field label="Year" id="year" error={errors.year}>
          <input
            id="year"
            type="number"
            inputMode="numeric"
            value={formData.year}
            onChange={(e) => updateField('year', e.target.value)}
            className={inputClasses(errors.year)}
            placeholder={`e.g. ${currentYear - 2}`}
          />
        </Field>
        {isCar(formData) && (
          <Field label="Seats" id="seats" error={errors.seats}>
            <input
              id="seats"
              type="number"
              inputMode="numeric"
              min={MIN_SEATS}
              max={MAX_SEATS}
              value={formData.seats}
              onChange={(e) => updateField('seats', e.target.value)}
              className={inputClasses(errors.seats)}
              placeholder="e.g. 5"
            />
          </Field>
        )}
      </div>

      {isCar(formData) && (
        <div className="grid sm:grid-cols-2 gap-4 mt-5">
          <ToggleGroup
            label="Transmission"
            id="transmission"
            options={TRANSMISSIONS}
            value={formData.transmission}
            onChange={(value) => updateField('transmission', value)}
            error={errors.transmission}
          />
          <Field label="Drive type (optional)" id="driveType">
            <select
              id="driveType"
              value={formData.driveType}
              onChange={(e) => updateField('driveType', e.target.value)}
              className={inputClasses(false)}
            >
              <option value="">Not sure</option>
              <option value="2WD">2WD</option>
              <option value="4WD">4WD</option>
            </select>
          </Field>
        </div>
      )}
    </div>
  )
}

// A big clickable box with a drawing, used for Bike / Car and Motorcycle / Scooter.
function PictureTile({ label, selected, onSelect, children }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`relative rounded-cardsm border-2 p-3 text-left transition ${
        selected ? 'border-accent bg-accentsoftbg' : 'border-bordercol bg-white hover:border-borderstrong'
      }`}
    >
      <div className="relative h-16 sm:h-20">{children}</div>
      <span className="flex items-center justify-between mt-2">
        <span className={`text-sm font-semibold ${selected ? 'text-accentsofttext' : 'text-ink'}`}>{label}</span>
        {selected && (
          <span className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center">
            <CheckIcon size={12} />
          </span>
        )}
      </span>
    </button>
  )
}

// A small text-only button, used for the 5 car body types.
function ChoiceButton({ label, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`rounded-ctl border-2 px-2 py-2.5 text-sm font-semibold transition ${
        selected
          ? 'border-accent bg-accentsoftbg text-accentsofttext'
          : 'border-bordercol bg-white text-ink hover:border-borderstrong'
      }`}
    >
      {label}
    </button>
  )
}

// ---------- Step 2 ----------
function PriceStep({ formData, errors, updateField }) {
  const example = EXAMPLES[formData.vehicleType]
  const fuelOptions = FUEL_TYPES[formData.vehicleType].map((fuel) => ({ value: fuel, label: fuel }))
  const showBatteryAndRange = isCar(formData) && isElectric(formData)

  return (
    <div>
      <StepHeading title="Price and condition" subtitle="Honest details help you sell faster." />

      {/* Fuel comes first, because it decides which boxes come next
          (electric vehicles have no engine size). */}
      <ToggleGroup
        label="Fuel type"
        id="fuelType"
        options={fuelOptions}
        value={formData.fuelType}
        onChange={(value) => updateField('fuelType', value)}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-5">
        <Field label="KM driven" id="mileageKm" error={errors.mileageKm}>
          <input
            id="mileageKm"
            type="number"
            inputMode="numeric"
            value={formData.mileageKm}
            onChange={(e) => updateField('mileageKm', e.target.value)}
            className={inputClasses(errors.mileageKm)}
            placeholder={`e.g. ${example.km}`}
          />
        </Field>
        {!isElectric(formData) && (
          <Field label="Engine (cc)" id="engineCc" error={errors.engineCc}>
            <input
              id="engineCc"
              type="number"
              inputMode="numeric"
              value={formData.engineCc}
              onChange={(e) => updateField('engineCc', e.target.value)}
              className={inputClasses(errors.engineCc)}
              placeholder={`e.g. ${example.cc}`}
            />
          </Field>
        )}
      </div>

      {showBatteryAndRange && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-5">
          <Field label="Battery (kWh)" id="batteryKwh" error={errors.batteryKwh} hint="Optional">
            <input
              id="batteryKwh"
              type="number"
              inputMode="decimal"
              value={formData.batteryKwh}
              onChange={(e) => updateField('batteryKwh', e.target.value)}
              className={inputClasses(errors.batteryKwh)}
              placeholder="e.g. 39.2"
            />
          </Field>
          <Field label="Range (km)" id="rangeKm" error={errors.rangeKm} hint="Optional, on a full charge">
            <input
              id="rangeKm"
              type="number"
              inputMode="numeric"
              value={formData.rangeKm}
              onChange={(e) => updateField('rangeKm', e.target.value)}
              className={inputClasses(errors.rangeKm)}
              placeholder="e.g. 450"
            />
          </Field>
        </div>
      )}

      <div className="mt-5">
        <Field
          label="Asking price"
          id="price"
          error={errors.price}
          hint={formData.price && !errors.price ? `Rs. ${formatPrice(formData.price)}` : 'Enter the full amount in rupees.'}
        >
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-textmuted">Rs.</span>
            <input
              id="price"
              type="number"
              inputMode="numeric"
              value={formData.price}
              onChange={(e) => updateField('price', e.target.value)}
              className={`${inputClasses(errors.price)} pl-11`}
              placeholder={example.price}
            />
          </div>
        </Field>
      </div>

      <label className="flex items-start gap-3 mt-5 p-3 rounded-ctl border border-bordercol cursor-pointer hover:bg-sunken/60 transition">
        <input
          type="checkbox"
          checked={formData.negotiable}
          onChange={(e) => updateField('negotiable', e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-accent"
        />
        <span>
          <span className="text-sm font-semibold block">Price is negotiable</span>
          <span className="text-xs text-textmuted">Buyers can send you offers. You choose to accept, reject or counter.</span>
        </span>
      </label>
    </div>
  )
}

// ---------- Step 3 ----------
function LocationStep({ formData, errors, updateField }) {
  const charsLeft = DESCRIPTION_LIMIT - formData.description.length
  return (
    <div>
      <StepHeading title="Where is the vehicle?" subtitle="Buyers usually look for vehicles near them." />

      <Field label="City" id="location" error={errors.location}>
        <select
          id="location"
          value={formData.location}
          onChange={(e) => updateField('location', e.target.value)}
          className={inputClasses(errors.location)}
        >
          <option value="">Select a city</option>
          {Object.entries(citiesByProvince).map(([province, provinceCities]) => (
            <optgroup key={province} label={province}>
              {provinceCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </Field>

      <div className="mt-5">
        <Field label="Description (optional)" id="description" hint={`${charsLeft} characters left`}>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value.slice(0, DESCRIPTION_LIMIT))}
            className={inputClasses(false)}
            rows={5}
            placeholder="Service history, new tyres, any scratches, reason for selling..."
          />
        </Field>
      </div>
    </div>
  )
}

// ---------- Step 4 ----------
function PhotosStep({ photos, error, onAdd, onRemove, onMakeCover }) {
  const [isDragging, setIsDragging] = useState(false)
  const canAddMore = photos.length < MAX_PHOTOS

  function handleDrop(event) {
    event.preventDefault() // stop the browser from opening the photo in a new tab
    setIsDragging(false)
    onAdd(event.dataTransfer.files)
  }

  return (
    <div>
      <StepHeading
        title="Add photos"
        subtitle={`Listings with clear photos get more buyers. Add 1 to ${MAX_PHOTOS} photos.`}
      />

      {canAddMore && (
        // A <label> wrapped around a hidden file input: clicking anywhere on the box opens the file picker.
        // On phones this also lets the person take a new photo with the camera.
        <label
          id="photos"
          onDragOver={(event) => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center text-center gap-2 rounded-cardsm border-2 border-dashed px-4 py-8 cursor-pointer transition ${
            isDragging
              ? 'border-accent bg-accentsoftbg'
              : error
                ? 'border-danger bg-dangerbg/40'
                : 'border-bordercol bg-sunken/50 hover:border-accent hover:bg-accentsoftbg'
          }`}
        >
          <input
            type="file"
            accept={ALLOWED_PHOTO_TYPES.join(',')}
            multiple
            className="sr-only"
            onChange={(event) => {
              onAdd(event.target.files)
              event.target.value = '' // so picking the same photo again still works
            }}
          />
          <span className="w-11 h-11 rounded-full bg-white text-accent shadow-card flex items-center justify-center">
            <CameraIcon />
          </span>
          <span className="text-sm font-semibold">
            <span className="text-accent">Choose photos</span>
            <span className="hidden sm:inline"> or drag them here</span>
          </span>
          <span className="text-xs text-textfaint">
            JPG, PNG or WebP · up to {MAX_PHOTO_SIZE_MB} MB each · {photos.length} of {MAX_PHOTOS} added
          </span>
        </label>
      )}

      {error && (
        <p role="alert" className="text-xs text-danger mt-2">
          {error}
        </p>
      )}

      {photos.length > 0 && (
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
          {photos.map((photo, index) => (
            <li key={photo.id} className="relative rounded-cardsm overflow-hidden border border-bordercol bg-sunken">
              <img src={photo.previewUrl} alt={`Photo ${index + 1}`} className="w-full aspect-[4/3] object-cover" />
              {index === 0 && (
                <Badge variant="featured" className="absolute top-2 left-2">
                  Cover
                </Badge>
              )}
              <button
                type="button"
                onClick={() => onRemove(photo.id)}
                aria-label={`Remove photo ${index + 1}`}
                className="absolute top-1.5 right-1.5 w-8 h-8 rounded-full bg-ink/70 text-white flex items-center justify-center hover:bg-ink transition"
              >
                <CloseIcon />
              </button>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => onMakeCover(photo.id)}
                  className="absolute bottom-0 inset-x-0 bg-ink/60 text-white text-xs font-semibold py-2 hover:bg-ink/80 transition"
                >
                  Make cover
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {photos.length > 1 && (
        <p className="text-xs text-textfaint mt-3">The cover photo is the one buyers see first in search results.</p>
      )}
    </div>
  )
}

// ---------- Step 5 ----------
function ReviewStep({ formData, photos, onEdit }) {
  const car = isCar(formData)
  const electric = isElectric(formData)
  return (
    <div>
      <StepHeading title="Check your listing" subtitle="Make sure everything is right before you publish." />

      <div className="grid md:grid-cols-[260px_1fr] gap-6 items-start">
        <ListingPreview formData={formData} coverUrl={photos[0]?.previewUrl} />

        <div className="flex flex-col gap-4">
          <ReviewSection title="Photos" onEdit={() => onEdit(4)}>
            <ReviewRow
              label={`${photos.length} added`}
              value={
                <span className="flex flex-wrap justify-end gap-2">
                  {photos.map((photo, index) => (
                    <img
                      key={photo.id}
                      src={photo.previewUrl}
                      alt={`Photo ${index + 1}`}
                      className="w-14 h-14 rounded-ctl object-cover border border-bordercol"
                    />
                  ))}
                </span>
              }
            />
          </ReviewSection>
          <ReviewSection title="Vehicle Info" onEdit={() => onEdit(1)}>
            <ReviewRow label="Vehicle" value={car ? 'Car' : 'Bike'} />
            <ReviewRow label="Type" value={getTypeLabel(formData.type)} />
            <ReviewRow label="Brand" value={formData.brand} />
            <ReviewRow label="Model" value={formData.model} />
            <ReviewRow label="Year" value={formData.year} />
            {car && (
              <>
                <ReviewRow label="Seats" value={formData.seats} />
                <ReviewRow label="Transmission" value={formData.transmission === 'automatic' ? 'Automatic' : 'Manual'} />
                <ReviewRow label="Drive type" value={formData.driveType || 'Not given'} />
              </>
            )}
          </ReviewSection>
          <ReviewSection title="Price & Condition" onEdit={() => onEdit(2)}>
            <ReviewRow label="Fuel" value={formData.fuelType} />
            <ReviewRow label="KM driven" value={`${formatPrice(formData.mileageKm)} KM`} />
            {!electric && <ReviewRow label="Engine" value={`${formData.engineCc} cc`} />}
            {car && electric && (
              <>
                <ReviewRow label="Battery" value={formData.batteryKwh !== '' ? `${formData.batteryKwh} kWh` : 'Not given'} />
                <ReviewRow label="Range" value={formData.rangeKm !== '' ? `${formatPrice(formData.rangeKm)} km` : 'Not given'} />
              </>
            )}
            <ReviewRow
              label="Price"
              value={`Rs. ${formatPrice(formData.price)} (${formData.negotiable ? 'Negotiable' : 'Fixed'})`}
            />
          </ReviewSection>
          <ReviewSection title="Location" onEdit={() => onEdit(3)}>
            <ReviewRow label="City" value={formData.location} />
            <ReviewRow label="Description" value={formData.description.trim() || 'None'} />
          </ReviewSection>
        </div>
      </div>
    </div>
  )
}

function ReviewSection({ title, onEdit, children }) {
  return (
    <div className="border border-bordersoft rounded-cardsm p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-bold">{title}</p>
        <button
          type="button"
          onClick={onEdit}
          className="text-sm font-semibold text-accent hover:underline -my-2 -mr-2 px-2 py-2"
        >
          Edit
        </button>
      </div>
      <dl className="flex flex-col gap-1.5">{children}</dl>
    </div>
  )
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <dt className="text-textmuted shrink-0">{label}</dt>
      <dd className="text-right font-medium break-words min-w-0">{value}</dd>
    </div>
  )
}

// ---------- The card that shows how the listing will look ----------
// coverUrl is the first photo's preview. Without a photo we show a drawing of the
// chosen type (VehicleArt draws bikes and cars).
function ListingPreview({ formData, coverUrl }) {
  const title = `${formData.brand} ${formData.model}`.trim() || 'Your vehicle'
  const details = [formData.year, formData.mileageKm !== '' ? `${formatPrice(formData.mileageKm)} KM` : '']
    .filter(Boolean)
    .join(' · ')

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="relative h-40 bg-linear-to-br from-accentsoftbg to-sunken">
        {coverUrl ? (
          <img src={coverUrl} alt="Cover photo" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <VehicleArt type={formData.type} />
        )}
        <Badge variant="info" className="absolute top-3 left-3">
          New listing
        </Badge>
      </div>
      <div className="p-4">
        <p className="font-display font-bold text-lg truncate">{title}</p>
        <p className="text-sm text-textmuted mt-0.5">{details || 'Year · KM'}</p>
        <p className="text-sm text-textmuted mt-0.5">{formData.location || 'City'}</p>
        <p className="font-display font-bold text-xl mt-3">
          {formData.price ? `Rs. ${formatPrice(formData.price)}` : 'Rs. —'}{' '}
          <span className="font-body font-normal text-xs text-textfaint">
            {formData.negotiable ? 'Negotiable' : 'Fixed'}
          </span>
        </p>
      </div>
    </Card>
  )
}

// ---------- Small shared pieces ----------
function StepHeading({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h2 className="font-display font-bold text-xl">{title}</h2>
      <p className="text-sm text-textmuted mt-1">{subtitle}</p>
    </div>
  )
}

// A label + input + (error or hint) text underneath.
function Field({ label, id, error, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold block mb-1.5">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-danger mt-1.5">{error}</p>
      ) : (
        hint && <p className="text-xs text-textfaint mt-1.5">{hint}</p>
      )}
    </div>
  )
}

// A row of buttons where only one can be picked (like Petrol / Electric).
// With 4 options it shows 2 per row on phones, so the buttons never squeeze.
function ToggleGroup({ label, id, options, value, onChange, error }) {
  const columns = options.length > 2 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'
  return (
    <div>
      <p className="text-sm font-semibold mb-1.5">{label}</p>
      <div
        id={id}
        role="group"
        aria-label={label}
        className={`grid ${columns} gap-1 sm:inline-grid bg-sunken rounded-ctl p-1 w-full sm:w-auto ${
          error ? 'ring-1 ring-danger' : ''
        }`}
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
            className={`px-5 py-2.5 sm:px-4 sm:py-1.5 text-sm font-semibold rounded-[7px] transition ${
              value === option.value ? 'bg-white text-ink shadow-card' : 'text-textmuted hover:text-ink'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-danger mt-1.5">{error}</p>}
    </div>
  )
}

function CheckIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

export default Sell
