import { useState } from 'react'
import { Activity, ChevronRight, User, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { useLeads, type Lead, type SeguimientoSemanal } from '../context/LeadsContext'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function semanaLabel(plan_inicio: string, semana: number): string {
  if (!plan_inicio) return `Semana ${semana}`
  const inicio = new Date(plan_inicio + 'T12:00:00')
  const d = new Date(inicio)
  d.setDate(d.getDate() + (semana - 1) * 7)
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
}

function calcSemanaActual(plan_inicio: string): number {
  if (!plan_inicio) return 1
  const inicio = new Date(plan_inicio + 'T12:00:00')
  const hoy    = new Date()
  const dias   = Math.floor((hoy.getTime() - inicio.getTime()) / 86400000)
  return Math.min(12, Math.max(1, Math.floor(dias / 7) + 1))
}

const SINT_OPTS = ['Náuseas', 'Estreñimiento', 'Fatiga', 'Acidez', 'Mareo', 'Sin síntomas']

// ─── Tarjeta de paciente en la lista ─────────────────────────────────────────

function PatientCard({
  lead,
  selected,
  onClick,
}: {
  lead: Lead
  selected: boolean
  onClick: () => void
}) {
  const semActual = lead.plan_inicio ? calcSemanaActual(lead.plan_inicio) : 1
  const completadas = (lead.seguimiento ?? []).filter(s => s.peso || s.fecha).length
  const pct = Math.round((completadas / 12) * 100)
  const planColor = lead.plan === 'S1' ? '#7C3AED' : '#0891B2'

  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left', padding: '12px 14px',
        background: selected ? '#F0FDF4' : '#fff',
        border: selected ? '1.5px solid #16A34A' : '1px solid #E5E7EB',
        borderRadius: '10px', cursor: 'pointer', transition: 'all 120ms',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <User size={14} color="#9CA3AF" />
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.2 }}>{lead.name}</p>
            <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>{lead.age} años</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {lead.plan && (
            <span style={{ fontSize: '10px', fontWeight: 700, background: planColor + '18', color: planColor, padding: '2px 8px', borderRadius: '20px' }}>
              {lead.plan}
            </span>
          )}
          <ChevronRight size={13} color="#9CA3AF" />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span style={{ fontSize: '11px', color: '#6B7280' }}>Semana {semActual}/12</span>
        <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 700 }}>{pct}% completado</span>
      </div>
      <div style={{ height: '4px', background: '#E5E7EB', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: '#16A34A', borderRadius: '2px' }} />
      </div>
    </button>
  )
}

// ─── Tarjeta de semana ────────────────────────────────────────────────────────

function SemanaCard({
  semana,
  lead,
  semActual,
  updateSemana,
}: {
  semana: number
  lead: Lead
  semActual: number
  updateSemana: (n: number, patch: Partial<SeguimientoSemanal>) => void
}) {
  const [open, setOpen] = useState(false)
  const sem      = lead.seguimiento?.find(s => s.semana === semana) ?? { semana }
  const isCtrl   = [4, 8, 12].includes(semana)
  const isActual = semana === semActual
  const done     = !!(sem.peso || sem.fecha)
  const isFutura = semana > semActual
  const isS1     = lead.plan === 'S1'

  const borderColor = isCtrl ? '#D4AF37' : done ? '#16A34A' : isActual ? '#12C49A' : '#E5E7EB'
  const headerBg    = isCtrl ? '#FEFCE8' : done ? '#F0FDF4'  : isActual ? '#F0FBF7' : '#F9FAFB'
  const titleColor  = isCtrl ? '#92400E' : done ? '#15803D'  : isActual ? '#0A3D2E' : '#6B7280'

  const status = done ? '✓' : isActual ? '◉ Actual' : isFutura ? 'Pendiente' : '—'
  const statusColor = done ? '#16A34A' : isActual ? '#12C49A' : '#9CA3AF'

  function field(label: string, key: keyof SeguimientoSemanal, ph = '', type = 'text') {
    return (
      <div>
        <label style={{ fontSize: '9px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '3px' }}>{label}</label>
        <input
          type={type}
          value={(sem[key] ?? '') as string}
          onChange={e => updateSemana(semana, { [key]: e.target.value })}
          placeholder={ph}
          disabled={isFutura}
          style={{ width: '100%', height: '30px', borderRadius: '6px', border: '1px solid #E5E7EB', padding: '0 8px', fontSize: '12px', color: '#111827', outline: 'none', boxSizing: 'border-box', background: isFutura ? '#F9FAFB' : '#fff' }}
        />
      </div>
    )
  }

  return (
    <div style={{ border: `1.5px solid ${borderColor}`, borderRadius: '10px', overflow: 'hidden', opacity: isFutura ? 0.6 : 1 }}>
      <button
        onClick={() => !isFutura && setOpen(p => !p)}
        disabled={isFutura}
        style={{ width: '100%', padding: '10px 12px', background: headerBg, border: 'none', cursor: isFutura ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: titleColor }}>
            Sem {semana}{isCtrl ? ' ⭐' : ''}
          </span>
          {lead.plan_inicio && (
            <span style={{ fontSize: '10px', color: '#9CA3AF' }}>{semanaLabel(lead.plan_inicio, semana)}</span>
          )}
          {sem.fecha && <span style={{ fontSize: '10px', color: '#6B7280' }}>· {sem.fecha}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {sem.peso && <span style={{ fontSize: '11px', fontWeight: 700, color: '#374151' }}>{sem.peso} kg</span>}
          <span style={{ fontSize: '10px', fontWeight: 700, color: statusColor }}>{status}</span>
          {!isFutura && <span style={{ fontSize: '10px', color: '#9CA3AF' }}>{open ? '▲' : '▼'}</span>}
        </div>
      </button>

      {open && !isFutura && (
        <div style={{ padding: '14px', background: '#fff', borderTop: '1px solid #F3F4F6', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {field('Fecha', 'fecha', '', 'date')}
            {field('Peso (kg)', 'peso', '___')}
            {field('Cintura (cm)', 'cintura', '___')}
            {field('PA (mmHg)', 'pa', '120/80')}
            {isS1 && field('Dosis GLP-1', 'dosis', '0.5mg')}
            {isS1 && field('Sitio inyección', 'sitio_inyeccion', 'Abdomen')}
            {field('Días ejercicio', 'dias_ejercicio', '0–7')}
            {field('Vasos agua', 'vasos_agua', '0–15')}
          </div>

          {/* Síntomas */}
          <div>
            <p style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px' }}>Síntomas</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {SINT_OPTS.map(s => {
                const sel = (sem.sintomas ?? []).includes(s)
                return (
                  <button key={s} type="button" onClick={() => {
                    const prev = sem.sintomas ?? []
                    updateSemana(semana, { sintomas: sel ? prev.filter(x => x !== s) : [...prev, s] })
                  }} style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: sel ? 700 : 400, border: sel ? '1.5px solid #12C49A' : '1px solid #E5E7EB', background: sel ? '#E6FAF5' : '#F9FAFB', color: sel ? '#0A3D2E' : '#6B7280', cursor: 'pointer' }}>
                    {s}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Adherencia */}
          <div>
            <p style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px' }}>Adherencia nutricional</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {([['excelente', '#16A34A', '#F0FDF4'], ['regular', '#D97706', '#FEF3C7'], ['bajo', '#DC2626', '#FEE2E2']] as const).map(([v, c, bg]) => (
                <button key={v} type="button" onClick={() => updateSemana(semana, { adherencia: v })} style={{ flex: 1, padding: '7px', borderRadius: '8px', border: sem.adherencia === v ? `2px solid ${c}` : '1px solid #E5E7EB', background: sem.adherencia === v ? bg : '#fff', fontSize: '12px', fontWeight: sem.adherencia === v ? 700 : 400, color: sem.adherencia === v ? c : '#9CA3AF', cursor: 'pointer', textTransform: 'capitalize' }}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div>
            <p style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Notas</p>
            <textarea
              value={sem.notas ?? ''}
              onChange={e => updateSemana(semana, { notas: e.target.value })}
              rows={2}
              style={{ width: '100%', borderRadius: '8px', border: '1px solid #E5E7EB', padding: '8px 10px', fontSize: '12px', color: '#111827', resize: 'vertical', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
              placeholder="Observaciones de la semana..."
            />
          </div>

          {/* Control médico */}
          {isCtrl && (
            <div style={{ background: '#FEFCE8', border: '1px solid #D4AF3766', borderRadius: '8px', padding: '12px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>⭐ Control Médico — Semana {semana}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '10px' }}>
                {[
                  { label: '% Grasa', key: 'control_grasa' as const },
                  { label: 'Kg Masa Magra', key: 'control_magra' as const },
                  { label: 'Próx. control', key: 'control_prox_fecha' as const, type: 'date' },
                  ...(isS1 ? [{ label: 'Nueva dosis', key: 'control_nueva_dosis' as const }] : []),
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: '9px', fontWeight: 700, color: '#92400E', display: 'block', marginBottom: '3px' }}>{f.label}</label>
                    <input
                      type={f.type ?? 'text'}
                      value={(sem[f.key] ?? '') as string}
                      onChange={e => updateSemana(semana, { [f.key]: e.target.value })}
                      style={{ width: '100%', height: '30px', borderRadius: '6px', border: '1px solid #D4AF3766', padding: '0 8px', fontSize: '12px', color: '#111827', outline: 'none', boxSizing: 'border-box', background: '#fff' }}
                    />
                  </div>
                ))}
              </div>
              <div>
                <label style={{ fontSize: '9px', fontWeight: 700, color: '#92400E', display: 'block', marginBottom: '3px' }}>Indicaciones médicas del control</label>
                <textarea
                  value={sem.control_indicaciones ?? ''}
                  onChange={e => updateSemana(semana, { control_indicaciones: e.target.value })}
                  rows={2}
                  style={{ width: '100%', borderRadius: '6px', border: '1px solid #D4AF3766', padding: '6px 8px', fontSize: '12px', color: '#111827', resize: 'vertical', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#fff' }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Panel de seguimiento de un paciente ──────────────────────────────────────

function PacienteDetail({ lead }: { lead: Lead }) {
  const { updateLead } = useLeads()
  const semActual   = lead.plan_inicio ? calcSemanaActual(lead.plan_inicio) : 1
  const completadas = (lead.seguimiento ?? []).filter(s => s.peso || s.fecha).length
  const planLabel   = lead.plan === 'S1' ? 'Control Metabólico' : lead.plan === 'S2' ? 'Bienestar Integral' : '—'
  const planColor   = lead.plan === 'S1' ? '#7C3AED' : '#0891B2'

  function updateSemana(n: number, patch: Partial<SeguimientoSemanal>) {
    const prev = (lead.seguimiento ?? []).filter(s => s.semana !== n)
    const curr = (lead.seguimiento ?? []).find(s => s.semana === n) ?? { semana: n }
    updateLead(lead.id, { seguimiento: [...prev, { ...curr, ...patch }] })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header paciente */}
      <div style={{ background: 'linear-gradient(135deg, #0B1B3D, #162847)', borderRadius: '14px', padding: '20px 24px', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>{lead.name}</h2>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', margin: 0 }}>{lead.age} años · {lead.city}</p>
          </div>
          {lead.plan && (
            <span style={{ background: planColor + '33', border: `1px solid ${planColor}66`, borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: 700, color: planColor === '#7C3AED' ? '#C4B5FD' : '#7DD3FC' }}>
              {lead.plan} — {planLabel}
            </span>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <div>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 2px' }}>Semana actual</p>
            <p style={{ fontSize: '18px', fontWeight: 800, color: '#12C49A', margin: 0 }}>{semActual}<span style={{ fontSize: '12px', fontWeight: 400, color: 'rgba(255,255,255,0.4)' }}>/12</span></p>
          </div>
          <div>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 2px' }}>Semanas completadas</p>
            <p style={{ fontSize: '18px', fontWeight: 800, color: '#D4AF37', margin: 0 }}>{completadas}</p>
          </div>
          <div>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 2px' }}>Inicio programa</p>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', margin: 0 }}>
              {lead.plan_inicio ? new Date(lead.plan_inicio + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
            </p>
          </div>
        </div>
        {/* Barra progreso */}
        <div style={{ marginTop: '12px' }}>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.15)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(completadas / 12) * 100}%`, background: '#12C49A', borderRadius: '3px', transition: 'width 0.4s' }} />
          </div>
        </div>
      </div>

      {/* 12 semanas */}
      <div>
        <p style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 10px' }}>12 Semanas de Seguimiento</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
            <SemanaCard key={n} semana={n} lead={lead} semActual={semActual} updateSemana={updateSemana} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function SeguimientoPage() {
  const { leads } = useLeads()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const pacientesActivos = leads.filter(l => l.stage === 'activo' || l.stage === 'renovacion')
  const selected = pacientesActivos.find(l => l.id === selectedId) ?? pacientesActivos[0] ?? null

  return (
    <div className="h-full overflow-hidden flex flex-col" style={{ background: '#F8FAFB' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '16px 28px', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#12C49A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Activity size={18} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '16px', fontWeight: 800, color: '#0B1B3D', margin: 0 }}>Seguimiento Clínico</h1>
          <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>
            {pacientesActivos.length} paciente{pacientesActivos.length !== 1 ? 's' : ''} activo{pacientesActivos.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {pacientesActivos.length === 0 ? (
        /* Estado vacío */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={30} color="#9CA3AF" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#374151', margin: '0 0 6px' }}>Sin pacientes activos</p>
            <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0 }}>
              Los pacientes aparecen aquí cuando confirmas su pago en la pestaña <strong>Pagos & Plan</strong> del Pipeline.
            </p>
          </div>
        </div>
      ) : (
        /* Contenido principal */
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Lista de pacientes */}
          <div style={{ width: '260px', flexShrink: 0, borderRight: '1px solid #E5E7EB', background: '#fff', overflowY: 'auto', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 4px 2px' }}>Pacientes Activos</p>
            {pacientesActivos.map(l => (
              <PatientCard
                key={l.id}
                lead={l}
                selected={(selectedId ?? pacientesActivos[0]?.id) === l.id}
                onClick={() => setSelectedId(l.id)}
              />
            ))}
          </div>

          {/* Panel de seguimiento */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
            {selected ? (
              <PacienteDetail lead={selected} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9CA3AF', fontSize: '13px' }}>
                Selecciona un paciente
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
