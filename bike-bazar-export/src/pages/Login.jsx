import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import Button from '../components/Button'
import VehicleArt from '../components/VehicleArt'

// Small line icons used on this page.
const iconPaths = {
  user: (
    <>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  mail: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 7l-10 6L2 7" />
    </>
  ),
  lock: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
  eye: (
    <>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeoff: (
    <>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <path d="M1 1l22 22" />
    </>
  ),
  store: (
    <>
      <path d="M3 9l1.5-5h15L21 9" />
      <path d="M4 9v11h16V9" />
      <path d="M9 20v-6h6v6" />
    </>
  ),
  pin: (
    <>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  star: <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />,
  tag: (
    <>
      <path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </>
  ),
  pulse: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
}

function Icon({ name, size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconPaths[name]}
    </svg>
  )
}

// A labelled text box with an icon inside on the left.
function Field({ id, label, icon, hint, rightSlot, ...inputProps }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold block mb-1.5">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textfaint pointer-events-none">
          <Icon name={icon} />
        </span>
        <input
          id={id}
          className={`w-full border border-bordercol focus:border-accent rounded-ctl pl-11 ${
            rightSlot ? 'pr-12' : 'pr-3'
          } py-3 text-sm bg-white placeholder:text-textfaint`}
          {...inputProps}
        />
        {rightSlot}
      </div>
      {hint && <p className="text-xs text-textfaint mt-1.5">{hint}</p>}
    </div>
  )
}

// The three reasons to join, shown on the brand panel.
const perks = [
  { icon: 'star', title: 'Rated sellers', text: 'Buyers rate sellers after a real deal, so you can see who to trust.' },
  { icon: 'tag', title: 'Fair price check', text: 'See how a price compares with similar bikes on the site.' },
  { icon: 'pulse', title: 'Bike health score', text: 'A quick condition estimate on every listing.' },
]

const brandBackground = 'linear-gradient(155deg, #0E1116 0%, #1B1F3B 55%, #5E3B2C 130%)'

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-[10px] bg-accent text-white flex items-center justify-center font-display font-bold text-lg">
        B
      </div>
      <span className="font-display font-bold text-xl">Bike Bazar</span>
    </div>
  )
}

function Login() {
  const [mode, setMode] = useState('login') // 'login' or 'register'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isDealer, setIsDealer] = useState(false)
  const [businessName, setBusinessName] = useState('')
  const [city, setCity] = useState('')
  // Only used when registering: the "I agree" box.
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { login, register } = useAuth()
  const navigate = useNavigate()
  const isRegister = mode === 'register'

  useDocumentTitle(isRegister ? 'Create Account' : 'Log In')

  function switchMode(next) {
    setMode(next)
    setError('')
    setShowPassword(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    // Stop here if the agreement box is not ticked. We return BEFORE
    // setSubmitting(true), so nothing is sent to the server.
    if (isRegister && !acceptedTerms) {
      setError('Please accept the Terms of Use and Privacy Policy to create an account.')
      return
    }

    setSubmitting(true)

    try {
      if (!isRegister) {
        await login(email.trim(), password)
        navigate('/profile')
      } else {
        await register(name.trim(), email.trim(), password, {
          // The real value of the checkbox, so the server records a true
          // answer. The guard above means it is always true by this point.
          acceptTerms: acceptedTerms,
          ...(isDealer ? { role: 'dealer', businessName: businessName.trim(), city: city.trim() } : {}),
        })
        navigate(isDealer ? '/dashboard' : '/profile')
      }
    } catch (err) {
      // A TypeError from fetch means the server could not be reached at all.
      setError(
        err instanceof TypeError ? "Couldn't reach the server. Check your connection and try again." : err.message
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="lg:grid lg:grid-cols-2 lg:min-h-[720px]">
      {/* Brand panel — desktop only */}
      <aside
        className="hidden lg:flex flex-col justify-between p-12 text-white"
        style={{ background: brandBackground }}
      >
        <BrandMark />

        <div>
          <h2 className="font-display font-bold text-[40px] leading-[1.1] max-w-md">
            Buy and sell bikes you can trust.
          </h2>
          <p className="text-white/70 mt-3 max-w-md">A marketplace for used motorcycles and scooters in Nepal.</p>

          <ul className="mt-8 flex flex-col gap-5 max-w-md">
            {perks.map((perk) => (
              <li key={perk.title} className="flex gap-3.5">
                <span className="shrink-0 w-10 h-10 rounded-full bg-white/10 ring-1 ring-white/15 flex items-center justify-center">
                  <Icon name={perk.icon} size={18} />
                </span>
                <span>
                  <span className="block font-semibold">{perk.title}</span>
                  <span className="block text-sm text-white/65 mt-0.5">{perk.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative h-[190px] rounded-card bg-white/10 ring-1 ring-white/15 overflow-hidden">
          <VehicleArt type="motorcycle" color="blue" />
        </div>
      </aside>

      <section className="flex flex-col">
        {/* Slim brand banner — phones and tablets */}
        <div className="lg:hidden px-5 py-4 text-white" style={{ background: brandBackground }}>
          <BrandMark />
          <p className="text-sm text-white/70 mt-2">Buy and sell bikes you can trust.</p>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-10">
          <div className="w-full max-w-[440px]">
            <h1 className="font-display font-bold text-[30px] leading-tight">
              {isRegister ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-textmuted mt-1.5">
              {isRegister ? 'It takes less than a minute.' : 'Log in to see your offers, favorites and listings.'}
            </p>

            {/* Log in / Register switch */}
            <div role="tablist" aria-label="Log in or create an account" className="flex gap-1 bg-sunken rounded-btn p-1 mt-6">
              <button
                type="button"
                role="tab"
                aria-selected={!isRegister}
                onClick={() => switchMode('login')}
                className={`flex-1 rounded-[8px] py-2 text-sm font-semibold transition ${
                  !isRegister ? 'bg-white text-ink shadow-card' : 'text-textmuted hover:text-ink'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={isRegister}
                onClick={() => switchMode('register')}
                className={`flex-1 rounded-[8px] py-2 text-sm font-semibold transition ${
                  isRegister ? 'bg-white text-ink shadow-card' : 'text-textmuted hover:text-ink'
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
              {isRegister && (
                <Field
                  id="auth-name"
                  label="Name"
                  icon="user"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  required
                />
              )}

              <Field
                id="auth-email"
                label="Email"
                icon="mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />

              <Field
                id="auth-password"
                label="Password"
                icon="lock"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isRegister ? 'At least 6 characters' : 'Your password'}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                minLength={isRegister ? 6 : undefined}
                required
                hint={isRegister ? 'Use at least 6 characters.' : undefined}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-textfaint hover:text-ink"
                  >
                    <Icon name={showPassword ? 'eyeoff' : 'eye'} />
                  </button>
                }
              />

              {isRegister && (
                <>
                  <label
                    className={`flex items-start gap-3 rounded-cardsm border p-3.5 cursor-pointer transition ${
                      isDealer ? 'border-accent bg-accentsoftbg' : 'border-bordercol hover:border-borderstrong'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isDealer}
                      onChange={(e) => setIsDealer(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-accent"
                    />
                    <span>
                      <span className="block text-sm font-semibold">I'm a dealer or business seller</span>
                      <span className="block text-xs text-textmuted mt-0.5">
                        Get a dealer profile. Free accounts can list up to 5 bikes.
                      </span>
                    </span>
                  </label>

                  {isDealer && (
                    <div className="flex flex-col gap-4 bg-sunken/60 rounded-cardsm p-3.5">
                      <Field
                        id="auth-business"
                        label="Business name"
                        icon="store"
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Rahul Motors"
                        autoComplete="organization"
                        required
                      />
                      <Field
                        id="auth-city"
                        label="City"
                        icon="pin"
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Kathmandu"
                        autoComplete="address-level2"
                        required
                      />
                    </div>
                  )}
                </>
              )}

              {/* The agreement box. The links open in a new tab so a
                  half-filled form is not lost. We check it in
                  handleSubmit instead of using the HTML `required`
                  attribute, so the message uses our own error style. */}
              {isRegister && (
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-accent shrink-0"
                  />
                  <span className="text-sm text-textmuted">
                    I agree to the{' '}
                    <Link
                      to="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-accent hover:underline"
                    >
                      Terms of Use
                    </Link>{' '}
                    and{' '}
                    <Link
                      to="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-accent hover:underline"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
              )}

              {error && (
                <p role="alert" className="text-sm text-danger bg-dangerbg rounded-ctl px-3 py-2.5">
                  {error}
                </p>
              )}

              <Button type="submit" size="lg" fullWidth loading={submitting} className="mt-1">
                {submitting ? 'Please wait...' : isRegister ? 'Create Account' : 'Log In'}
              </Button>
            </form>

            <p className="text-sm text-textmuted text-center mt-6">
              {isRegister ? 'Already have an account? ' : 'New to Bike Bazar? '}
              <button
                type="button"
                onClick={() => switchMode(isRegister ? 'login' : 'register')}
                className="font-semibold text-accent hover:underline"
              >
                {isRegister ? 'Log in' : 'Create an account'}
              </button>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Login