import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { api } from '../services/api'

function StatCard({ label, value, sub }) {
  return (
    <div className="cd-stat-card">
      <div className="cd-stat-value">{value}</div>
      <div className="cd-stat-label">{label}</div>
      {sub && <div className="cd-stat-sub">{sub}</div>}
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="review-item">
      <div className="review-label">{label}</div>
      <div className="review-value">{value || '—'}</div>
    </div>
  )
}

const STATUS_LABELS = { active: '● Active', draft: '◐ For Review', inactive: '○ Inactive' }

export default function CampaignDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.getCampaign(id)
      .then(data => {
        if (!data) setError('Campaign not found.')
        else setCampaign(data)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Layout><div className="page-shell"><div className="fetch-state">Loading…</div></div></Layout>
  if (error)   return <Layout><div className="page-shell"><div className="fetch-state fetch-error">{error}</div></div></Layout>

  const { name, type, status, audience, details, message, schedule, submittedBy, submittedAt } = campaign

  const hasFullDetail = !!details

  return (
    <Layout>
      <div className="page-shell">
        <section className="hero">
          <div className="hero-header">
            <div>
              <div className="cd-breadcrumb">
                <Link to="/campaigns" className="cd-breadcrumb-link">Campaigns</Link>
                <span className="cd-breadcrumb-sep">›</span>
                <span>{name}</span>
              </div>
              <h1 style={{ marginTop: 4 }}>{name}</h1>
            </div>
            <span className={`status-pill ${status}`}>{STATUS_LABELS[status] || status}</span>
          </div>
        </section>

        <section className="panel" style={{ marginBottom: 16 }}>
          <div className="cd-stats-row">
            <StatCard label="Campaign Type" value={type || '—'} />
            <StatCard label="Est. Audience" value={audience ? audience.toLocaleString() : '—'} sub="subscribers" />
            <StatCard label="Squad" value={details?.squad || '—'} />
            <StatCard label="Channel" value={message?.channel || '—'} />
          </div>
        </section>

        {hasFullDetail && (
          <>
            <section className="panel" style={{ marginBottom: 16 }}>
              <h3 className="cd-section-title">Campaign Details</h3>
              <div className="review-grid">
                <DetailRow label="Campaign Name" value={details.name} />
                <DetailRow label="Type" value={details.type} />
                <DetailRow label="Squad" value={details.squad} />
                <DetailRow label="Description" value={details.description} />
              </div>
            </section>

            <section className="panel" style={{ marginBottom: 16 }}>
              <h3 className="cd-section-title">Audience</h3>
              <div className="review-grid">
                <DetailRow label="Brands" value={campaign.audience?.brands?.join(', ')} />
                <DetailRow label="Est. Reach" value={campaign.audience?.estimatedCount?.toLocaleString()} />
                <DetailRow label="Filter Groups" value={campaign.audience?.groups?.length} />
              </div>
            </section>

            <section className="panel" style={{ marginBottom: 16 }}>
              <h3 className="cd-section-title">Message</h3>
              <div className="review-grid" style={{ marginBottom: message?.body ? 14 : 0 }}>
                <DetailRow label="Message Type" value={message?.messageType} />
                <DetailRow label="Channel" value={message?.channel} />
              </div>
              {message?.body && (
                <div className="review-item" style={{ marginTop: 14 }}>
                  <div className="review-label">Message Body</div>
                  <div className="review-value">{message.body}</div>
                </div>
              )}
            </section>

            <section className="panel" style={{ marginBottom: 16 }}>
              <h3 className="cd-section-title">Schedule</h3>
              <div className="review-grid">
                <DetailRow label="Frequency" value={schedule?.frequency} />
                <DetailRow label="Date" value={schedule?.date} />
                <DetailRow label="Time" value={schedule?.time} />
              </div>
            </section>

            {(submittedBy || submittedAt) && (
              <section className="panel">
                <h3 className="cd-section-title">Approval Info</h3>
                <div className="review-grid">
                  <DetailRow label="Submitted By" value={submittedBy} />
                  <DetailRow label="Submitted At" value={submittedAt ? new Date(submittedAt).toLocaleString('en-PH') : null} />
                </div>
              </section>
            )}
          </>
        )}

        {!hasFullDetail && (
          <section className="panel">
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              Full campaign details are available only for campaigns created through the campaign wizard.
            </p>
          </section>
        )}

        <div className="button-row" style={{ marginTop: 24 }}>
          <button type="button" className="back-button" onClick={() => navigate(-1)}>← Back</button>
        </div>
      </div>
    </Layout>
  )
}
