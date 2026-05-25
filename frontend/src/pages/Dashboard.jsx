import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'

export default function Dashboard() {
  const [campaigns, setCampaigns] = useState([])
  const [tab, setTab] = useState('all')

  useEffect(() => {
    fetch('/api/campaigns').then(r => r.json()).then(d => setCampaigns(d.campaigns))
  }, [])

  const filtered = tab === 'all' ? campaigns : campaigns.filter(c => c.status === tab)

  const total = campaigns.length
  const activeCount = campaigns.filter(c => c.status === 'active').length
  const activePct = total ? Math.round((activeCount / total) * 100) : 0
  const totalAudience = campaigns.reduce((s, c) => s + (c.audience || 0), 0)

  function toggleStatus(id) {
    setCampaigns(prev => prev.map(c =>
      c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c
    ))
  }

  return (
    <Layout>
      <div className="page-shell">
        <section className="hero">
          <div className="hero-header">
            <h1>Dashboard</h1>
            <Link to="/campaign-creation" className="primary-btn">+ New Campaign</Link>
          </div>
        </section>

        <div className="cards-row">
          <div className="card">
            <div className="card-label">Total Campaigns</div>
            <div className="card-value">{total}</div>
          </div>
          <div className="card">
            <div className="card-label">Active</div>
            <div className="card-value">{activeCount}</div>
            <div className="card-sub">{activePct}% of total</div>
          </div>
          <div className="card">
            <div className="card-label">Total Audience</div>
            <div className="card-value">{totalAudience.toLocaleString()}</div>
          </div>
        </div>

        <div className="panel">
          <div className="tab-switch">
            {['all', 'active', 'inactive', 'draft'].map(t => (
              <button
                key={t}
                className={`tab-btn ${tab === t ? 'active' : ''}`}
                onClick={() => setTab(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Campaign Name</th>
                  <th>Type</th>
                  <th>Audience</th>
                  <th>Status</th>
                  <th>Active</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{c.name}</td>
                    <td><span className="type-pill">{c.type}</span></td>
                    <td>{c.audience?.toLocaleString()}</td>
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
        </div>
      </div>
    </Layout>
  )
}
