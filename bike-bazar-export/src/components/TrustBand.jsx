// "Why Bike Bazar?" card near the bottom of the Home page.
// Only features that REALLY exist on the site are listed here.
// Don't add "Verified Sellers" until phone OTP verification is built,
// and don't add "Inspection" until there is a real inspection service.

// Small line icons. They use currentColor, so they take the blue
// color of the round chip around them.
const iconProps = {
  width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
}

function HealthIcon() {
  return (
    <svg {...iconProps}>
      <path d="M20.8 4.6c-1.8-1.5-4.5-1.3-6.1.4L12 7.7l-2.7-2.7c-1.6-1.7-4.3-1.9-6.1-.4-2 1.7-2.1 4.8-.3 6.6l8.4 8.6a1 1 0 0 0 1.4 0l8.4-8.6c1.8-1.8 1.7-4.9-.3-6.6z" />
      <path d="M7 12h2.5l1.5-3 2 5 1.5-2H17" />
    </svg>
  )
}

function PriceIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z" />
    </svg>
  )
}

function CompareIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="5" width="7" height="14" rx="1.5" />
      <rect x="14" y="5" width="7" height="14" rx="1.5" />
    </svg>
  )
}

const trustItems = [
  {
    // Honest wording: the score is worked out from age and kilometres
    // (see getBikeHealthScore in vehicleService.js), not from an inspection.
    title: 'Health Score',
    body: 'A quick estimate from age and kilometres driven.',
    Icon: HealthIcon,
  },
  {
    title: 'Price Insights',
    body: 'Good, Fair or High, compared to similar listings.',
    Icon: PriceIcon,
  },
  {
    title: 'Seller Ratings',
    body: 'See what other buyers say about a seller.',
    Icon: StarIcon,
  },
  {
    title: 'Compare Side by Side',
    body: 'Put up to 4 vehicles next to each other.',
    Icon: CompareIcon,
  },
]

function TrustBand() {
  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-10 lg:mt-12">
      {/* Light card (it used to be a dark band), like the mockup. */}
      <div className="rounded-band bg-gradient-to-b from-accentsoftbg to-white border border-accentsoftborder px-5 py-6 sm:px-8 sm:py-8 lg:px-11 lg:py-10">
        <h2 className="font-display font-bold text-ink text-[22px] lg:text-[26px]">Why Bike Bazar?</h2>
        <p className="mt-1 text-[14px] text-textmuted">A smarter way to buy and sell used vehicles in Nepal.</p>

        {/* 2 per row on phones, 4 in one row from lg (1024px).
            On desktop, lg:border-l draws a thin line between the items
            (lg:first:border-l-0 skips it before the first one). */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6 lg:gap-0 mt-6">
          {trustItems.map(({ title, body, Icon }) => (
            <div key={title} className="lg:px-6 lg:first:pl-0 lg:border-l lg:first:border-l-0 border-accentsoftborder">
              <span className="w-10 h-10 rounded-full bg-white text-accent shadow-card flex items-center justify-center">
                <Icon />
              </span>
              <p className="mt-3 text-ink font-semibold text-[15px]">{title}</p>
              <p className="mt-1 text-[13px] text-textmuted" style={{ lineHeight: 1.5 }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TrustBand
