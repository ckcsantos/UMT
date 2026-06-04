import { useState, useRef, useEffect } from 'react'

export default function SearchableSelect({ value, onChange, options, placeholder, disabled, style }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef(null)

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()))

  useEffect(() => {
    function handleOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  return (
    <div ref={containerRef} className="ss-wrap" style={style}>
      <button
        type="button"
        disabled={disabled}
        className={`ss-trigger ${open ? 'ss-open' : ''}`}
        onClick={() => { setOpen(o => !o); setSearch('') }}
      >
        <span style={{ color: value ? '#1e293b' : '#94a3b8' }}>{value || placeholder}</span>
        <span className="ss-chevron">▼</span>
      </button>

      {open && (
        <div className="ss-dropdown">
          <div className="ss-search-row">
            <input
              autoFocus
              type="text"
              className="ss-search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              onClick={e => e.stopPropagation()}
            />
          </div>
          <div className="ss-list">
            {filtered.length === 0
              ? <div className="ss-empty">No results</div>
              : filtered.map(opt => (
                <button
                  key={opt}
                  type="button"
                  className={`ss-option ${opt === value ? 'ss-selected' : ''}`}
                  onClick={() => { onChange(opt); setOpen(false); setSearch('') }}
                >
                  {opt}
                </button>
              ))
            }
          </div>
        </div>
      )}
    </div>
  )
}
