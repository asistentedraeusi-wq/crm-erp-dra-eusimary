import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import MainLayout from './layouts/MainLayout'
import { LeadsProvider } from './context/LeadsContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import type { ReactNode } from 'react'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { currentUser, loading } = useAuth()
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F8FAFB' }}>
        <svg style={{ animation: 'spin 1s linear infinite', width: '32px', height: '32px' }} fill="none" viewBox="0 0 24 24">
          <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
          <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="#12C49A" strokeWidth="4"/>
          <path style={{ opacity: 0.75 }} fill="#12C49A" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
        </svg>
      </div>
    )
  }
  if (!currentUser) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <LeadsProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </LeadsProvider>
    </AuthProvider>
  )
}
