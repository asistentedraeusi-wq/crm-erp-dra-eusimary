import { supabase } from './supabase'
import type { Lead, StageId } from '../context/LeadsContext'

// Estructura que devuelve la función crm_get_leads() de Supabase
interface SupabaseLeadRow {
  id: string
  created_at: string
  nombre: string | null
  edad: number | null
  celular: string | null
  email: string | null
  meta: string | null
  objetivo: string | null
  condicion: string | null
}

function assignLeadNo(seq: number): string {
  return `L${String(seq).padStart(3, '0')}`
}

function mapRow(row: SupabaseLeadRow, assignedId: string): Lead {
  const date = row.created_at
    ? new Date(row.created_at).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10)

  const tags: string[] = []
  if (row.condicion) tags.push(row.condicion)

  return {
    id:        assignedId,
    name:      row.nombre   ?? 'Sin nombre',
    phone:     row.celular  ?? 'Sin teléfono',
    email:     row.email    ?? 'Sin email',
    age:       row.edad     ?? 0,
    city:      'Barranquilla',
    stage:     'nuevo' as StageId,
    date,
    tags,
    meta:      row.meta      ?? undefined,
    objetivo:  row.objetivo  ?? undefined,
    condicion: row.condicion ?? undefined,
  }
}

export interface ImportResult {
  imported: Lead[]
  skipped: number
  total: number
}

export async function fetchLeadsFromSupabase(existingLeads: Lead[]): Promise<ImportResult> {
  if (!supabase) {
    throw new Error('Supabase no está configurado. Revisa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env')
  }

  // Llamar a la función segura crm_get_leads() que bypasa RLS con SECURITY DEFINER
  const { data, error } = await supabase.rpc('crm_get_leads')

  if (error) {
    // La función no existe aún — el setup.sql no se ha ejecutado
    if (error.code === 'PGRST202' || error.message?.includes('crm_get_leads')) {
      throw new Error(
        'SETUP_REQUIRED: Ejecuta el archivo supabase/setup.sql en el Editor SQL de Supabase antes de importar.'
      )
    }
    throw new Error(`Error Supabase: ${error.message}`)
  }

  const rows = (data ?? []) as SupabaseLeadRow[]

  // Índices para deduplicación
  const existingEmails = new Set(existingLeads.map(l => l.email.trim().toLowerCase()))
  const existingPhones = new Set(existingLeads.map(l => l.phone.replace(/\s+/g, '')))

  const maxSeq = existingLeads.reduce((max, l) => {
    const n = parseInt(l.id.replace('L', ''), 10) || 0
    return n > max ? n : max
  }, 0)

  let skipped = 0
  const imported: Lead[] = []

  for (const row of rows) {
    const emailNorm = (row.email ?? '').trim().toLowerCase()
    const phoneNorm = (row.celular ?? '').replace(/\s+/g, '')

    const isDuplicate =
      (emailNorm && existingEmails.has(emailNorm)) ||
      (phoneNorm && existingPhones.has(phoneNorm))

    if (isDuplicate) {
      skipped++
      continue
    }

    const seq  = maxSeq + imported.length + 1
    const lead = mapRow(row, assignLeadNo(seq))
    imported.push(lead)

    if (emailNorm) existingEmails.add(emailNorm)
    if (phoneNorm) existingPhones.add(phoneNorm)
  }

  return { imported, skipped, total: rows.length }
}
