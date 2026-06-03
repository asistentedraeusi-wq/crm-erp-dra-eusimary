import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import DashboardPage from '../pages/DashboardPage'
import PipelinePage from '../pages/PipelinePage'
import HistoriaClinicaPage from '../pages/HistoriaClinicaPage'
import PlaceholderPage from '../pages/PlaceholderPage'

export default function MainLayout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      <Sidebar />
      <main className="flex-1 overflow-hidden bg-[#F8FAFB]" style={{ borderLeft: '1px solid rgba(0,0,0,0.07)' }}>
        <Routes>
          <Route path="dashboard"              element={<DashboardPage />} />
          <Route path="pipeline"               element={<PipelinePage />} />
          <Route path="historia-clinica/:id"   element={<HistoriaClinicaPage />} />
          <Route path="historia-clinica"       element={<Navigate to="historia-clinica/nueva" replace />} />
          <Route path="citas"                  element={<Navigate to="/blueprints" replace />} />
          <Route path="blueprints"             element={<HistoriaClinicaPage />} />
          <Route path="seguimientos"           element={<PlaceholderPage title="Seguimientos" />} />
          <Route path="leads"                  element={<PlaceholderPage title="Base de Leads" />} />
          <Route path="chat"                   element={<PlaceholderPage title="Chat & Redes Sociales" />} />
          <Route path="config"                 element={<PlaceholderPage title="Configuración" />} />
          <Route path="*"                      element={<Navigate to="dashboard" replace />} />
        </Routes>
      </main>
    </div>
  )
}
