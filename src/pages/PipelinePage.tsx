import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X, Plus, Search, Phone, Mail, ChevronRight,
  User, FileText, Paperclip,
  Clock, Activity, CreditCard, Stethoscope,
  MoreHorizontal, Calendar, MapPin, Edit2, ArrowRight,
  Download, Database, CheckCircle2, AlertCircle, Loader2, Copy,
  ExternalLink, Trash2, FileCode,
} from 'lucide-react'
import { useLeads, type Lead, type StageId } from '../context/LeadsContext'
import { listarSoportes, eliminarSoporte, TIPO_LABELS, TIPO_COLORS, type Soporte } from '../lib/soportes'

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
      className={`bg-white rounded-xl border border-gray-100 cursor-grab active:cursor-grabbing
                  hover:border-gray-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.09)] hover:-translate-y-0.5
                  transition-all duration-150 group select-none
                  ${isDragging ? 'opacity-40 scale-[0.97] shadow-none border-dashed' : ''}`}
      style={{ padding: '14px 16px' }}
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
      <div className="relative flex items-center justify-center flex-shrink-0" style={{ padding: '14px 36px 14px 36px' }}>
        <div className="flex flex-col items-center" style={{ gap: '6px' }}>
          <span className="text-[11px] font-bold text-[#0D2244] leading-tight text-center">{stage.label}</span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums"
            style={{ background: stage.color + '18', color: stage.color }}
          >
            {leads.length} {leads.length === 1 ? 'lead' : 'leads'}
          </span>
        </div>
        <button
          onClick={() => onAddLead(stage.id)}
          className="absolute right-3 w-6 h-6 rounded-full flex items-center justify-center hover:opacity-75 transition-opacity"
          style={{ background: stage.color + '18', color: stage.color }}
          title="Agregar lead"
        >
          <Plus size={11} strokeWidth={2.5} />
        </button>
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

// Limpia y formatea el número para wa.me (Colombia +57 por defecto)
function toWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('57') && digits.length >= 11) return digits
  if (digits.length === 10 && digits.startsWith('3')) return '57' + digits
  return digits
}

// Ícono WhatsApp SVG (no está en Lucide)
function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

function TabPerfilActions({ lead }: { lead: Lead }) {
  const [copied, setCopied] = useState(false)

  function copyEmail() {
    navigator.clipboard.writeText(lead.email).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="flex" style={{ gap: '8px' }}>
      {/* WhatsApp Web */}
      <a
        href="https://web.whatsapp.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center rounded-lg font-semibold transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
        style={{ background: '#25D366', color: '#fff', gap: '6px', padding: '8px 12px', fontSize: '11px', textDecoration: 'none' }}
      >
        <WhatsAppIcon size={13} />
        WhatsApp Web
      </a>

      {/* Copiar email */}
      <button
        onClick={copyEmail}
        className="flex-1 flex items-center justify-center rounded-lg border border-gray-200 font-semibold transition-all duration-150 hover:bg-gray-50 active:scale-[0.97]"
        style={{ gap: '6px', padding: '8px 12px', fontSize: '11px', background: copied ? '#F0FDF9' : '#fff', borderColor: copied ? 'rgba(18,196,154,0.4)' : '#E5E7EB', color: copied ? '#12C49A' : '#374151' }}
      >
        {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
        {copied ? '¡Copiado!' : 'Copiar email'}
      </button>
    </div>
  )
}

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

      {/* Acciones rápidas — WhatsApp + Copiar email */}
      <TabPerfilActions lead={lead} />

      {/* Datos clínicos — Meta, Objetivo, Condición */}
      {(lead.meta || lead.objetivo || lead.condicion) && (
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Datos clínicos</p>
          <div className="flex flex-col" style={{ gap: '6px' }}>
            {[
              { label: 'Meta de salud',  value: lead.meta,      color: '#12C49A' },
              { label: 'Objetivo',       value: lead.objetivo,  color: '#0D2244' },
              { label: 'Condición',      value: lead.condicion, color: '#D97706' },
            ].filter(item => item.value).map(({ label, value, color }) => (
              <div
                key={label}
                className="flex items-start rounded-xl border border-gray-100 bg-white"
                style={{ padding: '10px 12px', gap: '10px' }}
              >
                <div
                  className="flex-shrink-0 rounded-md mt-0.5"
                  style={{ width: '6px', height: '6px', background: color, marginTop: '5px' }}
                />
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400">{label}</p>
                  <p className="text-xs font-semibold text-[#0D2244] mt-0.5 leading-snug">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {lead.tags.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Etiquetas</p>
          <div className="flex flex-wrap gap-1.5">
            {lead.tags.map(t => <TagBadge key={t} tag={t} />)}
          </div>
        </div>
      )}

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

function TabSoportes({ lead }: { lead: Lead }) {
  const [soportes, setSoportes]   = useState<Soporte[]>([])
  const [loading,  setLoading]    = useState(true)
  const [eliminando, setEliminando] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    listarSoportes(lead.id).then(({ data }) => {
      setSoportes(data ?? [])
      setLoading(false)
    })
  }, [lead.id])

  async function handleEliminar(s: Soporte) {
    if (!confirm(`¿Eliminar "${s.nombre}"?`)) return
    setEliminando(s.id)
    await eliminarSoporte(s.id, s.url)
    setSoportes(prev => prev.filter(x => x.id !== s.id))
    setEliminando(null)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-32 text-gray-400 text-sm gap-2">
      <Loader2 size={16} className="animate-spin" /> Cargando soportes...
    </div>
  )

  if (!soportes.length) return (
    <div className="flex flex-col items-center justify-center h-40 gap-3 text-center">
      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
        <Paperclip size={18} className="text-gray-400" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-500">Sin documentos</p>
        <p className="text-xs text-gray-400 mt-0.5">Los PDF generados aparecerán aquí automáticamente</p>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
        {soportes.length} documento{soportes.length !== 1 ? 's' : ''}
      </p>
      {soportes.map(s => {
        const color  = TIPO_COLORS[s.tipo] ?? '#6B7280'
        const label  = TIPO_LABELS[s.tipo]  ?? 'Documento'
        const fecha  = new Date(s.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
        return (
          <div key={s.id} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: '#F9FAFB', borderRadius: '10px',
            padding: '10px 12px', border: '1px solid #E5E7EB',
          }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0,
              background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FileCode size={16} style={{ color }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {s.nombre}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span style={{
                  fontSize: '10px', fontWeight: 700, color, background: color + '18',
                  borderRadius: '5px', padding: '1px 6px',
                }}>
                  {label}
                </span>
                <span style={{ fontSize: '10px', color: '#9CA3AF' }}>{fecha}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
              <a
                href={s.url} target="_blank" rel="noopener noreferrer"
                style={{
                  width: '28px', height: '28px', borderRadius: '7px',
                  background: color + '18', border: 'none', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  textDecoration: 'none',
                }}
                title="Abrir documento"
              >
                <ExternalLink size={13} style={{ color }} />
              </a>
              <button
                onClick={() => handleEliminar(s)}
                disabled={eliminando === s.id}
                style={{
                  width: '28px', height: '28px', borderRadius: '7px',
                  background: '#FEF2F2', border: 'none', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}
                title="Eliminar"
              >
                {eliminando === s.id
                  ? <Loader2 size={13} className="animate-spin text-red-400" />
                  : <Trash2 size={13} style={{ color: '#EF4444' }} />
                }
              </button>
            </div>
          </div>
        )
      })}
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

function TabHistoriaClinica({ lead }: { lead: Lead }) {
  const navigate = useNavigate()

  // Divide el nombre en nombres/apellidos (primer espacio = split)
  const partes      = lead.name.trim().split(' ')
  const nombres     = partes.slice(0, Math.ceil(partes.length / 2)).join(' ')
  const apellidos   = partes.slice(Math.ceil(partes.length / 2)).join(' ')

  function abrirFormulario() {
    navigate('/blueprints', {
      state: {
        leadId: lead.id,
        leadPrefill: {
          nombres,
          apellidos,
          telefono:  lead.phone,
          email:     lead.email,
          edad:      String(lead.age),
          ciudad:    lead.city,
          meta:      lead.meta      ?? '',
          objetivo:  lead.objetivo  ?? '',
          condicion: lead.condicion ?? '',
          fecha_consulta: new Date().toISOString().split('T')[0],
        },
      },
    })
  }

  return (
    <div className="flex flex-col items-center justify-center h-48 gap-4 text-center">
      <div className="w-12 h-12 rounded-2xl bg-[#E6FAF5] flex items-center justify-center">
        <FileText size={20} className="text-[#12C49A]" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-600">Historia Clínica BluePrint</p>
        <p className="text-xs text-gray-400 mt-0.5">Crear el documento clínico para este paciente</p>
      </div>
      <button
        onClick={abrirFormulario}
        style={{
          background: '#12C49A', color: '#fff', border: 'none',
          borderRadius: '10px', padding: '10px 24px',
          fontSize: '13px', fontWeight: '700', cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(18,196,154,0.35)',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}
      >
        <FileText size={14} /> Nueva Historia Clínica
      </button>
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
      case 'historia':    return <TabHistoriaClinica lead={lead} />
      case 'soportes':    return <TabSoportes lead={lead} />
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
          width: '860px',
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
            <div className="flex items-stretch" style={{ minWidth: '100%' }}>
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center whitespace-nowrap border-b-2 font-semibold transition-all duration-150 flex-1 ${
                    activeTab === tab.id
                      ? 'border-[#12C49A] text-[#12C49A]'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                  style={{
                    fontSize: '11px',
                    paddingTop: '11px',
                    paddingBottom: '11px',
                    gap: '4px',
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

// ─── Import Modal ─────────────────────────────────────────────────────────────

import { isSupabaseConfigured } from '../lib/supabase'
import { fetchLeadsFromSupabase } from '../lib/importLeads'

type ImportStatus = 'idle' | 'loading' | 'success' | 'error'

function ImportLeadsModal({ onClose }: { onClose: () => void }) {
  const { leads, importLeads } = useLeads()
  const [status,        setStatus]        = useState<ImportStatus>('idle')
  const [importedCount, setImportedCount] = useState(0)
  const [skippedCount,  setSkippedCount]  = useState(0)
  const [errorMsg,      setErrorMsg]      = useState('')

  async function handleImport() {
    setStatus('loading')
    try {
      const result = await fetchLeadsFromSupabase(leads)
      if (result.imported.length > 0) {
        importLeads(result.imported)
      }
      setImportedCount(result.imported.length)
      setSkippedCount(result.skipped)
      setStatus('success')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error desconocido')
      setStatus('error')
    }
  }

  const configured = isSupabaseConfigured

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-[2px] backdrop-in" onClick={onClose} />
      {/* Wrapper de posición — SIN animación para que translate(-50%,-50%) no sea sobreescrito */}
      <div
        className="fixed z-50"
        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '420px', maxWidth: 'calc(100vw - 48px)', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Contenedor animado — separado del wrapper de posición */}
        <div
          className="card-float-in flex flex-col bg-white"
          style={{ borderRadius: '20px', boxShadow: '0 24px 64px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)', overflow: 'hidden', flex: 1, minHeight: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100" style={{ padding: '16px 20px' }}>
            <div className="flex items-center" style={{ gap: '10px' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(13,34,68,0.08)' }}>
                <Database size={15} className="text-[#0D2244]" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#0D2244]">Importar Leads</p>
                <p className="text-[10px] text-gray-400">Sincronizar desde Supabase → columna 01 · Nuevo Lead</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-[#0D2244] transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Body — scrollable, min-height:0 necesario para que flex respete maxHeight */}
          <div className="overflow-y-auto" style={{ padding: '16px 20px', flex: 1, minHeight: 0 }}>

            {/* Fuente de datos */}
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Fuente de datos</p>
            <div
              className="flex items-center rounded-xl border"
              style={{
                padding: '12px 14px', gap: '12px',
                borderColor: configured ? '#12C49A40' : '#FDE68A',
                background:  configured ? 'rgba(18,196,154,0.04)' : '#FFFBEB',
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: configured ? '#12C49A15' : '#FEF3C7' }}
              >
                <Database size={15} style={{ color: configured ? '#12C49A' : '#D97706' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-[#0D2244]">Supabase — PostgreSQL</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Tabla: <span className="font-mono bg-gray-100 px-1 rounded">leads</span> · America/Bogota
                </p>
              </div>
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                style={configured
                  ? { background: 'rgba(18,196,154,0.12)', color: '#12C49A' }
                  : { background: '#FEF3C7', color: '#D97706' }
                }
              >
                {configured ? '● Conectado' : '● Pendiente'}
              </span>
            </div>

            {/* Regla de numeración */}
            <div className="flex items-center rounded-xl bg-gray-50 mt-3" style={{ padding: '10px 14px', gap: '8px' }}>
              <span className="text-[10px] font-bold text-[#12C49A] flex-shrink-0">Lead No.</span>
              <p className="text-[10px] text-gray-500">
                Cada lead importado recibe un código asignado automáticamente:
                <span className="font-mono font-bold text-[#0D2244] ml-1">
                  {String(leads.length + 1).padStart(3, '0')}-{new Date().getFullYear()} →
                  {String(leads.length + 2).padStart(3, '0')}-{new Date().getFullYear()} …
                </span>
              </p>
            </div>

            {/* Sin credenciales configuradas */}
            {!configured && (
              <div
                className="flex items-start rounded-xl mt-4"
                style={{ padding: '12px 14px', gap: '10px', background: '#FFFBEB', border: '1px solid #FDE68A' }}
              >
                <AlertCircle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold text-amber-700">Supabase no configurado</p>
                  <p className="text-[10px] text-amber-600 mt-1 leading-relaxed">
                    Copia <span className="font-mono bg-amber-100 px-1 rounded">.env.example</span> como{' '}
                    <span className="font-mono bg-amber-100 px-1 rounded">.env</span> y completa{' '}
                    <span className="font-mono bg-amber-100 px-1 rounded">VITE_SUPABASE_URL</span> y{' '}
                    <span className="font-mono bg-amber-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</span>{' '}
                    con las credenciales del proyecto en Supabase.
                  </p>
                </div>
              </div>
            )}

            {/* Estados idle / loading / success / error */}
            {configured && status === 'idle' && (
              <div className="flex items-start rounded-xl bg-gray-50 mt-4" style={{ padding: '12px 14px', gap: '10px' }}>
                <AlertCircle size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Se sincronizarán todos los leads de la tabla <span className="font-mono">leads</span>.
                  Los ya existentes (mismo email o teléfono) no se duplicarán.
                  Los nuevos entrarán en <strong>01 · Nuevo Lead</strong>.
                </p>
              </div>
            )}

            {status === 'loading' && (
              <div className="flex items-center justify-center rounded-xl bg-gray-50 mt-4" style={{ padding: '22px', gap: '10px' }}>
                <Loader2 size={16} className="text-[#12C49A] animate-spin" />
                <p className="text-[11px] text-[#12C49A] font-semibold">Conectando con Supabase...</p>
              </div>
            )}

            {status === 'success' && (
              <div
                className="flex items-start rounded-xl mt-4"
                style={{ padding: '14px', gap: '10px', background: 'rgba(18,196,154,0.07)', border: '1px solid rgba(18,196,154,0.25)' }}
              >
                <CheckCircle2 size={15} className="text-[#12C49A] flex-shrink-0 mt-0.5" />
                <div style={{ gap: '6px' }} className="flex flex-col">
                  <p className="text-[12px] font-bold text-[#0D2244]">Importación completada</p>
                  {importedCount > 0 ? (
                    <p className="text-[11px] text-gray-600">
                      <span className="font-bold text-[#12C49A]">{importedCount} leads nuevos</span> agregados a la columna
                      <strong> 01 · Nuevo Lead</strong> con código Lead No. asignado.
                      {skippedCount > 0 && <span className="text-gray-400"> · {skippedCount} omitidos (ya existían).</span>}
                    </p>
                  ) : (
                    <p className="text-[11px] text-gray-500">
                      El tablero ya está al día.
                      {skippedCount > 0 && ` ${skippedCount} leads ya existían en el sistema.`}
                    </p>
                  )}
                </div>
              </div>
            )}

            {status === 'error' && errorMsg.startsWith('SETUP_REQUIRED') && (
              <div className="flex flex-col rounded-xl mt-4" style={{ border: '1px solid #FDE68A', background: '#FFFBEB', overflow: 'hidden' }}>
                <div className="flex items-start" style={{ padding: '12px 14px', gap: '10px' }}>
                  <AlertCircle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold text-amber-700">Setup requerido — un solo paso</p>
                    <p className="text-[10px] text-amber-600 mt-0.5 leading-relaxed">
                      Ve a <strong>Supabase → SQL Editor</strong>, pega este código y presiona <strong>Run</strong>. Luego vuelve e importa.
                    </p>
                  </div>
                </div>
                <pre
                  className="text-[9px] leading-relaxed overflow-x-auto select-all"
                  style={{ background: '#1E1E2E', color: '#A6E22E', padding: '10px 14px', margin: 0 }}
                >{`CREATE OR REPLACE FUNCTION public.crm_get_leads()
RETURNS TABLE (id uuid, created_at timestamptz,
  nombre text, edad integer, celular text,
  email text, meta text, objetivo text, condicion text)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$ SELECT id,created_at,nombre,edad,celular,
   email,meta,objetivo,condicion FROM public.leads
   ORDER BY created_at ASC; $$;
GRANT EXECUTE ON FUNCTION public.crm_get_leads() TO anon;`}</pre>
              </div>
            )}

            {status === 'error' && !errorMsg.startsWith('SETUP_REQUIRED') && (
              <div
                className="flex items-start rounded-xl mt-4"
                style={{ padding: '12px 14px', gap: '10px', background: '#FEF2F2', border: '1px solid #FECACA' }}
              >
                <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold text-red-600">Error de importación</p>
                  <p className="text-[10px] text-red-400 mt-0.5 leading-relaxed">{errorMsg}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 flex" style={{ padding: '14px 20px', gap: '10px' }}>
            <button
              onClick={onClose}
              className="flex-1 h-9 rounded-xl border border-gray-200 text-[#0D2244] text-xs font-semibold hover:bg-gray-50 transition-colors"
            >
              {status === 'success' ? 'Cerrar' : 'Cancelar'}
            </button>
            {status !== 'success' && (
              <button
                onClick={handleImport}
                disabled={status === 'loading' || !configured}
                className="flex-1 h-9 rounded-xl text-white text-xs font-bold flex items-center justify-center transition-colors disabled:opacity-50"
                style={{ background: '#0D2244', gap: '6px' }}
              >
                {status === 'loading' ? (
                  <><Loader2 size={13} className="animate-spin" /> Importando...</>
                ) : (
                  <><Download size={13} /> Importar ahora</>
                )}
              </button>
            )}
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
  const [showImport, setShowImport] = useState(false)

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
      <div className="flex-shrink-0 bg-white border-b border-gray-100" style={{ padding: '28px 40px 20px' }}>
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
              onClick={() => setShowImport(true)}
              className="h-9 px-4 rounded-xl border border-gray-200 bg-white text-[#0D2244] text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Download size={13} />
              Importar Leads
            </button>
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
        <div className="flex flex-wrap mt-3" style={{ gap: '6px' }}>
          <button
            onClick={() => setFilterStage('all')}
            className={`rounded-full text-[10px] font-bold whitespace-nowrap transition-all flex-shrink-0 ${
              filterStage === 'all' ? 'bg-[#0D2244] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
            style={{ padding: '5px 14px' }}
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
                className="rounded-full text-[10px] font-bold whitespace-nowrap transition-all flex-shrink-0"
                style={{
                  padding: '5px 14px',
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
        <div className="flex gap-4 h-full" style={{ minWidth: 'max-content', padding: '20px 40px' }}>
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

      {/* ── Import modal ── */}
      {showImport && (
        <ImportLeadsModal onClose={() => setShowImport(false)} />
      )}
    </div>
  )
}
