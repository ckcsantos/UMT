import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import StepBar from '../components/StepBar'
import SearchableSelect from '../components/SearchableSelect'
import { useCampaign } from '../contexts/CampaignContext'
import { api } from '../services/api'

const BRANDS = ['TM', 'Globe Prepaid', 'Globe Postpaid', 'Globe at Home']

const FILTER_OPTIONS = {
  'Status':         ['Active', 'Inactive', 'Suspended'],
  'SIM Type':       ['Prepaid', 'Postpaid', 'Hybrid'],
  'Value Segment':  ['High Value', 'Mid Value', 'Low Value'],
  'Region':         ['NCR', 'Luzon', 'Visayas', 'Mindanao'],
  'Tenure (years)': ['< 1', '1–3', '3–5', '> 5'],
}

const FIELD_META = {
  'Status':         { type: 'categorical', desc: 'Current account status of the subscriber.' },
  'SIM Type':       { type: 'categorical', desc: 'Type of SIM subscription (Prepaid, Postpaid, or Hybrid).' },
  'Value Segment':  { type: 'categorical', desc: 'Customer tier based on monthly spend and engagement.' },
  'Region':         { type: 'categorical', desc: 'Geographic region where the subscriber is registered.' },
  'Tenure (years)': { type: 'numeric',     desc: 'Number of years the subscriber has been active on the network.' },
}

const OPERATORS = {
  categorical: ['equals', 'not equals'],
  numeric:     ['equals', 'not equals', 'greater than', 'less than', '≥ at least', '≤ at most'],
}

function escapeHtml(str) {
  const el = document.createElement('span')
  el.appendChild(document.createTextNode(str))
  return el.innerHTML
}

function Tooltip({ text, children }) {
  return (
    <span className="tooltip-wrap">
      {children}
      <span className="tooltip-icon">ⓘ</span>
      <span className="tooltip-box">{text}</span>
    </span>
  )
}

function OperatorToggle({ value, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(value === 'OR' ? 'AND' : 'OR')}
      title="Click to toggle"
      style={{
        width: 52, padding: '3px 0', borderRadius: 999, border: '2px solid',
        borderColor: value === 'OR' ? '#29348F' : '#1f2a7a',
        background: value === 'OR' ? '#EAECF8' : '#EAECF8',
        color: value === 'OR' ? '#29348F' : '#1f2a7a',
        fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
        transition: 'all 0.15s', userSelect: 'none', textAlign: 'center',
      }}
    >
      {value}
    </button>
  )
}

export default function AudienceBuilder() {
  const { draft, setAudience } = useCampaign()
  const navigate = useNavigate()
  const init = draft.audience || {}

  const [brands, setBrands] = useState(init.brands || [])
  const [groups, setGroups] = useState(init.groups || [
    { id: Date.now(), filters: [], groupOperator: 'OR' },
  ])
  const [showPreview, setShowPreview] = useState(false)
  const [estimatedCount, setEstimatedCount] = useState(init.estimatedCount ?? null)
  const [isCounting, setIsCounting] = useState(false)

  const formulaEstimate = brands.length * 15000 + groups.reduce((s, g) => s + g.filters.length * 3000, 0)

  async function handleCount() {
    setIsCounting(true)
    try {
      const data = await api.estimateAudience({ brands, groups })
      setEstimatedCount(data.count)
    } catch {
      setEstimatedCount(formulaEstimate)
    } finally {
      setIsCounting(false)
    }
  }

  function toggleBrand(b) {
    setBrands(prev => prev.includes(b) ? [] : [b])
  }

  function addGroup() {
    setGroups(prev => [...prev, { id: Date.now(), filters: [], groupOperator: 'OR' }])
  }

  function removeGroup(id) {
    setGroups(prev => prev.filter(g => g.id !== id))
  }

  function addFilter(groupId) {
    setGroups(prev => prev.map(g =>
      g.id === groupId
        ? { ...g, filters: [...g.filters, { id: Date.now(), field: '', operator: 'equals', value: '', filterOperator: 'AND' }] }
        : g
    ))
  }

  function updateFilter(groupId, filterId, key, val) {
    setGroups(prev => prev.map(g =>
      g.id === groupId
        ? {
            ...g, filters: g.filters.map(f => {
              if (f.id !== filterId) return f
              const updated = { ...f, [key]: val }
              // Reset operator and value when field changes
              if (key === 'field') {
                const meta = FIELD_META[val]
                const ops = meta ? OPERATORS[meta.type] : OPERATORS.categorical
                updated.operator = ops[0]
                updated.value = ''
              }
              return updated
            })
          }
        : g
    ))
  }

  function removeFilter(groupId, filterId) {
    setGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, filters: g.filters.filter(f => f.id !== filterId) } : g
    ))
  }

  function saveState() {
    setAudience({ brands, estimatedCount, groups })
  }

  function handleNext() {
    saveState()
    navigate('/message')
  }

  function handleSaveForLater() {
    saveState()
    navigate('/dashboard')
  }

  return (
    <Layout>
      <div className="page-shell">
        <section className="hero">
          <div className="hero-header">
            <h1>Audience Builder</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {estimatedCount !== null && !isCounting && (
                <div className="audience-count-result">
                  <span className="audience-count-num">{estimatedCount.toLocaleString()}</span>
                  <span className="audience-count-label">est. subscribers</span>
                </div>
              )}
              <button
                type="button"
                className="primary-btn"
                onClick={handleCount}
                disabled={isCounting || brands.length === 0}
              >
                {isCounting ? 'Counting…' : 'Count Audience'}
              </button>
            </div>
          </div>
        </section>

        <section className="panel">
          <StepBar current={2} />

          {/* Brand selector */}
          <div className="ab-section">
            <h3 className="ab-heading">Select Brand</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {BRANDS.map(b => (
                <button
                  key={b}
                  type="button"
                  className={`ab-brand-btn ${brands.includes(b) ? 'selected' : ''}`}
                  onClick={() => toggleBrand(b)}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Filter groups */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 className="ab-heading">Filter Groups</h3>
              <button type="button" className="primary-btn" style={{ fontSize: '0.85rem', padding: '8px 16px' }} onClick={addGroup}>
                + Add Group
              </button>
            </div>

            {groups.map((group, gi) => (
              <div key={group.id}>
                {gi > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 4px 16px' }}>
                    <span className="ab-group-connector">AND</span>
                  </div>
                )}

                <div className="ab-group-box">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span className="ab-group-label">Group {gi + 1}</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" className="row-edit-btn" onClick={() => addFilter(group.id)}>+ Filter</button>
                      {groups.length > 1 && (
                        <button type="button" className="row-edit-btn ab-remove-btn" onClick={() => removeGroup(group.id)}>Remove</button>
                      )}
                    </div>
                  </div>

                  {group.filters.length === 0 && (
                    <p className="ab-empty-filters">No filters — click "+ Filter" to add one.</p>
                  )}

                  {group.filters.map((f, fi) => {
                    const meta = FIELD_META[f.field]
                    const operators = meta ? OPERATORS[meta.type] : OPERATORS.categorical
                    return (
                      <div key={f.id} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ width: 52, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                          {fi > 0 && (
                            <OperatorToggle
                              value={f.filterOperator || 'AND'}
                              onChange={op => updateFilter(group.id, f.id, 'filterOperator', op)}
                            />
                          )}
                        </div>

                        {/* Field with glossary tooltip */}
                        <div style={{ flex: 1, position: 'relative' }}>
                          {f.field && FIELD_META[f.field] && (
                            <div style={{ position: 'absolute', top: -20, left: 2, zIndex: 1 }}>
                              <Tooltip text={FIELD_META[f.field].desc}>
                                <span className="ab-field-label">{f.field}</span>
                              </Tooltip>
                            </div>
                          )}
                          <SearchableSelect
                            value={f.field}
                            onChange={val => updateFilter(group.id, f.id, 'field', val)}
                            options={Object.keys(FILTER_OPTIONS)}
                            placeholder="Field…"
                          />
                        </div>

                        {/* Operator — options change based on field data type */}
                        <SearchableSelect
                          value={f.operator}
                          onChange={val => updateFilter(group.id, f.id, 'operator', val)}
                          options={operators}
                          placeholder="Operator…"
                          style={{ width: 150 }}
                          disabled={!f.field}
                        />

                        {/* Value */}
                        <SearchableSelect
                          value={f.value}
                          onChange={val => updateFilter(group.id, f.id, 'value', val)}
                          options={FILTER_OPTIONS[f.field] || []}
                          placeholder="Value…"
                          style={{ flex: 1 }}
                          disabled={!f.field}
                        />

                        <button type="button" onClick={() => removeFilter(group.id, f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1.1rem', padding: '0 4px' }}>✕</button>
                      </div>
                    )
                  })}
                </div>
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
                  {fi === 0 && gi === 0 ? 'AND (' : fi === 0 ? 'AND (' : `  ${f.filterOperator || 'AND'} `}
                  {escapeHtml(f.field || '?')} {f.operator} '{escapeHtml(f.value || '?')}'
                  {fi === g.filters.length - 1 ? ')' : ''}
                </div>
              )))}
            </div>
          )}

          <div className="button-row">
            <Link to="/campaign-creation" className="back-button">← Back</Link>
            <div className="button-row-right">
              <button type="button" className="secondary-btn" onClick={handleSaveForLater}>
                Save for Later
              </button>
              {brands.length === 0 ? (
                <div className="disabled-btn-wrap">
                  <button type="button" className="primary-btn" disabled>Next</button>
                  <div className="disabled-tooltip">Please select a brand to continue</div>
                </div>
              ) : (
                <button type="button" className="primary-btn" onClick={handleNext}>Next</button>
              )}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}
