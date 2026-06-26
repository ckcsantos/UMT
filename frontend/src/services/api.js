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

let pendingId = 200
const CAMPAIGN_DETAILS = {} // id → full draft data (populated on approve)

// ── User Management ──────────────────────────────────────────────────────────
let userIdSeq = 10
const IAM_USERS = [
  { userId: '1', username: 'admin',      email: 'admin@globe.com.ph',     firstName: 'System',   lastName: 'Administrator', role: 'Administrator',        status: 'Active',   lastLogin: '2026-06-26T08:30:00', createdDate: '2026-01-01T00:00:00', forcePasswordChange: false, failedLoginCount: 0 },
  { userId: '2', username: 'jdelacruz', email: 'jdelacruz@globe.com.ph', firstName: 'Juan',     lastName: 'Dela Cruz',     role: 'Campaign Planner',     status: 'Active',   lastLogin: '2026-06-25T09:14:00', createdDate: '2026-03-10T00:00:00', forcePasswordChange: false, failedLoginCount: 0 },
  { userId: '3', username: 'mreyes',    email: 'mreyes@globe.com.ph',    firstName: 'Maria',    lastName: 'Reyes',         role: 'Campaign Planner',     status: 'Active',   lastLogin: '2026-06-24T14:22:00', createdDate: '2026-03-10T00:00:00', forcePasswordChange: false, failedLoginCount: 0 },
  { userId: '4', username: 'lbenito',   email: 'lbenito@globe.com.ph',   firstName: 'Lorlynn',  lastName: 'Benito',        role: 'BA / Solution Designer', status: 'Active', lastLogin: '2026-06-23T11:05:00', createdDate: '2026-03-15T00:00:00', forcePasswordChange: false, failedLoginCount: 0 },
  { userId: '5', username: 'fvtops',    email: 'fvtops@globe.com.ph',    firstName: 'FVT',      lastName: 'Operations',    role: 'DevOps',               status: 'Active',   lastLogin: '2026-06-22T07:50:00', createdDate: '2026-02-01T00:00:00', forcePasswordChange: false, failedLoginCount: 0 },
  { userId: '6', username: 'rcruz',     email: 'rcruz@globe.com.ph',     firstName: 'Roberto',  lastName: 'Cruz',          role: 'Developer',            status: 'Disabled', lastLogin: '2026-05-10T16:30:00', createdDate: '2026-02-20T00:00:00', forcePasswordChange: false, failedLoginCount: 0 },
  { userId: '7', username: 'asantiago', email: 'asantiago@globe.com.ph', firstName: 'Ana',      lastName: 'Santiago',      role: 'Campaign Planner',     status: 'Locked',   lastLogin: '2026-06-20T10:00:00', createdDate: '2026-04-01T00:00:00', forcePasswordChange: false, failedLoginCount: 5 },
]
let PENDING_CAMPAIGNS = [
  {
    id: 101,
    name: 'Globe Prepaid Welcome Offer',
    details: { name: 'Globe Prepaid Welcome Offer', type: 'Register & Get', squad: 'Core Growth', description: 'Onboarding offer for new prepaid subscribers.' },
    audience: { brands: ['Globe Prepaid'], estimatedCount: 45000, groups: [{ filters: [{ field: 'Status', operator: 'equals', value: 'Active' }] }] },
    message: { messageType: 'Invite', channel: 'SMS', body: 'Hi [First Name]! You\'re invited to join Globe Prepaid Welcome Offer. Get exclusive rewards when you sign up today. Reply STOP to opt out.' },
    schedule: { frequency: 'One Time', date: '2026-06-30', time: '09:00' },
    submittedAt: '2026-06-22T10:15:00',
    submittedBy: 'jdelacruz@globe.com.ph',
  },
  {
    id: 102,
    name: 'TM Mid-Value Retention Drive',
    details: { name: 'TM Mid-Value Retention Drive', type: 'Spend & Get', squad: 'Retention', description: '' },
    audience: { brands: ['TM'], estimatedCount: 72000, groups: [{ filters: [{ field: 'Value Segment', operator: 'equals', value: 'Mid Value' }] }] },
    message: { messageType: 'Promotional', channel: 'SMS', body: '[First Name], don\'t miss out! TM Mid-Value Retention Drive is live now. Enjoy special offers just for you. Valid until [End Date]. T&Cs apply.' },
    schedule: { frequency: 'Weekly', date: '2026-07-01', time: '10:00' },
    submittedAt: '2026-06-23T08:30:00',
    submittedBy: 'mreyes@globe.com.ph',
  },
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
    if (!valid) return { ok: false, error: 'Invalid credentials' }
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
    const numId = Number(id)
    const base = HARDCODED_CAMPAIGNS.find(c => c.id === numId) ?? null
    if (!base) return null
    return { ...base, ...(CAMPAIGN_DETAILS[numId] || {}) }
  },

  createCampaign: async (data) => {
    await delay(300)
    const campaign = {
      id: pendingId++,
      name: data.details?.name || 'Unnamed Campaign',
      details: data.details || {},
      audience: data.audience || {},
      message: data.message || {},
      schedule: data.schedule || {},
      submittedAt: new Date().toISOString(),
      submittedBy: 'admin@globe.com.ph',
    }
    PENDING_CAMPAIGNS.push(campaign)
    return { ok: true, id: campaign.id }
  },

  updateCampaign: async (_id, _data) => {
    await delay()
    return { ok: true }
  },

  getPendingCampaigns: async () => {
    await delay(120)
    return { campaigns: [...PENDING_CAMPAIGNS] }
  },

  approveCampaign: async (id) => {
    await delay(200)
    const idx = PENDING_CAMPAIGNS.findIndex(c => c.id === id)
    if (idx !== -1) {
      const [c] = PENDING_CAMPAIGNS.splice(idx, 1)
      HARDCODED_CAMPAIGNS.push({ id: c.id, name: c.name, type: c.details?.type || '—', status: 'active', audience: c.audience?.estimatedCount || null })
      CAMPAIGN_DETAILS[c.id] = { details: c.details, audience: c.audience, message: c.message, schedule: c.schedule, submittedAt: c.submittedAt, submittedBy: c.submittedBy }
    }
    return { ok: true }
  },

  rejectCampaign: async (id) => {
    await delay(200)
    PENDING_CAMPAIGNS = PENDING_CAMPAIGNS.filter(c => c.id !== id)
    return { ok: true }
  },

  // Users
  getUsers: async () => {
    await delay()
    return { users: [...IAM_USERS] }
  },

  createUser: async (data) => {
    await delay(300)
    const user = {
      userId: String(userIdSeq++),
      username: data.username,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      status: 'Active',
      lastLogin: null,
      createdDate: new Date().toISOString(),
      forcePasswordChange: true,
      failedLoginCount: 0,
    }
    IAM_USERS.push(user)
    return { ok: true, userId: user.userId }
  },

  updateUser: async (userId, data) => {
    await delay(200)
    const idx = IAM_USERS.findIndex(u => u.userId === userId)
    if (idx !== -1) Object.assign(IAM_USERS[idx], data)
    return { ok: true }
  },

  disableUser: async (userId) => {
    await delay(200)
    const u = IAM_USERS.find(u => u.userId === userId)
    if (u) u.status = 'Disabled'
    return { ok: true }
  },

  enableUser: async (userId) => {
    await delay(200)
    const u = IAM_USERS.find(u => u.userId === userId)
    if (u) { u.status = 'Active'; u.failedLoginCount = 0 }
    return { ok: true }
  },

  resetPassword: async (userId) => {
    await delay(200)
    const u = IAM_USERS.find(u => u.userId === userId)
    if (u) u.forcePasswordChange = true
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
