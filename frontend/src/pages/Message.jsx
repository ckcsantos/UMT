import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import StepBar from '../components/StepBar'
import { useCampaign } from '../contexts/CampaignContext'

const MESSAGE_TEMPLATES = {
  Invite: (name) =>
    `Hi [First Name]! You're invited to join ${name}. Get exclusive rewards when you sign up today. Reply STOP to opt out.`,
  Promotional: (name) =>
    `[First Name], don't miss out! ${name} is live now. Enjoy special offers just for you. Valid until [End Date]. T&Cs apply.`,
  Informational: (name) =>
    `Important update from ${name}: Your account details have been updated. If this wasn't you, please contact support immediately.`,
  Reminder: (name) =>
    `Reminder: ${name} ends soon! Complete your transaction before [End Date] to enjoy your rewards. T&Cs apply.`,
  'Follow-up': (name) =>
    `Hi [First Name], we noticed you haven't completed ${name} yet. Complete now and enjoy exclusive benefits!`,
}

const CHANNELS = ['SMS', 'Email', 'Push Notification', 'In-App']
const SMS_LIMIT = 160

export default function Message() {
  const { draft, setMessage } = useCampaign()
  const navigate = useNavigate()
  const init = draft.message || {}
  const campaignName = draft.details?.name || 'this campaign'

  const [messageType, setMessageType] = useState(init.messageType || '')
  const [channel, setChannel] = useState(init.channel || '')
  const [body, setBody] = useState(init.body || '')

  useEffect(() => {
    if (messageType) {
      setBody(MESSAGE_TEMPLATES[messageType](campaignName))
    } else {
      setBody('')
    }
  }, [messageType])

  const charCount = body.length
  const isOver = channel === 'SMS' && charCount > SMS_LIMIT

  function handleNext() {
    if (!messageType || !channel) return
    setMessage({ messageType, channel, body })
    navigate('/schedule')
  }

  return (
    <Layout>
      <div className="page-shell">
        <section className="hero">
          <div className="hero-header">
            <h1>Message</h1>
          </div>
        </section>

        <section className="panel">
          <StepBar current={3} />

          <div className="form-grid">
            <div className="field">
              <label>Message Type<span className="required">*</span></label>
              <select value={messageType} onChange={e => setMessageType(e.target.value)}>
                <option value="">Select message type</option>
                {Object.keys(MESSAGE_TEMPLATES).map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div className="field">
              <label>Channel<span className="required">*</span></label>
              <select value={channel} onChange={e => setChannel(e.target.value)}>
                <option value="">Select channel</option>
                {CHANNELS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="field full-width">
              <label>Message Body</label>
              <textarea
                value={body}
                readOnly
                placeholder="Select a message type to auto-populate the body"
                style={{ background: '#f8fafc', color: body ? '#1e293b' : '#94a3b8', cursor: 'default' }}
              />
              {channel === 'SMS' && body && (
                <div className={`char-counter ${isOver ? 'over' : ''}`}>
                  {charCount} / {SMS_LIMIT}{isOver ? ` (+${charCount - SMS_LIMIT} over limit)` : ''}
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          {body && channel && (
            <div className="message-preview">
              <div className="preview-label">Preview — {channel}</div>
              {channel === 'SMS' && (
                <div className="sms-bubble">{body}</div>
              )}
              {channel === 'Email' && (
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 20px' }}>
                  <div style={{ fontWeight: 700, marginBottom: 8, color: '#0f172a' }}>Subject: {messageType} — {campaignName}</div>
                  <p style={{ color: '#334155', lineHeight: 1.6, fontSize: '0.95rem' }}>{body}</p>
                </div>
              )}
              {(channel === 'Push Notification' || channel === 'In-App') && (
                <div style={{ background: '#1e293b', borderRadius: 14, padding: '14px 18px', maxWidth: 340, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fff', fontWeight: 800 }}>A</div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', marginBottom: 4 }}>{campaignName}</div>
                    <div style={{ color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.5 }}>{body.slice(0, 80)}{body.length > 80 ? '…' : ''}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {(() => {
            const missing = [!messageType && 'Message type', !channel && 'Channel'].filter(Boolean)
            const isDisabled = missing.length > 0
            return (
              <div className="button-row">
                <Link to="/audience-builder" className="back-button">← Back</Link>
                <div className="button-row-right">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => { setMessage({ messageType, channel, body }); navigate('/dashboard') }}
                  >
                    Save for Later
                  </button>
                  {isDisabled ? (
                    <div className="disabled-btn-wrap">
                      <button type="button" className="primary-btn" disabled>Next</button>
                      <div className="disabled-tooltip">Required: {missing.join(', ')}</div>
                    </div>
                  ) : (
                    <button type="button" className="primary-btn" onClick={handleNext}>Next</button>
                  )}
                </div>
              </div>
            )
          })()}
        </section>
      </div>
    </Layout>
  )
}
