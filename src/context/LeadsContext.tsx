import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

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

const INITIAL_LEADS: Lead[] = [
  { id: 'L001', name: 'Andrea Martínez',  phone: '+57 300 1234567', email: 'andrea.m@gmail.com',   age: 38, city: 'Barranquilla', stage: 'nuevo',            date: '2026-05-28', tags: ['Instagram'],       source: 'Instagram' },
  { id: 'L002', name: 'Carlos Pérez',     phone: '+57 312 9876543', email: 'cperez@hotmail.com',   age: 45, city: 'Bogotá',        stage: 'nuevo',            date: '2026-05-29', tags: ['Referido'],        source: 'Referido' },
  { id: 'L003', name: 'Sofía Ramírez',    phone: '+57 315 4561230', email: 'sofiar@gmail.com',     age: 52, city: 'Medellín',      stage: 'contactado',       date: '2026-05-20', tags: ['WhatsApp'],        source: 'WhatsApp' },
  { id: 'L004', name: 'Miguel Torres',    phone: '+57 301 7890123', email: 'mtorres@yahoo.com',    age: 41, city: 'Cali',          stage: 'contactado',       date: '2026-05-18', tags: ['Facebook'],        source: 'Facebook' },
  { id: 'L005', name: 'Laura Gómez',      phone: '+57 320 3456789', email: 'laurag@gmail.com',     age: 35, city: 'Barranquilla', stage: 'cita_agendada',    date: '2026-05-15', tags: ['Instagram', 'S1'], source: 'Instagram', plan: 'S1' },
  { id: 'L006', name: 'Pedro Herrera',    phone: '+57 317 6543210', email: 'pherrera@gmail.com',   age: 60, city: 'Santa Marta',  stage: 'cita_agendada',    date: '2026-05-14', tags: ['Referido'],        source: 'Referido' },
  { id: 'L007', name: 'Valeria Castro',   phone: '+57 311 2345678', email: 'vcastro@outlook.com',  age: 29, city: 'Barranquilla', stage: 'cita_blueprint',   date: '2026-05-10', tags: ['S2'],              source: 'Google',    plan: 'S2' },
  { id: 'L008', name: 'Andrés Silva',     phone: '+57 318 8765432', email: 'asilva@gmail.com',     age: 48, city: 'Bogotá',        stage: 'cita_blueprint',   date: '2026-05-08', tags: ['S1', 'Urgente'],   source: 'Referido',  plan: 'S1' },
  { id: 'L009', name: 'Camila Ruiz',      phone: '+57 304 5678901', email: 'cruiz@gmail.com',      age: 33, city: 'Barranquilla', stage: 'paraclínicos',     date: '2026-05-05', tags: ['S1'],              source: 'Instagram', plan: 'S1' },
  { id: 'L010', name: 'Jorge Morales',    phone: '+57 322 1098765', email: 'jmorales@gmail.com',   age: 55, city: 'Cartagena',     stage: 'segunda_cita',     date: '2026-04-28', tags: ['S2'],              source: 'WhatsApp',  plan: 'S2' },
  { id: 'L011', name: 'Diana López',      phone: '+57 316 4321098', email: 'dlopez@gmail.com',     age: 42, city: 'Barranquilla', stage: 'pendiente_inicio', date: '2026-04-20', tags: ['S1', 'Referido'],  source: 'Referido',  plan: 'S1' },
  { id: 'L012', name: 'Luis Fernández',   phone: '+57 308 7654321', email: 'lfernandez@gmail.com', age: 50, city: 'Medellín',      stage: 'activo',           date: '2026-04-10', tags: ['S2'],              source: 'Facebook',  plan: 'S2', notes: 'Semana 4 completada, evolución excelente.' },
  { id: 'L013', name: 'María Jiménez',    phone: '+57 313 2109876', email: 'mjimenez@gmail.com',   age: 39, city: 'Barranquilla', stage: 'activo',           date: '2026-03-15', tags: ['S1'],              source: 'Instagram', plan: 'S1', notes: 'Paciente comprometida, baja de peso 6kg.' },
  { id: 'L014', name: 'Roberto Vargas',   phone: '+57 319 5432109', email: 'rvargas@outlook.com',  age: 58, city: 'Bogotá',        stage: 'renovacion',       date: '2026-02-01', tags: ['S1→S2', 'VIP'],   source: 'Referido',  plan: 'S2', notes: 'Renovó a S2. Refirió 2 pacientes.' },
  { id: 'L015', name: 'Patricia Soto',    phone: '+57 302 8901234', email: 'psoto@gmail.com',      age: 47, city: 'Barranquilla', stage: 'no_renueva',       date: '2026-01-15', tags: ['No contactable'],  source: 'Instagram' },
]

const STORAGE_KEY = 'crm_eusimary_leads_v1'

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

  function moveStage(id: string, stage: StageId) {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, stage } : l))
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
