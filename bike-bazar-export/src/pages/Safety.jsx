const tips = [
  'Never send money before verifying the vehicle in person.',
  'Meet in a safe, public location.',
  'Verify ownership documents before paying.',
  'Inspect the vehicle yourself, or request a professional inspection.',
  'Be cautious of prices that seem unusually low.',
]

function Safety() {
  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display font-bold text-[26px]">Safe Buying & Selling</h1>
      <p className="text-textmuted mt-2">
        A few simple habits go a long way toward avoiding scams on any marketplace.
      </p>

      <ul className="flex flex-col gap-3 mt-6">
        {tips.map((tip) => (
          <li key={tip} className="flex gap-3 items-start border border-bordercol rounded-cardsm p-3">
            <span className="text-success font-bold">✓</span>
            <span className="text-sm">{tip}</span>
          </li>
        ))}
      </ul>

      <div className="border border-bordercol rounded-card p-5 mt-8">
        <h2 className="font-display font-bold text-lg">Seen something suspicious?</h2>
        <p className="text-textmuted text-sm mt-1">
          Every vehicle listing has a "Report" option on its detail page — use it if a listing looks
          fake, is a duplicate, or the seller seems suspicious.
        </p>
      </div>
    </div>
  )
}

export default Safety