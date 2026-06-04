const BASE = import.meta.env.VITE_API_URL ?? ''

export function apiFetch(path, options = {}) {
  const token = localStorage.getItem('umt_token')
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return fetch(`${BASE}${path}`, { ...options, headers })
}
