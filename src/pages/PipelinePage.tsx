import { useState } from 'react'
import {
  X, Plus, Search, Phone, Mail, ChevronRight,
  User, FileText, Paperclip, MessageSquare,
  Clock, Activity, CreditCard, Stethoscope,
  MoreHorizontal, Calendar, MapPin, Edit2, ArrowRight,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type StageId =
  | 'nuevo' | 'contactado' | 'cita_agendada' | 'cita_blueprint'
  | 'paraclínicos' | 'segunda_cita' | 'pendiente_inicio'
  | 'activo' | 'renovacion' | 'no_renueva'

interface Lead {
  id: string
  name: string
  phone: string
  email: string
  age: number
  city: string
  stage: StageId
  date: string
  plan?: 'S1' | 'S2'
  tags: string[]
  source?: string
  notes?: string
}

// ─── Stages config ───────────────────────────────────────────────────────────

const STAGES: { id: StageId; label: string; short: string; color: string; bg: string; dot: string }[] = [
  { id: 'nuevo',           label: '01 · Nuevo Lead',             short: 'Nuevo',          color: '#3B82F6', bg: '#EFF6FF', dot: '#3B82F6' },
  { id: 'contactado',      label: '02 · Contactado',             short: 'Contactado',     color: '#6366F1', bg: '#EEF2FF', dot: '#6366F1' },
  { id: 'cita_agendada',   label: '03 · Cita Agendada',          short: 'Cita Agend.',    color: '#0891B2', bg: '#ECFEFF', dot: '#0891B2' },
  { id: 'cita_blueprint',  label: '04 · Cita Médica BluePrint',  short: 'BluePrint',      color: '#12C49A', bg: '#F0FDF9', dot: '#12C49A' },
  { id: 'paraclínicos',    label: '05 · Revisión Paraclínicos',  short: 'Paraclínicos',   color: '#D97706', bg: '#FFFBEB', dot: '#D97706' },
  { id: 'segunda_cita',    label: '06 · 2da Cita Médica',        short: '2da Cita',       color: '#EA580C', bg: '#FFF7ED', dot: '#EA580C' },
  { id: 'pendiente_inicio',label: '07 · Pendiente Inicio',       short: 'Pend. Inicio',   color: '#CA8A04', bg: '#FEFCE8', dot: '#CA8A04' },
  { id: 'activo',          label: '08 · Paciente Activo',        short: 'Activo',         color: '#16A34A', bg: '#F0FDF4', dot: '#16A34A' },
  { id: 'renovacion',      label: '09 · Renovación / Referido',  short: 'Renovación',     color: '#0D2244', bg: '#F0F4FF', dot: '#0D2244' },
  { id: 'no_renueva',      label: '10 · No Renueva',             short: 'No Renueva',     color: '#6B7280', bg: '#F9FAFB', dot: '#6B7280' },
]

// ─── Mock data ────────────────────────────────────────────────────────────────

const INITIAL_LEADS: Lead[] = [
  { id: 'L001', name: 'Andrea Martínez',  phone: '+57 300 1234567', email: 'andrea.m@gmail.com',    age: 38, city: 'Barranquilla', stage: 'nuevo',            date: '2026-05-28', tags: ['Instagram'],        source: 'Instagram' },
  { id: 'L002', name: 'Carlos Pérez',     phone: '+57 312 9876543', email: 'cperez@hotmail.com',    age: 45, city: 'Bogotá',        stage: 'nuevo',            date: '2026-05-29', tags: ['Referido'],         source: 'Referido' },
  { id: 'L003', name: 'Sofía Ramírez',   phone: '+57 315 4561230', email: 'sofiar@gmail.com',      age: 52, city: 'Medellín',      stage: 'contactado',       date: '2026-05-20', tags: ['WhatsApp'],         source: 'WhatsApp' },
  { id: 'L004', name: 'Miguel Torres',   phone: '+57 301 7890123', email: 'mtorres@yahoo.com',     age: 41, city: 'Cali',          stage: 'contactado',       date: '2026-05-18', tags: ['Facebook'],         source: 'Facebook' },
  { id: 'L005', name: 'Laura Gómez',     phone: '+57 320 3456789', email: 'laurag@gmail.com',      age: 35, city: 'Barranquilla', stage: 'cita_agendada',    date: '2026-05-15', tags: ['Instagram', 'S1'],  source: 'Instagram',  plan: 'S1' },
  { id: 'L006', name: 'Pedro Herrera',   phone: '+57 317 6543210', email: 'pherrera@gmail.com',    age: 60, city: 'Santa Marta',  stage: 'cita_agendada',    date: '2026-05-14', tags: ['Referido'],         source: 'Referido' },
  { id: 'L007', name: 'Valeria Castro',  phone: '+57 311 2345678', email: 'vcastro@outlook.com',   age: 29, city: 'Barranquilla', stage: 'cita_blueprint',   date: '2026-05-10', tags: ['S2'],               source: 'Google',     plan: 'S2' },
  { id: 'L008', name: 'Andrés Silva',    phone: '+57 318 8765432', email: 'asilva@gmail.com',      age: 48, city: 'Bogotá',        stage: 'cita_blueprint',   date: '2026-05-08', tags: ['S1', 'Urgente'],    source: 'Referido',   plan: 'S1' },
  { id: 'L009', name: 'Camila Ruiz',     phone: '+57 304 5678901', email: 'cruiz@gmail.com',       age: 33, city: 'Barranquilla', stage: 'paraclínicos',     date: '2026-05-05', tags: ['S1'],               source: 'Instagram',  plan: 'S1' },
  { id: 'L010', name: 'Jorge Morales',   phone: '+57 322 1098765', email: 'jmorales@gmail.com',    age: 55, city: 'Cartagena',     stage: 'segunda_cita',     date: '2026-04-28', tags: ['S2'],               source: 'WhatsApp',   plan: 'S2' },
  { id: 'L011', name: 'Diana López',     phone: '+57 316 4321098', email: 'dlopez@gmail.com',      age: 42, city: 'Barranquilla', stage: 'pendiente_inicio', date: '2026-04-20', tags: ['S1', 'Referido'],   source: 'Referido',   plan: 'S1' },
  { id: 'L012', name: 'Luis Fernández',  phone: '+57 308 7654321', email: 'lfernandez@gmail.com',  age: 50, city: 'Medellín',      stage: 'activo',           date: '2026-04-10', tags: ['S2'],               source: 'Facebook',   plan: 'S2', notes: 'Semana 4 completada, evolución excelente.' },
  { id: 'L013', name: 'María Jiménez',   phone: '+57 313 2109876', email: 'mjimenez@gmail.com',    age: 39, city: 'Barranquilla', stage: 'activo',           date: '2026-03-15', tags: ['S1'],               source: 'Instagram',  plan: 'S1', notes: 'Paciente comprometida, baja de peso 6kg.' },
  { id: 'L014', name: 'Roberto Vargas',  phone: '+57 319 5432109', email: 'rvargas@outlook.com',   age: 58, city: 'Bogotá',        stage: 'renovacion',       date: '2026-02-01', tags: ['S1→S2', 'VIP'],    source: 'Referido',   plan: 'S2', notes: 'Renovó a S2. Refirió 2 pacientes.' },
  { id: 'L015', name: 'Patricia Soto',   phone: '+57 302 8901234', email: 'psoto@gmail.com',       age: 47, city: 'Barranquilla', stage: 'no_renueva',       date: '2026-01-15', tags: ['No contactable'],   source: 'Instagram' },
]

// ─── TAG badge ────────────────────────────────────────────────────────────────

function TagBadge({ tag }: { tag: string }) {
  const map: Record<string, string> = {
    S1: 'bg-violet-100 text-violet-700',
    S2: 'bg-blue-100 text-blue-700',
    VIP: 'bg-[#D4AF5A]/15 text-[#A07820]',
    Urgente: 'bg-red-100 text-red-600',
    Referido: 'bg-emerald-100 text-emerald-700',
    'S1→S2': 'bg-teal-100 text-teal-700',
  }
  return (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none ${map[tag] ?? 'bg-gray-100 text-gray-500'}`}>
      {tag}
    </span>
  )
}

// ─── Lead Card ────────────────────────────────────────────────────────────────

function LeadCard({ lead, stage, onClick }: { lead: Lead; stage: typeof STAGES[0]; onClick: () => void }) {
  const initials = lead.name.split(' ').slice(0, 2).map(w => w[0]).join('')
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-[0_1px_6px_rgba(0,0,0,0.07)] border border-gray-100 p-3 cursor-pointer hover:shadow-[0_3px_14px_rgba(0,0,0,0.11)] hover:-translate-y-0.5 transition-all duration-150 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
            style={{ background: stage.color + '18', color: stage.color }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-[#0D2244] truncate leading-tight">{lead.name}</p>
            <p className="text-[10px] text-gray-400">{lead.age} años · {lead.city}</p>
          </div>
        </div>
        <MoreHorizontal size={13} className="text-gray-300 group-hover:text-gray-500 flex-shrink-0 mt-0.5 transition-colors" />
      </div>

      {/* Tags */}
      {lead.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {lead.tags.map(t => <TagBadge key={t} tag={t} />)}
        </div>
      )}

      {/* Contact */}
      <div className="flex items-center gap-1 text-[10px] text-gray-400">
        <Phone size={9} className="flex-shrink-0" />
        <span className="truncate">{lead.phone}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
        <span className="text-[9px] text-gray-300">{lead.date}</span>
        <ChevronRight size={11} className="text-gray-300 group-hover:text-[#12C49A] transition-colors" />
      </div>
    </div>
  )
}

// ─── Column ───────────────────────────────────────────────────────────────────

function KanbanColumn({
  stage, leads, onCardClick, onAddLead,
}: {
  stage: typeof STAGES[0]
  leads: Lead[]
  onCardClick: (lead: Lead) => void
  onAddLead: (stageId: StageId) => void
}) {
  return (
    <div className="flex flex-col w-[220px] min-w-[220px] h-full">
      {/* Column header */}
      <div
        className="flex items-center justify-between px-3 py-2.5 rounded-t-xl border-b-2 mb-2"
        style={{ background: stage.bg, borderColor: stage.color + '30' }}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: stage.dot }} />
          <span className="text-[10px] font-bold text-[#0D2244] truncate leading-tight">{stage.label}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
            style={{ background: stage.color + '20', color: stage.color }}
          >
            {leads.length}
          </span>
          <button
            onClick={() => onAddLead(stage.id)}
            className="w-5 h-5 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
            style={{ background: stage.color + '20', color: stage.color }}
            title="Agregar lead"
          >
            <Plus size={10} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-0.5 pb-3 min-h-[40px]">
        {leads.length === 0 ? (
          <div
            className="flex items-center justify-center h-16 rounded-xl border-2 border-dashed text-[10px] text-gray-300 cursor-pointer hover:border-opacity-60 transition-colors"
            style={{ borderColor: stage.color + '30' }}
            onClick={() => onAddLead(stage.id)}
          >
            + Agregar
          </div>
        ) : (
          leads.map(lead => (
            <LeadCard key={lead.id} lead={lead} stage={stage} onClick={() => onCardClick(lead)} />
          ))
        )}
      </div>
    </div>
  )
}

// ─── Lead Panel — 8 tabs ──────────────────────────────────────────────────────

type TabId = 'perfil' | 'ivc' | 'historia' | 'soportes' | 'emails' | 'historial' | 'seguimiento' | 'pagos'

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'perfil',      label: 'Perfil',             icon: <User size={13} /> },
  { id: 'ivc',         label: 'IVC & Paciente',     icon: <Stethoscope size={13} /> },
  { id: 'historia',    label: 'Historia Clínica',   icon: <FileText size={13} /> },
  { id: 'soportes',    label: 'Soportes',           icon: <Paperclip size={13} /> },
  { id: 'emails',      label: 'Emails',             icon: <Mail size={13} /> },
  { id: 'historial',   label: 'Historial',          icon: <Clock size={13} /> },
  { id: 'seguimiento', label: 'Seguimiento Clínico',icon: <Activity size={13} /> },
  { id: 'pagos',       label: 'Pagos & Plan',       icon: <CreditCard size={13} /> },
]

function TabPerfil({ lead }: { lead: Lead }) {
  const stage = STAGES.find(s => s.id === lead.stage)!
  return (
    <div className="flex flex-col gap-4">
      {/* Avatar + name */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
          style={{ background: stage.color + '18', color: stage.color }}
        >
          {lead.name.split(' ').slice(0, 2).map(w => w[0]).join('')}
        </div>
        <div>
          <h3 className="text-[#0D2244] font-bold text-base leading-tight">{lead.name}</h3>
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
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: <Phone size={13} />,    label: 'Teléfono',  value: lead.phone },
          { icon: <Mail size={13} />,     label: 'Email',     value: lead.email },
          { icon: <User size={13} />,     label: 'Edad',      value: `${lead.age} años` },
          { icon: <MapPin size={13} />,   label: 'Ciudad',    value: lead.city },
          { icon: <Calendar size={13} />, label: 'Ingreso',   value: lead.date },
          { icon: <ArrowRight size={13} />, label: 'Fuente',  value: lead.source ?? '—' },
        ].map(({ icon, label, value }) => (
          <div key={label} className="flex flex-col gap-0.5 p-3 bg-white rounded-xl border border-gray-100">
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
        <select className="w-full h-9 rounded-xl border border-gray-200 text-xs text-[#0D2244] px-3 bg-white focus:outline-none focus:border-[#12C49A]">
          {STAGES.map(s => (
            <option key={s.id} value={s.id} selected={s.id === lead.stage}>{s.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

function TabIVC() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Índice de Valor del Cliente</p>
      {[
        { label: 'Motivación', value: 80 },
        { label: 'Capacidad de pago', value: 65 },
        { label: 'Urgencia de salud', value: 90 },
        { label: 'Compromiso', value: 70 },
      ].map(({ label, value }) => (
        <div key={label}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[#0D2244] font-medium">{label}</span>
            <span className="text-[#12C49A] font-bold">{value}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${value}%`, background: '#12C49A' }}
            />
          </div>
        </div>
      ))}

      <div className="mt-2 p-4 bg-[#12C49A]/08 rounded-xl border border-[#12C49A]/20">
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
              className={`p-2 rounded-xl border text-[10px] font-semibold text-center transition-all ${i === 0 ? 'border-[#12C49A] bg-[#12C49A]/10 text-[#12C49A]' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
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
      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-500">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">Pendiente de configuración</p>
      </div>
    </div>
  )
}

function TabHistorial() {
  const events = [
    { date: '2026-05-28', action: 'Lead creado desde Instagram', type: 'create' },
    { date: '2026-05-29', action: 'Primer contacto por WhatsApp', type: 'contact' },
    { date: '2026-05-30', action: 'Cita agendada para 04 Jun', type: 'cita' },
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
    S2: { name: 'Plan S2 — Bienestar Integral', price: 250_000, period: 'Trimestral' },
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
            <p className="text-2xl font-bold mt-2 tabular-nums">${plan.price.toLocaleString('es-CO')} <span className="text-sm font-normal text-white/60">COP</span></p>
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

// ─── Lead Panel ───────────────────────────────────────────────────────────────

function LeadPanel({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<TabId>('perfil')
  const stage = STAGES.find(s => s.id === lead.stage)!

  const renderTab = () => {
    switch (activeTab) {
      case 'perfil':      return <TabPerfil lead={lead} />
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
      <div className="fixed inset-0 bg-black/20 z-40 backdrop-blur-[1px]" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-[400px] max-w-[92vw] bg-white z-50 shadow-[−8px_0_40px_rgba(0,0,0,0.12)] flex flex-col">

        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: stage.dot }}
            />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{stage.label}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
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
        <div className="px-5 py-3 border-b border-gray-50 flex-shrink-0">
          <h2 className="text-[#0D2244] text-base font-bold">{lead.name}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-gray-400">{lead.age} años · {lead.city}</span>
            {lead.plan && <TagBadge tag={lead.plan} />}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-100 flex-shrink-0 scrollbar-none px-3">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-3 text-[10px] font-semibold whitespace-nowrap border-b-2 transition-all duration-150 flex-shrink-0 ${
                activeTab === tab.id
                  ? 'border-[#12C49A] text-[#12C49A]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className={activeTab === tab.id ? 'text-[#12C49A]' : 'text-gray-400'}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {renderTab()}
        </div>

        {/* Panel footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-2 flex-shrink-0">
          <button className="flex-1 h-9 rounded-xl bg-[#12C49A] text-white text-xs font-bold hover:bg-[#0EA882] transition-colors shadow-[0_2px_10px_rgba(18,196,154,0.30)]">
            Guardar cambios
          </button>
          <button className="flex-1 h-9 rounded-xl border border-gray-200 text-[#0D2244] text-xs font-semibold hover:bg-gray-50 transition-colors">
            Registrar actividad
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Pipeline Page ─────────────────────────────────────────────────────────────

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS)
  const [search, setSearch] = useState('')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [filterStage, setFilterStage] = useState<StageId | 'all'>('all')

  const filteredLeads = leads.filter(l => {
    const matchSearch = search === '' ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search) ||
      l.email.toLowerCase().includes(search.toLowerCase())
    const matchStage = filterStage === 'all' || l.stage === filterStage
    return matchSearch && matchStage
  })

  const totalLeads = leads.length
  const activePatients = leads.filter(l => l.stage === 'activo').length
  const renewals = leads.filter(l => l.stage === 'renovacion').length

  function handleAddLead(stageId: StageId) {
    const newLead: Lead = {
      id: `L${String(leads.length + 1).padStart(3, '0')}`,
      name: 'Nuevo Lead',
      phone: '+57 300 0000000',
      email: 'nuevo@email.com',
      age: 0,
      city: 'Barranquilla',
      stage: stageId,
      date: new Date().toISOString().slice(0, 10),
      tags: [],
    }
    setLeads(prev => [...prev, newLead])
    setSelectedLead(newLead)
  }

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[#0D2244] text-2xl font-bold tracking-tight">Pipeline Leads</h1>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-xs text-gray-400">{totalLeads} leads totales</span>
              <span className="text-xs text-[#16A34A] font-semibold">{activePatients} pacientes activos</span>
              <span className="text-xs text-[#0D2244] font-semibold">{renewals} renovaciones</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="flex items-center gap-2 h-9 bg-gray-100 rounded-xl px-3 text-xs text-gray-500 w-52">
              <Search size={13} className="flex-shrink-0 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar lead..."
                className="bg-transparent flex-1 outline-none placeholder-gray-400 text-[#0D2244]"
              />
            </div>

            {/* Stage filter */}
            <select
              value={filterStage}
              onChange={e => setFilterStage(e.target.value as StageId | 'all')}
              className="h-9 rounded-xl border border-gray-200 text-xs text-[#0D2244] px-3 bg-white focus:outline-none focus:border-[#12C49A] cursor-pointer"
            >
              <option value="all">Todas las etapas</option>
              {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>

            {/* Add lead */}
            <button
              onClick={() => handleAddLead('nuevo')}
              className="h-9 px-4 rounded-xl bg-[#12C49A] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#0EA882] transition-colors shadow-[0_2px_10px_rgba(18,196,154,0.30)]"
            >
              <Plus size={14} strokeWidth={2.5} />
              Nuevo Lead
            </button>
          </div>
        </div>

        {/* Stage pills */}
        <div className="flex gap-1.5 mt-4 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setFilterStage('all')}
            className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all flex-shrink-0 ${filterStage === 'all' ? 'bg-[#0D2244] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            Todo ({leads.length})
          </button>
          {STAGES.map(s => {
            const count = leads.filter(l => l.stage === s.id).length
            return (
              <button
                key={s.id}
                onClick={() => setFilterStage(s.id === filterStage ? 'all' : s.id)}
                className="px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all flex-shrink-0"
                style={{
                  background: filterStage === s.id ? s.color : s.color + '15',
                  color: filterStage === s.id ? 'white' : s.color,
                }}
              >
                {s.short} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-3 h-full px-6 py-4" style={{ minWidth: 'max-content' }}>
          {STAGES.map(stage => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              leads={filteredLeads.filter(l => l.stage === stage.id)}
              onCardClick={lead => setSelectedLead(lead)}
              onAddLead={handleAddLead}
            />
          ))}
        </div>
      </div>

      {/* Lead panel */}
      {selectedLead && (
        <LeadPanel
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  )
}
