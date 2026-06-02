const BASE = import.meta.env.VITE_API_URL ?? ''

async function request(method, path, body) {
  const opts = { method, headers: {} }
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(body)
  }
  const res = await fetch(`${BASE}${path}`, opts)
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}))
    const err = new Error(payload.error || `${method} ${path} → ${res.status}`)
    err.status = res.status
    throw err
  }
  return res.json()
}

export const api = {
  // Auth
  me:     ()               => request('GET',   '/api/me'),
  login:  (email, password)=> request('POST',  '/api/login',  { email, password }),
  logout: ()               => request('POST',  '/api/logout'),

  // Campaigns
  getCampaigns:   ()        => request('GET',   '/api/campaigns'),
  getCampaign:    (id)      => request('GET',   `/api/campaigns/${id}`),
  createCampaign: (data)    => request('POST',  '/api/campaigns', data),
  updateCampaign: (id, data)=> request('PATCH', `/api/campaigns/${id}`, data),

  // Audience
  estimateAudience: (payload) => request('POST', '/api/audience/estimate', payload),
}
