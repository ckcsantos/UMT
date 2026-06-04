import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()

  const allFilled = !!draft.details && !!draft.audience && !!draft.message && !!draft.schedule
  const completed = [
    !!draft.details,
    !!draft.audience,
    !!draft.message,
    !!draft.schedule,
    allFilled,
  ]

  return (
    <div className="steps">
      {STEPS.map((label, i) => {
        const num = i + 1
        const isActive = num === current
        const isDone = !isActive && completed[i]

        return (
          <div
            key={label}
            className={`step ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
          >
            <div
              className="step-indicator"
              onClick={() => { if (isDone) navigate(ROUTES[i]) }}
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
