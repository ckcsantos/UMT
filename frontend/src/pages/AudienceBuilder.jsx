import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import StepBar from '../components/StepBar'
import { useCampaign } from '../contexts/CampaignContext'

const BRANDS = ['GlobeOne', 'TM', 'Globe Prepaid', 'Globe Postpaid', 'Globe at Home']

const FILTER_OPTIONS = {
  Status: ['Active', 'Inactive', 'Suspended'],
  'SIM Type': ['Prepaid', 'Postpaid', 'Hybrid'],
  'Value Segment': ['High Value', 'Mid Value', 'Low Value'],
  Region: ['NCR', 'Luzon', 'Visayas', 'Mindanao'],
  'Tenure (years)': ['< 1', '1–3', '3–5', '> 5'],
}

function escapeHtml(str) {
  const el = document.createElement('span')
  el.appendChild(document.createTextNode(str))
  return el.innerHTML
}

export default function AudienceBuilder() {
  const { draft, setAudience } = useCampaign()
  const navigate = useNavigate()
  const init = draft.audience || {}

  const [brands, setBrands] = useState(init.brands || [])
  const [groups, setGroups] = useState(init.groups || [
    { id: Date.now(), filters: [] },
  ])
  const [showPreview, setShowPreview] = useState(false)

  const estimatedCount = brands.length * 15000 + groups.reduce((s, g) => s + g.filters.length * 3000, 0)

  function toggleBrand(b) {
    setBrands(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b])
  }

  function addGroup() {
    setGroups(prev => [...prev, { id: Date.now(), filters: [] }])
  }

  function removeGroup(id) {
    setGroups(prev => prev.filter(g => g.id !== id))
  }

  function addFilter(groupId) {
    setGroups(prev => prev.map(g =>
      g.id === groupId
        ? { ...g, filters: [...g.filters, { id: Date.now(), field: '', operator: 'equals', value: '' }] }
        : g
    ))
  }

  function updateFilter(groupId, filterId, key, val) {
    setGroups(prev => prev.map(g =>
      g.id === groupId
        ? { ...g, filters: g.filters.map(f => f.id === filterId ? { ...f, [key]: val } : f) }
        : g
    ))
  }

  function removeFilter(groupId, filterId) {
    setGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, filters: g.filters.filter(f => f.id !== filterId) } : g
    ))
  }

  function handleNext() {
    setAudience({ brands, estimatedCount, groups })
    navigate('/message')
  }

  return (
    <Layout>
      <div className="page-shell">
        <section className="hero">
          <div className="hero-header">
            <h1>Audience Builder</h1>
            <Link to="/campaign-creation" className="back-button">Back</Link>
          </div>
        </section>

        <section className="panel">
          <StepBar current={2} />

          {/* Brand selector */}
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 12, color: '#1e293b' }}>
              Select Brands
              <span style={{ marginLeft: 12, fontSize: '0.85rem', fontWeight: 500, background: '#eff6ff', color: '#2563eb', padding: '2px 10px', borderRadius: 999 }}>
                {estimatedCount.toLocaleString()} est. audience
              </span>
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {BRANDS.map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => toggleBrand(b)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 999,
                    border: brands.includes(b) ? '2px solid #2563eb' : '2px solid #e2e8f0',
                    background: brands.includes(b) ? '#eff6ff' : '#fff',
                    color: brands.includes(b) ? '#2563eb' : '#475569',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.15s',
                  }}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Filter groups */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontWeight: 700, color: '#1e293b' }}>Filter Groups</h3>
              <button type="button" className="primary-btn" style={{ fontSize: '0.85rem', padding: '8px 16px' }} onClick={addGroup}>
                + Add Group
              </button>
            </div>

            {groups.map((group, gi) => (
              <div key={group.id} style={{ background: '#f8fafc', borderRadius: 14, padding: '16px 20px', marginBottom: 14, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontWeight: 700, color: '#475569', fontSize: '0.88rem' }}>
                    {gi > 0 && <span style={{ color: '#2563eb', marginRight: 8 }}>OR</span>}
                    Group {gi + 1}
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" className="row-edit-btn" onClick={() => addFilter(group.id)}>+ Filter</button>
                    {groups.length > 1 && (
                      <button type="button" className="row-edit-btn" style={{ color: '#dc2626', borderColor: '#fecaca' }} onClick={() => removeGroup(group.id)}>Remove</button>
                    )}
                  </div>
                </div>

                {group.filters.length === 0 && (
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No filters — click "+ Filter" to add one.</p>
                )}

                {group.filters.map((f, fi) => (
                  <div key={f.id} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                    {fi > 0 && <span style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.8rem', minWidth: 28 }}>AND</span>}
                    {fi === 0 && <span style={{ minWidth: 28 }} />}
                    <select
                      value={f.field}
                      onChange={e => updateFilter(group.id, f.id, 'field', e.target.value)}
                      style={{ flex: 1 }}
                    >
                      <option value="">Field…</option>
                      {Object.keys(FILTER_OPTIONS).map(k => <option key={k}>{k}</option>)}
                    </select>
                    <select
                      value={f.operator}
                      onChange={e => updateFilter(group.id, f.id, 'operator', e.target.value)}
                      style={{ width: 120 }}
                    >
                      <option value="equals">equals</option>
                      <option value="not_equals">not equals</option>
                    </select>
                    <select
                      value={f.value}
                      onChange={e => updateFilter(group.id, f.id, 'value', e.target.value)}
                      style={{ flex: 1 }}
                      disabled={!f.field}
                    >
                      <option value="">Value…</option>
                      {(FILTER_OPTIONS[f.field] || []).map(v => <option key={v}>{v}</option>)}
                    </select>
                    <button type="button" onClick={() => removeFilter(group.id, f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1.1rem', padding: '0 4px' }}>✕</button>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Query preview */}
          <button type="button" className="row-edit-btn" style={{ marginBottom: 20 }} onClick={() => setShowPreview(p => !p)}>
            {showPreview ? 'Hide' : 'Show'} Query Preview
          </button>

          {showPreview && (
            <div style={{ background: '#0f172a', borderRadius: 14, padding: '16px 20px', marginBottom: 20, fontFamily: 'monospace', fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.6 }}>
              <div>SELECT subscribers</div>
              <div>FROM customer_base</div>
              <div>WHERE brand IN ({brands.map(escapeHtml).join(', ') || 'any'})</div>
              {groups.map((g, gi) => g.filters.map((f, fi) => (
                <div key={`${g.id}-${f.id}`}>
                  {fi === 0 && gi === 0 ? 'AND (' : fi === 0 ? 'OR (' : '  AND '}
                  {escapeHtml(f.field || '?')} {f.operator.replace('_', ' ')} '{escapeHtml(f.value || '?')}'
                  {fi === g.filters.length - 1 ? ')' : ''}
                </div>
              )))}
            </div>
          )}

          <div className="button-row">
            <button type="button" className="primary-btn" onClick={handleNext}>
              Next
            </button>
          </div>
        </section>
      </div>
    </Layout>
  )
}
