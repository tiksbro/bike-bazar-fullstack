const budgets = [
  { label: 'Under Rs. 1 Lakh', count: '312 bikes' },
  { label: 'Rs. 1–2 Lakh', count: '728 bikes' },
  { label: 'Rs. 2–3 Lakh', count: '641 bikes' },
  { label: 'Rs. 3–5 Lakh', count: '409 bikes' },
  { label: 'Above Rs. 5 Lakh', count: '158 bikes' },
]

const brands = ['Yamaha', 'Honda', 'Bajaj', 'TVS', 'Royal Enfield', 'KTM', 'Hero', 'Suzuki', 'NIU', 'Yezdi', 'Other']

function BudgetAndBrand() {
  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8" style={{ marginTop: 48 }}>
      <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-8">
        <div>
          <h2 className="font-display font-bold text-[26px]">Browse by Budget</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            {budgets.map((b) => (
              <a key={b.label} href="/vehicles" className="bg-white rounded-cardsm px-[18px] py-4">
                <p className="font-semibold text-[15px]">{b.label}</p>
                <p className="text-[12.5px] text-textfaint mt-1">{b.count}</p>
              </a>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display font-bold text-[26px]">Browse by Brand</h2>
          <div className="flex flex-wrap gap-2 mt-4">
            {brands.map((brand) => (
              <a key={brand} href="/vehicles" className="bg-white border border-bordercol rounded-full font-medium text-[13.5px] px-4 py-[9px]">
                {brand}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default BudgetAndBrand