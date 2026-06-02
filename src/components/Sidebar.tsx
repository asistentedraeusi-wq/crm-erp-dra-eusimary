import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Kanban,
  CalendarDays,
  ClipboardList,
  Activity,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  ChevronRight,
  Stethoscope,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'KPIs' },
  { to: '/pipeline',     icon: Kanban,          label: 'Pipeline' },
  { to: '/citas',        icon: CalendarDays,    label: 'Citas' },
  { to: '/blueprints',   icon: ClipboardList,   label: 'Blueprints' },
  { to: '/seguimientos', icon: Activity,        label: 'Seguimientos' },
  { to: '/leads',        icon: Users,           label: 'Leads' },
  { to: '/chat',         icon: MessageSquare,   label: 'Chat' },
  { to: '/config',       icon: Settings,        label: 'Configuración' },
]

function Clock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const timeStr = now.toLocaleTimeString('es-CO', {
    timeZone: 'America/Bogota',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })

  const dateStr = now.toLocaleDateString('es-CO', {
    timeZone: 'America/Bogota',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="text-center px-2">
      <p className="text-white text-base font-semibold tabular-nums tracking-wide">
        {timeStr}
      </p>
      <p className="text-white/40 text-[10px] capitalize mt-0.5 leading-tight">
        {dateStr}
      </p>
    </div>
  )
}

export default function Sidebar() {
  const navigate = useNavigate()

  function handleLogout() {
    navigate('/login')
  }

  return (
    <aside className="flex flex-col h-screen w-[240px] min-w-[240px] bg-[#3A3A3A] select-none" style={{ paddingLeft: '10px' }}>

      {/* Encabezado — logo + título */}
      <div className="flex-shrink-0 pr-4" style={{ paddingTop: '36px', paddingLeft: '6px' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(18,196,154,0.15)', border: '1px solid rgba(18,196,154,0.30)' }}>
            <Stethoscope size={17} className="text-[#12C49A] icon-heartbeat" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] text-white/30 font-bold uppercase tracking-[0.18em] leading-none mb-1">CRM · ERP</p>
            <p className="text-[13px] font-bold truncate leading-tight text-[#12C49A]">Dra. Eusi Contreras</p>
          </div>
        </div>
        <div className="h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.12), transparent)' }} />
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto pr-3 pb-4 flex flex-col gap-1" style={{ paddingTop: '24px' }}>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl text-[13px] font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-[#12C49A]/18 text-[#12C49A]'
                  : 'text-white/55 hover:bg-white/8 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={16}
                  className={`flex-shrink-0 transition-colors ${isActive ? 'text-[#12C49A]' : 'text-white/45 group-hover:text-white/80'}`}
                />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight size={13} className="text-[#12C49A]/60" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Sección inferior */}
      <div className="flex-shrink-0 border-t border-white/10">

        {/* Reloj */}
        <div className="pr-4 pt-5 pb-3" style={{ paddingLeft: '6px' }}>
          <Clock />
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-3 pr-4 py-3 border-t border-white/8" style={{ paddingLeft: '6px' }}>
          <div className="w-9 h-9 rounded-full bg-[#12C49A]/20 border border-[#12C49A]/40 flex items-center justify-center flex-shrink-0">
            <span className="text-[#12C49A] text-[13px] font-bold">CS</span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-[13px] font-semibold truncate leading-tight">Carlos Suárez</p>
            <p className="text-white/40 text-[11px] truncate mt-0.5">Superadmin</p>
          </div>
          <div className="ml-auto w-2 h-2 rounded-full bg-[#12C49A] flex-shrink-0" title="Sesión activa" />
        </div>

        {/* Cerrar sesión */}
        <div className="pr-3 pt-4 border-t border-white/8" style={{ paddingLeft: '2px', paddingBottom: '48px' }}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-[13px] font-medium text-white/45 hover:bg-red-500/12 hover:text-red-400 transition-all duration-150 group"
          >
            <LogOut size={16} className="flex-shrink-0 transition-colors group-hover:text-red-400" />
            <span>Cerrar sesión</span>
          </button>
        </div>

      </div>
    </aside>
  )
}
