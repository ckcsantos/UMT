// Hardcoded data — no backend required. Replace with real API calls when migrating.

const HARDCODED_USER = { authenticated: true, email: 'admin@globe.com.ph' }

const HARDCODED_CAMPAIGNS = [
  { id: 1, name: 'GlobeOne Summer Blast',        type: 'Blast',           status: 'active',   audience: 142500 },
  { id: 2, name: 'TM Top-up Promo Q2',            type: 'Top-up & Get',    status: 'active',   audience: 98000  },
  { id: 3, name: 'Postpaid Register & Get',       type: 'Register & Get',  status: 'draft',    audience: 55000  },
  { id: 4, name: 'Globe at Home Spend Rewards',   type: 'Spend & Get',     status: 'active',   audience: 210000 },
  { id: 5, name: 'Prepaid Pull KW Campaign',      type: 'Pull KW',         status: 'inactive', audience: 33000  },
  { id: 6, name: 'Retention Mid-Value Push',      type: 'Blast',           status: 'draft',    audience: 76500  },
]

function delay(ms = 120) {
  return new Promise(r => setTimeout(r, ms))
}

export const api = {
  // Auth
  me: async () => {
    await delay()
    return HARDCODED_USER
  },

  login: async (email, password) => {
    await delay()
    const valid =
      (email === 'admin@globe.com.ph' && password === 'admin') ||
      (email === 'admin' && password === 'admin')
    if (!valid) {
      const err = new Error('Invalid credentials')
      err.status = 401
      throw err
    }
    return { ok: true, email }
  },

  logout: async () => {
    await delay()
    return {}
  },

  // Campaigns
  getCampaigns: async () => {
    await delay()
    return { campaigns: HARDCODED_CAMPAIGNS }
  },

  getCampaign: async (id) => {
    await delay()
    return HARDCODED_CAMPAIGNS.find(c => c.id === id) ?? null
  },

  createCampaign: async (_data) => {
    await delay(300)
    return { ok: true }
  },

  updateCampaign: async (_id, _data) => {
    await delay()
    return { ok: true }
  },

  // Audience — formula: brands × 15000 + filters × 3000
  estimateAudience: async ({ brands = [], groups = [] }) => {
    await delay(400)
    const filterCount = groups.reduce((s, g) => s + g.filters.length, 0)
    const count = brands.length * 15000 + filterCount * 3000
    return { count }
  },
}
