const trustItems = [
  {
    title: 'Verified Sellers',
    body: 'Phone and email checks, visible on every listing.',
    Icon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7B818A" strokeWidth="1.8"><path d="M20 6L9 17l-5-5" /></svg>
    ),
  },
  {
    title: 'Safer Marketplace',
    body: 'Report suspicious listings and sellers in one tap.',
    Icon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7B818A" strokeWidth="1.8"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /></svg>
    ),
  },
  {
    title: 'Compare Vehicles',
    body: 'Put up to four bikes side by side before deciding.',
    Icon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7B818A" strokeWidth="1.8"><rect x="3" y="10" width="7" height="10" /><rect x="14" y="4" width="7" height="16" /></svg>
    ),
  },
  {
    title: 'Inspection',
    body: 'Request a partner mechanic to check the bike first.',
    Icon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7B818A" strokeWidth="1.8"><path d="M14.7 6.3a4 4 0 00-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 005.4-5.4l-2.5 2.5-2-2z" /></svg>
    ),
  },
  {
    title: 'Transparent Pricing',
    body: 'See how a price compares to similar listings.',
    Icon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7B818A" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>
    ),
  },
]

function TrustBand() {
  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8" style={{ marginTop: 52 }}>
      <div className="rounded-band bg-ink" style={{ padding: '40px 44px' }}>
        <h2 className="font-display font-bold text-white text-[26px]">Why Bike Bazar?</h2>
        <p className="mt-1.5 text-[14px]" style={{ color: '#9AA0A6' }}>
          Buying a used bike is a trust problem before it is a search problem.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-[22px] mt-7">
          {trustItems.map(({ title, body, Icon }) => (
            <div key={title}>
              <div className="mb-2.5">
                <Icon />
              </div>
              <p className="text-white font-semibold text-[15.5px]">{title}</p>
              <p className="text-[13.5px] mt-1" style={{ lineHeight: 1.55, color: '#9AA0A6' }}>
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