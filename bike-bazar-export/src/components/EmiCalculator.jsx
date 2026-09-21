import { useState } from 'react'

function EmiCalculator({ price }) {
  const [downPaymentPercent, setDownPaymentPercent] = useState(20)
  const [tenureMonths, setTenureMonths] = useState(24)
  const [annualRate, setAnnualRate] = useState(10.5)

  const downPayment = Math.round((price * downPaymentPercent) / 100)
  const principal = price - downPayment
  const monthlyRate = annualRate / 12 / 100

  const emi =
    monthlyRate === 0
      ? principal / tenureMonths
      : (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
        (Math.pow(1 + monthlyRate, tenureMonths) - 1)

  const totalPayment = emi * tenureMonths
  const totalInterest = totalPayment - principal

  return (
    <div className="border border-bordercol rounded-card p-5">
      <h3 className="font-display font-bold text-lg">EMI Calculator</h3>
      <p className="text-xs text-textfaint mt-0.5">
        Estimate your monthly payment. Actual rates depend on the lender.
      </p>

      <div className="grid sm:grid-cols-3 gap-4 mt-4">
        <div>
          <label className="text-xs font-semibold block mb-1.5">Down Payment (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={downPaymentPercent}
            onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
            className="w-full border border-bordercol rounded-ctl px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-semibold block mb-1.5">Tenure</label>
          <select
            value={tenureMonths}
            onChange={(e) => setTenureMonths(Number(e.target.value))}
            className="w-full border border-bordercol rounded-ctl px-3 py-2 text-sm"
          >
            <option value={12}>12 months</option>
            <option value={24}>24 months</option>
            <option value={36}>36 months</option>
            <option value={48}>48 months</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold block mb-1.5">Interest Rate (% p.a.)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={annualRate}
            onChange={(e) => setAnnualRate(Number(e.target.value))}
            className="w-full border border-bordercol rounded-ctl px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mt-5 pt-4 border-t border-bordersoft">
        <div>
          <p className="text-xs text-textfaint">Monthly EMI</p>
          <p className="font-display font-bold text-xl mt-0.5">
            Rs. {Math.round(emi).toLocaleString('en-IN')}
          </p>
        </div>
        <div>
          <p className="text-xs text-textfaint">Down Payment</p>
          <p className="font-semibold text-sm mt-0.5">Rs. {downPayment.toLocaleString('en-IN')}</p>
        </div>
        <div>
          <p className="text-xs text-textfaint">Total Interest</p>
          <p className="font-semibold text-sm mt-0.5">Rs. {Math.round(totalInterest).toLocaleString('en-IN')}</p>
        </div>
      </div>
    </div>
  )
}

export default EmiCalculator