import { http, HttpResponse } from 'msw'

const CREDENTIALS = { admin: 'admin', 'admin@globe.com.ph': 'admin' }

let campaigns = [
  { id: 1, name: 'Campaign 1 — Educational', type: 'Blast', status: 'active',   audience: 60000 },
  { id: 2, name: 'Campaign 2 — Informative', type: 'Blast', status: 'draft',    audience: null  },
  { id: 3, name: 'Campaign 3 — Follow-up',   type: 'Blast', status: 'active',   audience: 45000 },
  { id: 4, name: 'Campaign 4 — Retention',   type: 'Blast', status: 'inactive', audience: 48000 },
  { id: 5, name: 'Campaign 5 — Growth',      type: 'Blast', status: 'active',   audience: 72000 },
  { id: 6, name: 'Campaign 6 — Planning',    type: 'Blast', status: 'draft',    audience: null  },
]

let nextId = 7

// Auth state — kept only for login/logout/me flow.
// Data endpoints do NOT gate on this so HMR reloads don't cause 401s.
let sessionUser = null

export const handlers = [
  // Auth
  http.get('/api/me', () => {
    if (sessionUser) return HttpResponse.json({ authenticated: true, email: sessionUser })
    return HttpResponse.json({ authenticated: false })
  }),

  http.post('/api/login', async ({ request }) => {
    const { email, password } = await request.json()
    if (CREDENTIALS[email] === password) {
      sessionUser = email
      return HttpResponse.json({ ok: true, email })
    }
    return HttpResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 })
  }),

  http.post('/api/logout', () => {
    sessionUser = null
    return HttpResponse.json({ ok: true })
  }),

  // Campaigns — no auth gate (MSW resets on HMR, AuthContext persists via sessionStorage)
  http.get('/api/campaigns', () => {
    return HttpResponse.json({ campaigns })
  }),

  http.get('/api/campaigns/:id', ({ params }) => {
    const campaign = campaigns.find(c => c.id === Number(params.id))
    if (!campaign) return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    return HttpResponse.json({ campaign })
  }),

  http.post('/api/campaigns', async ({ request }) => {
    const body = await request.json()
    const newCampaign = {
      id: nextId++,
      name: body.details?.name ?? 'Untitled Campaign',
      type: body.details?.type ?? 'Blast',
      status: 'active',
      audience: body.audience?.estimatedCount ?? null,
    }
    campaigns = [...campaigns, newCampaign]
    return HttpResponse.json({ ok: true, id: newCampaign.id, status: 'queued' }, { status: 201 })
  }),

  http.patch('/api/campaigns/:id', async ({ params, request }) => {
    const updates = await request.json()
    campaigns = campaigns.map(c => c.id === Number(params.id) ? { ...c, ...updates } : c)
    return HttpResponse.json({ ok: true })
  }),

  // Audience estimate
  http.post('/api/audience/estimate', async ({ request }) => {
    const { brands = [], groups = [] } = await request.json()
    const count = brands.length * 15000 + groups.reduce((s, g) => s + g.filters.length * 3000, 0)
    return HttpResponse.json({ count })
  }),
]
