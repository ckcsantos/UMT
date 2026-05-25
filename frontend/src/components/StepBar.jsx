const STEPS = ['Details', 'Audience', 'Message', 'Schedule', 'Review']

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
            <div className="step-indicator">
              {isDone ? '✓' : num}
            </div>
            <div>{label}</div>
          </div>
        )
      })}
    </div>
  )
}
