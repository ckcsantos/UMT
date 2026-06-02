import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { api } from '../services/api'

const ACTIVITY = [
  {
    id: 1,
    title: 'Campaign 1 — Educational',
    tag: 'SMS',
    tagColor: 'activity-tag-sms',
    dot: '#22c55e',
    desc: 'Successfully sent 60,000 messages with 94.2% delivery rate.',
    time: '2 hours ago',
  },
  {
    id: 2,
    title: 'Campaign 5 — Growth',
    tag: 'SMS',
    tagColor: 'activity-tag-sms',
    dot: '#22c55e',
    desc: 'Audience target reached — 72,000 invites dispatched.',
    time: '5 hours ago',
  },
  {
    id: 3,
    title: 'Campaign Performance Alert',
    tag: 'Warning',
    tagColor: 'activity-tag-warning',
    dot: '#f59e0b',
    desc: 'Campaign 4 — Retention showing lower than expected delivery rates.',
    time: '6 hours ago',
  },
  {
    id: 4,
    title: 'Campaign 3 — Follow-up',
    tag: 'SMS',
    tagColor: 'activity-tag-sms',
    dot: '#22c55e',
    desc: 'Follow-up blast completed. 45,000 messages sent with 97.1% success rate.',
    time: '1 day ago',
  },
  {
    id: 5,
    title: 'System Health Check',
    tag: 'Success',
    tagColor: 'activity-tag-success',
    dot: '#3b82f6',
    desc: 'All services operational with 99.9% uptime this week.',
    time: '2 days ago',
  },
]

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

  function toggleStatus(id) {
    setCampaigns(prev => prev.map(c =>
      c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c
    ))
  }

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
            <Link to="/campaign-creation" className="primary-btn">+ New Campaign</Link>
          </div>
        </section>

        {isLoading && <div className="fetch-state">Loading campaigns…</div>}
        {error && <div className="fetch-state fetch-error">Failed to load campaigns: {error}</div>}

        {/* Metric cards */}
        <div className="cards-row four-col">
          <div className="card stat-card">
            <div className="stat-icon stat-icon-blue"><IconCampaigns /></div>
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
            <div className="card-label">Drafts</div>
            <div className="card-value">{draftCount}</div>
            <div className="card-sub">Pending setup</div>
          </div>
          <div className="card stat-card">
            <div className="stat-icon stat-icon-purple"><IconAudience /></div>
            <div className="card-label">Total Invites for the Day</div>
            <div className="card-value">{totalAudience.toLocaleString()}</div>
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
                  Draft ({draftCount})
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

        {/* Recent Activity */}
        <div className="panel">
          <h2 className="section-title">Recent Activity</h2>
          <p className="section-sub">Overview of campaign performance and activity.</p>
          <div className="activity-list">
            {ACTIVITY.map((a, i) => (
              <div key={a.id} className={`activity-item ${i < ACTIVITY.length - 1 ? 'activity-item-border' : ''}`}>
                <div className="activity-dot" style={{ background: a.dot }} />
                <div className="activity-body">
                  <div className="activity-header">
                    <span className="activity-title">{a.title}</span>
                    <span className={`activity-tag ${a.tagColor}`}>{a.tag}</span>
                  </div>
                  <div className="activity-desc">{a.desc}</div>
                  <div className="activity-time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

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
                  {t.charAt(0).toUpperCase() + t.slice(1)}
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
                  : `No campaigns with "${tab}" status found.`}
              </div>
            </div>
          ) : (
            <div className="table-card">
              <table>
                <thead>
                  <tr>
                    <th>Campaign Name</th>
                    <th>Type</th>
                    <th>Invites for the Day</th>
                    <th>Status</th>
                    <th>Enable</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>{c.name}</td>
                      <td><span className="type-pill">{c.type}</span></td>
                      <td>
                        {c.audience
                          ? c.audience.toLocaleString()
                          : <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>—</span>}
                      </td>
                      <td>
                        <span className={`status-pill ${c.status}`}>
                          {c.status === 'active' ? '● Active' : c.status === 'draft' ? '◐ Draft' : '○ Inactive'}
                        </span>
                      </td>
                      <td>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={c.status === 'active'}
                            onChange={() => toggleStatus(c.id)}
                          />
                          <span className="toggle-track" />
                        </label>
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
