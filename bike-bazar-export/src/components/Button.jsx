import { Link } from 'react-router-dom'


const base =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-btn transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none'

const variants = {
  primary: 'bg-accent text-white border border-transparent shadow-btn hover:bg-accenthover',
  secondary: 'bg-white text-ink border border-bordercol hover:border-borderstrong hover:bg-sunken',
  danger: 'bg-white text-danger border border-danger hover:bg-dangerbg',
  dark: 'bg-ink text-white border border-transparent hover:bg-ink-2',
  ghost: 'bg-transparent text-textmuted border border-transparent hover:text-ink hover:bg-sunken',
}

const sizes = {
  sm: 'text-[13px] px-3 py-1.5',
  md: 'text-sm px-5 py-3',
  lg: 'text-[15px] px-6 py-3.5',
}

function Spinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function Button({
  variant = 'primary',
  size = 'md',
  to,
  href,
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  className = '',
  children,
  ...rest
}) {
  const classes = `${base} ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.md} ${
    fullWidth ? 'w-full' : ''
  } ${className}`

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    )
  }

  return (
    <button type={type} disabled={disabled || loading} className={classes} {...rest}>
      {loading && <Spinner />}
      {children}
    </button>
  )
}

export default Button