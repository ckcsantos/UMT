import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import StepBar from '../components/StepBar'
import { useCampaign } from '../contexts/CampaignContext'

const TYPES = ['Blast', 'Top-up & Get', 'Register & Get', 'Spend & Get', 'Pull KW']
const SQUADS = ['Core Growth', 'Retention', 'Product', 'Operations']

export default function CampaignCreation() {
  const { draft, setDetails } = useCampaign()
  const navigate = useNavigate()
  const init = draft.details || {}

  const [name, setName] = useState(init.name || '')
  const [description, setDescription] = useState(init.description || '')
  const [type, setType] = useState(init.type || '')
  const [squad, setSquad] = useState(init.squad || '')

  function handleNext(e) {
    e.preventDefault()
    if (!name.trim() || !type || !squad) return
    setDetails({ name: name.trim(), description: description.trim(), type, squad })
    navigate('/audience-builder')
  }

  const remaining = 250 - description.length

  return (
    <Layout>
      <div className="page-shell">
        <section className="hero">
          <div className="hero-header">
            <h1>Campaign Creation</h1>
            <Link to="/dashboard" className="back-button">Back to Dashboard</Link>
          </div>
        </section>

        <section className="panel">
          <StepBar current={1} />

          <form onSubmit={handleNext} noValidate>
            <div className="form-grid">
              <div className="field full-width">
                <label>Campaign Name<span className="required">*</span></label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter campaign name"
                  required
                />
              </div>

              <div className="field full-width">
                <label>Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value.slice(0, 250))}
                  placeholder="Describe the campaign"
                />
                <div className="help-text">{remaining} characters remaining</div>
              </div>

              <div className="field">
                <label>Campaign Type<span className="required">*</span></label>
                <select value={type} onChange={e => setType(e.target.value)} required>
                  <option value="">Select a type</option>
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div className="field">
                <label>Campaign Squad<span className="required">*</span></label>
                <select value={squad} onChange={e => setSquad(e.target.value)} required>
                  <option value="">Select a squad</option>
                  {SQUADS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="button-row">
              <button
                type="submit"
                className="primary-btn"
                disabled={!name.trim() || !type || !squad}
              >
                Next
              </button>
            </div>
          </form>
        </section>
      </div>
    </Layout>
  )
}
