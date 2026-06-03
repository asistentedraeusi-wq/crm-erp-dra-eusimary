import type { HistoriaClinicaForm } from '../../../types/historia-clinica';
import { PROGRAMAS, TIPOS_CONSULTA } from '../../../constants/historia-clinica';
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
  transition: 'border-color 150ms',
};

const SELECT = { ...INPUT };

interface Props {
  form: HistoriaClinicaForm;
  set: (k: keyof HistoriaClinicaForm, v: string) => void;
}

export default function S02_Consulta({ form, set }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <SectionHeader number={10} title="Datos de la Consulta" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
        <FormField label="Fecha de consulta" required>
          <input style={INPUT} type="date" value={form.fecha_consulta} onChange={e => set('fecha_consulta', e.target.value)} />
        </FormField>
        <FormField label="Tipo de consulta">
          <select style={SELECT} value={form.tipo_consulta} onChange={e => set('tipo_consulta', e.target.value)}>
            <option value="">Seleccionar...</option>
            {TIPOS_CONSULTA.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </FormField>
        <FormField label="No. Historia Clinica">
          <input style={{ ...INPUT, background: '#F9FAFB', color: '#9CA3AF' }} value={form.num_hc} readOnly placeholder="Asignado al guardar" />
        </FormField>
      </div>

      <FormField label="Programa clinico" required>
        <select style={SELECT} value={form.programa} onChange={e => set('programa', e.target.value)}>
          <option value="">Seleccionar programa...</option>
          {PROGRAMAS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </FormField>

      <FormField label="Motivo de consulta" required hint="Describir en las propias palabras del paciente">
        <textarea
          value={form.motivo}
          onChange={e => set('motivo', e.target.value)}
          placeholder="El paciente refiere..."
          rows={3}
          style={{
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            padding: '10px 12px',
            fontSize: '13px',
            color: '#111827',
            background: '#fff',
            width: '100%',
            boxSizing: 'border-box',
            outline: 'none',
            resize: 'vertical',
            fontFamily: 'inherit',
            lineHeight: '1.5',
          }}
        />
      </FormField>
    </div>
  );
}
