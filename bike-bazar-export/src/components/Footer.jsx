function Footer() {
  return (
    <footer className="mt-14 border-t border-bordercol px-8 md:px-14 py-9">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row gap-10">
        <div className="max-w-[260px]">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-7 h-7 rounded-[9px] bg-accent flex items-center justify-center text-white font-display font-bold text-sm">
              B
            </span>
            <span className="font-display font-bold text-lg">Bike Bazar</span>
          </div>
          <p className="text-[13.5px] text-textmuted">
            Buy • Sell • Compare • Verify. A vehicle marketplace built for Nepal.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 flex-1">
          <FooterColumn title="Buy" links={['Browse Bikes', 'Compare', 'Featured', 'Dealers']} />
          <FooterColumn title="Sell" links={['Sell Your Vehicle', 'Seller Guide', 'Pricing Guide']} />
          <FooterColumn title="Services" links={['Inspection', 'Financing', 'Insurance']} />
          <FooterColumn title="Support" links={['Help Center', 'Safety', 'Report Listing']} />
        </div>
      </div>
    </footer>
  )
}

// A small helper component so we don't repeat the same markup four times.
// This is a common React pattern: pull repeated JSX into its own component
// and pass in the parts that differ as props.
function FooterColumn({ title, links }) {
  return (
    <div>
      <p className="font-bold uppercase text-xs tracking-wide">{title}</p>
      <ul className="mt-3 space-y-2 text-[13.5px] text-textmuted">
        {links.map((label) => (
          <li key={label}>
            <a href="#" className="hover:text-ink">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Footer
