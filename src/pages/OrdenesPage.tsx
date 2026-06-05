import { useState } from 'react';
import { FlaskConical, FileText, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { EXAMENES_PARACLÍNICOS, PROGRAMAS } from '../constants/historia-clinica';
import { generarOrdenMedica } from '../lib/generarOrdenMedica';
import type { HistoriaClinicaForm } from '../types/historia-clinica';

// Estado mínimo necesario para generar la orden
const EMPTY_ORDEN: Pick<
  HistoriaClinicaForm,
  'nombres' | 'apellidos' | 'tipo_doc' | 'cc' | 'edad' | 'ciudad' |
  'programa' | 'examenes' | 'exam_otro' | 'instr_lab' |
  'dx1' | 'cie1'
> = {
  nombres: '', apellidos: '', tipo_doc: 'CC', cc: '',
  edad: '', ciudad: '', programa: '',
  examenes: [], exam_otro: '', instr_lab: '',
  dx1: '', cie1: '',
};

const BADGE_COLOR: Record<string, string> = {
  hemograma: '#10B981',
  hba1c:     '#F59E0B',
};
function getBadge(id: string) { return BADGE_COLOR[id] ?? '#12C49A'; }

const INPUT: React.CSSProperties = {
  height: '40px', borderRadius: '8px', border: '1px solid #E5E7EB',
  padding: '0 12px', fontSize: '13px', color: '#111827', background: '#fff',
  width: '100%', boxSizing: 'border-box', outline: 'none',
};
const SELECT: React.CSSProperties = { ...INPUT };
const CARD: React.CSSProperties = {
  background: '#fff', borderRadius: '14px', padding: '22px 24px',
  border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(18,196,154,0.07)',
};
const LABEL: React.CSSProperties = {
  fontSize: '10px', fontWeight: 700, color: '#6B7280',
  textTransform: 'uppercase', letterSpacing: '0.07em',
  display: 'block', marginBottom: '5px',
};

export default function OrdenesPage() {
  const [form, setForm] = useState({ ...EMPTY_ORDEN });
  const [generando, setGenerando] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  function toggleExam(id: string) {
    set('examenes',
      form.examenes.includes(id)
        ? form.examenes.filter(e => e !== id)
        : [...form.examenes, id]
    );
  }

  function handleGenerar() {
    if (!form.nombres.trim()) {
      toast.error('Ingresa al menos el nombre del paciente.');
      return;
    }
    if (form.examenes.length === 0) {
      toast.error('Selecciona al menos un examen.');
      return;
    }
    setGenerando(true);
    // Cast mínimo para la función — campos no requeridos quedan vacíos
    generarOrdenMedica(form as HistoriaClinicaForm);
    setTimeout(() => setGenerando(false), 1200);
    toast.success('Orden médica generada — se abrió ventana de impresión.');
  }

  function handleLimpiar() {
    setForm({ ...EMPTY_ORDEN });
  }

  const tieneExamenes = form.examenes.length > 0;

  return (
    <div className="h-full overflow-y-auto bg-[#F8FAFB]">
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 36px' }}>

        {/* ── Header ──────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #0A3D2E, #0D7A5F)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FlaskConical size={20} color="#12C49A" />
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0A3D2E', margin: 0 }}>
                Órdenes Médicas
              </h1>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: '2px 0 0' }}>
                Genera e imprime órdenes de laboratorio clínico
              </p>
            </div>
          </div>
          {(tieneExamenes || form.nombres) && (
            <button
              onClick={handleLimpiar}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'transparent', border: '1px solid #E5E7EB',
                borderRadius: '8px', padding: '7px 14px',
                fontSize: '12px', fontWeight: 600, color: '#9CA3AF',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={13} /> Limpiar
            </button>
          )}
        </div>

        {/* ── Layout 2 columnas ─────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', alignItems: 'start' }}>

          {/* ── Columna izquierda ─────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Datos del paciente */}
            <div style={CARD}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#0A3D2E', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Datos del Paciente</span>
                <div style={{ flex: 1, height: '1.5px', background: 'linear-gradient(90deg, #D4AF37, transparent)' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={LABEL}>Nombres <span style={{ color: '#EF4444' }}>*</span></label>
                  <input style={INPUT} value={form.nombres}
                    onChange={e => set('nombres', e.target.value)}
                    placeholder="Nombres del paciente" />
                </div>
                <div>
                  <label style={LABEL}>Apellidos</label>
                  <input style={INPUT} value={form.apellidos}
                    onChange={e => set('apellidos', e.target.value)}
                    placeholder="Apellidos" />
                </div>
                <div>
                  <label style={LABEL}>Tipo doc.</label>
                  <select style={SELECT} value={form.tipo_doc}
                    onChange={e => set('tipo_doc', e.target.value)}>
                    <option value="CC">CC</option>
                    <option value="CE">CE</option>
                    <option value="PA">Pasaporte</option>
                    <option value="TI">TI</option>
                  </select>
                </div>
                <div>
                  <label style={LABEL}>Número de documento</label>
                  <input style={INPUT} value={form.cc}
                    onChange={e => set('cc', e.target.value)}
                    placeholder="000 000 000" />
                </div>
                <div>
                  <label style={LABEL}>Edad</label>
                  <input style={INPUT} type="number" min={1} max={120}
                    value={form.edad}
                    onChange={e => set('edad', e.target.value)}
                    placeholder="Ej: 42" />
                </div>
                <div>
                  <label style={LABEL}>Ciudad</label>
                  <input style={INPUT} value={form.ciudad}
                    onChange={e => set('ciudad', e.target.value)}
                    placeholder="Barranquilla" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={LABEL}>Programa clínico</label>
                  <select style={SELECT} value={form.programa}
                    onChange={e => set('programa', e.target.value as HistoriaClinicaForm['programa'])}>
                    <option value="">Seleccionar programa...</option>
                    {PROGRAMAS.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Selección de exámenes */}
            <div style={CARD}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#0A3D2E', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Seleccionar Exámenes <span style={{ color: '#EF4444' }}>*</span>
                </span>
                <div style={{ flex: 1, height: '1.5px', background: 'linear-gradient(90deg, #D4AF37, transparent)' }} />
                {tieneExamenes && (
                  <span style={{
                    fontSize: '10px', fontWeight: 700, color: '#0A3D2E',
                    background: '#E6FAF5', border: '1px solid rgba(18,196,154,0.3)',
                    borderRadius: '20px', padding: '2px 10px',
                  }}>
                    {form.examenes.length} seleccionado{form.examenes.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {EXAMENES_PARACLÍNICOS.map(exam => {
                  const active = form.examenes.includes(exam.id);
                  return (
                    <button
                      key={exam.id}
                      type="button"
                      onClick={() => toggleExam(exam.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        textAlign: 'left', padding: '8px 10px', borderRadius: '8px',
                        border: active ? `2px solid ${getBadge(exam.id)}` : '1px solid #E5E7EB',
                        background: active ? '#E6FAF5' : '#F9FAFB',
                        fontSize: '12px', color: active ? '#0A3D2E' : '#374151',
                        fontWeight: active ? 700 : 400,
                        cursor: 'pointer', transition: 'all 150ms', lineHeight: '1.3',
                      }}
                    >
                      <div style={{
                        width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                        background: active ? getBadge(exam.id) : '#D1D5DB',
                        transition: 'background 150ms',
                      }} />
                      {exam.label}
                    </button>
                  );
                })}
              </div>

              {/* Otros exámenes */}
              <div style={{ marginTop: '14px' }}>
                <label style={LABEL}>Otros exámenes no listados</label>
                <textarea
                  value={form.exam_otro}
                  onChange={e => set('exam_otro', e.target.value)}
                  placeholder="Especificar exámenes adicionales..."
                  rows={2}
                  style={{
                    width: '100%', boxSizing: 'border-box', borderRadius: '8px',
                    border: '1px solid #E5E7EB', padding: '9px 12px',
                    fontSize: '13px', color: '#111827', resize: 'vertical',
                    fontFamily: 'inherit', lineHeight: '1.5', outline: 'none',
                  }}
                />
              </div>

              {/* Instrucciones especiales */}
              <div style={{ marginTop: '12px' }}>
                <label style={LABEL}>Instrucciones especiales para laboratorio</label>
                <textarea
                  value={form.instr_lab}
                  onChange={e => set('instr_lab', e.target.value)}
                  placeholder="Ej: Ayuno 12h, no suspender medicamentos, etc."
                  rows={2}
                  style={{
                    width: '100%', boxSizing: 'border-box', borderRadius: '8px',
                    border: '1px solid #E5E7EB', padding: '9px 12px',
                    fontSize: '13px', color: '#111827', resize: 'vertical',
                    fontFamily: 'inherit', lineHeight: '1.5', outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* ── Columna derecha: resumen + acción ────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '32px' }}>

            {/* Mini-preview del header de la orden */}
            <div style={{
              borderRadius: '14px', overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(10,61,46,0.15)',
            }}>
              {/* Header mini */}
              <div style={{
                background: 'linear-gradient(135deg, #0A3D2E, #0D7A5F)',
                padding: '16px',
                display: 'flex', alignItems: 'center', gap: '12px',
              }}>
                <img
                  src="/logo-dra-eusimary.jpg"
                  alt="Logo"
                  style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(212,175,55,0.5)', flexShrink: 0 }}
                />
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 800, color: '#fff', margin: 0, lineHeight: '1.3' }}>Dra. Eusimary Contreras</p>
                  <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.65)', margin: '2px 0 0' }}>Medicina Metabólica & Longevidad</p>
                </div>
              </div>
              {/* Gold line */}
              <div style={{ height: '2px', background: '#D4AF37' }} />
              {/* Banner mini */}
              <div style={{ background: '#E6FAF5', padding: '10px 14px', textAlign: 'center', borderBottom: '1px solid rgba(18,196,154,0.2)' }}>
                <p style={{ fontSize: '9.5px', fontWeight: 900, color: '#0A3D2E', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Orden Médica de Laboratorio</p>
              </div>
              {/* Resumen exámenes */}
              <div style={{ background: '#fff', padding: '12px 14px' }}>
                {tieneExamenes ? (
                  <div>
                    <p style={{ fontSize: '9px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>
                      {form.examenes.length} examen{form.examenes.length !== 1 ? 'es' : ''} seleccionado{form.examenes.length !== 1 ? 's' : ''}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {form.examenes.slice(0, 5).map(id => {
                        const exam = EXAMENES_PARACLÍNICOS.find(e => e.id === id);
                        if (!exam) return null;
                        return (
                          <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getBadge(id), flexShrink: 0 }} />
                            <span style={{ fontSize: '11px', color: '#374151', lineHeight: '1.3' }}>{exam.label}</span>
                          </div>
                        );
                      })}
                      {form.examenes.length > 5 && (
                        <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '2px 0 0' }}>+{form.examenes.length - 5} más...</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: '11px', color: '#D1D5DB', textAlign: 'center', padding: '8px 0', margin: 0 }}>
                    Selecciona exámenes para ver el resumen
                  </p>
                )}
              </div>
              {/* Footer mini */}
              <div style={{ background: '#0A3D2E', padding: '8px 14px', textAlign: 'center' }}>
                <p style={{ fontSize: '8px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', margin: 0, textTransform: 'uppercase' }}>
                  draeusimary.netlify.app · Válida 30 días
                </p>
              </div>
            </div>

            {/* Botón generar */}
            <button
              type="button"
              onClick={handleGenerar}
              disabled={!tieneExamenes || !form.nombres.trim() || generando}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                width: '100%', padding: '13px',
                borderRadius: '12px', border: 'none',
                background: tieneExamenes && form.nombres.trim()
                  ? 'linear-gradient(135deg, #0A3D2E, #0D7A5F)'
                  : '#E5E7EB',
                color: tieneExamenes && form.nombres.trim() ? '#fff' : '#9CA3AF',
                fontSize: '13px', fontWeight: 700,
                cursor: tieneExamenes && form.nombres.trim() && !generando ? 'pointer' : 'not-allowed',
                boxShadow: tieneExamenes && form.nombres.trim()
                  ? '0 6px 20px rgba(10,61,46,0.3)' : 'none',
                transition: 'all 150ms',
              }}
            >
              <FileText size={16} />
              {generando ? 'Generando...' : 'Generar Orden Médica PDF'}
            </button>

            {/* Info instrucciones rápidas */}
            <div style={{
              background: '#FFF8E7', border: '1px solid rgba(212,175,55,0.4)',
              borderRadius: '10px', padding: '12px 14px',
              display: 'flex', gap: '10px',
            }}>
              <div style={{ width: '3px', background: '#12C49A', borderRadius: '2px', flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: '10px', fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px' }}>Al generar</p>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {[
                    'Se abre ventana de impresión',
                    'Selecciona "Guardar como PDF"',
                    'O imprime directamente',
                  ].map(t => (
                    <li key={t} style={{ display: 'flex', gap: '6px', fontSize: '11px', color: '#374151', lineHeight: '1.4' }}>
                      <span style={{ color: '#12C49A', fontSize: '7px', marginTop: '3px' }}>●</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
