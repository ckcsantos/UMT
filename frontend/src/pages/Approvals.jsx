import { useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { useApprovals } from '../contexts/ApprovalsContext'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function DetailRow({ label, value }) {
  return (
    <div className="approval-detail-item">
      <span className="approval-detail-label">{label}</span>
      <span className="approval-detail-value">{value || '—'}</span>
    </div>
  )
}

function CampaignCard({ campaign, onApprove, onReject }) {
  const [busy, setBusy] = useState(null) // 'approve' | 'reject' | null
  const [done, setDone] = useState(null) // 'approved' | 'rejected' | null

  async function handle(action) {
    setBusy(action)
    if (action === 'approve') await onApprove(campaign.id)
    else await onReject(campaign.id)
    setDone(action)
    setBusy(null)
  }

  if (done) {
    return (
      <div className={`approval-card approval-card--${done}`}>
        <div className="approval-card-done" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{done === 'approved' ? '✓ Approved' : '✕ Rejected'} — <strong>{campaign.name}</strong></span>
          {done === 'approved' && (
            <Link to={`/campaigns/${campaign.id}`} className="approval-view-link">View campaign →</Link>
          )}
        </div>
      </div>
    )
  }

  const { details, audience, message, schedule, submittedAt, submittedBy } = campaign

  return (
    <div className="approval-card">
      <div className="approval-card-header">
        <div>
          <div className="approval-campaign-name">{campaign.name}</div>
          <div className="approval-meta">
            Submitted {formatDate(submittedAt)} by <span className="approval-submitter">{submittedBy}</span>
          </div>
        </div>
        <div className="approval-actions">
          <button
            className="approval-btn approval-btn--reject"
            onClick={() => handle('reject')}
            disabled={!!busy}
          >
            {busy === 'reject' ? 'Rejecting…' : 'Reject'}
          </button>
          <button
            className="approval-btn approval-btn--approve"
            onClick={() => handle('approve')}
            disabled={!!busy}
          >
            {busy === 'approve' ? 'Approving…' : 'Approve'}
          </button>
        </div>
      </div>

      <div className="approval-details">
        <div className="approval-detail-group">
          <div className="approval-detail-group-title">Campaign</div>
          <DetailRow label="Type" value={details?.type} />
          <DetailRow label="Squad" value={details?.squad} />
          {details?.description && <DetailRow label="Description" value={details.description} />}
        </div>
        <div className="approval-detail-group">
          <div className="approval-detail-group-title">Audience</div>
          <DetailRow label="Brand" value={audience?.brands?.join(', ')} />
          <DetailRow label="Est. Reach" value={audience?.estimatedCount?.toLocaleString()} />
          <DetailRow label="Filter Groups" value={audience?.groups?.length} />
        </div>
        <div className="approval-detail-group">
          <div className="approval-detail-group-title">Message</div>
          <DetailRow label="Type" value={message?.messageType} />
          <DetailRow label="Channel" value={message?.channel} />
        </div>
        <div className="approval-detail-group">
          <div className="approval-detail-group-title">Schedule</div>
          <DetailRow label="Frequency" value={schedule?.frequency} />
          <DetailRow label="Date" value={schedule?.date} />
          <DetailRow label="Time" value={schedule?.time} />
        </div>
      </div>

      {message?.body && (
        <div className="approval-body-preview">
          <span className="approval-detail-label">Message Body</span>
          <p className="approval-body-text">{message.body}</p>
        </div>
      )}
    </div>
  )
}

export default function Approvals() {
  const { pending, loading, approve, reject } = useApprovals()

  return (
    <Layout>
      <div className="page-shell">
        <section className="hero">
          <div className="hero-header">
            <h1>Approvals</h1>
            {!loading && pending.length > 0 && (
              <div className="approval-count-badge">{pending.length} pending</div>
            )}
          </div>
        </section>

        <section className="panel">
          {loading && (
            <div className="fetch-state">Loading pending campaigns…</div>
          )}

          {!loading && pending.length === 0 && (
            <div className="approval-empty">
              <div className="approval-empty-icon">✓</div>
              <div className="approval-empty-title">All clear</div>
              <div className="approval-empty-sub">No campaigns pending review.</div>
            </div>
          )}

          {!loading && pending.map(c => (
            <CampaignCard
              key={c.id}
              campaign={c}
              onApprove={approve}
              onReject={reject}
            />
          ))}
        </section>
      </div>
    </Layout>
  )
}
