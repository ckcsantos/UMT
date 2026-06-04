import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await login(email, password)
    if (result.ok) {
      navigate('/dashboard', { replace: true })
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-bg-logo" aria-hidden="true">ARROW</div>
      <div className="login-bg-x" aria-hidden="true">X</div>
      <div className="login-box">
        <div className="login-brand">ARROW<sup className="logo-sup">X</sup></div>
        <div className="login-sub">Campaign Studio</div>

        {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div>
            <label>Username</label>
            <input
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your Username"
              required
              autoFocus
            />
          </div>
          <div>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
