// The bike drawings shown on vehicle cards and the detail page.
// The bike body color follows the listing's artColor, so a grid of
// bikes doesn't look like the same picture repeated.
const palettes = {
  orange: { body: '#E4572E', dark: '#B23C1C' },
  blue: { body: '#2B5BE3', dark: '#1E43AB' },
  graphite: { body: '#3A414D', dark: '#232830' },
  teal: { body: '#0F8A7A', dark: '#0B6358' },
}

function Wheel({ cx, cy, r }) {
  const spokes = [0, 1, 2, 3, 4, 5].map((i) => {
    const a = (i * Math.PI) / 3 + 0.3
    return (
      <line
        key={i}
        x1={cx}
        y1={cy}
        x2={cx + (r - 13) * Math.cos(a)}
        y2={cy + (r - 13) * Math.sin(a)}
        stroke="#AEB6C4"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    )
  })
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#15181E" />
      <circle cx={cx} cy={cy} r={r - 8} fill="#2B303A" />
      <circle cx={cx} cy={cy} r={r - 11} fill="none" stroke="#C9D0DB" strokeWidth="3" />
      {spokes}
      <circle cx={cx} cy={cy} r="7" fill="#8E97A6" />
      <circle cx={cx} cy={cy} r="3" fill="#15181E" />
    </g>
  )
}

function VehicleArt({ type, color }) {
  const key = color && palettes[color] ? color : type === 'scooter' ? 'teal' : 'orange'
  const { body, dark } = palettes[key]

  if (type === 'scooter') {
    return (
      <svg viewBox="0 0 400 240" className="absolute inset-0 w-full h-full" aria-hidden="true">
        <ellipse cx="200" cy="212" rx="140" ry="9" fill="#0E1116" opacity="0.14" />
        <Wheel cx={110} cy={176} r={34} />
        <Wheel cx={296} cy={176} r={34} />
        <path d="M62 158 Q60 104 128 100 L214 102 L218 158 Z" fill={body} />
        <path d="M80 130 Q100 112 140 112" stroke="#FFFFFF" strokeOpacity="0.3" strokeWidth="5" fill="none" strokeLinecap="round" />
        <rect x="96" y="86" width="118" height="20" rx="10" fill="#14171C" />
        <rect x="200" y="156" width="82" height="14" rx="7" fill={dark} />
        <path d="M262 160 Q270 104 292 70 L312 74 Q304 112 312 160 Z" fill={body} />
        <path d="M296 72 L274 60 L254 64" stroke="#14171C" strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M262 62 L258 46" stroke="#14171C" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="258" cy="42" rx="8" ry="5" fill="#9AA3B2" />
        <circle cx="314" cy="92" r="11" fill="#FFF6D0" stroke="#E2C25A" strokeWidth="2.5" />
        <path d="M304 84 L298 176" stroke="#BCC4D0" strokeWidth="8" strokeLinecap="round" />
        <path d="M266 156 Q296 132 326 156" stroke={body} strokeWidth="8" fill="none" strokeLinecap="round" />
        <rect x="56" y="126" width="8" height="12" rx="3" fill="#E5432E" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 400 240" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <ellipse cx="200" cy="212" rx="150" ry="9" fill="#0E1116" opacity="0.14" />
      <Wheel cx={92} cy={168} r={44} />
      <Wheel cx={312} cy={168} r={44} />
      <path d="M92 168 L170 152" stroke="#2B303A" strokeWidth="9" strokeLinecap="round" />
      <rect x="150" y="138" width="92" height="50" rx="12" fill="#2B303A" />
      <rect x="160" y="146" width="70" height="8" rx="3" fill="#3B414D" />
      <rect x="160" y="160" width="70" height="8" rx="3" fill="#3B414D" />
      <path d="M210 184 Q170 200 138 172" stroke="#9AA3B2" strokeWidth="9" fill="none" strokeLinecap="round" />
      <rect x="98" y="142" width="54" height="15" rx="7.5" fill="#C2C9D4" transform="rotate(22 125 150)" />
      <rect x="94" y="145" width="9" height="9" rx="4" fill="#5B6473" transform="rotate(22 98 150)" />
      <path d="M80 122 Q86 100 128 104 L150 108 L146 128 L96 134 Z" fill={body} />
      <path d="M120 112 Q150 104 188 110 L184 124 L124 128 Z" fill="#14171C" />
      <path d="M172 112 Q184 74 232 76 Q270 80 278 100 L268 122 L180 126 Z" fill={body} />
      <path d="M190 100 Q214 88 250 92" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M272 98 Q300 84 316 102 L312 130 L270 124 Z" fill={dark} />
      <circle cx="306" cy="106" r="11" fill="#FFF6D0" stroke="#E2C25A" strokeWidth="2.5" />
      <path d="M292 96 L312 168" stroke="#BCC4D0" strokeWidth="8" strokeLinecap="round" />
      <path d="M268 84 L252 68 L236 70" stroke="#14171C" strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M276 140 Q312 112 348 140" stroke={body} strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M188 124 L200 150" stroke="#2B303A" strokeWidth="8" strokeLinecap="round" />
      <rect x="78" y="112" width="8" height="12" rx="3" fill="#E5432E" />
    </svg>
  )
}

export default VehicleArt