import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  // On the very first load, check if a previous login was saved in
  // localStorage. This is what makes a login "survive" a page refresh.
  useEffect(() => {
    const savedUser = localStorage.getItem('bikebazar_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  async function login(email, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Login failed')
    }
    // localStorage can only store TEXT, never a real JavaScript object
    // directly — JSON.stringify turns the user object into text first.
    localStorage.setItem('bikebazar_user', JSON.stringify(data.user))
    localStorage.setItem('bikebazar_token', data.token)
    setUser(data.user)
  }

 async function register(name, email, password, dealerInfo = {}) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, ...dealerInfo }),
  })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed')
    }
    localStorage.setItem('bikebazar_user', JSON.stringify(data.user))
    localStorage.setItem('bikebazar_token', data.token)
    setUser(data.user)
  }

  function logout() {
    localStorage.removeItem('bikebazar_user')
    localStorage.removeItem('bikebazar_token')
    setUser(null)
  }
  function updateUser(updates) {
  const newUser = { ...user, ...updates }
  localStorage.setItem('bikebazar_user', JSON.stringify(newUser))
  setUser(newUser)
}

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}