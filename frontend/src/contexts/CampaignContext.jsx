import { createContext, useContext, useState } from 'react'

const CampaignContext = createContext(null)

const EMPTY = {
  details: null,   // { name, description, type, squad }
  audience: null,  // { brands, estimatedCount, filters, groups }
  message: null,   // { messageType, channel, body }
  schedule: null,  // { frequency, date, time, days }
}

export function CampaignProvider({ children }) {
  const [draft, setDraft] = useState(EMPTY)

  function setDetails(v) { setDraft(d => ({ ...d, details: v })) }
  function setAudience(v) { setDraft(d => ({ ...d, audience: v })) }
  function setMessage(v) { setDraft(d => ({ ...d, message: v })) }
  function setSchedule(v) { setDraft(d => ({ ...d, schedule: v })) }
  function resetDraft() { setDraft(EMPTY) }

  return (
    <CampaignContext.Provider value={{ draft, setDetails, setAudience, setMessage, setSchedule, resetDraft }}>
      {children}
    </CampaignContext.Provider>
  )
}

export function useCampaign() {
  return useContext(CampaignContext)
}
