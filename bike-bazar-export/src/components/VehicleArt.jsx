// The vehicle drawings shown on vehicle cards and the detail page.
// Bikes: motorcycle and scooter. Cars: hatchback, sedan, suv, muv and pickup.
// The body color follows the listing's artColor, so a grid of
// vehicles doesn't look like the same picture repeated.
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

// ---------- Cars ----------
const CAR_TYPES = ['hatchback', 'sedan', 'suv', 'muv', 'pickup']

// A car wheel: tyre, silver rim and a small hub (no spokes like the bike wheel).
function CarWheel({ cx, cy, r }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#15181E" />
      <circle cx={cx} cy={cy} r={r * 0.62} fill="#AEB6C4" />
      <circle cx={cx} cy={cy} r={r * 0.5} fill="none" stroke="#8E97A6" strokeWidth="3" />
      <circle cx={cx} cy={cy} r={r * 0.2} fill="#2B303A" />
    </g>
  )
}

// Each car shape is described by a few numbers and SVG paths:
// body = the painted outline, windows = the glass, wheels = where the wheels go.
const carShapes = {
  hatchback: {
    body: 'M60 176 L60 130 Q60 120 72 116 L98 86 Q104 80 114 80 L236 80 Q252 80 264 92 L300 122 L328 128 Q350 134 348 176 Z',
    windows: ['M84 116 L106 92 Q110 88 118 88 L190 88 L190 116 Z', 'M200 88 L236 88 Q248 88 256 96 L280 116 L200 116 Z'],
    doorX: 195,
    wheels: [{ cx: 120, r: 30 }, { cx: 290, r: 30 }],
    lights: { front: 336, back: 60 },
  },
  sedan: {
    body: 'M36 176 Q32 140 62 134 L124 126 L162 92 Q174 82 192 82 L258 82 Q276 82 288 94 L322 126 L346 130 Q368 136 366 176 Z',
    windows: ['M146 124 L174 98 Q180 92 190 92 L226 92 L226 124 Z', 'M236 92 L258 92 Q270 92 278 100 L302 124 L236 124 Z'],
    doorX: 231,
    wheels: [{ cx: 108, r: 30 }, { cx: 296, r: 30 }],
    lights: { front: 352, back: 38 },
  },
  suv: {
    body: 'M40 178 L40 128 Q40 118 52 116 L92 112 L118 70 Q124 62 136 62 L276 62 Q290 62 298 72 L326 110 L350 114 Q364 118 364 132 L364 178 Z',
    windows: ['M104 110 L126 74 Q130 70 138 70 L196 70 L196 110 Z', 'M206 70 L272 70 Q282 70 288 78 L312 110 L206 110 Z'],
    doorX: 201,
    wheels: [{ cx: 110, r: 35 }, { cx: 296, r: 35 }],
    lights: { front: 352, back: 42 },
  },
  muv: {
    body: 'M34 178 L34 84 Q34 70 50 68 L272 66 Q288 66 298 78 L328 112 L352 116 Q366 120 366 134 L366 178 Z',
    windows: ['M46 110 L46 82 Q46 76 54 76 L120 76 L120 110 Z', 'M130 76 L210 76 L210 110 L130 110 Z', 'M220 76 L268 76 Q280 76 288 86 L310 110 L220 110 Z'],
    doorX: 215,
    wheels: [{ cx: 104, r: 33 }, { cx: 298, r: 33 }],
    lights: { front: 354, back: 36 },
  },
  pickup: {
    body: 'M34 178 L34 118 L176 118 L176 78 Q176 66 190 66 L262 66 Q276 66 286 78 L314 112 L346 116 Q364 120 364 136 L364 178 Z',
    windows: ['M188 108 L188 80 Q188 74 196 74 L258 74 Q268 74 276 84 L298 108 Z'],
    doorX: 240,
    wheels: [{ cx: 102, r: 33 }, { cx: 298, r: 33 }],
    lights: { front: 352, back: 36 },
  },
}

function CarArt({ type, body, dark }) {
  const shape = carShapes[type]
  return (
    <svg viewBox="0 0 400 240" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <ellipse cx="200" cy="212" rx="165" ry="9" fill="#0E1116" opacity="0.14" />
      <path d={shape.body} fill={body} />
      {shape.windows.map((d) => (
        <path key={d} d={d} fill="#CFE0F5" />
      ))}
      {/* Door line, and a light stripe along the side to give some shine */}
      <path d={`M${shape.doorX} 120 L${shape.doorX} 168`} stroke={dark} strokeWidth="3" />
      <path d="M60 146 L344 146" stroke="#FFFFFF" strokeOpacity="0.3" strokeWidth="4" strokeLinecap="round" />
      {/* Pickup only: the open cargo bed at the back */}
      {type === 'pickup' && <rect x="42" y="118" width="128" height="8" rx="3" fill={dark} />}
      <rect x={shape.lights.front} y="134" width="14" height="10" rx="4" fill="#FFF6D0" stroke="#E2C25A" strokeWidth="2" />
      <rect x={shape.lights.back} y="134" width="8" height="12" rx="3" fill="#E5432E" />
      <rect x="30" y="168" width="340" height="10" rx="5" fill={dark} />
      {shape.wheels.map((wheel) => (
        <CarWheel key={wheel.cx} cx={wheel.cx} cy={176} r={wheel.r} />
      ))}
    </svg>
  )
}

function VehicleArt({ type, color }) {
  const isCar = CAR_TYPES.includes(type)
  // No color given? Scooters are teal, cars blue, motorcycles orange.
  const defaultColor = type === 'scooter' ? 'teal' : isCar ? 'blue' : 'orange'
  const key = color && palettes[color] ? color : defaultColor
  const { body, dark } = palettes[key]

  if (isCar) {
    return <CarArt type={type} body={body} dark={dark} />
  }

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