import { useCampaign } from '../contexts/CampaignContext'

const STEPS = ['Details', 'Audience', 'Message', 'Schedule', 'Review']
const ROUTES = [
  '/campaign-creation',
  '/audience-builder',
  '/message',
  '/schedule',
  '/review',
]

export default function StepBar({ current }) {
  const { draft } = useCampaign()

  // A step is "done" if its data exists in the draft, regardless of current page
  const allFilled = !!draft.details && !!draft.audience && !!draft.message && !!draft.schedule
  const completed = [
    !!draft.details,
    !!draft.audience,
    !!draft.message,
    !!draft.schedule,
    allFilled, // Review is reachable once all steps are filled
  ]

  return (
    <div className="steps">
      {STEPS.map((label, i) => {
        const num = i + 1
        const isActive = num === current
        const isDone = !isActive && completed[i] // completed but not the current step

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
