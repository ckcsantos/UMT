import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([])

  useEffect(() => {
    fetch('/api/campaigns').then(r => r.json()).then(d => setCampaigns(d.campaigns))
  }, [])

  return (
    <Layout>
      <div className="page-shell">
        <section className="hero">
          <div className="hero-header">
            <h1>Campaigns</h1>
            <Link to="/campaign-creation" className="primary-btn">+ New Campaign</Link>
          </div>
        </section>

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Campaign Name</th>
                <th>Type</th>
                <th>Audience</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => (
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
                    <Link to="/campaign-creation" className="row-edit-btn">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
