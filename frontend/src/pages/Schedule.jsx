import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.min.css'
import Layout from '../components/Layout'
import StepBar from '../components/StepBar'
import { useCampaign } from '../contexts/CampaignContext'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAY_JS = [1, 2, 3, 4, 5, 6, 0] // Mon=1…Sun=0 mapping to JS getDay()

const FREQS = ['Once', 'Daily', 'Weekly', 'Monthly']

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function nowTimeStr() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function currentDayIndex() {
  const jsDay = new Date().getDay()
  return DAY_JS.indexOf(jsDay)
}

export default function Schedule() {
  const { draft, setSchedule } = useCampaign()
  const navigate = useNavigate()
  const init = draft.schedule || {}

  const [frequency, setFrequency] = useState(init.frequency || 'Once')
  const [date, setDate] = useState(init.date || todayStr())
  const [time, setTime] = useState(init.time || nowTimeStr())
  const [selectedDays, setSelectedDays] = useState(init.days || [currentDayIndex()])

  const dateRef = useRef(null)
  const timeRef = useRef(null)
  const fpDateRef = useRef(null)
  const fpTimeRef = useRef(null)

  useEffect(() => {
    fpDateRef.current = flatpickr(dateRef.current, {
      dateFormat: 'Y-m-d',
      defaultDate: date,
      minDate: 'today',
      onChange: ([d]) => {
        if (!d) return
        const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        setDate(str)
        // If today, enforce minTime
        const isToday = str === todayStr()
        fpTimeRef.current?.set('minTime', isToday ? nowTimeStr() : '00:00')
      },
    })
    fpTimeRef.current = flatpickr(timeRef.current, {
      enableTime: true,
      noCalendar: true,
      dateFormat: 'H:i',
      defaultDate: time,
      minTime: date === todayStr() ? nowTimeStr() : '00:00',
      time_24hr: true,
      onChange: ([d]) => {
        if (!d) return
        setTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`)
      },
    })
    return () => {
      fpDateRef.current?.destroy()
      fpTimeRef.current?.destroy()
    }
  }, [])

  function toggleDay(i) {
    setSelectedDays(prev => prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i])
  }

  function handleNext() {
    setSchedule({ frequency, date, time, days: selectedDays })
    navigate('/review')
  }

  const sortedDays = [...selectedDays].sort((a, b) => a - b).map(i => DAYS[i])
  const showDays = ['Daily', 'Weekly'].includes(frequency)

  const preview = date && time
    ? `Campaign will ${frequency === 'Once' ? 'send once' : `repeat ${frequency.toLowerCase()}`} on ${new Date(date + 'T' + time).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} at ${new Date('1970-01-01T' + time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}${showDays && sortedDays.length ? ` on ${sortedDays.join(', ')}` : ''}.`
    : null

  return (
    <Layout>
      <div className="page-shell">
        <section className="hero">
          <div className="hero-header">
            <h1>Schedule</h1>
            <Link to="/message" className="back-button">Back</Link>
          </div>
        </section>

        <section className="panel">
          <StepBar current={4} />

          <div className="form-grid">
            <div className="field">
              <label>Frequency</label>
              <select value={frequency} onChange={e => setFrequency(e.target.value)}>
                {FREQS.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>

            <div className="field">
              <label>Date</label>
              <input ref={dateRef} type="text" placeholder="Pick a date" readOnly style={{ cursor: 'pointer' }} />
            </div>

            <div className="field">
              <label>Time</label>
              <input ref={timeRef} type="text" placeholder="Pick a time" readOnly style={{ cursor: 'pointer' }} />
            </div>

            {showDays && (
              <div className="field full-width">
                <label>Days</label>
                <div className="day-toggles">
                  {DAYS.map((d, i) => (
                    <button
                      key={d}
                      type="button"
                      className={`day-btn ${selectedDays.includes(i) ? 'selected' : ''}`}
                      onClick={() => toggleDay(i)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {preview && (
            <div className="schedule-preview">
              <p>{preview}</p>
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
