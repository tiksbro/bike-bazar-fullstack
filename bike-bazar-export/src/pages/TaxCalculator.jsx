import { useState } from 'react'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { getProvinces, getBrands, getModelsForBrand, getCcBand, calculateTax } from '../services/taxService'

function TaxCalculator() {
  useDocumentTitle('Bike Tax Calculator')

  const provinces = getProvinces()
  const brands = getBrands()

  const [province, setProvince] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')

  const models = brand ? getModelsForBrand(brand) : []
  const selectedModel = models.find((m) => m.name === model)
  const ccBand = selectedModel ? getCcBand(selectedModel.engineCc) : null
  const taxAmount = province && ccBand ? calculateTax(province, ccBand) : null

  function handleProvinceChange(value) {
    setProvince(value)
    setBrand('')
    setModel('')
  }

  function handleBrandChange(value) {
    setBrand(value)
    setModel('')
  }

  return (
    <div className="max-w-[720px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display font-bold text-[26px]">Bike Tax Calculator</h1>
      <p className="text-textmuted mt-1">
        Estimate your yearly vehicle tax based on province and engine capacity.
      </p>

      <div className="flex flex-col gap-4 mt-8">
        <Field label="Province">
          <select
            value={province}
            onChange={(e) => handleProvinceChange(e.target.value)}
            className="w-full border border-bordercol rounded-ctl px-3 py-2 text-sm outline-none"
          >
            <option value="">Select a province</option>
            {provinces.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </Field>

        <Field label="Brand">
          <select
            value={brand}
            onChange={(e) => handleBrandChange(e.target.value)}
            disabled={!province}
            className="w-full border border-bordercol rounded-ctl px-3 py-2 text-sm outline-none disabled:opacity-40 disabled:bg-sunken"
          >
            <option value="">Select a brand</option>
            {brands.map((b) => (
              <option key={b.name} value={b.name}>{b.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Model">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={!brand}
            className="w-full border border-bordercol rounded-ctl px-3 py-2 text-sm outline-none disabled:opacity-40 disabled:bg-sunken"
          >
            <option value="">Select a model</option>
            {models.map((m) => (
              <option key={m.name} value={m.name}>{m.name} ({m.engineCc}cc)</option>
            ))}
          </select>
        </Field>
      </div>

      {taxAmount !== null && (
        <div className="mt-8 border border-bordercol rounded-card p-5 bg-accentsoftbg">
          <p className="text-sm text-textmuted">Estimated yearly tax for {brand} {model} in {province}</p>
          <p className="font-display font-bold text-2xl mt-1 text-accentsofttext">
            Rs. {taxAmount.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-textfaint mt-3">
            This is an estimate based on mock data, not an official government rate.
          </p>
        </div>
      )}
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

export default TaxCalculator
