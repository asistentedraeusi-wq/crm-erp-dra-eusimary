import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL ?? ''
const key = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

// Detecta si las credenciales reales están configuradas en .env
export const isSupabaseConfigured =
  url !== '' &&
  url !== 'https://tu-proyecto.supabase.co' &&
  key !== '' &&
  key !== 'tu_anon_key_aqui'

export const supabase = isSupabaseConfigured ? createClient(url, key) : null
