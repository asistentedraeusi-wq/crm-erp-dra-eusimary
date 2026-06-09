import type { HistoriaClinicaForm } from '../../../types/historia-clinica';
import { TIPOS_CONSULTA } from '../../../constants/historia-clinica';
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

interface Props {
  form: HistoriaClinicaForm;
  set: (k: keyof HistoriaClinicaForm, v: string) => void;
  readOnly?: boolean;
}

export default function S02b_Consulta2({ form, set, readOnly = false }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <SectionHeader number={11} title="Datos de la Consulta — 2ª Cita" />

      <FormField label="Tipo de consulta" required>
        {readOnly ? (
          <div style={{
            ...INPUT,
            display: 'flex', alignItems: 'center',
            background: '#F9FAFB',
            color: form.tipo_2cita ? '#111827' : '#9CA3AF',
          }}>
            {form.tipo_2cita || 'No especificado'}
          </div>
        ) : (
          <select
            style={{ ...INPUT, cursor: 'pointer' }}
            value={form.tipo_2cita}
            onChange={e => set('tipo_2cita', e.target.value)}
          >
            <option value="">Seleccionar tipo de consulta...</option>
            {TIPOS_CONSULTA.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        )}
      </FormField>
    </div>
  );
}
