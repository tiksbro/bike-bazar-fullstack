import { useState } from 'react'
import { citiesByProvince } from '../data/cities'
import { createVehicle } from '../services/vehicleService'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import Button from '../components/Button'
import Card from '../components/Card'
import Badge from '../components/Badge'
import VehicleArt from '../components/VehicleArt'

// The 4 steps of the form, in order.
const steps = ['Vehicle Info', 'Price & Condition', 'Location', 'Review']

const currentYear = new Date().getFullYear()

const emptyForm = {
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
}

const DESCRIPTION_LIMIT = 500

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

// Checks ONE step and returns an object of error messages.
// An empty object {} means the step is fine.
function validateStep(stepNumber, form) {
  const errors = {}

  if (stepNumber === 1) {
    if (!form.brand.trim()) errors.brand = 'Enter the brand, like Yamaha.'
    if (!form.model.trim()) errors.model = 'Enter the model, like R15 V3.'
    const year = Number(form.year)
    if (!form.year) errors.year = 'Enter the year it was made.'
    else if (year < 1980 || year > currentYear + 1) errors.year = `Year must be between 1980 and ${currentYear + 1}.`
  }

  if (stepNumber === 2) {
    if (form.mileageKm === '') errors.mileageKm = 'Enter how many KM it has run.'
    else if (Number(form.mileageKm) < 0) errors.mileageKm = 'KM cannot be negative.'
    // The backend needs engineCc for every listing, so it is required here too.
    if (!form.engineCc) errors.engineCc = 'Enter the engine size in cc.'
    else if (Number(form.engineCc) <= 0) errors.engineCc = 'Engine size must be more than 0.'
    if (!form.price) errors.price = 'Enter your asking price.'
    else if (Number(form.price) < 1000) errors.price = 'Price looks too low. Enter the full amount in rupees.'
  }

  if (stepNumber === 3) {
    if (!form.location) errors.location = 'Pick the city where the vehicle is.'
  }

  return errors
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

  function updateField(field, value) {
    setFormData({ ...formData, [field]: value })
    // Once they fix a box, remove that box's error message.
    if (errors[field]) {
      const { [field]: _removed, ...rest } = errors
      setErrors(rest)
    }
  }

  function goNext() {
    const stepErrors = validateStep(step, formData)
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
    setSubmitting(true)
    try {
      const token = localStorage.getItem('bikebazar_token')
      await createVehicle(
        {
          ...formData,
          brand: formData.brand.trim(),
          model: formData.model.trim(),
          description: formData.description.trim(),
        },
        token
      )
      setPublished(true)
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  function startNewListing() {
    setFormData(emptyForm)
    setErrors({})
    setStep(1)
    setPublished(false)
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
      <p className="text-textmuted text-sm mt-1">Free to list. Fill in 4 short steps and your vehicle goes live.</p>

      <Stepper step={step} onStepClick={goToStep} />

      <div className="grid lg:grid-cols-[1fr_340px] gap-6 mt-6 items-start">
        <Card padding="none" className="p-5 sm:p-6">
          {step === 1 && <VehicleInfoStep formData={formData} errors={errors} updateField={updateField} />}
          {step === 2 && <PriceStep formData={formData} errors={errors} updateField={updateField} />}
          {step === 3 && <LocationStep formData={formData} errors={errors} updateField={updateField} />}
          {step === 4 && <ReviewStep formData={formData} onEdit={goToStep} />}

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
                {submitting ? 'Publishing...' : 'Publish Listing'}
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
            <ListingPreview formData={formData} />
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
function VehicleInfoStep({ formData, errors, updateField }) {
  return (
    <div>
      <StepHeading title="Tell us about your vehicle" subtitle="Start with the basics buyers search for." />

      <p className="text-sm font-semibold mb-2">Vehicle type</p>
      <div className="grid grid-cols-2 gap-3">
        <TypeTile type="motorcycle" label="Motorcycle" selected={formData.type === 'motorcycle'} onSelect={updateField} />
        <TypeTile type="scooter" label="Scooter" selected={formData.type === 'scooter'} onSelect={updateField} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-6">
        <Field label="Brand" id="brand" error={errors.brand}>
          <input
            id="brand"
            value={formData.brand}
            onChange={(e) => updateField('brand', e.target.value)}
            className={inputClasses(errors.brand)}
            placeholder="e.g. Yamaha"
          />
        </Field>
        <Field label="Model" id="model" error={errors.model}>
          <input
            id="model"
            value={formData.model}
            onChange={(e) => updateField('model', e.target.value)}
            className={inputClasses(errors.model)}
            placeholder="e.g. R15 V3"
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
      </div>
    </div>
  )
}

// A big clickable box with a bike drawing, used to pick Motorcycle or Scooter.
function TypeTile({ type, label, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect('type', type)}
      aria-pressed={selected}
      className={`relative rounded-cardsm border-2 p-3 text-left transition ${
        selected ? 'border-accent bg-accentsoftbg' : 'border-bordercol bg-white hover:border-borderstrong'
      }`}
    >
      <div className="relative h-16 sm:h-20">
        <VehicleArt type={type} />
      </div>
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

// ---------- Step 2 ----------
function PriceStep({ formData, errors, updateField }) {
  return (
    <div>
      <StepHeading title="Price and condition" subtitle="Honest details help you sell faster." />

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Field label="KM driven" id="mileageKm" error={errors.mileageKm}>
          <input
            id="mileageKm"
            type="number"
            inputMode="numeric"
            value={formData.mileageKm}
            onChange={(e) => updateField('mileageKm', e.target.value)}
            className={inputClasses(errors.mileageKm)}
            placeholder="e.g. 18000"
          />
        </Field>
        <Field label="Engine (cc)" id="engineCc" error={errors.engineCc}>
          <input
            id="engineCc"
            type="number"
            inputMode="numeric"
            value={formData.engineCc}
            onChange={(e) => updateField('engineCc', e.target.value)}
            className={inputClasses(errors.engineCc)}
            placeholder="e.g. 155"
          />
        </Field>
      </div>

      <p className="text-sm font-semibold mt-5 mb-1.5">Fuel type</p>
      <div className="inline-flex bg-sunken rounded-ctl p-1" role="group" aria-label="Fuel type">
        {['Petrol', 'Electric'].map((fuel) => (
          <button
            key={fuel}
            type="button"
            onClick={() => updateField('fuelType', fuel)}
            aria-pressed={formData.fuelType === fuel}
            className={`px-5 py-2.5 sm:px-4 sm:py-1.5 text-sm font-semibold rounded-[7px] transition ${
              formData.fuelType === fuel ? 'bg-white text-ink shadow-card' : 'text-textmuted hover:text-ink'
            }`}
          >
            {fuel}
          </button>
        ))}
      </div>

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
              placeholder="320000"
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
function ReviewStep({ formData, onEdit }) {
  return (
    <div>
      <StepHeading title="Check your listing" subtitle="Make sure everything is right before you publish." />

      <div className="grid md:grid-cols-[260px_1fr] gap-6 items-start">
        <ListingPreview formData={formData} />

        <div className="flex flex-col gap-4">
          <ReviewSection title="Vehicle Info" onEdit={() => onEdit(1)}>
            <ReviewRow label="Type" value={formData.type === 'scooter' ? 'Scooter' : 'Motorcycle'} />
            <ReviewRow label="Brand" value={formData.brand} />
            <ReviewRow label="Model" value={formData.model} />
            <ReviewRow label="Year" value={formData.year} />
          </ReviewSection>
          <ReviewSection title="Price & Condition" onEdit={() => onEdit(2)}>
            <ReviewRow label="KM driven" value={`${formatPrice(formData.mileageKm)} KM`} />
            <ReviewRow label="Engine" value={`${formData.engineCc} cc`} />
            <ReviewRow label="Fuel" value={formData.fuelType} />
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
function ListingPreview({ formData }) {
  const title = `${formData.brand} ${formData.model}`.trim() || 'Your vehicle'
  const details = [formData.year, formData.mileageKm !== '' ? `${formatPrice(formData.mileageKm)} KM` : '']
    .filter(Boolean)
    .join(' · ')

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="relative h-40 bg-linear-to-br from-accentsoftbg to-sunken">
        <VehicleArt type={formData.type} />
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

export default Sell
