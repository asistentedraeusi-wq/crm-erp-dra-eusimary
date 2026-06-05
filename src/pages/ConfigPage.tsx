import { useState, useEffect, useCallback } from 'react'
import {
  Lock, Eye, EyeOff, ShieldCheck, UserPlus, Pencil, Trash2,
  CheckCircle2, XCircle, KeyRound, Users, RefreshCw,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const CONFIG_PIN = 'C@$t2801'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface RemoteUser {
  id:         string
  email:      string
  name:       string
  role:       'admin' | 'asistente'
  active:     boolean
  created_at: string
}

// ─── Gate de verificación ─────────────────────────────────────────────────────

function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState(false)

  function verify() {
    if (pin === CONFIG_PIN) {
      onUnlock()
    } else {
      setError(true)
      setPin('')
      setTimeout(() => setError(false), 2000)
    }
  }

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFB' }}>
      <div style={{
        background: '#fff', borderRadius: '20px', padding: '48px 52px',
        boxShadow: '0 4px 32px rgba(0,0,0,0.08)', width: '100%', maxWidth: '400px',
        border: '1px solid rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(13,34,68,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={26} color="#0D2244" />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0D2244', margin: 0 }}>Zona Restringida</h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0, textAlign: 'center' }}>
            Ingresa la clave de verificación para acceder a Configuración
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', height: '52px',
            background: '#fff', border: `2px solid ${error ? '#EF4444' : '#CBD5E1'}`,
            borderRadius: '12px', transition: 'border-color 0.15s',
          }}>
            <div style={{ padding: '0 14px', display: 'flex', alignItems: 'center' }}>
              <KeyRound size={17} color={error ? '#EF4444' : '#0D2244'} />
            </div>
            <div style={{ width: '1px', height: '20px', background: '#CBD5E1' }} />
            <input
              type={show ? 'text' : 'password'}
              value={pin}
              onChange={e => { setPin(e.target.value); setError(false) }}
              onKeyDown={e => e.key === 'Enter' && verify()}
              placeholder="Clave de verificación"
              style={{ flex: 1, height: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: '15px', color: '#0D2244', padding: '0 12px' }}
            />
            <button type="button" onClick={() => setShow(v => !v)} style={{ padding: '0 14px', color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer' }}>
              {show ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          {error && (
            <p style={{ color: '#EF4444', fontSize: '12px', textAlign: 'center', margin: 0 }}>
              Clave incorrecta. Inténtalo de nuevo.
            </p>
          )}

          <button
            onClick={verify}
            style={{ width: '100%', height: '50px', borderRadius: '12px', background: '#0D2244', color: '#fff', fontWeight: 700, fontSize: '15px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(13,34,68,0.25)' }}
          >
            Verificar acceso
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal Nuevo / Editar Usuario ─────────────────────────────────────────────

interface UserFormData {
  name:     string
  email:    string
  password: string
  role:     'admin' | 'asistente'
  active:   boolean
}

function UserModal({ user, onSave, onClose, saving }: {
  user:    RemoteUser | null
  onSave:  (data: UserFormData) => void
  onClose: () => void
  saving:  boolean
}) {
  const [form, setForm] = useState<UserFormData>({
    name:     user?.name     ?? '',
    email:    user?.email    ?? '',
    password: '',
    role:     user?.role     ?? 'asistente',
    active:   user?.active   ?? true,
  })
  const [showPass, setShowPass] = useState(false)
  const [errors,   setErrors]   = useState<Partial<Record<keyof UserFormData, string>>>({})

  function validate(): boolean {
    const e: Partial<Record<keyof UserFormData, string>> = {}
    if (!form.name.trim())              e.name  = 'Requerido'
    if (!form.email.trim())             e.email = 'Requerido'
    if (!user && !form.password.trim()) e.password = 'Requerido para usuario nuevo'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (validate()) onSave(form)
  }

  const inputStyle = (err?: string): React.CSSProperties => ({
    width: '100%', height: '44px', borderRadius: '10px', padding: '0 14px',
    border: `1.5px solid ${err ? '#EF4444' : '#CBD5E1'}`, outline: 'none',
    fontSize: '14px', color: '#0D2244', background: '#fff', boxSizing: 'border-box',
  })

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ background: '#fff', borderRadius: '18px', padding: '36px 40px', width: '100%', maxWidth: '440px', boxShadow: '0 8px 40px rgba(0,0,0,0.14)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0D2244', margin: '0 0 24px' }}>
          {user ? 'Editar usuario' : 'Nuevo usuario'}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#0D2244', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>Nombre completo</label>
            <input style={inputStyle(errors.name)} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ej. Carlos Suárez" />
            {errors.name && <p style={{ color: '#EF4444', fontSize: '11px', margin: '4px 0 0' }}>{errors.name}</p>}
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#0D2244', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>Correo (usuario)</label>
            <input style={inputStyle(errors.email)} value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="correo@ejemplo.com" type="email" disabled={!!user} />
            {errors.email && <p style={{ color: '#EF4444', fontSize: '11px', margin: '4px 0 0' }}>{errors.email}</p>}
            {user && <p style={{ color: '#94A3B8', fontSize: '11px', margin: '4px 0 0' }}>El correo no se puede cambiar</p>}
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#0D2244', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>
              {user ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                style={{ ...inputStyle(errors.password), paddingRight: '44px' }}
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder={user ? 'Dejar vacío para mantener' : 'Mínimo 6 caracteres'}
              />
              <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p style={{ color: '#EF4444', fontSize: '11px', margin: '4px 0 0' }}>{errors.password}</p>}
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#0D2244', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>Rol</label>
            <select style={{ ...inputStyle(), cursor: 'pointer' }} value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as 'admin' | 'asistente' }))}>
              <option value="admin">Administrador</option>
              <option value="asistente">Asistente / Doctor</option>
            </select>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.active} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} style={{ width: '16px', height: '16px', accentColor: '#12C49A', cursor: 'pointer' }} />
            <span style={{ fontSize: '14px', color: '#334155' }}>Usuario activo</span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
          <button onClick={onClose} disabled={saving} style={{ flex: 1, height: '44px', borderRadius: '10px', border: '1.5px solid #CBD5E1', background: '#fff', color: '#64748B', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 1, height: '44px', borderRadius: '10px', border: 'none', background: saving ? '#94A3B8' : '#12C49A', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 3px 12px rgba(18,196,154,0.35)' }}>
            {saving ? 'Guardando…' : (user ? 'Guardar cambios' : 'Crear usuario')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Panel principal ──────────────────────────────────────────────────────────

function ConfigPanel() {
  const { currentUser } = useAuth()
  const [users,         setUsers]         = useState<RemoteUser[]>([])
  const [loadingUsers,  setLoadingUsers]  = useState(true)
  const [modal,         setModal]         = useState<{ open: boolean; user: RemoteUser | null }>({ open: false, user: null })
  const [saving,        setSaving]        = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [feedback,      setFeedback]      = useState<{ msg: string; ok: boolean } | null>(null)

  const loadUsers = useCallback(async () => {
    if (!supabase) return
    setLoadingUsers(true)
    const { data, error } = await supabase.functions.invoke('admin-users', { body: { action: 'list' } })
    if (!error && data?.users) setUsers(data.users as RemoteUser[])
    setLoadingUsers(false)
  }, [])

  useEffect(() => { loadUsers() }, [loadUsers])

  function showFeedback(msg: string, ok: boolean) {
    setFeedback({ msg, ok })
    setTimeout(() => setFeedback(null), 3000)
  }

  async function handleSave(formData: UserFormData) {
    if (!supabase) return
    setSaving(true)
    const { user } = modal

    if (user) {
      const body: Record<string, unknown> = {
        action: 'update',
        id:     user.id,
        name:   formData.name,
        role:   formData.role,
        active: formData.active,
      }
      if (formData.password) body.password = formData.password

      const { error } = await supabase.functions.invoke('admin-users', { body })
      if (error) {
        showFeedback('Error al actualizar el usuario.', false)
      } else {
        showFeedback('Usuario actualizado correctamente.', true)
        setModal({ open: false, user: null })
        await loadUsers()
      }
    } else {
      const { error } = await supabase.functions.invoke('admin-users', {
        body: { action: 'create', email: formData.email, password: formData.password, name: formData.name, role: formData.role, active: formData.active },
      })
      if (error) {
        showFeedback('Error al crear el usuario.', false)
      } else {
        showFeedback('Usuario creado correctamente.', true)
        setModal({ open: false, user: null })
        await loadUsers()
      }
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!supabase) return
    const { error } = await supabase.functions.invoke('admin-users', { body: { action: 'delete', id } })
    if (error) {
      showFeedback('Error al eliminar el usuario.', false)
    } else {
      showFeedback('Usuario eliminado.', true)
      await loadUsers()
    }
    setConfirmDelete(null)
  }

  const roleLabel = { admin: 'Administrador', asistente: 'Asistente / Doctor' }
  const roleColor = { admin: '#0D2244', asistente: '#0891B2' }
  const roleBg    = { admin: '#EEF2FF',  asistente: '#ECFEFF'  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#F8FAFB', padding: '36px 40px' }}>

      {/* Feedback toast */}
      {feedback && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
          padding: '12px 20px', borderRadius: '12px', fontSize: '13px', fontWeight: 600,
          background: feedback.ok ? '#F0FDF4' : '#FEF2F2',
          color: feedback.ok ? '#16A34A' : '#DC2626',
          border: `1px solid ${feedback.ok ? '#BBF7D0' : '#FECACA'}`,
          boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
        }}>
          {feedback.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(13,34,68,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={20} color="#0D2244" />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0D2244', margin: 0 }}>Configuración</h1>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>Gestión de usuarios y accesos del sistema</p>
          </div>
        </div>
        <div style={{ height: '3px', width: '48px', background: '#D4AF5A', borderRadius: '2px', marginTop: '12px' }} />
      </div>

      {/* Card usuarios */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0D2244', margin: 0 }}>Usuarios del sistema</h2>
            <p style={{ fontSize: '12px', color: '#94A3B8', margin: '3px 0 0' }}>
              {loadingUsers ? 'Cargando…' : `${users.length} usuario${users.length !== 1 ? 's' : ''} registrado${users.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={loadUsers}
              title="Recargar"
              style={{ width: '38px', height: '38px', borderRadius: '10px', border: '1.5px solid #E2E8F0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}
            >
              <RefreshCw size={15} style={{ animation: loadingUsers ? 'spin 1s linear infinite' : 'none' }} />
            </button>
            <button
              onClick={() => setModal({ open: true, user: null })}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '38px', padding: '0 18px', borderRadius: '10px', background: '#0D2244', color: '#fff', fontWeight: 600, fontSize: '13px', border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(13,34,68,0.25)' }}
            >
              <UserPlus size={15} />
              Nuevo usuario
            </button>
          </div>
        </div>

        {/* Lista */}
        {loadingUsers ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>Cargando usuarios…</div>
        ) : users.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>No hay usuarios registrados.</div>
        ) : (
          users.map((u, i) => (
            <div
              key={u.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px',
                borderBottom: i < users.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                background: u.id === currentUser?.id ? 'rgba(18,196,154,0.04)' : '#fff',
              }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0, background: u.role === 'admin' ? 'rgba(13,34,68,0.10)' : 'rgba(8,145,178,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${u.role === 'admin' ? 'rgba(13,34,68,0.20)' : 'rgba(8,145,178,0.20)'}` }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: roleColor[u.role] }}>
                  {u.name.split(' ').slice(0,2).map(p => p[0]).join('').toUpperCase()}
                </span>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#0D2244' }}>{u.name}</span>
                  {u.id === currentUser?.id && (
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#12C49A', background: 'rgba(18,196,154,0.12)', borderRadius: '20px', padding: '2px 8px', border: '1px solid rgba(18,196,154,0.25)' }}>Tú</span>
                  )}
                  <span style={{ fontSize: '10px', fontWeight: 700, color: roleColor[u.role], background: roleBg[u.role], borderRadius: '20px', padding: '2px 8px' }}>
                    {roleLabel[u.role]}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: '3px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                {u.active ? <CheckCircle2 size={15} color="#16A34A" /> : <XCircle size={15} color="#DC2626" />}
                <span style={{ fontSize: '12px', color: u.active ? '#16A34A' : '#DC2626', fontWeight: 600 }}>
                  {u.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <button
                  onClick={() => setModal({ open: true, user: u })}
                  title="Editar"
                  style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1.5px solid #E2E8F0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}
                >
                  <Pencil size={14} />
                </button>

                {u.id !== currentUser?.id && (
                  confirmDelete === u.id ? (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button onClick={() => handleDelete(u.id)} style={{ height: '34px', padding: '0 10px', borderRadius: '8px', border: 'none', background: '#EF4444', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                        Confirmar
                      </button>
                      <button onClick={() => setConfirmDelete(null)} style={{ height: '34px', padding: '0 10px', borderRadius: '8px', border: '1.5px solid #E2E8F0', background: '#fff', color: '#64748B', fontSize: '12px', cursor: 'pointer' }}>
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(u.id)}
                      title="Eliminar"
                      style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1.5px solid #E2E8F0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Nota seguridad */}
      <div style={{ marginTop: '20px', padding: '14px 18px', borderRadius: '12px', background: 'rgba(212,175,90,0.08)', border: '1px solid rgba(212,175,90,0.25)', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <Lock size={15} color="#D4AF5A" style={{ marginTop: '2px', flexShrink: 0 }} />
        <p style={{ fontSize: '12px', color: '#92700A', margin: 0, lineHeight: '1.6' }}>
          Esta sección está protegida por clave de verificación. Los cambios en usuarios son gestionados de forma segura en el servidor — las contraseñas nunca se almacenan en el navegador.
        </p>
      </div>

      {modal.open && (
        <UserModal
          user={modal.user}
          onSave={handleSave}
          onClose={() => setModal({ open: false, user: null })}
          saving={saving}
        />
      )}
    </div>
  )
}

// ─── Export principal ─────────────────────────────────────────────────────────

export default function ConfigPage() {
  const [unlocked, setUnlocked] = useState(false)
  if (!unlocked) return <PinGate onUnlock={() => setUnlocked(true)} />
  return <ConfigPanel />
}

// Tipado local para el formulario
interface UserFormData {
  name:     string
  email:    string
  password: string
  role:     'admin' | 'asistente'
  active:   boolean
}
