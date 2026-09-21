import { useState } from 'react'
import { Link } from 'react-router-dom'
import { citiesByProvince } from '../data/cities'
import { createVehicle } from '../services/vehicleService'
import { useAuth } from '../context/AuthContext'

const steps = ['Vehicle Info', 'Price & Condition', 'Location', 'Preview']

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

function Sell() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState(emptyForm)
  const [published, setPublished] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  function updateField(field, value) {
    setFormData({ ...formData, [field]: value })
  }

  function isStepValid() {
    if (step === 1) return formData.brand && formData.model && formData.year
    if (step === 2) return formData.mileageKm && formData.price
    if (step === 3) return formData.location
    return true
  }

  function goNext() {
    if (step < steps.length) setStep(step + 1)
  }
  function goBack() {
    if (step > 1) setStep(step - 1)
  }
  const { user } = useAuth()

  async function handlePublish() {
    setSubmitError('')
    setSubmitting(true)
    try {
      const token = localStorage.getItem('bikebazar_token')
      await createVehicle(formData, token)
      setPublished(true)
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

if (!user) {
  return (
    <div className="max-w-[500px] mx-auto px-4 sm:px-6 py-24 text-center">
      <h1 className="font-display font-bold text-2xl">Log In to Sell a Vehicle</h1>
      <p className="text-textmuted mt-2">You need an account to list a vehicle for sale.</p>
      <Link to="/login" className="inline-flex mt-6 bg-accent hover:bg-accenthover transition text-white font-semibold text-sm rounded-btn px-5 py-3">
        Log In
      </Link>
    </div>
  )
}

  if (published) {
    return (
      <div className="max-w-[600px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="font-display font-bold text-2xl">Listing Submitted!</h1>
        <p className="text-textmuted mt-2">
          Your {formData.brand} {formData.model} has been saved and is now live on Bike Bazar.
        </p>
        <div className="flex gap-3 justify-center mt-6">
          <Link to="/dashboard" className="inline-flex bg-accent hover:bg-accenthover transition text-white font-semibold text-sm rounded-btn px-5 py-3">
            View in Dashboard
          </Link>
          <Link to="/" className="inline-flex border border-bordercol font-semibold text-sm rounded-btn px-5 py-3">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[720px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display font-bold text-[26px]">Sell Your Vehicle</h1>

      <div className="flex items-center gap-2 mt-6">
        {steps.map((label, index) => {
          const stepNumber = index + 1
          const isActive = stepNumber === step
          const isDone = stepNumber < step
          return (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  isActive || isDone ? 'bg-accent text-white' : 'bg-sunken text-textfaint'
                }`}
              >
                {stepNumber}
              </div>
              <span className={`text-xs ${isActive ? 'font-semibold' : 'text-textfaint'}`}>{label}</span>
              {stepNumber < steps.length && <div className="flex-1 h-px bg-bordercol" />}
            </div>
          )
        })}
      </div>

      {step === 1 && (
        <div className="flex flex-col gap-4 mt-8">
          <Field label="Brand">
            <input value={formData.brand} onChange={(e) => updateField('brand', e.target.value)} className="w-full border border-bordercol rounded-ctl px-3 py-2 text-sm outline-none" placeholder="e.g. Yamaha" />
          </Field>
          <Field label="Model">
            <input value={formData.model} onChange={(e) => updateField('model', e.target.value)} className="w-full border border-bordercol rounded-ctl px-3 py-2 text-sm outline-none" placeholder="e.g. R15 V3" />
          </Field>
          <Field label="Year">
            <input type="number" value={formData.year} onChange={(e) => updateField('year', e.target.value)} className="w-full border border-bordercol rounded-ctl px-3 py-2 text-sm outline-none" placeholder="e.g. 2022" />
          </Field>
          <Field label="Type">
            <select value={formData.type} onChange={(e) => updateField('type', e.target.value)} className="w-full border border-bordercol rounded-ctl px-3 py-2 text-sm outline-none">
              <option value="motorcycle">Motorcycle</option>
              <option value="scooter">Scooter</option>
            </select>
          </Field>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4 mt-8">
          <Field label="KM Driven">
            <input type="number" value={formData.mileageKm} onChange={(e) => updateField('mileageKm', e.target.value)} className="w-full border border-bordercol rounded-ctl px-3 py-2 text-sm outline-none" placeholder="e.g. 18000" />
          </Field>
          <Field label="Engine (cc)">
            <input type="number" value={formData.engineCc} onChange={(e) => updateField('engineCc', e.target.value)} className="w-full border border-bordercol rounded-ctl px-3 py-2 text-sm outline-none" placeholder="e.g. 155" />
          </Field>
          <Field label="Fuel Type">
            <select value={formData.fuelType} onChange={(e) => updateField('fuelType', e.target.value)} className="w-full border border-bordercol rounded-ctl px-3 py-2 text-sm outline-none">
              <option value="Petrol">Petrol</option>
              <option value="Electric">Electric</option>
            </select>
          </Field>
          <Field label="Price (Rs.)">
            <input type="number" value={formData.price} onChange={(e) => updateField('price', e.target.value)} className="w-full border border-bordercol rounded-ctl px-3 py-2 text-sm outline-none" placeholder="e.g. 320000" />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={formData.negotiable} onChange={(e) => updateField('negotiable', e.target.checked)} />
            Price is negotiable
          </label>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-4 mt-8">
          <Field label="Location">
            <select value={formData.location} onChange={(e) => updateField('location', e.target.value)} className="w-full border border-bordercol rounded-ctl px-3 py-2 text-sm outline-none">
              <option value="">Select a city</option>
              {Object.entries(citiesByProvince).map(([province, provinceCities]) => (
                <optgroup key={province} label={province}>
                  {provinceCities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Field>
          <Field label="Description (optional)">
            <textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              className="w-full border border-bordercol rounded-ctl px-3 py-2 text-sm outline-none"
              rows={4}
              placeholder="Anything a buyer should know..."
            />
          </Field>
        </div>
      )}

      {step === 4 && (
        <div className="mt-8 border border-bordercol rounded-card p-5">
          <p className="font-display font-bold text-xl">{formData.brand} {formData.model}</p>
          <p className="text-textmuted mt-1">
            {formData.year} · {formData.mileageKm} KM · {formData.engineCc}cc · {formData.fuelType}
          </p>
          <p className="text-textmuted">{formData.location}</p>
          <p className="font-display font-bold text-2xl mt-3">
            Rs. {Number(formData.price || 0).toLocaleString('en-IN')}{' '}
            <span className="font-body font-normal text-sm text-textfaint">
              {formData.negotiable ? 'Negotiable' : 'Fixed'}
            </span>
          </p>
          {formData.description && <p className="text-sm text-textmuted mt-3">{formData.description}</p>}
        </div>
      )}

      <div className="flex justify-between mt-8">
        <button
          onClick={goBack}
          disabled={step === 1}
          className="text-sm font-semibold px-5 py-3 rounded-btn border border-bordercol disabled:opacity-40"
        >
          Back
        </button>

        {step < steps.length ? (
          <button
            onClick={goNext}
            disabled={!isStepValid()}
            className="bg-accent hover:bg-accenthover transition text-white font-semibold text-sm rounded-btn px-6 py-3 disabled:opacity-40"
          >
            Next
          </button>
        ) : (
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={handlePublish}
              disabled={submitting}
              className="bg-accent hover:bg-accenthover transition text-white font-semibold text-sm rounded-btn px-6 py-3 disabled:opacity-40"
            >
              {submitting ? 'Publishing...' : 'Publish Listing'}
            </button>
            {submitError && <p className="text-danger text-xs">{submitError}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-sm font-semibold block mb-1.5">{label}</label>
      {children}
    </div>
  )
}

export default Sell