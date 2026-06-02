import { createContext, useContext, useState } from 'react'

const CampaignContext = createContext(null)
const STORAGE_KEY = 'umt_campaign_draft'

const EMPTY = {
  details: null,
  audience: null,
  message: null,
  schedule: null,
}

function load() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : EMPTY
  } catch {
    return EMPTY
  }
}

function save(draft) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  } catch {}
}

export function CampaignProvider({ children }) {
  const [draft, setDraftState] = useState(load)

  function setDraft(updater) {
    setDraftState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      save(next)
      return next
    })
  }

  function setDetails(v) { setDraft(d => ({ ...d, details: v })) }
  function setAudience(v) { setDraft(d => ({ ...d, audience: v })) }
  function setMessage(v) { setDraft(d => ({ ...d, message: v })) }
  function setSchedule(v) { setDraft(d => ({ ...d, schedule: v })) }
  function resetDraft() {
    sessionStorage.removeItem(STORAGE_KEY)
    setDraftState(EMPTY)
  }

  return (
    <CampaignContext.Provider value={{ draft, setDetails, setAudience, setMessage, setSchedule, resetDraft }}>
      {children}
    </CampaignContext.Provider>
  )
}

export function useCampaign() {
  return useContext(CampaignContext)
}
