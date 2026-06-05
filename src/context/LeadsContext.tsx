import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react'
import { toast } from 'sonner'
import { supabase } from '../lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

export type StageId =
  | 'nuevo' | 'contactado' | 'cita_agendada' | 'cita_blueprint'
  | 'paraclínicos' | 'segunda_cita' | 'pendiente_inicio'
  | 'activo' | 'renovacion' | 'no_renueva'

export interface SeguimientoSemanal {
  semana:              number    // 1–12
  fecha?:              string
  peso?:               string
  cintura?:            string
  pa?:                 string
  dosis?:              string    // S1
  sitio_inyeccion?:    string    // S1
  dias_ejercicio?:     string
  vasos_agua?:         string
  sintomas?:           string[]
  adherencia?:         'excelente' | 'regular' | 'bajo'
  notas?:              string
  // Control médico (semanas 4, 8, 12)
  control_grasa?:      string
  control_magra?:      string
  control_nueva_dosis?:string
  control_prox_fecha?: string
  control_indicaciones?:string
}

export interface Lead {
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
  // Campos clínicos — vienen de la tabla leads de Supabase
  meta?: string
  objetivo?: string
  condicion?: string
  fuente?: string
  // Gestión de pago e inicio de programa
  pago_confirmado?: boolean
  plan_inicio?:     string    // fecha ISO 'YYYY-MM-DD'
  // Seguimiento semanal (12 semanas)
  seguimiento?:     SeguimientoSemanal[]
}

// ─── Datos iniciales (mock) ───────────────────────────────────────────────────

const INITIAL_LEADS: Lead[] = []

const STORAGE_KEY     = 'crm_eusimary_leads_v1'
const CAL_PROC_KEY    = 'crm_cal_processed_v1'

// Orden de etapas — solo avanzamos, nunca retrocedemos por webhook de Cal.com
const STAGE_ORDER: StageId[] = [
  'nuevo', 'contactado', 'cita_agendada', 'cita_blueprint',
  'paraclínicos', 'segunda_cita', 'pendiente_inicio',
  'activo', 'renovacion', 'no_renueva',
]

function getProcessedCal(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(CAL_PROC_KEY) ?? '[]')) }
  catch { return new Set() }
}

function markProcessedCal(id: string) {
  const s = getProcessedCal()
  s.add(id)
  localStorage.setItem(CAL_PROC_KEY, JSON.stringify([...s]))
}

function loadLeads(): Lead[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return INITIAL_LEADS
    const parsed = JSON.parse(raw) as Lead[]
    return parsed.length > 0 ? parsed : INITIAL_LEADS
  } catch {
    return INITIAL_LEADS
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface LeadsContextValue {
  leads: Lead[]
  moveStage: (id: string, stage: StageId) => void
  addLead: (stageId: StageId) => Lead
  updateLead: (id: string, patch: Partial<Lead>) => void
  importLeads: (newLeads: Lead[]) => void
}

const LeadsContext = createContext<LeadsContextValue | null>(null)

export function LeadsProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(loadLeads)

  // Persiste en localStorage cada vez que cambia el estado
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads))
  }, [leads])

  // Ref siempre actualizado — necesario para leer el estado actual
  // desde dentro de callbacks de Realtime sin re-suscribirse cada render
  const leadsRef = useRef(leads)
  useEffect(() => { leadsRef.current = leads }, [leads])

  // ─── Cal.com Realtime ───────────────────────────────────────────────────────
  // Cuando el paciente agenda en Cal.com → webhook → cal_bookings → aquí
  // Se procesa tanto on-mount (bookings pendientes) como en tiempo real
  useEffect(() => {
    const sb = supabase
    if (!sb) return

    type CalRow = { id: string; email: string; event_slug: string; nombre: string }

    function handleBooking(b: CalRow) {
      if (getProcessedCal().has(b.id)) return

      const targetStage: StageId =
        b.event_slug === 'segunda_cita' ? 'segunda_cita' : 'cita_agendada'

      const lead = leadsRef.current.find(
        l => l.email.toLowerCase().trim() === b.email.toLowerCase().trim()
      )

      if (lead) {
        const ci = STAGE_ORDER.indexOf(lead.stage)
        const ti = STAGE_ORDER.indexOf(targetStage)
        if (ti > ci) {
          // setLeads funcional — seguro desde closure estático (setLeads es estable)
          setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, stage: targetStage } : l))
          toast.success(
            targetStage === 'segunda_cita'
              ? `📅 ${b.nombre || lead.name} agendó 2ª Cita → 06 · 2da Cita Médica`
              : `📅 ${b.nombre || lead.name} agendó Cita → 03 · Cita Agendada`
          )
        }
      } else {
        console.warn(`cal-booking: sin lead para ${b.email}`)
      }

      markProcessedCal(b.id)
    }

    // 1. Procesar bookings pendientes que llegaron cuando el CRM estaba cerrado
    sb.from('cal_bookings')
      .select('id, email, event_slug, nombre')
      .order('created_at', { ascending: true })
      .then(({ data }) => { data?.forEach(b => handleBooking(b as CalRow)) })

    // 2. Suscripción Realtime: nuevos bookings mientras el CRM está abierto
    const channel = sb
      .channel('cal-bookings-realtime')
      .on(
        'postgres_changes' as const,
        { event: 'INSERT', schema: 'public', table: 'cal_bookings' },
        payload => handleBooking(payload.new as CalRow)
      )
      .subscribe()

    return () => { sb.removeChannel(channel) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function moveStage(id: string, stage: StageId) {
    setLeads(prev => {
      const updated = prev.map(l => l.id === id ? { ...l, stage } : l)

      // Cuando llega a Paraclínicos → recordatorio 48h al paciente + notificación a la Dra.
      // Se dispara desde HC (guardar Cita 1) y desde el Pipeline (mover manual)
      if (stage === 'paraclínicos' && supabase) {
        const lead = updated.find(l => l.id === id)
        if (lead?.email) {
          const payload = { email: lead.email, nombre: lead.name, celular: lead.phone }
          supabase.functions.invoke('notify-paraclinicos', { body: payload })
            .catch((err: unknown) => console.warn('notify-paraclinicos:', err))
          supabase.functions.invoke('notify-doctor', { body: payload })
            .catch((err: unknown) => console.warn('notify-doctor:', err))
        }
      }

      return updated
    })
  }

  function addLead(stageId: StageId): Lead {
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
    return newLead
  }

  function updateLead(id: string, patch: Partial<Lead>) {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l))
  }

  function importLeads(newLeads: Lead[]) {
    setLeads(prev => [...prev, ...newLeads])
  }

  return (
    <LeadsContext.Provider value={{ leads, moveStage, addLead, updateLead, importLeads }}>
      {children}
    </LeadsContext.Provider>
  )
}

export function useLeads() {
  const ctx = useContext(LeadsContext)
  if (!ctx) throw new Error('useLeads must be used within LeadsProvider')
  return ctx
}
