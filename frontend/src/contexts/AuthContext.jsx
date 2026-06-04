import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'

const AuthContext = createContext(null)
const SESSION_KEY = 'umt_auth'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined) // undefined = loading

  useEffect(() => {
    // Check sessionStorage first so page reloads don't log the user out
    const saved = sessionStorage.getItem(SESSION_KEY)
    if (saved) {
      setUser(JSON.parse(saved))
      return
    }
    api.me()
      .then(data => {
        const u = data.authenticated ? data : null
        if (u) sessionStorage.setItem(SESSION_KEY, JSON.stringify(u))
        setUser(u)
      })
      .catch(() => setUser(null))
  }, [])

  async function login(email, password) {
    const data = await api.login(email, password)
    if (data.ok) {
      const u = { authenticated: true, email: data.email }
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(u))
      setUser(u)
      return { ok: true }
    }
    return { ok: false, error: data.error || 'Invalid credentials' }
  }

  async function logout() {
    await api.logout()
    sessionStorage.removeItem(SESSION_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
