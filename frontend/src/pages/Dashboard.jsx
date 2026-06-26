import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { api } from '../services/api'
import { useCampaign } from '../contexts/CampaignContext'


function IconCampaigns() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M4 6h16M4 12h16M4 18h7"/>
    </svg>
  )
}

function IconActive() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  )
}

function IconDraft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}

function IconAudience() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}

export default function Dashboard() {
  const { resetDraft } = useCampaign()
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState([])
  const [tab, setTab] = useState('all')
  const [lastRefreshed, setLastRefreshed] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setIsLoading(true)
    api.getCampaigns()
      .then(d => {
        setCampaigns(d.campaigns)
        setLastRefreshed(new Date())
      })
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [])

  const filtered = tab === 'all' ? campaigns : campaigns.filter(c => c.status === tab)

  const total = campaigns.length
  const activeCount = campaigns.filter(c => c.status === 'active').length
  const draftCount = campaigns.filter(c => c.status === 'draft').length
  const inactiveCount = campaigns.filter(c => c.status === 'inactive').length
  const activePct = total ? Math.round((activeCount / total) * 100) : 0
  const totalAudience = campaigns.reduce((s, c) => s + (c.audience || 0), 0)

  const tabCounts = { active: activeCount, inactive: inactiveCount, draft: draftCount }


  const timeStr = lastRefreshed
    ? lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <Layout>
      <div className="page-shell">
        <section className="hero">
          <div className="hero-header">
            <div>
              <h1>Dashboard</h1>
              {timeStr && (
                <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: 4 }}>
                  Last refreshed at {timeStr}
                </p>
              )}
            </div>
            <button className="primary-btn" onClick={() => { resetDraft(); navigate('/campaign-creation') }}>+ New Campaign</button>
          </div>
        </section>

        {isLoading && <div className="fetch-state">Loading campaigns…</div>}
        {error && <div className="fetch-state fetch-error">Failed to load campaigns: {error}</div>}

        {/* Metric cards */}
        <div className="cards-row">
          <div className="card stat-card">
            <div className="stat-icon stat-icon-teal"><IconCampaigns /></div>
            <div className="card-label">Total Campaigns</div>
            <div className="card-value">{total}</div>
          </div>
          <div className="card stat-card">
            <div className="stat-icon stat-icon-green"><IconActive /></div>
            <div className="card-label">Active</div>
            <div className="card-value">{activeCount}</div>
            <div className="card-sub">{activePct}% of total</div>
          </div>
          <div className="card stat-card">
            <div className="stat-icon stat-icon-yellow"><IconDraft /></div>
            <div className="card-label">For Review</div>
            <div className="card-value">{draftCount}</div>
            <div className="card-sub">Pending setup</div>
          </div>
        </div>

        {/* Status breakdown bar */}
        {total > 0 && (
          <div className="panel status-breakdown-panel">
            <div className="status-breakdown-header">
              <span className="status-breakdown-title">Campaign Status Breakdown</span>
              <div className="status-breakdown-legend">
                <span className="legend-item">
                  <span className="legend-dot" style={{ background: '#22c55e' }} />
                  Active ({activeCount})
                </span>
                <span className="legend-item">
                  <span className="legend-dot" style={{ background: '#cbd5e1' }} />
                  Inactive ({inactiveCount})
                </span>
                <span className="legend-item">
                  <span className="legend-dot" style={{ background: '#fbbf24' }} />
                  For Review ({draftCount})
                </span>
              </div>
            </div>
            <div className="status-bar">
              {activeCount > 0 && <div className="status-bar-seg seg-active" style={{ flex: activeCount }} />}
              {inactiveCount > 0 && <div className="status-bar-seg seg-inactive" style={{ flex: inactiveCount }} />}
              {draftCount > 0 && <div className="status-bar-seg seg-draft" style={{ flex: draftCount }} />}
            </div>
          </div>
        )}


        {/* Campaign table */}
        <div className="panel">
          <div className="table-toolbar">
            <div className="tab-switch">
              {['all', 'active', 'inactive', 'draft'].map(t => (
                <button
                  key={t}
                  className={`tab-btn ${tab === t ? 'active' : ''}`}
                  onClick={() => setTab(t)}
                >
                  {t === 'draft' ? 'For Review' : t.charAt(0).toUpperCase() + t.slice(1)}
                  {t !== 'all' && (
                    <span className={`tab-count ${tab === t ? 'tab-count-active' : ''}`}>
                      {tabCounts[t]}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <span className="table-meta">{filtered.length} campaign{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <div className="empty-title">
                No {tab === 'all' ? '' : tab} campaigns
              </div>
              <div className="empty-sub">
                {tab === 'all'
                  ? 'Create your first campaign to get started.'
                  : `No campaigns with "${tab === 'draft' ? 'for review' : tab}" status found.`}
              </div>
            </div>
          ) : (
            <div className="table-card">
              <table>
                <thead>
                  <tr>
                    <th>Campaign Name</th>
                    <th>Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id} className="table-row-link" onClick={() => navigate(`/campaigns/${c.id}`)}>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td><span className="type-pill">{c.type}</span></td>
                      <td>
                        <span className={`status-pill ${c.status}`}>
                          {c.status === 'active' ? '● Active' : c.status === 'draft' ? '◐ For Review' : '○ Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
