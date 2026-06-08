import { useState } from 'react'
import {
  Users, UserCheck, CalendarCheck, TrendingUp,
  Activity, Award, Share2, ShoppingBag, DollarSign,
  Download, Printer,
} from 'lucide-react'
import { useLeads } from '../context/LeadsContext'

type Period = 'mes' | 'acumulado'

// Acumulado histórico — se actualiza manualmente al cerrar cada mes
const ACUMULADO = {
  leads: 0, pacientes: 0, citas: 0,
  conversion: 0, planS1: 0, planS2: 0,
  referidos: 0, planesVendidos: 0,
  valorCOP: 0,
}

function formatCOP(n: number) {
  return '$' + n.toLocaleString('es-CO')
}

interface KpiCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  accent?: string
  trend?: number
  floatClass?: string
  cardDelay?: string
}

function KpiCard({ icon, label, value, sub, accent = '#12C49A', trend, floatClass = 'icon-float', cardDelay = 'd-0' }: KpiCardProps) {
  return (
    <div className={`card-in ${cardDelay} bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_16px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.09)] transition-shadow duration-200 flex flex-col gap-4`}>
      <div className="flex items-start justify-between">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${floatClass}`}
          style={{ background: accent + '15' }}
        >
          <span style={{ color: accent }}>{icon}</span>
        </div>
        {trend !== undefined && (
          <span className={`badge-pulse text-xs font-semibold px-2.5 py-1 rounded-full ${
            trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
          }`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <p className="text-3xl font-bold text-[#0D2244] tabular-nums leading-none">{value}</p>
        <p className="text-sm font-semibold text-gray-600 mt-2">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function GaugeChart({ value }: { value: number }) {
  const radius = 44
  const circ = 2 * Math.PI * radius
  const half = circ / 2
  const offset = half - (value / 100) * half

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="110" height="66" viewBox="0 0 110 66">
        <path d="M 11 60 A 44 44 0 0 1 99 60" fill="none" stroke="#F0F0F0" strokeWidth="10" strokeLinecap="round" />
        <path
          d="M 11 60 A 44 44 0 0 1 99 60"
          fill="none" stroke="#12C49A" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${half}`}
          strokeDashoffset={`${offset}`}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        <text x="55" y="57" textAnchor="middle" fontSize="15" fontWeight="700" fill="#0D2244">
          {value}%
        </text>
      </svg>
      <p className="text-xs text-gray-400 font-medium">Tasa de conversión</p>
    </div>
  )
}

function BarChart({ value, max, color = '#12C49A' }: { value: number; max: number; color?: string }) {
  const pct = Math.round((value / max) * 100)
  const bars = [0.4, 0.6, 0.75, 0.55, 0.9, pct / 100]
  return (
    <div className="flex items-end gap-1.5 h-12">
      {bars.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-md transition-all duration-500"
          style={{
            height: `${h * 100}%`,
            background: i === 5 ? color : '#EDF2F7',
            opacity: i === 5 ? 1 : 0.7,
          }}
        />
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>('mes')
  const { leads } = useLeads()

  // KPIs calculados en vivo desde el estado global del Pipeline
  const citasStages = new Set(['cita_agendada', 'cita_blueprint', 'segunda_cita'])
  const totalLeads      = leads.length
  const pacientesActivos = leads.filter(l => l.stage === 'activo').length
  const citasMedicas    = leads.filter(l => citasStages.has(l.stage)).length
  const planesVendidos  = leads.filter(l => l.plan !== undefined).length
  const planS1          = leads.filter(l => l.plan === 'S1').length
  const planS2          = leads.filter(l => l.plan === 'S2').length
  const referidos       = leads.filter(l => l.source === 'Referido' || l.tags.includes('Referido')).length
  const conversion      = totalLeads > 0
    ? Math.round((leads.filter(l => l.stage === 'activo' || l.stage === 'renovacion').length / totalLeads) * 100)
    : 0
  const filtrosPagados  = leads.filter(l => l.filtro_pagado).length
  const valorCOP        = planS1 * 500_000 + planS2 * 250_000 + filtrosPagados * 70_000

  const live = { leads: totalLeads, pacientes: pacientesActivos, citas: citasMedicas, conversion, planS1, planS2, referidos, planesVendidos, valorCOP }
  const d = period === 'mes' ? live : ACUMULADO

  return (
    <div className="h-full overflow-y-auto bg-[#F8FAFB]">
      <div className="max-w-[1280px] mx-auto" style={{ padding: '40px 48px' }}>

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-[#0D2244] text-2xl font-bold tracking-tight">Panel de KPIs</h1>
            <p className="text-gray-400 text-sm mt-1">Indicadores clave de desempeño · Dra. Eusimary Contreras</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-white border border-gray-200 rounded-xl p-1 text-xs font-medium shadow-sm">
              {(['mes', 'acumulado'] as Period[]).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-1.5 rounded-lg transition-all duration-150 ${
                    period === p ? 'bg-[#12C49A] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {p === 'mes' ? 'Mes actual' : 'Acumulado'}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs text-gray-600 hover:bg-gray-50 shadow-sm transition-all">
              <Download size={13} /> Descargar
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs text-gray-600 hover:bg-gray-50 shadow-sm transition-all">
              <Printer size={13} /> Imprimir
            </button>
          </div>
        </div>

        {/* ── Banner principal COP ── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0D2244] to-[#1A3A6E] rounded-2xl mb-8 flex items-center justify-between shadow-[0_4px_24px_rgba(13,34,68,0.22)]" style={{ padding: '28px 36px' }}>
          <div className="banner-shimmer" />
          <div>
            <p className="text-white/55 text-sm font-medium mb-2">Ingresos totales (consultas + planes)</p>
            <p className="text-white text-5xl font-bold tabular-nums tracking-tight leading-none">
              {formatCOP(d.valorCOP)}
              <span className="text-white/40 text-xl font-normal ml-2">COP</span>
            </p>
            <p className="text-white/35 text-xs mt-3">
              {period === 'mes' ? 'Mes actual — Junio 2026' : 'Total acumulado histórico'}
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 icon-float-3"
            style={{ background: 'rgba(212,175,90,0.18)', border: '1px solid rgba(212,175,90,0.30)' }}>
            <DollarSign size={28} className="text-[#D4AF5A]" />
          </div>
        </div>

        {/* ── Grid 4 × 2 KPIs ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <KpiCard icon={<Users size={20} />}         label="Total Leads"              value={d.leads}            sub="Ingresaron al sistema"  trend={12} floatClass="icon-float"   cardDelay="d-0" />
          <KpiCard icon={<UserCheck size={20} />}     label="Pacientes Activos"        value={d.pacientes}        sub="En seguimiento"         accent="#0D2244" trend={8} floatClass="icon-float-2" cardDelay="d-1" />
          <KpiCard icon={<CalendarCheck size={20} />} label="Citas Médicas"            value={d.citas}            sub="Agendadas y realizadas"  accent="#D4AF5A" trend={5} floatClass="icon-float-3" cardDelay="d-2" />
          <KpiCard icon={<ShoppingBag size={20} />}   label="Planes Vendidos"          value={d.planesVendidos}   sub="Nuevos programas"       trend={18}        floatClass="icon-float-4" cardDelay="d-3" />
          <KpiCard icon={<Award size={20} />}         label="Plan S1 — Control Met."   value={d.planS1}           sub="Pacientes activos S1"   accent="#7C3AED"  floatClass="icon-float-5" cardDelay="d-4" />
          <KpiCard icon={<Activity size={20} />}      label="Plan S2 — Bienestar Int." value={d.planS2}           sub="Pacientes activos S2"   accent="#0D2244"  floatClass="icon-float-6" cardDelay="d-5" />
          <KpiCard icon={<Share2 size={20} />}        label="Referidos por Paciente"   value={d.referidos}        sub="Nuevos leads referidos" accent="#D4AF5A" trend={3} floatClass="icon-float-7" cardDelay="d-6" />
          <KpiCard icon={<TrendingUp size={20} />}    label="Conversión"               value={`${d.conversion}%`} sub="Leads → Pacientes"     trend={2}         floatClass="icon-float-8" cardDelay="d-7" />
        </div>

        {/* ── Fila gráficos ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_16px_rgba(0,0,0,0.05)] flex flex-col gap-4">
            <p className="text-sm font-semibold text-gray-700">% Conversión Leads</p>
            <div className="flex justify-center py-2">
              <GaugeChart value={d.conversion} />
            </div>
            <p className="text-xs text-center text-gray-400">
              {d.conversion >= 60 ? '✅ Por encima de la meta (60%)' : '⚠️ Por debajo de la meta'}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_16px_rgba(0,0,0,0.05)] flex flex-col gap-4">
            <p className="text-sm font-semibold text-gray-700">Citas médicas — últimos meses</p>
            <div className="flex-1 flex flex-col justify-end gap-3">
              <BarChart value={d.citas} max={30} color="#0D2244" />
              <p className="text-sm font-bold text-[#0D2244]">{d.citas} citas</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_16px_rgba(0,0,0,0.05)] flex flex-col gap-4">
            <p className="text-sm font-semibold text-gray-700">Planes vendidos — últimos meses</p>
            <div className="flex-1 flex flex-col justify-end gap-3">
              <BarChart value={d.planesVendidos} max={20} color="#D4AF5A" />
              <p className="text-sm font-bold text-[#D4AF5A]">{d.planesVendidos} planes</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
