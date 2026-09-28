// One card style for the whole site: white, soft shadow, rounded corners.
//   padding: "none" | "sm" | "md" | "lg"
//   tone="attention" gives a soft amber tint, for things that need the
//   person to act (like an offer waiting for a reply).
//   hover adds the small lift on mouse-over (for clickable cards).
const paddings = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' }

const tones = {
  default: 'bg-white border-bordersoft',
  attention: 'bg-warningbg/40 border-warning/30',
}

function Card({ as: Tag = 'div', padding = 'md', tone = 'default', hover = false, className = '', children, ...rest }) {
  return (
    <Tag
      className={`border rounded-card shadow-card ${tones[tone] ?? tones.default} ${paddings[padding] ?? paddings.md} ${
        hover ? 'transition duration-200 hover:shadow-cardhover hover:-translate-y-0.5' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  )
}

export default Card