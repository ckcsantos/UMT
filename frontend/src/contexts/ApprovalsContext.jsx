import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'

const ApprovalsContext = createContext(null)

export function ApprovalsProvider({ children }) {
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.getPendingCampaigns()
      setPending(data.campaigns)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  async function approve(id) {
    await api.approveCampaign(id)
    setPending(p => p.filter(c => c.id !== id))
  }

  async function reject(id) {
    await api.rejectCampaign(id)
    setPending(p => p.filter(c => c.id !== id))
  }

  return (
    <ApprovalsContext.Provider value={{ pending, loading, refresh, approve, reject }}>
      {children}
    </ApprovalsContext.Provider>
  )
}

export function useApprovals() {
  return useContext(ApprovalsContext)
}
