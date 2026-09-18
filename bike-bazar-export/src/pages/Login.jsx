import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Login() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    if (!name || !email) return
    login(name, email)
    navigate('/profile')
  }

  return (
    <div className="max-w-[420px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-display font-bold text-[26px]">Log In</h1>
      <p className="text-textmuted text-sm mt-1">
        This is a mock login for the prototype — no real password or account is created.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
        <div>
          <label className="text-sm font-semibold block mb-1.5">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-bordercol rounded-ctl px-3 py-2 text-sm"
            placeholder="Your name"
          />
        </div>
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
        <button
          type="submit"
          className="bg-accent hover:bg-accenthover transition text-white font-semibold text-sm rounded-btn px-5 py-3 mt-2"
        >
          Log In
        </button>
      </form>
    </div>
  )
}

export default Login