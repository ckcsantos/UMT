import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { api } from '../services/api'
import { useCampaign } from '../contexts/CampaignContext'

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([])
  const { resetDraft } = useCampaign()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.getCampaigns()
      .then(d => setCampaigns(d.campaigns))
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <Layout>
      <div className="page-shell">
        <section className="hero">
          <div className="hero-header">
            <h1>Campaigns</h1>
            <button className="primary-btn" onClick={() => { resetDraft(); navigate('/campaign-creation') }}>+ New Campaign</button>
          </div>
        </section>

        {isLoading && <div className="fetch-state">Loading campaigns…</div>}
        {error && <div className="fetch-state fetch-error">Failed to load campaigns: {error}</div>}

        {!isLoading && !error && (
          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Campaign Name</th>
                  <th>Type</th>
                  <th>Invites for the Day</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '32px 0' }}>
                      No campaigns yet.
                    </td>
                  </tr>
                ) : campaigns.map(c => (
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
                        {c.status === 'active' ? '● Active' : c.status === 'draft' ? '◐ For Review' : '○ Inactive'}
                      </span>
                    </td>
                    <td>
                      <Link to="/campaign-creation" className="row-edit-btn">Edit</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}
