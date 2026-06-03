import type { HistoriaClinicaForm } from '../../../types/historia-clinica';
import SectionHeader from '../ui/SectionHeader';
import FormField from '../ui/FormField';

const INPUT: React.CSSProperties = {
  height: '40px',
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  padding: '0 12px',
  fontSize: '13px',
  color: '#111827',
  background: '#fff',
  width: '100%',
  boxSizing: 'border-box',
  outline: 'none',
};

const TEXTAREA: React.CSSProperties = {
  borderRadius: '8px', border: '1px solid #E5E7EB', padding: '10px 12px',
  fontSize: '13px', color: '#111827', background: '#fff',
  width: '100%', boxSizing: 'border-box', outline: 'none',
  resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.5',
};

interface Props {
  form: HistoriaClinicaForm;
  set: (k: keyof HistoriaClinicaForm, v: string) => void;
}

export default function S10_PlanManejo({ form, set }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <SectionHeader number={10} title="Plan de Manejo" />

      {/* Medicacion */}
      <div style={{ padding: '14px', background: '#F9FAFB', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
        <p style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 12px' }}>
          Medicacion farmacologica
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '14px' }}>
          <FormField label="Medicamento">
            <input style={INPUT} value={form.med_nombre} onChange={e => set('med_nombre', e.target.value)}
              placeholder="Nombre del medicamento / molecula" />
          </FormField>
          <FormField label="Dosis">
            <input style={INPUT} value={form.dosis} onChange={e => set('dosis', e.target.value)}
              placeholder="Ej: 0.25 mg" />
          </FormField>
          <FormField label="Frecuencia">
            <input style={INPUT} value={form.frecuencia} onChange={e => set('frecuencia', e.target.value)}
              placeholder="Ej: 1 vez/semana" />
          </FormField>
        </div>
      </div>

      {/* Plan no farmacologico */}
      <FormField label="Plan no farmacologico">
        <textarea style={TEXTAREA} rows={3} value={form.plan_nf}
          onChange={e => set('plan_nf', e.target.value)}
          placeholder="Intervenciones sin medicamentos: suplementacion, cambios de habitos, etc." />
      </FormField>

      {/* Nutricion */}
      <FormField label="Plan nutricional">
        <textarea style={TEXTAREA} rows={3} value={form.nutricion}
          onChange={e => set('nutricion', e.target.value)}
          placeholder="Prescripcion nutricional: tipo de dieta, calorias estimadas, distribución de macros, ayuno intermitente si aplica..." />
      </FormField>

      {/* Actividad fisica */}
      <FormField label="Prescripcion de actividad fisica">
        <textarea style={TEXTAREA} rows={2} value={form.actividad}
          onChange={e => set('actividad', e.target.value)}
          placeholder="Tipo de ejercicio, frecuencia, duracion, intensidad..." />
      </FormField>

      {/* Metas */}
      <FormField label="Metas terapeuticas">
        <textarea style={TEXTAREA} rows={2} value={form.metas}
          onChange={e => set('metas', e.target.value)}
          placeholder="Objetivos clinicos a 1, 3 y 6 meses: peso meta, HbA1c, etc." />
      </FormField>

      {/* Proxima cita */}
      <FormField label="Proxima cita / Control">
        <input style={INPUT} type="date" value={form.proxima} onChange={e => set('proxima', e.target.value)} />
      </FormField>
    </div>
  );
}
