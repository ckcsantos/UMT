import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CampaignProvider } from './contexts/CampaignContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Campaigns from './pages/Campaigns'
import CampaignCreation from './pages/CampaignCreation'
import AudienceBuilder from './pages/AudienceBuilder'
import Message from './pages/Message'
import Schedule from './pages/Schedule'
import Review from './pages/Review'

function Protected({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}

export default function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <CampaignProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="/campaigns" element={<Protected><Campaigns /></Protected>} />
            <Route path="/campaign-creation" element={<Protected><CampaignCreation /></Protected>} />
            <Route path="/audience-builder" element={<Protected><AudienceBuilder /></Protected>} />
            <Route path="/message" element={<Protected><Message /></Protected>} />
            <Route path="/schedule" element={<Protected><Schedule /></Protected>} />
            <Route path="/review" element={<Protected><Review /></Protected>} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </CampaignProvider>
    </AuthProvider>
    </ThemeProvider>
  )
}
