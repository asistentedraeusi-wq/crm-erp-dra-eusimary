import { useState, useEffect } from 'react'
import { Activity, ChevronRight, User, Save, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { useLeads, type Lead, type SeguimientoSemanal } from '../context/LeadsContext'
import { guardarControlSeguimiento, buildSeguimientoSemanaHTML } from '../lib/generarSeguimientoPDF'
import { obtenerHistoria } from '../lib/historia-clinica'
import { htmlToPdfBase64 } from '../lib/htmlToPdf'
import { supabase } from '../lib/supabase'
import type { HistoriaClinicaForm as HCForm } from '../types/historia-clinica'

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

// ─── Celda de dato baseline ───────────────────────────────────────────────────

function BaseCell({ label, value, unit = '' }: { label: string; value?: string; unit?: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '8px 4px', background: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
      <div style={{ fontSize: '8.5px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>{label}</div>
      <div style={{ fontSize: '14px', fontWeight: 800, color: value ? '#0A3D2E' : '#D1D5DB' }}>
        {value || '—'}
        {value && unit && <span style={{ fontSize: '10px', fontWeight: 600, color: '#6B7280' }}> {unit}</span>}
      </div>
    </div>
  )
}

// ─── Delta badge ──────────────────────────────────────────────────────────────

function DeltaBadge({ current, base, unit = 'kg', lowerBetter = true }: {
  current?: string; base?: string; unit?: string; lowerBetter?: boolean
}) {
  if (!current || !base) return null
  const diff = parseFloat(current) - parseFloat(base)
  if (isNaN(diff) || Math.abs(diff) < 0.01) return null
  const improved = lowerBetter ? diff < 0 : diff > 0
  return (
    <span style={{
      fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '5px',
      background: improved ? '#D1FAE5' : '#FEE2E2',
      color: improved ? '#065F46' : '#DC2626',
    }}>
      {diff < 0 ? '↓' : '↑'}{Math.abs(diff).toFixed(1)}{unit}
    </span>
  )
}

// ─── Tarjeta de semana ────────────────────────────────────────────────────────

function SemanaCard({
  semana,
  lead,
  semActual,
  updateSemana,
  hcForm,
}: {
  semana: number
  lead: Lead
  semActual: number
  updateSemana: (n: number, patch: Partial<SeguimientoSemanal>) => void
  hcForm: HCForm | null
}) {
  const [open, setOpen] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const sem      = lead.seguimiento?.find(s => s.semana === semana) ?? { semana }
  const isCtrl   = [4, 8, 12].includes(semana)
  const isActual = semana === semActual
  const done     = !!(sem.peso || sem.fecha)
  const isFutura = semana > semActual
  const isS1     = lead.plan === 'S1'
  const isTele   = hcForm?.modalidad === 'telemedicina'

  const borderColor = isCtrl ? '#D4AF37' : done ? '#16A34A' : isActual ? '#12C49A' : '#E5E7EB'
  const headerBg    = isCtrl ? '#FEFCE8' : done ? '#F0FDF4'  : isActual ? '#F0FBF7' : '#F9FAFB'
  const titleColor  = isCtrl ? '#92400E' : done ? '#15803D'  : isActual ? '#0A3D2E' : '#6B7280'

  const status = done ? '✓' : isActual ? '◉ Actual' : isFutura ? 'Pendiente' : '—'
  const statusColor = done ? '#16A34A' : isActual ? '#12C49A' : '#9CA3AF'

  const basePeso = hcForm ? (isTele ? hcForm.tp : hcForm.peso) : undefined

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {sem.peso && <span style={{ fontSize: '11px', fontWeight: 700, color: '#374151' }}>{sem.peso} kg</span>}
          {sem.peso && basePeso && <DeltaBadge current={sem.peso} base={basePeso} unit="kg" />}
          <span style={{ fontSize: '10px', fontWeight: 700, color: statusColor }}>{status}</span>
          {!isFutura && <span style={{ fontSize: '10px', color: '#9CA3AF' }}>{open ? '▲' : '▼'}</span>}
        </div>
      </button>

      {open && !isFutura && (
        <div style={{ padding: '14px', background: '#fff', borderTop: '1px solid #F3F4F6', display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* ── Campos comunes (existentes) ── */}
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

          {/* ── Campos Telemedicina ── */}
          {isTele && (
            <div>
              <p style={{ fontSize: '10px', fontWeight: 800, color: '#0891B2', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>📡 Medidas Corporales — Telemedicina</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {field('Cadera (cm)', 'cadera', '—')}
                {field('Cuello (cm)', 'cuello', '—')}
                {field('Pantorrilla (cm)', 'pantorrilla', '—')}
                {field('FC (lpm)', 'fc', '72')}
              </div>
            </div>
          )}

          {/* ── Campos Presencial ── */}
          {!isTele && hcForm && (
            <div>
              <p style={{ fontSize: '10px', fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>🏥 Composición Corporal — Presencial</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {field('IMC (kg/m²)', 'imc', '—')}
                {field('Grasa Corp. (%)', 'grasa_pct', '—')}
                {field('Masa Grasa (kg)', 'masa_grasa_kg', '—')}
                {field('Masa Magra (%)', 'masa_magra_pct', '—')}
                {field('Agua (L)', 'agua_pct', '—')}
                {field('Peri. Abdominal (cm)', 'peri_abd', '—')}
                {field('Rango Grasa Óptima', 'fat_range', '18-25%')}
                {field('FC (lpm)', 'fc', '72')}
                {field('Temp. (°C)', 'temp', '36.5')}
                {field('SatO₂ (%)', 'sato2', '98')}
                {field('FR (rpm)', 'fr', '16')}
              </div>
            </div>
          )}

          {/* ── Síntomas (existente) ── */}
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

          {/* ── Adherencia (existente) ── */}
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

          {/* ── Notas (existente) ── */}
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

          {/* ── Botón guardar en Soportes + enviar email ── */}
          {done && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
              <button
                type="button"
                disabled={guardando}
                onClick={async () => {
                  setGuardando(true)
                  const semAnterior = semana > 1
                    ? (lead.seguimiento ?? []).find(s => s.semana === semana - 1) ?? null
                    : null

                  // 1. Guardar en Soportes
                  const ok = await guardarControlSeguimiento(lead, semana, sem, hcForm, semAnterior)
                  if (ok) toast.success(`Semana ${semana} guardada en Soportes.`, { duration: 2500 })
                  else    toast.warning(`No se pudo guardar en Soportes.`)

                  // 2. Enviar email con PDF si hay email del paciente
                  if (!lead.email) {
                    toast.warning('Este paciente no tiene email guardado — el reporte no se puede enviar.', { duration: 5000 })
                  } else if (lead.email && supabase) {
                    try {
                      const html      = buildSeguimientoSemanaHTML(lead, semana, sem, hcForm, semAnterior)
                      const pdfBase64 = await htmlToPdfBase64(html)
                      if (!pdfBase64) console.warn('PDF generation returned null — email will be sent without attachment')
                      supabase.functions.invoke('notify-seguimiento-semanal', {
                        body: {
                          email:  lead.email,
                          nombre: lead.name,
                          semana,
                          plan:   lead.plan,
                          pdfBase64,
                        },
                      }).then(({ data, error }: { data: unknown; error: unknown }) => {
                        if (error) {
                          console.warn('notify-seguimiento-semanal invoke error:', error)
                          toast.warning(`Soportes guardado. Email falló — revisa la función en Supabase.`)
                        } else if ((data as { ok?: boolean })?.ok === false) {
                          const status = (data as { status?: number })?.status
                          console.warn('notify-seguimiento-semanal Brevo error — status:', status, data)
                          toast.warning(`Soportes guardado. Brevo rechazó el email (${status ?? '?'}). Verifica BREVO_API_KEY en Supabase.`)
                        } else {
                          toast.success(`📧 Reporte Semana ${semana} enviado a ${lead.email}`, { duration: 4000 })
                        }
                      }).catch((err: unknown) => {
                        console.warn('notify-seguimiento-semanal:', err)
                        toast.warning('Soportes guardado. No se pudo invocar la función de email.')
                      })
                    } catch (err) {
                      console.warn('PDF seguimiento build:', err)
                      toast.warning('No se pudo generar el PDF del reporte.')
                    }
                  }

                  setGuardando(false)
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '7px 16px', borderRadius: '8px',
                  border: `1px solid ${isCtrl ? '#D4AF37' : '#12C49A'}`,
                  background: isCtrl ? '#FEFCE8' : '#F0FDF4',
                  cursor: guardando ? 'not-allowed' : 'pointer',
                  fontSize: '12px', fontWeight: 700,
                  color: isCtrl ? '#92400E' : '#0A3D2E',
                  opacity: guardando ? 0.7 : 1,
                }}
              >
                <Save size={13} />
                <Mail size={13} />
                {guardando ? 'Guardando y enviando...' : isCtrl ? 'Guardar Control + Email' : 'Guardar + Email Paciente'}
              </button>
            </div>
          )}

          {/* ── Control médico (existente, semanas 4/8/12) ── */}
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

  // Cargar HC para baseline examen físico
  const [hcForm, setHcForm] = useState<HCForm | null>(null)
  useEffect(() => {
    if (lead.hc_id) {
      obtenerHistoria(lead.hc_id).then(({ data }) => {
        if (data?.datos) setHcForm(data.datos as HCForm)
      })
    }
  }, [lead.hc_id])

  const isTele = hcForm?.modalidad === 'telemedicina'

  const pesoBaseline = hcForm
    ? parseFloat((hcForm.modalidad === 'telemedicina' ? hcForm.tp : hcForm.peso) ?? '')
    : NaN
  const lastSemConPeso = (lead.seguimiento ?? [])
    .filter(s => !!s.peso)
    .sort((a, b) => b.semana - a.semana)[0]
  const pesoActual    = lastSemConPeso ? parseFloat(lastSemConPeso.peso ?? '') : NaN
  const metaPeso      = lead.meta ? parseFloat(lead.meta) : NaN
  const kilosPerdidos = !isNaN(pesoBaseline) && !isNaN(pesoActual)
    ? pesoBaseline - pesoActual : null
  const kilosFaltan   = !isNaN(pesoActual) && !isNaN(metaPeso)
    ? pesoActual - metaPeso : null
  const pctProgreso   = !isNaN(pesoBaseline) && !isNaN(metaPeso) && !isNaN(pesoActual) && pesoBaseline > metaPeso
    ? Math.min(100, Math.max(0, ((pesoBaseline - pesoActual) / (pesoBaseline - metaPeso)) * 100))
    : null

  function updateSemana(n: number, patch: Partial<SeguimientoSemanal>) {
    const prev = (lead.seguimiento ?? []).filter(s => s.semana !== n)
    const curr = (lead.seguimiento ?? []).find(s => s.semana === n) ?? { semana: n }
    updateLead(lead.id, { seguimiento: [...prev, { ...curr, ...patch }] })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── Header paciente (existente) ── */}
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

      {/* ── Fechas del Programa ── */}
      <div style={{ border: '1px solid #D1FAE5', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ background: '#F0FDF4', padding: '10px 18px', borderBottom: '1px solid #D1FAE5' }}>
          <p style={{ fontSize: '10px', fontWeight: 800, color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>Fechas del Programa</p>
        </div>
        <div style={{ padding: '12px 18px', background: '#fff', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Inicio — automático */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>Fecha de Inicio del Programa</span>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#0A3D2E', background: '#E6FAF5', padding: '4px 14px', borderRadius: '8px' }}>
              {(() => {
                const d = lead.plan_inicio ?? lead.pago2_fecha
                return d
                  ? new Date(d + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
                  : '—'
              })()}
            </span>
          </div>
          {/* Aplicación medicamento — editable */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#374151', flexShrink: 0 }}>Fecha de Aplicación del Medicamento</span>
            <input
              type="date"
              value={lead.fecha_aplicacion_med ?? ''}
              onChange={e => updateLead(lead.id, { fecha_aplicacion_med: e.target.value })}
              style={{ height: '32px', borderRadius: '8px', border: '1px solid #E5E7EB', padding: '0 10px', fontSize: '12px', color: '#111827', outline: 'none', background: '#fff', minWidth: '150px' }}
            />
          </div>
        </div>
      </div>

      {/* ── Evaluación Inicial — Examen Físico Baseline ── */}
      {hcForm && (
        <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ background: '#0A3D2E', padding: '10px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '11px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
              Evaluación Inicial — Examen Físico
            </p>
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.12)', padding: '2px 10px', borderRadius: '4px' }}>
              {isTele ? 'Telemedicina' : 'Presencial'} · Semana 0
            </span>
          </div>
          <div style={{ padding: '14px 18px', background: '#F9FAFB' }}>
            {isTele ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <BaseCell label="Peso" value={hcForm.tp} unit="kg" />
                <BaseCell label="Cintura" value={hcForm.tw} unit="cm" />
                <BaseCell label="Cadera" value={hcForm.thip} unit="cm" />
                <BaseCell label="Cuello" value={hcForm.tn} unit="cm" />
                <BaseCell label="Pantorrilla" value={hcForm.tc} unit="cm" />
                <BaseCell label="TA" value={hcForm.pa} unit="mmHg" />
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '10px' }}>
                  <BaseCell label="Peso" value={hcForm.peso} unit="kg" />
                  <BaseCell label="IMC" value={hcForm.imc} unit="kg/m²" />
                  <BaseCell label="Grasa Corp." value={hcForm.grasa} unit="%" />
                  <BaseCell label="Masa Grasa" value={hcForm.grasa_kg} unit="kg" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '10px' }}>
                  <BaseCell label="Masa Magra %" value={hcForm.muscular} unit="%" />
                  <BaseCell label="Masa Magra Kg" value={hcForm.magra_kg} unit="kg" />
                  <BaseCell label="Agua" value={hcForm.agua_total} unit="L" />
                  <BaseCell label="Peri. Abd." value={hcForm.peri_abd} unit="cm" />
                </div>
                <div style={{ height: '1px', background: '#E5E7EB', margin: '4px 0 10px' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                  <BaseCell label="TA" value={hcForm.pa} unit="mmHg" />
                  <BaseCell label="FC" value={hcForm.fc} unit="lpm" />
                  <BaseCell label="Temp." value={hcForm.temp} unit="°C" />
                  <BaseCell label="SatO₂" value={hcForm.sato2} unit="%" />
                  <BaseCell label="FR" value={hcForm.fr} unit="rpm" />
                </div>
                {hcForm.fat_range && (
                  <div style={{ marginTop: '10px', padding: '6px 12px', background: '#E6FAF5', borderRadius: '8px', fontSize: '12px', color: '#0A3D2E', fontWeight: 600 }}>
                    Rango grasa óptima inicial: <strong>{hcForm.fat_range}</strong>
                  </div>
                )}
              </>
            )}

            {/* ── Meta Sugerida + Progreso ── */}
            <div style={{ marginTop: '14px', border: '1.5px solid #12C49A', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ background: '#12C49A', padding: '8px 14px' }}>
                <p style={{ margin: 0, fontSize: '10px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Meta Sugerida y Progreso de Peso</p>
              </div>
              <div style={{ padding: '12px 14px', background: '#fff', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Meta editable */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>Meta de Peso Sugerida</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="number"
                      value={lead.meta ?? ''}
                      onChange={e => updateLead(lead.id, { meta: e.target.value })}
                      placeholder="65"
                      style={{ width: '80px', height: '32px', borderRadius: '8px', border: '1.5px solid #12C49A', padding: '0 8px', fontSize: '13px', fontWeight: 700, color: '#0A3D2E', textAlign: 'center', outline: 'none' }}
                    />
                    <span style={{ fontSize: '12px', color: '#6B7280' }}>kg</span>
                  </div>
                </div>
                {/* Stats: perdidos / faltan */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ textAlign: 'center', padding: '12px 8px', background: '#F0FDF4', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
                    <p style={{ fontSize: '9px', fontWeight: 700, color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>↓ Ha Bajado</p>
                    {kilosPerdidos !== null ? (
                      <>
                        <p style={{ fontSize: '22px', fontWeight: 900, color: kilosPerdidos > 0 ? '#16A34A' : kilosPerdidos < 0 ? '#DC2626' : '#6B7280', margin: 0, lineHeight: 1.1 }}>
                          {Math.abs(kilosPerdidos).toFixed(1)}
                        </p>
                        <p style={{ fontSize: '11px', color: '#6B7280', margin: '2px 0 0' }}>
                          kg {kilosPerdidos > 0 ? 'perdidos' : kilosPerdidos < 0 ? 'ganados' : 'sin cambio'}
                        </p>
                      </>
                    ) : (
                      <p style={{ fontSize: '13px', color: '#D1D5DB', margin: '8px 0' }}>Sin registro</p>
                    )}
                  </div>
                  <div style={{ textAlign: 'center', padding: '12px 8px', background: kilosFaltan !== null && kilosFaltan <= 0 ? '#F0FDF4' : '#FFF7ED', borderRadius: '10px', border: `1px solid ${kilosFaltan !== null && kilosFaltan <= 0 ? '#BBF7D0' : '#FED7AA'}` }}>
                    <p style={{ fontSize: '9px', fontWeight: 700, color: kilosFaltan !== null && kilosFaltan <= 0 ? '#065F46' : '#92400E', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>
                      {kilosFaltan !== null && kilosFaltan <= 0 ? '🎯 Meta lograda' : 'Le Faltan'}
                    </p>
                    {kilosFaltan !== null ? (
                      <>
                        <p style={{ fontSize: '22px', fontWeight: 900, color: kilosFaltan <= 0 ? '#16A34A' : '#D97706', margin: 0, lineHeight: 1.1 }}>
                          {kilosFaltan <= 0 ? '✓' : kilosFaltan.toFixed(1)}
                        </p>
                        {kilosFaltan > 0 && <p style={{ fontSize: '11px', color: '#6B7280', margin: '2px 0 0' }}>kg para la meta</p>}
                      </>
                    ) : (
                      <p style={{ fontSize: '11px', color: '#D1D5DB', margin: '8px 0' }}>
                        {!lead.meta ? 'Sin meta definida' : 'Sin peso registrado'}
                      </p>
                    )}
                  </div>
                </div>
                {/* Barra de progreso hacia la meta */}
                {pctProgreso !== null && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#9CA3AF', marginBottom: '4px' }}>
                      <span>Inicio: {pesoBaseline.toFixed(1)} kg</span>
                      <span>Actual: {pesoActual.toFixed(1)} kg</span>
                      <span>Meta: {metaPeso.toFixed(1)} kg</span>
                    </div>
                    <div style={{ height: '8px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pctProgreso}%`, background: 'linear-gradient(90deg, #12C49A, #16A34A)', borderRadius: '4px', transition: 'width 0.4s' }} />
                    </div>
                    <p style={{ fontSize: '10px', color: '#6B7280', margin: '4px 0 0', textAlign: 'right' }}>
                      {pctProgreso.toFixed(0)}% del camino recorrido
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 12 semanas ── */}
      <div>
        <p style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 10px' }}>12 Semanas de Seguimiento</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
            <SemanaCard key={n} semana={n} lead={lead} semActual={semActual} updateSemana={updateSemana} hcForm={hcForm} />
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
