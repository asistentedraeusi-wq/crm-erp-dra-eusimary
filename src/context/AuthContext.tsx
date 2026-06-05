import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export interface AppUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'asistente'
  active: boolean
}

interface AuthContextValue {
  currentUser: AppUser | null
  session:     Session | null
  loading:     boolean
  login:       (email: string, password: string) => Promise<{ error: string | null }>
  logout:      () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function fetchProfile(userId: string): Promise<Omit<AppUser, 'id' | 'email'> | null> {
  if (!supabase) return null
  const { data } = await supabase
    .from('profiles')
    .select('name, role, active')
    .eq('id', userId)
    .single()
  return data ?? null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null)
  const [session,     setSession]     = useState<Session | null>(null)
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }

    // Cargar sesión almacenada al iniciar
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        if (profile) {
          setCurrentUser({ id: session.user.id, email: session.user.email ?? '', ...profile })
        }
      }
      setLoading(false)
    })

    // Escuchar cambios de sesión (login, logout, refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        if (profile) {
          setCurrentUser({ id: session.user.id, email: session.user.email ?? '', ...profile })
        } else {
          setCurrentUser(null)
        }
      } else {
        setCurrentUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function login(email: string, password: string): Promise<{ error: string | null }> {
    if (!supabase) return { error: 'Supabase no configurado.' }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      if (error.message.toLowerCase().includes('invalid login')) {
        return { error: 'Usuario o contraseña incorrectos.' }
      }
      return { error: 'Error al iniciar sesión. Intenta de nuevo.' }
    }
    return { error: null }
  }

  async function logout(): Promise<void> {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ currentUser, session, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
