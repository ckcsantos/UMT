import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined) // undefined = loading

  useEffect(() => {
    api.me()
      .then(data => setUser(data.authenticated ? data : null))
      .catch(() => setUser(null))
  }, [])

  async function login(email, password) {
    const data = await api.login(email, password)
    if (data.ok) {
      setUser({ authenticated: true, email: data.email })
      return { ok: true }
    }
    return { ok: false, error: data.error || 'Invalid credentials' }
  }

  async function logout() {
    await api.logout()
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
