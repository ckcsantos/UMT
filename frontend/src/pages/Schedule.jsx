import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.min.css'
import Layout from '../components/Layout'
import StepBar from '../components/StepBar'
import { useCampaign } from '../contexts/CampaignContext'

// ── Helpers ──────────────────────────────────────────────────────────────────

const TIME_SLOTS = (() => {
  const slots = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const val = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      const ap = h < 12 ? 'AM' : 'PM'
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
      slots.push({ value: val, label: `${h12}:${String(m).padStart(2, '0')} ${ap}` })
    }
  }
  return slots
})()

function toLabel(val) { return TIME_SLOTS.find(s => s.value === val)?.label ?? val }

function addHours(val, hrs) {
  const [h, m] = val.split(':').map(Number)
  const t = h * 60 + m + hrs * 60
  return `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function nowSlot() {
  const d = new Date()
  const m = Math.ceil(d.getMinutes() / 15) * 15
  const h = m === 60 ? (d.getHours() + 1) % 24 : d.getHours()
  return `${String(h).padStart(2, '0')}:${String(m === 60 ? 0 : m).padStart(2, '0')}`
}

function formatDisplayDate(str) {
  if (!str) return 'Pick date'
  return new Date(str + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

function getOrdinal(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

function getRecurrenceOptions(dateStr) {
  if (!dateStr) return [{ value: 'none', label: 'Does not repeat' }]
  const d = new Date(dateStr + 'T12:00:00')
  const dayName  = d.toLocaleDateString('en-US', { weekday: 'long' })
  const monthDay = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
  const weekNum  = Math.ceil(d.getDate() / 7)
  return [
    { value: 'none',     label: 'Does not repeat' },
    { value: 'daily',    label: 'Every day' },
    { value: 'weekly',   label: `Every week on ${dayName}` },
    { value: 'monthly',  label: `Every month on the ${getOrdinal(weekNum)} ${dayName}` },
    { value: 'yearly',   label: `Every year on ${monthDay}` },
    { value: 'weekdays', label: 'Every weekday (Monday to Friday)' },
    { value: 'custom',   label: 'Custom…' },
  ]
}

const WEEK_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const WEEK_NAMES   = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const CUSTOM_UNITS = ['day', 'week', 'month', 'year']

// ── Time dropdown ─────────────────────────────────────────────────────────────

function TimeDropdown({ value, onChange, slots = TIME_SLOTS }) {
  const [open, setOpen] = useState(false)
  const ref     = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    function out(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', out)
    return () => document.removeEventListener('mousedown', out)
  }, [])

  useEffect(() => {
    if (open && listRef.current) {
      const idx = slots.findIndex(s => s.value === value)
      listRef.current.children[idx]?.scrollIntoView({ block: 'center' })
    }
  }, [open])

  return (
    <div ref={ref} className="gcal-time-wrap">
      <button type="button" className="gcal-time-btn" onClick={() => setOpen(o => !o)}>
        {toLabel(value)}
      </button>
      {open && (
        <div className="gcal-time-dropdown" ref={listRef}>
          {slots.map(s => (
            <button key={s.value} type="button"
              className={`gcal-time-opt ${s.value === value ? 'selected' : ''}`}
              onClick={() => { onChange(s.value); setOpen(false) }}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Schedule() {
  const { draft, setSchedule } = useCampaign()
  const navigate = useNavigate()
  const init = draft.schedule || {}

  const [startDate,      setStartDate]      = useState(init.date         || todayStr())
  const [startTime,      setStartTime]      = useState(init.startTime    || nowSlot())
  const [recurrence,     setRecurrence]     = useState(init.recurrence   || 'none')
  const [weekDays,       setWeekDays]       = useState(init.weekDays     || [new Date().getDay()])
  const [endsType,       setEndsType]       = useState(init.endsType     || 'never')
  const [endsDate,       setEndsDate]       = useState(init.endsDate     || '')
  const [endsAfter,      setEndsAfter]      = useState(init.endsAfter    || 30)
  const [customInterval, setCustomInterval] = useState(init.customInterval || 1)
  const [customUnit,     setCustomUnit]     = useState(init.customUnit   || 'week')

  const dateRef     = useRef(null)
  const fpDate      = useRef(null)
  const endsDateRef = useRef(null)
  const fpEndsDate  = useRef(null)

  useEffect(() => {
    fpDate.current = flatpickr(dateRef.current, {
      dateFormat: 'Y-m-d',
      defaultDate: startDate,
      minDate: 'today',
      disableMobile: true,
      onChange: ([d]) => {
        if (!d) return
        const s = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        setStartDate(s)
        setWeekDays([d.getDay()])
      },
    })
    return () => fpDate.current?.destroy()
  }, [])

  useEffect(() => {
    if (endsType !== 'on' || !endsDateRef.current) return
    fpEndsDate.current = flatpickr(endsDateRef.current, {
      dateFormat: 'Y-m-d',
      defaultDate: endsDate || undefined,
      minDate: startDate,
      disableMobile: true,
      onChange: ([d]) => {
        if (!d) return
        setEndsDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
      },
    })
    return () => fpEndsDate.current?.destroy()
  }, [endsType])

  function toggleWeekDay(d) {
    setWeekDays(prev =>
      prev.includes(d) && prev.length === 1 ? prev
        : prev.includes(d) ? prev.filter(x => x !== d)
        : [...prev, d]
    )
  }

  const recurrenceOptions = getRecurrenceOptions(startDate)
  const isRecurring       = recurrence !== 'none'
  const showDayCircles    = recurrence === 'weekly' || (recurrence === 'custom' && customUnit === 'week')
  const recLabel          = recurrenceOptions.find(r => r.value === recurrence)?.label ?? ''

  function buildPayload() {
    return {
      date: startDate, startTime,
      recurrence, weekDays, endsType, endsDate, endsAfter,
      customInterval, customUnit,
      frequency: recurrence === 'none' ? 'One Time' : recurrence === 'daily' ? 'Daily' : recurrence === 'weekly' ? 'Weekly' : 'Monthly',
      time: startTime,
      days: weekDays,
    }
  }

  function handleNext() { setSchedule(buildPayload()); navigate('/review') }
  function handleSave()  { setSchedule(buildPayload()); navigate('/dashboard') }

  return (
    <Layout>
      <div className="page-shell">
        <section className="hero">
          <div className="hero-header"><h1>Schedule</h1></div>
        </section>

        <section className="panel">
          <StepBar current={4} />

          {/* ── Date & time ─────────────────────────────────────────────── */}
          <div className="gcal-block">
            <div className="gcal-datetime-row">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="gcal-field-label">Date</span>
                <input
                  ref={dateRef}
                  type="text"
                  className="gcal-date-btn"
                  value={formatDisplayDate(startDate)}
                  readOnly
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="gcal-field-label">Start Time</span>
                <TimeDropdown value={startTime} onChange={setStartTime} />
              </div>
            </div>
          </div>

          {/* ── Recurrence ──────────────────────────────────────────────── */}
          <div className="gcal-block">
            <label className="gcal-field-label">Repeat</label>
            <select
              className="gcal-recur-select"
              value={recurrence}
              onChange={e => setRecurrence(e.target.value)}
            >
              {recurrenceOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* ── Day circles for weekly ───────────────────────────────────── */}
          {showDayCircles && (
            <div className="gcal-block">
              <label className="gcal-field-label">Repeat on</label>
              <div className="gcal-day-circles">
                {WEEK_LETTERS.map((ltr, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`gcal-day-circle ${weekDays.includes(i) ? 'selected' : ''}`}
                    onClick={() => toggleWeekDay(i)}
                    title={WEEK_NAMES[i]}
                  >
                    {ltr}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Custom recurrence ───────────────────────────────────────── */}
          {recurrence === 'custom' && (
            <div className="gcal-block gcal-custom-panel">
              <label className="gcal-field-label">Repeat every</label>
              <div className="gcal-custom-row">
                <input
                  type="number" min="1" max="99"
                  value={customInterval}
                  onChange={e => setCustomInterval(Math.max(1, Number(e.target.value)))}
                  className="gcal-custom-num"
                />
                <select
                  className="gcal-recur-select"
                  value={customUnit}
                  onChange={e => setCustomUnit(e.target.value)}
                >
                  {CUSTOM_UNITS.map(u => (
                    <option key={u} value={u}>{u}{customInterval > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* ── Ends ────────────────────────────────────────────────────── */}
          {isRecurring && (
            <div className="gcal-block">
              <label className="gcal-field-label">Ends</label>
              <div className="gcal-ends-options">
                {[
                  { v: 'never', label: 'Never' },
                  { v: 'on',    label: 'On date' },
                  { v: 'after', label: 'After' },
                ].map(({ v, label }) => (
                  <label key={v} className={`gcal-ends-row ${endsType === v ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="ends"
                      value={v}
                      checked={endsType === v}
                      onChange={() => setEndsType(v)}
                    />
                    <span>{label}</span>
                    {v === 'on' && endsType === 'on' && (
                      <input
                        ref={endsDateRef}
                        type="text"
                        className="gcal-ends-date-input"
                        readOnly
                        placeholder="Pick a date"
                      />
                    )}
                    {v === 'after' && endsType === 'after' && (
                      <div className="gcal-ends-after">
                        <input
                          type="number" min="1" max="365"
                          value={endsAfter}
                          onChange={e => setEndsAfter(Math.max(1, Number(e.target.value)))}
                          className="gcal-custom-num"
                          onClick={e => e.stopPropagation()}
                        />
                        <span className="gcal-ends-unit">occurrences</span>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ── Summary ─────────────────────────────────────────────────── */}
          <div className="schedule-preview">
            <p>
              {formatDisplayDate(startDate)}
              {' '}&nbsp;·&nbsp;{' '}{toLabel(startTime)}
              {recurrence !== 'none' && <> &nbsp;·&nbsp; {recLabel}</>}
              {isRecurring && endsType === 'on'    && endsDate && <> &nbsp;·&nbsp; until {formatDisplayDate(endsDate)}</>}
              {isRecurring && endsType === 'after'              && <> &nbsp;·&nbsp; {endsAfter} occurrences</>}
            </p>
          </div>

          <div className="button-row">
            <Link to="/message" className="back-button">← Back</Link>
            <div className="button-row-right">
              <button type="button" className="secondary-btn" onClick={handleSave}>Save for Later</button>
              <button type="button" className="primary-btn"   onClick={handleNext}>Next</button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}
