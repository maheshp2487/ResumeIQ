import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import AtsChecker from './pages/AtsChecker'
import ResumeAnalyzer from './pages/ResumeAnalyzer'
import JdMatch from './pages/JdMatch'
import Builder from './pages/Builder'

export default function App() {
  useEffect(() => {
    document.title = 'ResumeIQ'
  }, [])

  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<Landing />} />

      {/* Main App routes inside AppLayout */}
      <Route element={<AppLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="ats-checker" element={<AtsChecker />} />
        <Route path="resume-analyzer" element={<ResumeAnalyzer />} />
        <Route path="jd-match" element={<JdMatch />} />
        <Route path="builder" element={<Builder />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}