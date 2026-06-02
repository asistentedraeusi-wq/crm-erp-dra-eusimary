import { useState, useRef } from 'react'
import {
  X, Plus, Search, Phone, Mail, ChevronRight,
  User, FileText, Paperclip,
  Clock, Activity, CreditCard, Stethoscope,
  MoreHorizontal, Calendar, MapPin, Edit2, ArrowRight,
} from 'lucide-react'
import { useLeads, type Lead, type StageId } from '../context/LeadsContext'

// ─── Stages config ───────────────────────────────────────────────────────────

const STAGES: { id: StageId; label: string; short: string; color: string; bg: string }[] = [
  { id: 'nuevo',            label: '01 · Nuevo Lead',            short: 'Nuevo',        color: '#3B82F6', bg: '#EFF6FF' },
  { id: 'contactado',       label: '02 · Contactado',            short: 'Contactado',   color: '#6366F1', bg: '#EEF2FF' },
  { id: 'cita_agendada',    label: '03 · Cita Agendada',         short: 'Cita Agend.',  color: '#0891B2', bg: '#ECFEFF' },
  { id: 'cita_blueprint',   label: '04 · Cita BluePrint',        short: 'BluePrint',    color: '#12C49A', bg: '#F0FDF9' },
  { id: 'paraclínicos',     label: '05 · Paraclínicos',          short: 'Paraclín.',    color: '#D97706', bg: '#FFFBEB' },
  { id: 'segunda_cita',     label: '06 · 2da Cita Médica',       short: '2da Cita',     color: '#EA580C', bg: '#FFF7ED' },
  { id: 'pendiente_inicio', label: '07 · Pendiente Inicio',      short: 'Pend. Inicio', color: '#CA8A04', bg: '#FEFCE8' },
  { id: 'activo',           label: '08 · Paciente Activo',       short: 'Activo',       color: '#16A34A', bg: '#F0FDF4' },
  { id: 'renovacion',       label: '09 · Renovación / Referido', short: 'Renovación',   color: '#0D2244', bg: '#F0F4FF' },
  { id: 'no_renueva',       label: '10 · No Renueva',            short: 'No Renueva',   color: '#6B7280', bg: '#F9FAFB' },
]

// ─── TagBadge ─────────────────────────────────────────────────────────────────

function TagBadge({ tag }: { tag: string }) {
  const map: Record<string, string> = {
    S1:               'bg-violet-100 text-violet-700',
    S2:               'bg-blue-100 text-blue-700',
    VIP:              'bg-amber-100 text-amber-700',
    Urgente:          'bg-red-100 text-red-600',
    Referido:         'bg-emerald-100 text-emerald-700',
    'S1→S2':          'bg-teal-100 text-teal-700',
    Instagram:        'bg-pink-100 text-pink-600',
    WhatsApp:         'bg-green-100 text-green-700',
    Facebook:         'bg-blue-100 text-blue-600',
    'No contactable': 'bg-gray-100 text-gray-500',
  }
  return (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none ${map[tag] ?? 'bg-gray-100 text-gray-500'}`}>
      {tag}
    </span>
  )
}

// ─── Lead Card ────────────────────────────────────────────────────────────────

function LeadCard({
  lead, stage, onClick, onDragStart, onDragEnd, isDragging,
}: {
  lead: Lead
  stage: typeof STAGES[0]
  onClick: () => void
  onDragStart: () => void
  onDragEnd: () => void
  isDragging: boolean
}) {
  const initials = lead.name.split(' ').slice(0, 2).map(w => w[0]).join('')
  const didDrag = useRef(false)

  return (
    <div
      draggable
      onDragStart={e => {
        e.dataTransfer.setData('text/plain', lead.id)
        e.dataTransfer.effectAllowed = 'move'
        didDrag.current = true
        onDragStart()
      }}
      onDragEnd={() => {
        onDragEnd()
        requestAnimationFrame(() => { didDrag.current = false })
      }}
      onClick={() => { if (!didDrag.current) onClick() }}
      className={`bg-white rounded-xl border border-gray-100 p-3.5 cursor-grab active:cursor-grabbing
                  hover:border-gray-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.09)] hover:-translate-y-0.5
                  transition-all duration-150 group select-none
                  ${isDragging ? 'opacity-40 scale-[0.97] shadow-none border-dashed' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
            style={{ background: stage.color + '18', color: stage.color }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-[#0D2244] truncate leading-tight">{lead.name}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{lead.age} años · {lead.city}</p>
          </div>
        </div>
        <MoreHorizontal size={13} className="text-gray-300 group-hover:text-gray-500 flex-shrink-0 mt-0.5 transition-colors" />
      </div>

      {/* Tags */}
      {lead.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {lead.tags.map(t => <TagBadge key={t} tag={t} />)}
        </div>
      )}

      {/* Phone */}
      <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
        <Phone size={9} className="flex-shrink-0" />
        <span className="truncate">{lead.phone}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-50">
        <span className="text-[9px] text-gray-300">{lead.date}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={e => e.stopPropagation()}
            className="w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: stage.color + '18', color: stage.color }}
            title={lead.phone}
          >
            <Phone size={8} />
          </button>
          <button
            onClick={e => e.stopPropagation()}
            className="w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: stage.color + '18', color: stage.color }}
            title={lead.email}
          >
            <Mail size={8} />
          </button>
        </div>
        <ChevronRight size={11} className="text-gray-300 group-hover:text-[#12C49A] transition-colors" />
      </div>
    </div>
  )
}

// ─── Kanban Column ────────────────────────────────────────────────────────────

function KanbanColumn({
  stage, leads, onCardClick, onAddLead, onDropLead, draggingId,
}: {
  stage: typeof STAGES[0]
  leads: Lead[]
  onCardClick: (lead: Lead) => void
  onAddLead: (stageId: StageId) => void
  onDropLead: (leadId: string, stageId: StageId) => void
  draggingId: string | null
}) {
  const [isOver, setIsOver] = useState(false)

  return (
    <div
      className="flex flex-col w-[220px] min-w-[220px] h-full bg-white rounded-2xl border overflow-hidden transition-all duration-150"
      style={{
        borderColor: isOver ? stage.color + '60' : 'rgba(0,0,0,0.07)',
        boxShadow: isOver
          ? `0 0 0 2px ${stage.color}40, 0 4px 20px rgba(0,0,0,0.08)`
          : '0 1px 6px rgba(0,0,0,0.05)',
      }}
      onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setIsOver(true) }}
      onDragLeave={e => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsOver(false)
      }}
      onDrop={e => {
        e.preventDefault()
        setIsOver(false)
        const leadId = e.dataTransfer.getData('text/plain')
        if (leadId) onDropLead(leadId, stage.id)
      }}
    >
      {/* Accent stripe — se agranda al recibir drop */}
      <div
        className="flex-shrink-0 transition-all duration-150"
        style={{ height: isOver ? '5px' : '3px', background: stage.color }}
      />

      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2.5 flex-shrink-0">
        <span className="text-[10px] font-bold text-[#0D2244] truncate leading-tight pr-2">{stage.label}</span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center tabular-nums"
            style={{ background: stage.color + '18', color: stage.color }}
          >
            {leads.length}
          </span>
          <button
            onClick={() => onAddLead(stage.id)}
            className="w-5 h-5 rounded-full flex items-center justify-center hover:opacity-75 transition-opacity"
            style={{ background: stage.color + '18', color: stage.color }}
            title="Agregar lead"
          >
            <Plus size={10} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="h-px mx-3 bg-gray-50 flex-shrink-0" />

      {/* Cards */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 p-2.5 min-h-[40px]">
        {leads.length === 0 ? (
          <div
            className="flex items-center justify-center h-16 rounded-xl border-2 border-dashed text-[10px] transition-colors"
            style={{
              borderColor: isOver ? stage.color + '80' : stage.color + '35',
              color: isOver ? stage.color : '#D1D5DB',
              background: isOver ? stage.color + '06' : 'transparent',
            }}
            onClick={() => onAddLead(stage.id)}
          >
            {draggingId ? '↓ Soltar aquí' : '+ Agregar'}
          </div>
        ) : (
          leads.map(lead => (
            <LeadCard
              key={lead.id}
              lead={lead}
              stage={stage}
              onClick={() => onCardClick(lead)}
              onDragStart={() => {}}
              onDragEnd={() => {}}
              isDragging={draggingId === lead.id}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ─── Lead Panel — 8 tabs ──────────────────────────────────────────────────────

type TabId = 'perfil' | 'ivc' | 'historia' | 'soportes' | 'emails' | 'historial' | 'seguimiento' | 'pagos'

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'perfil',      label: 'Perfil',         icon: <User size={13} /> },
  { id: 'ivc',         label: 'IVC & Paciente', icon: <Stethoscope size={13} /> },
  { id: 'historia',    label: 'Hist. Clínica',  icon: <FileText size={13} /> },
  { id: 'soportes',    label: 'Soportes',       icon: <Paperclip size={13} /> },
  { id: 'emails',      label: 'Emails',         icon: <Mail size={13} /> },
  { id: 'historial',   label: 'Historial',      icon: <Clock size={13} /> },
  { id: 'seguimiento', label: 'Seg. Clínico',   icon: <Activity size={13} /> },
  { id: 'pagos',       label: 'Pagos & Plan',   icon: <CreditCard size={13} /> },
]

function TabPerfil({ lead, onMoveStage }: { lead: Lead; onMoveStage: (s: StageId) => void }) {
  const stage = STAGES.find(s => s.id === lead.stage)!
  return (
    <div className="flex flex-col" style={{ gap: '14px' }}>
      {/* Avatar + name */}
      <div
        className="flex items-center rounded-xl"
        style={{ background: stage.color + '0D', padding: '14px 16px', gap: '14px' }}
      >
        <div
          className="rounded-xl flex items-center justify-center font-bold flex-shrink-0"
          style={{ width: '52px', height: '52px', fontSize: '18px', background: stage.color + '20', color: stage.color }}
        >
          {lead.name.split(' ').slice(0, 2).map(w => w[0]).join('')}
        </div>
        <div>
          <h3 className="text-[#0D2244] font-bold leading-tight" style={{ fontSize: '17px' }}>{lead.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: stage.color + '18', color: stage.color }}
            >
              {stage.short}
            </span>
            {lead.plan && <TagBadge tag={lead.plan} />}
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2" style={{ gap: '8px' }}>
        {[
          { icon: <Phone size={12} />,      label: 'Teléfono', value: lead.phone },
          { icon: <Mail size={12} />,       label: 'Email',    value: lead.email },
          { icon: <User size={12} />,       label: 'Edad',     value: `${lead.age} años` },
          { icon: <MapPin size={12} />,     label: 'Ciudad',   value: lead.city },
          { icon: <Calendar size={12} />,   label: 'Ingreso',  value: lead.date },
          { icon: <ArrowRight size={12} />, label: 'Fuente',   value: lead.source ?? '—' },
        ].map(({ icon, label, value }) => (
          <div key={label} className="flex flex-col bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]" style={{ gap: '4px', padding: '10px 12px' }}>
            <div className="flex items-center gap-1.5 text-gray-400 text-[10px]">
              {icon}
              <span>{label}</span>
            </div>
            <p className="text-[#0D2244] text-xs font-semibold truncate">{value}</p>
          </div>
        ))}
      </div>

      {/* Tags */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Etiquetas</p>
        <div className="flex flex-wrap gap-1.5">
          {lead.tags.map(t => <TagBadge key={t} tag={t} />)}
        </div>
      </div>

      {/* Notes */}
      {lead.notes && (
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Notas</p>
          <p className="text-xs text-gray-600 bg-gray-50 rounded-xl p-3 leading-relaxed">{lead.notes}</p>
        </div>
      )}

      {/* Move stage */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Mover a etapa</p>
        <select
          className="w-full h-9 rounded-xl border border-gray-200 text-xs text-[#0D2244] px-3 bg-white focus:outline-none focus:border-[#12C49A] cursor-pointer"
          value={lead.stage}
          onChange={e => onMoveStage(e.target.value as StageId)}
        >
          {STAGES.map(s => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

function TabIVC() {
  const metrics = [
    { label: 'Motivación',        value: 80 },
    { label: 'Capacidad de pago', value: 65 },
    { label: 'Urgencia de salud', value: 90 },
    { label: 'Compromiso',        value: 70 },
  ]
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Índice de Valor del Cliente</p>
      {metrics.map(({ label, value }) => (
        <div key={label}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[#0D2244] font-medium">{label}</span>
            <span className="text-[#12C49A] font-bold">{value}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, background: '#12C49A' }} />
          </div>
        </div>
      ))}

      <div className="mt-2 p-4 rounded-xl" style={{ background: 'rgba(18,196,154,0.08)', border: '1px solid rgba(18,196,154,0.20)' }}>
        <p className="text-[10px] text-[#12C49A] font-bold uppercase tracking-widest mb-1">IVC Total</p>
        <p className="text-2xl font-bold text-[#0D2244]">76 <span className="text-sm font-normal text-gray-400">/ 100</span></p>
        <p className="text-[10px] text-gray-500 mt-1">Paciente de alto valor — priorizar atención</p>
      </div>

      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Tipo de Paciente</p>
        <div className="grid grid-cols-3 gap-2">
          {['Control Metabólico', 'Bienestar Integral', 'Referidor'].map((t, i) => (
            <button
              key={t}
              className="p-2 rounded-xl border text-[10px] font-semibold text-center transition-all"
              style={i === 0
                ? { borderColor: '#12C49A', background: 'rgba(18,196,154,0.10)', color: '#12C49A' }
                : { borderColor: '#E5E7EB', color: '#9CA3AF' }
              }
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function TabPlaceholder({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-gray-500">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">Pendiente de configuración</p>
      </div>
    </div>
  )
}

function TabHistorial() {
  const events = [
    { date: '2026-05-28', action: 'Lead creado desde Instagram',  type: 'create' },
    { date: '2026-05-29', action: 'Primer contacto por WhatsApp', type: 'contact' },
    { date: '2026-05-30', action: 'Cita agendada para 04 Jun',    type: 'cita' },
    { date: '2026-06-01', action: 'Formulario enviado por email', type: 'email' },
  ]
  const colors: Record<string, string> = { create: '#3B82F6', contact: '#12C49A', cita: '#D97706', email: '#6366F1' }
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Línea de tiempo</p>
      {events.map((e, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: colors[e.type] }} />
            {i < events.length - 1 && <div className="w-px flex-1 bg-gray-100 mt-1" />}
          </div>
          <div className="pb-4 min-w-0">
            <p className="text-xs text-[#0D2244] font-medium leading-snug">{e.action}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{e.date}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function TabPagos({ lead }: { lead: Lead }) {
  const plans = {
    S1: { name: 'Plan S1 — Control Metabólico', price: 500_000, period: 'Trimestral' },
    S2: { name: 'Plan S2 — Bienestar Integral',  price: 250_000, period: 'Trimestral' },
  }
  const plan = lead.plan ? plans[lead.plan] : null
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Consulta Filtro</p>
        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
          <span className="text-xs text-[#0D2244] font-medium">1ra Cita (Filtro)</span>
          <span className="text-xs font-bold text-[#0D2244]">$70.000 COP</span>
        </div>
      </div>

      {plan && (
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Plan Activo</p>
          <div className="p-4 bg-[#0D2244] rounded-xl text-white">
            <p className="text-xs font-bold">{plan.name}</p>
            <p className="text-2xl font-bold mt-2 tabular-nums">
              ${plan.price.toLocaleString('es-CO')}
              <span className="text-sm font-normal text-white/60 ml-1">COP</span>
            </p>
            <p className="text-[10px] text-white/50 mt-0.5">{plan.period}</p>
          </div>
        </div>
      )}

      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Estado de pago</p>
        <div className="flex flex-col gap-2">
          {[
            { label: 'Consulta filtro', amount: '$70.000', status: 'Pagado', ok: true },
            { label: plan ? plan.name : 'Plan', amount: plan ? `$${plan.price.toLocaleString('es-CO')}` : '—', status: lead.plan ? 'Pagado' : 'Pendiente', ok: !!lead.plan },
          ].map(({ label, amount, status, ok }) => (
            <div key={label} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
              <div>
                <p className="text-xs font-medium text-[#0D2244]">{label}</p>
                <p className="text-[10px] text-gray-400">{amount}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ok ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Lead Panel — flotante en el lado derecho ─────────────────────────────────

function LeadPanel({
  lead,
  onClose,
  onMoveStage,
}: {
  lead: Lead
  onClose: () => void
  onMoveStage: (id: string, stage: StageId) => void
}) {
  const [activeTab, setActiveTab] = useState<TabId>('perfil')
  const stage = STAGES.find(s => s.id === lead.stage)!

  const renderTab = () => {
    switch (activeTab) {
      case 'perfil':      return <TabPerfil lead={lead} onMoveStage={s => onMoveStage(lead.id, s)} />
      case 'ivc':         return <TabIVC />
      case 'historia':    return <TabPlaceholder label="Historia Clínica" icon={<FileText size={20} />} />
      case 'soportes':    return <TabPlaceholder label="Soportes / Adjuntos" icon={<Paperclip size={20} />} />
      case 'emails':      return <TabPlaceholder label="Emails" icon={<Mail size={20} />} />
      case 'historial':   return <TabHistorial />
      case 'seguimiento': return <TabPlaceholder label="Seguimiento Clínico" icon={<Activity size={20} />} />
      case 'pagos':       return <TabPagos lead={lead} />
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/25 z-40 backdrop-blur-[2px] backdrop-in"
        onClick={onClose}
      />

      {/* Floating card — centrado vertical y horizontalmente en el panel derecho */}
      <div
        className="fixed z-50"
        style={{
          top: '50%',
          left: '63%',
          transform: 'translate(-50%, -50%)',
          width: '700px',
          maxWidth: 'calc(100vw - 260px)',
          maxHeight: '90vh',
        }}
      >
        <div
          className="flex flex-col bg-white card-float-in"
          style={{
            borderRadius: '22px',
            boxShadow: '0 28px 72px rgba(0,0,0,0.20), 0 0 0 1px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            maxHeight: '90vh',
          }}
        >
          {/* Panel header */}
          <div
            className="flex items-center justify-between border-b border-gray-100 flex-shrink-0"
            style={{ padding: '14px 24px' }}
          >
            <div className="flex items-center min-w-0" style={{ gap: '10px' }}>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: stage.color }} />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{stage.label}</span>
              {/* Número de lead */}
              <span
                className="font-bold flex-shrink-0"
                style={{
                  fontSize: '10px',
                  color: '#12C49A',
                  background: 'rgba(18,196,154,0.10)',
                  padding: '3px 8px',
                  borderRadius: '20px',
                  letterSpacing: '0.04em',
                }}
              >
                Lead No. {lead.id.replace('L', '').padStart(3, '0')}-{lead.date.substring(0, 4)}
              </span>
            </div>
            <div className="flex items-center flex-shrink-0" style={{ gap: '6px' }}>
              <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-[#0D2244] transition-colors">
                <Edit2 size={13} />
              </button>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-[#0D2244] transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Lead name bar */}
          <div className="border-b border-gray-50 flex-shrink-0" style={{ padding: '12px 24px' }}>
            <h2 className="text-[#0D2244] font-bold" style={{ fontSize: '17px' }}>{lead.name}</h2>
            <div className="flex items-center mt-0.5" style={{ gap: '8px' }}>
              <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{lead.age} años · {lead.city}</span>
              {lead.plan && <TagBadge tag={lead.plan} />}
            </div>
          </div>

          {/* Tabs */}
          <div
            className="border-b border-gray-100 flex-shrink-0"
            style={{ overflowX: 'auto', scrollbarWidth: 'none' }}
          >
            <div className="flex" style={{ justifyContent: 'center', minWidth: 'max-content', margin: '0 auto' }}>
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center whitespace-nowrap border-b-2 font-semibold transition-all duration-150 flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'border-[#12C49A] text-[#12C49A]'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                  style={{
                    fontSize: '11px',
                    paddingLeft: '14px',
                    paddingRight: '14px',
                    paddingTop: '11px',
                    paddingBottom: '11px',
                    gap: '5px',
                  }}
                >
                  <span className={activeTab === tab.id ? 'text-[#12C49A]' : 'text-gray-400'}>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto" style={{ padding: '18px 24px' }}>
            {renderTab()}
          </div>

          {/* Footer */}
          <div
            className="border-t border-gray-100 flex flex-shrink-0"
            style={{ padding: '14px 24px', gap: '10px' }}
          >
            <button className="flex-1 h-9 rounded-xl bg-[#12C49A] text-white text-xs font-bold hover:bg-[#0EA882] transition-colors shadow-[0_2px_10px_rgba(18,196,154,0.30)]">
              Guardar cambios
            </button>
            <button className="flex-1 h-9 rounded-xl border border-gray-200 text-[#0D2244] text-xs font-semibold hover:bg-gray-50 transition-colors">
              Registrar actividad
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Pipeline Page ─────────────────────────────────────────────────────────────

export default function PipelinePage() {
  const { leads, moveStage, addLead } = useLeads()
  const [search, setSearch] = useState('')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [filterStage, setFilterStage] = useState<StageId | 'all'>('all')
  const [draggingId, setDraggingId] = useState<string | null>(null)

  // Sincronizar el lead seleccionado con el estado global
  const syncedLead = selectedLead
    ? leads.find(l => l.id === selectedLead.id) ?? null
    : null

  const filtered = leads.filter(l => {
    const q = search.toLowerCase()
    const matchSearch = !search ||
      l.name.toLowerCase().includes(q) ||
      l.phone.includes(q) ||
      l.email.toLowerCase().includes(q)
    const matchStage = filterStage === 'all' || l.stage === filterStage
    return matchSearch && matchStage
  })

  const totalLeads     = leads.length
  const activePatients = leads.filter(l => l.stage === 'activo').length
  const renewals       = leads.filter(l => l.stage === 'renovacion').length

  function handleMoveStage(id: string, stage: StageId) {
    moveStage(id, stage)
  }

  function handleAddLead(stageId: StageId) {
    const newLead = addLead(stageId)
    setSelectedLead(newLead)
  }

  return (
    <div
      className="flex flex-col h-full bg-[#F8FAFB]"
      onDragEnd={() => setDraggingId(null)}
    >

      {/* ── Header ── */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100" style={{ padding: '28px 32px 20px' }}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[#0D2244] text-2xl font-bold tracking-tight">Pipeline Leads</h1>
            <div className="flex items-center gap-2 mt-2">
              {[
                { label: `${totalLeads} leads totales`, color: '#3B82F6' },
                { label: `${activePatients} activos`,    color: '#16A34A' },
                { label: `${renewals} en renovación`,    color: '#0D2244' },
              ].map(({ label, color }) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: color + '12', color }}
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 h-9 bg-white border border-gray-200 rounded-xl px-3 text-xs shadow-sm w-52">
              <Search size={13} className="flex-shrink-0 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar lead..."
                className="bg-transparent flex-1 outline-none placeholder-gray-400 text-[#0D2244]"
              />
            </div>

            <select
              value={filterStage}
              onChange={e => setFilterStage(e.target.value as StageId | 'all')}
              className="h-9 rounded-xl border border-gray-200 text-xs text-[#0D2244] px-3 bg-white focus:outline-none focus:border-[#12C49A] cursor-pointer shadow-sm"
            >
              <option value="all">Todas las etapas</option>
              {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>

            <button
              onClick={() => handleAddLead('nuevo')}
              className="h-9 px-4 rounded-xl bg-[#12C49A] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#0EA882] transition-colors shadow-[0_2px_10px_rgba(18,196,154,0.30)]"
            >
              <Plus size={14} strokeWidth={2.5} />
              Nuevo Lead
            </button>
          </div>
        </div>

        {/* Stage filter pills */}
        <div className="flex gap-1.5 mt-4 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setFilterStage('all')}
            className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all flex-shrink-0 ${
              filterStage === 'all' ? 'bg-[#0D2244] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            Todo ({leads.length})
          </button>
          {STAGES.map(s => {
            const count = leads.filter(l => l.stage === s.id).length
            const isActive = filterStage === s.id
            return (
              <button
                key={s.id}
                onClick={() => setFilterStage(s.id === filterStage ? 'all' : s.id)}
                className="px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all flex-shrink-0"
                style={{
                  background: isActive ? s.color : s.color + '15',
                  color: isActive ? 'white' : s.color,
                }}
              >
                {s.short} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Kanban board ── */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 h-full" style={{ minWidth: 'max-content', padding: '20px 32px' }}>
          {STAGES.map(stage => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              leads={filtered.filter(l => l.stage === stage.id)}
              onCardClick={lead => setSelectedLead(lead)}
              onAddLead={handleAddLead}
              onDropLead={(id, s) => { handleMoveStage(id, s); setDraggingId(null) }}
              draggingId={draggingId}
            />
          ))}
        </div>
      </div>

      {/* ── Lead panel ── */}
      {syncedLead && (
        <LeadPanel
          lead={syncedLead}
          onClose={() => setSelectedLead(null)}
          onMoveStage={handleMoveStage}
        />
      )}
    </div>
  )
}
