import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Login() {
  const [mode, setMode] = useState('login') // 'login' or 'register'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { login, register } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(name, email, password)
      }
      navigate('/profile')
    } catch (err) {
      // err.message is exactly the string AuthContext's throw new
      // Error(...) set it to — e.g. "Invalid email or password" or
      // "An account with this email already exists" — straight from
      // our backend's actual response.
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-[420px] mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-display font-bold text-[26px]">
        {mode === 'login' ? 'Log In' : 'Create an Account'}
      </h1>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => { setMode('login'); setError('') }}
          className={`text-sm font-semibold px-4 py-2 rounded-full border ${
            mode === 'login' ? 'bg-ink text-white border-ink' : 'border-bordercol text-textmuted'
          }`}
        >
          Log In
        </button>
        <button
          onClick={() => { setMode('register'); setError('') }}
          className={`text-sm font-semibold px-4 py-2 rounded-full border ${
            mode === 'register' ? 'bg-ink text-white border-ink' : 'border-bordercol text-textmuted'
          }`}
        >
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
        {/* Name field only exists in the JSX at all when mode is
            'register' — conditional rendering, same {condition && ...}
            pattern from VehicleCard's Featured badge. */}
        {mode === 'register' && (
          <div>
            <label className="text-sm font-semibold block mb-1.5">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-bordercol rounded-ctl px-3 py-2 text-sm"
              placeholder="Your name"
            />
          </div>
        )}

        <div>
          <label className="text-sm font-semibold block mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-bordercol rounded-ctl px-3 py-2 text-sm"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="text-sm font-semibold block mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-bordercol rounded-ctl px-3 py-2 text-sm"
            placeholder="At least 6 characters"
          />
        </div>

        {error && (
          <p className="text-sm text-danger bg-dangerbg rounded-ctl px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="bg-accent hover:bg-accenthover transition text-white font-semibold text-sm rounded-btn px-5 py-3 mt-2 disabled:opacity-50"
        >
          {submitting ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}
        </button>
      </form>
    </div>
  )
}

export default Login