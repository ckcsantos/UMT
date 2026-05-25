const STEPS = ['Details', 'Audience', 'Message', 'Schedule', 'Review']
const ROUTES = [
  '/campaign-creation',
  '/audience-builder',
  '/message',
  '/schedule',
  '/review',
]

export default function StepBar({ current }) {
  return (
    <div className="steps">
      {STEPS.map((label, i) => {
        const num = i + 1
        const isDone = num < current
        const isActive = num === current

        return (
          <div
            key={label}
            className={`step ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
          >
            <div
              className="step-indicator"
              onClick={() => { if (isDone) window.location.href = ROUTES[i] }}
              title={isDone ? `Back to ${label}` : label}
            >
              {isDone ? '✓' : num}
            </div>
            <div>{label}</div>
          </div>
        )
      })}
    </div>
  )
}
