import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, User } from 'lucide-react'
import logo from '../assets/logo.png'
import heroBg from '../assets/Video LoginPag.mp4'

export default function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.username || !form.password) {
      setError('Por favor ingresa tu usuario y contraseña.')
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      navigate('/dashboard')
    }, 1200)
  }

  const inputWrapperClass =
    'flex items-center h-14 bg-white border-2 border-[#CBD5E1] rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.07)] focus-within:border-[#12C49A] focus-within:ring-2 focus-within:ring-[#12C49A]/15 transition-all duration-150'

  const inputClass =
    'flex-1 h-full bg-transparent text-[15px] text-[#0D2244] placeholder-[#94A3B8] focus:outline-none'

  return (
    <div className="min-h-screen w-full flex">

      {/* ── MITAD IZQUIERDA — Video ── */}
      <div className="hidden md:flex w-1/2 bg-white items-center justify-center overflow-hidden">
        <video
          src={heroBg}
          autoPlay
          muted
          loop
          playsInline
          className="w-[98%] h-[98%] object-contain"
        />
      </div>

      {/* ── MITAD DERECHA — Formulario ── */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center bg-[#E8FAF5] px-8 py-12 relative">

        {/* Línea vertical decorativa */}
        <div className="hidden md:block absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-[#0D2244] via-[#D4AF5A] to-[#0D2244]" />

        {/* Card centrada */}
        <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.09)] px-12 py-10">

          {/* Logo solo en mobile */}
          <div className="flex justify-center mb-8 md:hidden">
            <img src={logo} alt="Dra. Eusimary Contreras" className="w-56 object-contain" />
          </div>

          {/* Encabezado */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-[#12C49A]/10 border border-[#12C49A]/25 rounded-full px-3 py-1 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#12C49A] animate-pulse" />
              <span className="text-[#12C49A] text-[11px] font-bold tracking-widest uppercase">Sistema activo</span>
            </div>
            <h1 className="text-[#0D2244] text-[26px] font-bold tracking-tight leading-tight">
              Bienvenido
            </h1>
            <p className="text-[#64748B] text-sm mt-1.5">
              Ingresa tus credenciales para acceder
            </p>
            <div className="w-10 h-[3px] bg-[#D4AF5A] rounded-full mt-4" />
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">

            {/* Usuario */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-[#0D2244] tracking-widest uppercase">
                Usuario
              </label>
              <div className={inputWrapperClass}>
                <div className="pl-5 pr-4 flex items-center flex-shrink-0">
                  <User size={18} className="text-[#0D2244]" />
                </div>
                <div className="w-px h-5 bg-[#CBD5E1] flex-shrink-0" />
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Ingresa tu usuario"
                  autoComplete="username"
                  className={`${inputClass} pl-4 pr-4`}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-[#0D2244] tracking-widest uppercase">
                Contraseña
              </label>
              <div className={inputWrapperClass}>
                <div className="pl-5 pr-4 flex items-center flex-shrink-0">
                  <Lock size={18} className="text-[#0D2244]" />
                </div>
                <div className="w-px h-5 bg-[#CBD5E1] flex-shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                  className={`${inputClass} pl-4 pr-4`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="pr-5 flex items-center text-[#94A3B8] hover:text-[#0D2244] transition-colors flex-shrink-0"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-500 text-xs text-center bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            {/* Botón ingresar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-[#12C49A] hover:bg-[#0EA882] active:scale-[0.98] text-white font-bold text-[15px] tracking-wide shadow-[0_4px_18px_rgba(18,196,154,0.40)] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                  </svg>
                  Ingresando…
                </span>
              ) : (
                'Ingresar'
              )}
            </button>

            {/* Olvidé contraseña */}
            <div className="text-center -mt-1">
              <a
                href="#"
                className="text-sm text-[#D4AF5A] hover:text-[#B8962E] hover:underline transition-colors font-semibold"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-[#94A3B8] mt-6">
          Sistema administrado por{' '}
          <span className="text-[#0D2244] font-bold">CAST Consultorías SAS</span>
        </p>
      </div>
    </div>
  )
}
