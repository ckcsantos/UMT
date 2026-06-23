import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import StepBar from '../components/StepBar'
import { useCampaign } from '../contexts/CampaignContext'
import { api } from '../services/api'

export default function Review() {
  const { draft, resetDraft } = useCampaign()
  const navigate = useNavigate()
  const [launched, setLaunched] = useState(false)
  const [launching, setLaunching] = useState(false)
  const [launchError, setLaunchError] = useState(null)

  const { details, audience, message, schedule } = draft

  async function handleLaunch() {
    setLaunching(true)
    setLaunchError(null)
    try {
      await api.createCampaign({ details, audience, message, schedule })
      setLaunched(true)
    } catch (err) {
      setLaunchError(err.message)
    } finally {
      setLaunching(false)
    }
  }

  function handleDone() {
    resetDraft()
    navigate('/dashboard')
  }

  const daysStr = schedule?.days?.length
    ? schedule.days.sort((a, b) => a - b).map(i => ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]).join(', ')
    : '—'

  return (
    <Layout>
      <div className="page-shell">
        <section className="hero">
          <div className="hero-header">
            <h1>Review</h1>
          </div>
        </section>

        <section className="panel">
          <StepBar current={5} />

          {/* Campaign Details */}
          <div className="review-section">
            <div className="review-section-header">
              <h3>Campaign Details</h3>
              <Link to="/campaign-creation" className="row-edit-btn">Edit</Link>
            </div>
            <div className="review-grid">
              <div className="review-item">
                <div className="review-label">Campaign Name</div>
                <div className="review-value">{details?.name || '—'}</div>
              </div>
              <div className="review-item">
                <div className="review-label">Type</div>
                <div className="review-value">{details?.type || '—'}</div>
              </div>
              <div className="review-item">
                <div className="review-label">Squad</div>
                <div className="review-value">{details?.squad || '—'}</div>
              </div>
              <div className="review-item">
                <div className="review-label">Description</div>
                <div className="review-value">{details?.description || '—'}</div>
              </div>
            </div>
          </div>

          {/* Audience */}
          <div className="review-section">
            <div className="review-section-header">
              <h3>Audience</h3>
              <Link to="/audience-builder" className="row-edit-btn">Edit</Link>
            </div>
            <div className="review-grid">
              <div className="review-item">
                <div className="review-label">Brands</div>
                <div className="review-value">{audience?.brands?.join(', ') || '—'}</div>
              </div>
              <div className="review-item">
                <div className="review-label">Estimated Reach</div>
                <div className="review-value">{audience?.estimatedCount?.toLocaleString() || '—'}</div>
              </div>
              <div className="review-item">
                <div className="review-label">Filter Groups</div>
                <div className="review-value">{audience?.groups?.length ?? '—'}</div>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="review-section">
            <div className="review-section-header">
              <h3>Message</h3>
              <Link to="/message" className="row-edit-btn">Edit</Link>
            </div>
            <div className="review-grid">
              <div className="review-item">
                <div className="review-label">Type</div>
                <div className="review-value">{message?.messageType || '—'}</div>
              </div>
              <div className="review-item">
                <div className="review-label">Channel</div>
                <div className="review-value">{message?.channel || '—'}</div>
              </div>
            </div>
            {message?.body && (
              <div className="review-item" style={{ marginTop: 14 }}>
                <div className="review-label">Message Body</div>
                <div className="review-value">{message.body}</div>
              </div>
            )}
          </div>

          {/* Schedule */}
          <div className="review-section">
            <div className="review-section-header">
              <h3>Schedule</h3>
              <Link to="/schedule" className="row-edit-btn">Edit</Link>
            </div>
            <div className="review-grid">
              <div className="review-item">
                <div className="review-label">Frequency</div>
                <div className="review-value">{schedule?.frequency || '—'}</div>
              </div>
              <div className="review-item">
                <div className="review-label">Date</div>
                <div className="review-value">{schedule?.date || '—'}</div>
              </div>
              <div className="review-item">
                <div className="review-label">Time</div>
                <div className="review-value">{schedule?.time || '—'}</div>
              </div>
              {['Daily', 'Weekly'].includes(schedule?.frequency) && (
                <div className="review-item">
                  <div className="review-label">Days</div>
                  <div className="review-value">{daysStr}</div>
                </div>
              )}
            </div>
          </div>

          {launchError && (
            <div className="fetch-state fetch-error" style={{ marginBottom: 16 }}>
              Submit failed: {launchError}
            </div>
          )}
          <div className="button-row">
            <Link to="/schedule" className="back-button">← Back</Link>
            <div className="button-row-right">
              <button type="button" className="secondary-btn" onClick={() => navigate('/dashboard')}>
                Save for Later
              </button>
              {launching ? (
                <div className="disabled-btn-wrap">
                  <button type="button" className="primary-btn" disabled>Submitting…</button>
                  <div className="disabled-tooltip">Submitting your campaign, please wait…</div>
                </div>
              ) : (
                <button type="button" className="primary-btn" onClick={handleLaunch}>Submit Campaign</button>
              )}
            </div>
          </div>
        </section>
      </div>

      {launched && (
        <div className="modal-backdrop">
          <div className="modal">
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>📋</div>
            <h2>Campaign for Review</h2>
            <p style={{ marginTop: 8 }}>
              <strong>{details?.name}</strong> has been submitted and is now pending review before sending.
            </p>
            <button
              type="button"
              className="primary-btn"
              style={{ marginTop: 24, width: '100%', justifyContent: 'center' }}
              onClick={handleDone}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </Layout>
  )
}
