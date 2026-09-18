import { Link } from 'react-router-dom'

const guides = [
  { title: 'Best bikes under Rs. 2 lakh', teaser: 'Our picks for reliable, budget-friendly motorcycles.' },
  { title: 'Yamaha R15 buying guide', teaser: 'What to check before buying a used R15.' },
  { title: 'How to check a used bike', teaser: 'A step-by-step inspection checklist.' },
  { title: 'How to transfer bike ownership', teaser: 'The paperwork process, explained simply.' },
  { title: 'Bike insurance guide', teaser: 'Understanding your options in Nepal.' },
  { title: 'EV bike buying guide', teaser: 'What is different about buying an electric bike.' },
  { title: 'Bike tax information', teaser: 'Estimate your yearly vehicle tax by province and engine size.', link: '/tax-calculator' },
]

function Guides() {
  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display font-bold text-[26px]">Guides</h1>
      <p className="text-textmuted mt-1">Helpful reading before you buy or sell.</p>

      <div className="grid sm:grid-cols-2 gap-4 mt-6">
        {guides.map((guide) =>
          guide.link ? (
            <Link key={guide.title} to={guide.link} className="border border-bordercol rounded-card p-5 hover:border-borderstrong transition">
              <p className="font-display font-semibold">{guide.title}</p>
              <p className="text-sm text-textmuted mt-1">{guide.teaser}</p>
            </Link>
          ) : (
            <div key={guide.title} className="border border-bordercol rounded-card p-5">
              <p className="font-display font-semibold">{guide.title}</p>
              <p className="text-sm text-textmuted mt-1">{guide.teaser}</p>
              <p className="text-xs text-textfaint mt-3">Full article coming soon</p>
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default Guides