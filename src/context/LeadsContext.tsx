import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react'
import { toast } from 'sonner'
import { supabase } from '../lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

export type StageId =
  | 'nuevo' | 'contactado' | 'cita_agendada' | 'cita_blueprint'
  | 'paraclínicos' | 'segunda_cita' | 'pendiente_inicio'
  | 'activo' | 'renovacion' | 'no_renueva' | 'leads_nutrir'

export interface SeguimientoSemanal {
  semana:              number
  fecha?:              string
  peso?:               string
  cintura?:            string
  pa?:                 string
  dosis?:              string
  sitio_inyeccion?:    string
  dias_ejercicio?:     string
  vasos_agua?:         string
  sintomas?:           string[]
  adherencia?:         'excelente' | 'regular' | 'bajo'
  notas?:              string
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
  meta?: string
  objetivo?: string
  condicion?: string
  fuente?: string
  filtro_pagado?:   boolean
  pago_confirmado?: boolean
  plan_inicio?:     string
  hc_id?:           string
  seguimiento?:     SeguimientoSemanal[]
  // Pago 2ª cita — se activa cuando HC Point 11 se guarda con programa_2cita
  segunda_cita_programa?: string
  pago2_valor_asignado?:  number
  pago2_pagado?:          number
  pago2_tipo?:            'total' | 'parcial'
  pago2_fecha?:           string
}

// ─── Storage keys ─────────────────────────────────────────────────────────────

const STORAGE_KEY  = 'crm_eusimary_leads_v1'
const CAL_PROC_KEY = 'crm_cal_processed_v1'

// Orden de etapas — solo avanzamos por webhook de Cal.com
const STAGE_ORDER: StageId[] = [
  'nuevo', 'contactado', 'cita_agendada', 'cita_blueprint',
  'paraclínicos', 'segunda_cita', 'pendiente_inicio',
  'activo', 'renovacion', 'no_renueva',
]

// ─── localStorage helpers ─────────────────────────────────────────────────────

function loadLeadsLocal(): Lead[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Lead[]
  } catch {
    return []
  }
}

function getProcessedCal(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(CAL_PROC_KEY) ?? '[]')) }
  catch { return new Set() }
}

function markProcessedCal(id: string) {
  const s = getProcessedCal()
  s.add(id)
  localStorage.setItem(CAL_PROC_KEY, JSON.stringify([...s]))
}

// ─── Supabase helpers ─────────────────────────────────────────────────────────

type DbRow = Record<string, unknown>

function rowToLead(row: DbRow): Lead {
  return {
    id:              row.id as string,
    name:            (row.name as string) || '',
    phone:           (row.phone as string) || '',
    email:           (row.email as string) || '',
    age:             (row.age as number) || 0,
    city:            (row.city as string) || '',
    stage:           (row.stage as StageId) || 'nuevo',
    date:            (row.date as string) || '',
    plan:            (row.plan as Lead['plan']) ?? undefined,
    tags:            (row.tags as string[]) || [],
    source:          (row.source as string) ?? undefined,
    notes:           (row.notes as string) ?? undefined,
    meta:            (row.meta as string) ?? undefined,
    objetivo:        (row.objetivo as string) ?? undefined,
    condicion:       (row.condicion as string) ?? undefined,
    fuente:          (row.fuente as string) ?? undefined,
    filtro_pagado:   (row.filtro_pagado as boolean) ?? undefined,
    pago_confirmado: (row.pago_confirmado as boolean) ?? undefined,
    plan_inicio:     (row.plan_inicio as string) ?? undefined,
    hc_id:           (row.hc_id as string) ?? undefined,
    seguimiento:     (row.seguimiento as SeguimientoSemanal[]) ?? undefined,
    segunda_cita_programa: (row.segunda_cita_programa as string) ?? undefined,
    pago2_valor_asignado:  (row.pago2_valor_asignado as number) ?? undefined,
    pago2_pagado:          (row.pago2_pagado as number) ?? undefined,
    pago2_tipo:            (row.pago2_tipo as Lead['pago2_tipo']) ?? undefined,
    pago2_fecha:           (row.pago2_fecha as string) ?? undefined,
  }
}

function leadToRow(lead: Lead) {
  return {
    id:              lead.id,
    name:            lead.name,
    phone:           lead.phone,
    email:           lead.email,
    age:             lead.age,
    city:            lead.city,
    stage:           lead.stage,
    date:            lead.date,
    plan:            lead.plan ?? null,
    tags:            lead.tags,
    source:          lead.source ?? null,
    notes:           lead.notes ?? null,
    meta:            lead.meta ?? null,
    objetivo:        lead.objetivo ?? null,
    condicion:       lead.condicion ?? null,
    fuente:          lead.fuente ?? null,
    filtro_pagado:          lead.filtro_pagado ?? null,
    pago_confirmado:        lead.pago_confirmado ?? null,
    plan_inicio:            lead.plan_inicio ?? null,
    hc_id:                  lead.hc_id ?? null,
    seguimiento:            lead.seguimiento ?? null,
    segunda_cita_programa:  lead.segunda_cita_programa ?? null,
    pago2_valor_asignado:   lead.pago2_valor_asignado ?? null,
    pago2_pagado:           lead.pago2_pagado ?? null,
    pago2_tipo:             lead.pago2_tipo ?? null,
    pago2_fecha:            lead.pago2_fecha ?? null,
    updated_at:             new Date().toISOString(),
  }
}

async function fetchAllLeads(): Promise<Lead[] | null> {
  if (!supabase) return null
  // Intentar con filtro deleted_at (requiere migración 004)
  const { data, error } = await supabase
    .from('crm_leads')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
  if (error) {
    console.warn('crm_leads fetch (con filtro):', error.message)
    // Fallback sin filtro si la columna deleted_at no existe aún
    const { data: fallback, error: err2 } = await supabase
      .from('crm_leads')
      .select('*')
      .order('created_at', { ascending: true })
    if (err2) { console.warn('crm_leads fetch (fallback):', err2.message); return null }
    return (fallback ?? []).map(row => rowToLead(row as DbRow))
  }
  return (data ?? []).map(row => rowToLead(row as DbRow))
}

async function upsertLead(lead: Lead): Promise<void> {
  if (!supabase) return
  const { error } = await supabase
    .from('crm_leads')
    .upsert(leadToRow(lead), { onConflict: 'id' })
  if (error) console.warn('crm_leads upsert:', error.message)
}

async function deleteLeadSb(id: string): Promise<void> {
  if (!supabase) return
  // Soft-delete: marcar con deleted_at en lugar de borrar físicamente
  // Recuperable desde Supabase Dashboard (vista crm_leads_papelera) por 30 días
  const { error } = await supabase
    .from('crm_leads')
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) console.warn('crm_leads soft-delete:', error.message)
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface LeadsContextValue {
  leads: Lead[]
  moveStage: (id: string, stage: StageId) => void
  addLead: (stageId: StageId) => Lead
  updateLead: (id: string, patch: Partial<Lead>) => void
  deleteLead: (id: string) => void
  importLeads: (newLeads: Lead[]) => void
}

const LeadsContext = createContext<LeadsContextValue | null>(null)

export function LeadsProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage so the UI renders immediately without flicker
  const [leads, setLeads] = useState<Lead[]>(loadLeadsLocal)

  // Ref siempre actualizado para callbacks de Realtime
  const leadsRef = useRef(leads)
  useEffect(() => { leadsRef.current = leads }, [leads])

  // ─── Sync inicial desde Supabase (fuente de verdad) ──────────────────────
  useEffect(() => {
    async function init() {
      // Supabase es la única fuente de verdad — nunca se sube localStorage
      const sbLeads = await fetchAllLeads()
      if (sbLeads === null) return

      // Auto-avance de leads 'guia' — corre DESPUÉS de cargar datos reales
      // (nunca con datos de caché local para evitar sobreescribir Supabase)
      const today = new Date(); today.setHours(0, 0, 0, 0)
      const advanced = sbLeads.map(lead => {
        const fuente = (lead.source ?? lead.fuente ?? '').toLowerCase()
        if (fuente !== 'guia') return lead
        const leadDate = new Date(lead.date); leadDate.setHours(0, 0, 0, 0)
        const days = Math.floor((today.getTime() - leadDate.getTime()) / 86_400_000)
        // Solo avanza nuevo → contactado (automático).
        // contactado → leads_nutrir se hace manualmente para no sobreescribir movimientos intencionales.
        if (lead.stage === 'nuevo' && days >= 2) return { ...lead, stage: 'contactado' as StageId }
        return lead
      })
      advanced.forEach((lead, i) => {
        if (lead.stage !== sbLeads[i]?.stage) upsertLead(lead)
      })

      setLeads(advanced)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(advanced))
    }
    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Realtime: recibir cambios del otro usuario en vivo ──────────────────
  useEffect(() => {
    const sb = supabase
    if (!sb) return

    const channel = sb
      .channel('crm-leads-realtime')
      .on(
        'postgres_changes' as const,
        { event: '*', schema: 'public', table: 'crm_leads' },
        payload => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const row = payload.new as DbRow
            // Si el lead fue soft-deleted, quitarlo de la vista
            if (row.deleted_at) {
              setLeads(prev => prev.filter(l => l.id !== row.id))
              return
            }
            const incoming = rowToLead(row)
            setLeads(prev => {
              const exists = prev.some(l => l.id === incoming.id)
              return exists
                ? prev.map(l => l.id === incoming.id ? incoming : l)
                : [...prev, incoming]
            })
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id: string }).id
            setLeads(prev => prev.filter(l => l.id !== deletedId))
          }
        }
      )
      .subscribe()

    return () => { sb.removeChannel(channel) }
  }, [])

  // Caché local: siempre refleja el estado actual para modo offline
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads))
  }, [leads])

  // ─── Cal.com Realtime ───────────────────────────────────────────────────────
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
          const updated = { ...lead, stage: targetStage }
          setLeads(prev => prev.map(l => l.id === lead.id ? updated : l))
          upsertLead(updated)
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

    sb.from('cal_bookings')
      .select('id, email, event_slug, nombre')
      .order('created_at', { ascending: true })
      .then(({ data }) => { data?.forEach(b => handleBooking(b as CalRow)) })

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

  // ─── Mutaciones ───────────────────────────────────────────────────────────

  function moveStage(id: string, stage: StageId) {
    setLeads(prev => {
      const updated = prev.map(l => l.id === id ? { ...l, stage } : l)
      const lead = updated.find(l => l.id === id)
      if (lead) {
        upsertLead(lead)
        if (stage === 'paraclínicos' && supabase && lead.email) {
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
      id: `L${Date.now().toString(36).toUpperCase()}`,
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
    upsertLead(newLead)
    return newLead
  }

  function updateLead(id: string, patch: Partial<Lead>) {
    setLeads(prev => {
      const updated = prev.map(l => l.id === id ? { ...l, ...patch } : l)
      const lead = updated.find(l => l.id === id)
      if (lead) upsertLead(lead)
      return updated
    })
  }

  function deleteLead(id: string) {
    setLeads(prev => prev.filter(l => l.id !== id))
    deleteLeadSb(id)
  }

  function importLeads(newLeads: Lead[]) {
    setLeads(prev => [...prev, ...newLeads])
    newLeads.forEach(upsertLead)
  }

  return (
    <LeadsContext.Provider value={{ leads, moveStage, addLead, updateLead, deleteLead, importLeads }}>
      {children}
    </LeadsContext.Provider>
  )
}

export function useLeads() {
  const ctx = useContext(LeadsContext)
  if (!ctx) throw new Error('useLeads must be used within LeadsProvider')
  return ctx
}
