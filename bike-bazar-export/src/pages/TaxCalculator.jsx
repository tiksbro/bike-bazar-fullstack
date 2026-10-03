import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import VehicleTabs from '../components/VehicleTabs'
import {
  getProvinces,
  getBrands,
  getModelsForBrand,
  getCcBand,
  calculateTax,
  getCarCcBands,
  getCarPowerBands,
  calculateCarTax,
} from '../services/taxService'

// The fuel types a car can have, in the order they show in the select.
const carFuelTypes = ['Petrol', 'Diesel', 'Hybrid', 'Electric']

// Electric cars pick a motor power group (kW), because they have no engine cc.
// Petrol, Diesel and Hybrid cars pick an engine size group (cc).
function bandsForFuel(fuelType) {
  return fuelType === 'Electric' ? getCarPowerBands() : getCarCcBands()
}

// The page itself. Its only jobs: read which tab is in the URL, and
// change the URL when someone picks the other tab.
//
// The tab lives in the URL (/tax-calculator = Bikes,
// /tax-calculator?vehicle=car = Cars) instead of in useState, so:
//   - the Back button goes back to the tab you were on,
//   - a shared link opens the same tab for your friend,
//   - refreshing the page keeps the tab.
// This is the same pattern as the Browse page.
function TaxCalculator() {
  const [searchParams, setSearchParams] = useSearchParams()
  const vehicle = searchParams.get('vehicle') === 'car' ? 'car' : 'bike'

  useDocumentTitle('Vehicle Tax Calculator')

  // Bikes is the default, so its URL is just /tax-calculator with
  // nothing after it. setSearchParams adds a new entry to the browser
  // history, which is what makes the Back button work.
  function switchTab(nextVehicle) {
    setSearchParams(nextVehicle === 'car' ? { vehicle: 'car' } : {})
  }

  return (
    <div className="max-w-[720px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display font-bold text-[26px]">Vehicle Tax Calculator</h1>
      <p className="text-textmuted mt-1">
        {vehicle === 'car'
          ? 'Estimate your yearly car tax based on province, fuel type and engine size.'
          : 'Estimate your yearly bike tax based on province and engine capacity.'}
      </p>

      <VehicleTabs value={vehicle} onChange={switchTab} className="mt-4" />

      {/* Each tab is its own component, so switching tabs throws the old
          form away and starts the new one empty. The key is the URL's
          query part: when it changes (a link from a new car page, the
          Back button), the car form starts again and reads the new URL. */}
      {vehicle === 'car' ? (
        <CarTaxForm key={searchParams.toString()} searchParams={searchParams} />
      ) : (
        <BikeTaxForm />
      )}
    </div>
  )
}

// BIKES: Province -> Brand -> Model. The model gives us the cc,
// the cc gives us the band, the band gives us the tax.
function BikeTaxForm() {
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
    <>
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
        <ResultBox
          label={`Estimated yearly tax for ${brand} ${model} in ${province}`}
          amount={taxAmount}
        />
      )}
    </>
  )
}

// CARS: Province -> Fuel Type -> Engine size (or Motor power for electric).
function CarTaxForm({ searchParams }) {
  const provinces = getProvinces()

  // Optional pre-fill from the URL, e.g.
  // /tax-calculator?vehicle=car&fuel=Petrol&band=1001-1500cc
  // The "Estimate yearly tax" link on a new car page uses this, so the
  // visitor only has to pick a province. We check the values first and
  // ignore anything that is not a real fuel type or a real band.
  const urlFuel = searchParams.get('fuel')
  const startFuel = carFuelTypes.includes(urlFuel) ? urlFuel : ''
  const urlBand = searchParams.get('band')
  const startBand =
    startFuel && bandsForFuel(startFuel).includes(urlBand) ? urlBand : ''

  const [province, setProvince] = useState('')
  const [fuelType, setFuelType] = useState(startFuel)
  const [band, setBand] = useState(startBand)

  const isElectric = fuelType === 'Electric'
  const bands = fuelType ? bandsForFuel(fuelType) : []
  const taxAmount =
    province && fuelType && band ? calculateCarTax(province, fuelType, band) : null

  // Petrol bands and Electric bands are two different lists, so the old
  // pick cannot stay when the fuel type changes.
  function handleFuelChange(value) {
    setFuelType(value)
    setBand('')
  }

  // "an Electric car", but "a Petrol car".
  const article = isElectric ? 'an' : 'a'

  return (
    <>
      <div className="flex flex-col gap-4 mt-8">
        <Field label="Province">
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="w-full border border-bordercol rounded-ctl px-3 py-2 text-sm outline-none"
          >
            <option value="">Select a province</option>
            {provinces.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </Field>

        <Field label="Fuel Type">
          <select
            value={fuelType}
            onChange={(e) => handleFuelChange(e.target.value)}
            // Locked until a province is picked, unless the URL already
            // filled it in, in which case it must stay usable.
            disabled={!province && !fuelType}
            className="w-full border border-bordercol rounded-ctl px-3 py-2 text-sm outline-none disabled:opacity-40 disabled:bg-sunken"
          >
            <option value="">Select a fuel type</option>
            {carFuelTypes.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </Field>

        <Field label={isElectric ? 'Motor power' : 'Engine size'}>
          <select
            value={band}
            onChange={(e) => setBand(e.target.value)}
            disabled={!fuelType}
            className="w-full border border-bordercol rounded-ctl px-3 py-2 text-sm outline-none disabled:opacity-40 disabled:bg-sunken"
          >
            <option value="">
              {isElectric ? 'Select a motor power' : 'Select an engine size'}
            </option>
            {bands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          {isElectric && (
            <p className="text-xs text-textfaint mt-1.5">
              Electric cars are taxed by motor power, not engine size.
            </p>
          )}
        </Field>
      </div>

      {taxAmount !== null && (
        <ResultBox
          label={`Estimated yearly tax for ${article} ${fuelType} car (${band}) in ${province}`}
          amount={taxAmount}
        />
      )}
    </>
  )
}

// The answer box. Shared, so bikes and cars look exactly the same.
function ResultBox({ label, amount }) {
  return (
    <div className="mt-8 border border-bordercol rounded-card p-5 bg-accentsoftbg">
      <p className="text-sm text-textmuted">{label}</p>
      <p className="font-display font-bold text-2xl mt-1 text-accentsofttext">
        Rs. {amount.toLocaleString('en-IN')}
      </p>
      <p className="text-xs text-textfaint mt-3">
        This is an estimate based on mock data, not an official government rate.
      </p>
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
