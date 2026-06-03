import type { HistoriaClinicaForm } from '../../../types/historia-clinica';
import { CIE10_FRECUENTES } from '../../../constants/historia-clinica';
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

interface Props {
  form: HistoriaClinicaForm;
  set: (k: keyof HistoriaClinicaForm, v: string) => void;
}

export default function S08_Diagnostico({ form, set }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <SectionHeader number={7} title="Diagnostico" />

      {/* Codigos CIE-10 frecuentes */}
      <div>
        <p style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>
          CIE-10 Frecuentes — click para autocompletar DX1
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {CIE10_FRECUENTES.map(c => (
            <button
              key={c.code}
              type="button"
              onClick={() => { set('cie1', c.code); set('dx1', c.desc); }}
              style={{
                padding: '4px 10px',
                borderRadius: '20px',
                border: form.cie1 === c.code ? '2px solid #12C49A' : '1px solid #E5E7EB',
                background: form.cie1 === c.code ? '#E6FAF5' : '#F9FAFB',
                fontSize: '11px', fontWeight: '600',
                color: form.cie1 === c.code ? '#0A3D2E' : '#6B7280',
                cursor: 'pointer',
                transition: 'all 150ms',
              }}
            >
              {c.code} — {c.desc}
            </button>
          ))}
        </div>
      </div>

      {/* DX1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
        <FormField label="Diagnostico principal" required>
          <input style={INPUT} value={form.dx1} onChange={e => set('dx1', e.target.value)}
            placeholder="Descripcion del diagnostico principal" />
        </FormField>
        <FormField label="Codigo CIE-10">
          <input style={INPUT} value={form.cie1} onChange={e => set('cie1', e.target.value)}
            placeholder="Ej: E66" />
        </FormField>
      </div>

      {/* DX2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
        <FormField label="Diagnostico secundario (opcional)">
          <input style={INPUT} value={form.dx2} onChange={e => set('dx2', e.target.value)}
            placeholder="Comorbilidad o diagnostico complementario" />
        </FormField>
        <FormField label="Codigo CIE-10">
          <input style={INPUT} value={form.cie2} onChange={e => set('cie2', e.target.value)}
            placeholder="Ej: E11" />
        </FormField>
      </div>
    </div>
  );
}
