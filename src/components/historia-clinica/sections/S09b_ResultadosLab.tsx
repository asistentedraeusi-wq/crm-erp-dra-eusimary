import { useState, useRef } from 'react';
import { Upload, ExternalLink, CheckCircle2, AlertCircle, AlertTriangle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import type { HistoriaClinicaForm, ResultadoExamen } from '../../../types/historia-clinica';
import { EXAMENES_PARACLÍNICOS } from '../../../constants/historia-clinica';
import { supabase } from '../../../lib/supabase';
import SectionHeader from '../ui/SectionHeader';
import FormField from '../ui/FormField';

const INPUT: React.CSSProperties = {
  height: '36px', borderRadius: '8px', border: '1px solid #E5E7EB',
  padding: '0 10px', fontSize: '13px', color: '#111827', background: '#fff',
  boxSizing: 'border-box', outline: 'none', width: '100%',
};

const ESTADO_CONFIG = {
  '':        { label: 'Pendiente',  color: '#9CA3AF', bg: '#F9FAFB', icon: Clock },
  normal:    { label: 'Normal',     color: '#10B981', bg: '#ECFDF5', icon: CheckCircle2 },
  anormal:   { label: 'Anormal',    color: '#F59E0B', bg: '#FFFBEB', icon: AlertTriangle },
  critico:   { label: 'Crítico',    color: '#EF4444', bg: '#FEF2F2', icon: AlertCircle },
} as const;

interface Props {
  form: HistoriaClinicaForm;
  set: (k: keyof HistoriaClinicaForm, v: unknown) => void;
  readOnly?: boolean;
}

export default function S09b_ResultadosLab({ form, set, readOnly = false }: Props) {
  const [subiendo, setSubiendo] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const examenesPedidos = form.examenes
    .map(id => EXAMENES_PARACLÍNICOS.find(e => e.id === id))
    .filter((e): e is typeof EXAMENES_PARACLÍNICOS[number] => Boolean(e));

  function setResultado(examId: string, campo: keyof ResultadoExamen, valor: string) {
    const prev = form.res_valores?.[examId] ?? { valor: '', unidad: '', estado: '', obs: '' };
    set('res_valores', {
      ...form.res_valores,
      [examId]: { ...prev, [campo]: valor },
    });
  }

  async function handleArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!supabase) {
      // Supabase no configurado — guarda solo el nombre del archivo
      set('res_archivo_url', `local:${file.name}`);
      toast.info(`Archivo "${file.name}" registrado localmente.`);
      return;
    }

    setSubiendo(true);
    try {
      const path = `resultados/${form.cc || 'sin-cc'}/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('resultados-lab')
        .upload(path, file, { upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('resultados-lab')
        .getPublicUrl(data.path);

      set('res_archivo_url', publicUrl);
      toast.success('Archivo de resultados subido correctamente.');
    } catch {
      // Bucket no existe aún — guarda nombre local
      set('res_archivo_url', `local:${file.name}`);
      toast.info(`Archivo "${file.name}" registrado. Crea el bucket "resultados-lab" en Supabase para subir PDFs.`);
    } finally {
      setSubiendo(false);
    }
  }

  // Conteo de estados para el resumen header
  const conteo = examenesPedidos.reduce(
    (acc, exam) => {
      const est = form.res_valores?.[exam.id]?.estado ?? '';
      if (est === 'normal')  acc.normales++;
      else if (est === 'anormal') acc.anormales++;
      else if (est === 'critico') acc.criticos++;
      else acc.pendientes++;
      return acc;
    },
    { normales: 0, anormales: 0, criticos: 0, pendientes: 0 }
  );

  const archivoLocal = form.res_archivo_url?.startsWith('local:')
    ? form.res_archivo_url.replace('local:', '')
    : null;
  const archivoUrl = form.res_archivo_url && !form.res_archivo_url.startsWith('local:')
    ? form.res_archivo_url
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <SectionHeader number={11} title="Resultados de Laboratorio" />

      {/* Contexto 2da cita */}
      <div style={{
        background: 'linear-gradient(135deg, #E6FAF5, #F0FDF9)',
        border: '1px solid rgba(18,196,154,0.3)',
        borderRadius: '10px', padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <div style={{ width: '4px', height: '100%', minHeight: '36px', background: '#12C49A', borderRadius: '2px', flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#0A3D2E', margin: 0 }}>
            Sección para la 2ª Cita Médica
          </p>
          <p style={{ fontSize: '11px', color: '#374151', margin: '2px 0 0', lineHeight: '1.5' }}>
            Registra los resultados del laboratorio. Al completarlos, la Dra. puede determinar el programa adecuado para el paciente (S1 o S2) y continuar con el Plan de Manejo.
          </p>
        </div>
      </div>

      {/* Fecha + estado general */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <FormField label="Fecha de recepción de resultados">
          <input style={INPUT} type="date" value={form.res_fecha}
            readOnly={readOnly}
            onChange={e => set('res_fecha', e.target.value)} />
        </FormField>
        <FormField label="Estado de los resultados">
          <select
            style={{ ...INPUT, background: readOnly ? '#F9FAFB' : '#fff' }}
            value={form.res_estado}
            disabled={readOnly}
            onChange={e => set('res_estado', e.target.value)}
          >
            <option value="">Seleccionar...</option>
            <option value="pendientes">Pendientes de recibir</option>
            <option value="parciales">Recibidos parcialmente</option>
            <option value="completos">Recibidos completos</option>
          </select>
        </FormField>
      </div>

      {/* Resumen de estados */}
      {examenesPedidos.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { label: 'Normales',   val: conteo.normales,  color: '#10B981', bg: '#ECFDF5' },
            { label: 'Anormales',  val: conteo.anormales, color: '#F59E0B', bg: '#FFFBEB' },
            { label: 'Críticos',   val: conteo.criticos,  color: '#EF4444', bg: '#FEF2F2' },
            { label: 'Pendientes', val: conteo.pendientes, color: '#9CA3AF', bg: '#F9FAFB' },
          ].map(({ label, val, color, bg }) => val > 0 ? (
            <div key={label} style={{
              background: bg, border: `1px solid ${color}33`,
              borderRadius: '20px', padding: '3px 12px',
              fontSize: '11px', fontWeight: 700, color,
            }}>
              {val} {label}
            </div>
          ) : null)}
        </div>
      )}

      {/* Lista de exámenes con inputs de resultados */}
      {examenesPedidos.length === 0 ? (
        <div style={{
          background: '#F9FAFB', border: '1px dashed #E5E7EB',
          borderRadius: '10px', padding: '20px', textAlign: 'center',
          fontSize: '12px', color: '#9CA3AF',
        }}>
          No se solicitaron exámenes en la sección anterior. Regresa a la Sección 8 y selecciona los paraclínicos a solicitar.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
            Resultados por examen ({examenesPedidos.length} solicitado{examenesPedidos.length !== 1 ? 's' : ''})
          </p>

          {examenesPedidos.map(exam => {
            const res = form.res_valores?.[exam.id] ?? { valor: '', unidad: '', estado: '', obs: '' };
            const estadoCfg = ESTADO_CONFIG[res.estado as keyof typeof ESTADO_CONFIG] ?? ESTADO_CONFIG[''];
            const EstadoIcon = estadoCfg.icon;

            return (
              <div key={exam.id} style={{
                border: `1.5px solid ${res.estado ? estadoCfg.color + '40' : '#E5E7EB'}`,
                borderRadius: '10px', overflow: 'hidden',
                background: res.estado === 'critico' ? '#FFF5F5' : '#fff',
                transition: 'border-color 200ms',
              }}>
                {/* Nombre del examen */}
                <div style={{
                  padding: '8px 14px',
                  background: res.estado ? estadoCfg.bg : '#F9FAFB',
                  borderBottom: '1px solid #E5E7EB',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#0A3D2E' }}>
                    {exam.label}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <EstadoIcon size={13} color={estadoCfg.color} />
                    <span style={{ fontSize: '10px', fontWeight: 700, color: estadoCfg.color }}>
                      {estadoCfg.label}
                    </span>
                  </div>
                </div>

                {/* Inputs */}
                <div style={{ padding: '10px 14px', display: 'grid', gridTemplateColumns: '2fr 1fr 1.4fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '9px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '4px' }}>
                      Valor / Resultado
                    </label>
                    <input
                      style={INPUT}
                      value={res.valor}
                      readOnly={readOnly}
                      onChange={e => setResultado(exam.id, 'valor', e.target.value)}
                      placeholder="Ej: 4.5, Reactivo, Normal..."
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '9px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '4px' }}>
                      Unidad
                    </label>
                    <input
                      style={INPUT}
                      value={res.unidad}
                      readOnly={readOnly}
                      onChange={e => setResultado(exam.id, 'unidad', e.target.value)}
                      placeholder="mg/dL, g/dL..."
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '9px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '4px' }}>
                      Clasificación
                    </label>
                    <select
                      style={{ ...INPUT, background: readOnly ? '#F9FAFB' : '#fff', color: estadoCfg.color, fontWeight: 700 }}
                      value={res.estado}
                      disabled={readOnly}
                      onChange={e => setResultado(exam.id, 'estado', e.target.value)}
                    >
                      <option value="">Pendiente</option>
                      <option value="normal">Normal</option>
                      <option value="anormal">Anormal</option>
                      <option value="critico">Crítico</option>
                    </select>
                  </div>
                </div>

                {/* Observación por examen (solo si hay valor) */}
                {(res.valor || res.estado) && (
                  <div style={{ padding: '0 14px 10px' }}>
                    <input
                      style={{ ...INPUT, fontSize: '12px', color: '#6B7280' }}
                      value={res.obs}
                      readOnly={readOnly}
                      onChange={e => setResultado(exam.id, 'obs', e.target.value)}
                      placeholder="Observación clínica opcional..."
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Observaciones generales */}
      <FormField label="Interpretación clínica general de resultados">
        <textarea
          value={form.res_obs}
          readOnly={readOnly}
          onChange={e => set('res_obs', e.target.value)}
          placeholder="Resumen de hallazgos relevantes, correlación clínica, impresión diagnóstica con base en paraclínicos..."
          rows={3}
          style={{
            borderRadius: '8px', border: '1px solid #E5E7EB', padding: '10px 12px',
            fontSize: '13px', color: '#111827', width: '100%', boxSizing: 'border-box',
            outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.5',
            background: readOnly ? '#F9FAFB' : '#fff',
          }}
        />
      </FormField>

      {/* Adjuntar PDF del laboratorio */}
      <div style={{
        border: '1.5px dashed #D4AF37',
        borderRadius: '10px', padding: '16px 18px',
        background: '#FFFDF5',
      }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 10px' }}>
          Adjuntar PDF del Laboratorio
        </p>

        {archivoUrl ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={16} color="#10B981" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#0A3D2E', margin: 0 }}>Archivo subido</p>
              <a href={archivoUrl} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: '11px', color: '#12C49A', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                Ver resultados <ExternalLink size={11} />
              </a>
            </div>
            {!readOnly && (
              <button type="button" onClick={() => set('res_archivo_url', '')}
                style={{ fontSize: '11px', color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                Quitar
              </button>
            )}
          </div>
        ) : archivoLocal ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FFF8E7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={16} color="#D97706" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#92400E', margin: 0 }}>Registrado localmente</p>
              <p style={{ fontSize: '11px', color: '#6B7280', margin: '2px 0 0' }}>{archivoLocal}</p>
            </div>
            {!readOnly && (
              <button type="button" onClick={() => set('res_archivo_url', '')}
                style={{ fontSize: '11px', color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                Quitar
              </button>
            )}
          </div>
        ) : (
          !readOnly && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={subiendo}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '9px 18px', borderRadius: '8px',
                border: '1px solid #D4AF37', background: '#fff',
                fontSize: '13px', fontWeight: 600, color: '#92400E',
                cursor: subiendo ? 'not-allowed' : 'pointer',
                opacity: subiendo ? 0.7 : 1,
              }}
            >
              <Upload size={15} />
              {subiendo ? 'Subiendo...' : 'Subir PDF / imagen de resultados'}
            </button>
          )
        )}

        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          style={{ display: 'none' }}
          onChange={handleArchivo}
        />
      </div>
    </div>
  );
}
