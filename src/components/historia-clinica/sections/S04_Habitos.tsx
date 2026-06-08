import type { HistoriaClinicaForm } from '../../../types/historia-clinica';
import { HABITOS_CONFIG } from '../../../constants/historia-clinica';
import SectionHeader from '../ui/SectionHeader';
import FormField from '../ui/FormField';

const TEXTAREA: React.CSSProperties = {
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
};

interface Props {
  form: HistoriaClinicaForm;
  set: (k: keyof HistoriaClinicaForm, v: string) => void;
}

export default function S04_Habitos({ form, set }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <SectionHeader number={3} title="Habitos y Estilo de Vida" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
        {HABITOS_CONFIG.map(hab => (
          <div key={hab.key}>
            <p style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>
              {hab.label}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {hab.opciones.map(opt => {
                const active = form[hab.key] === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => set(hab.key, opt)}
                    style={{
                      textAlign: 'left',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: active ? '2px solid #12C49A' : '1px solid #E5E7EB',
                      background: active ? '#E6FAF5' : '#F9FAFB',
                      fontSize: '12px',
                      color: active ? '#0A3D2E' : '#374151',
                      fontWeight: active ? '600' : '400',
                      cursor: 'pointer',
                      transition: 'all 150ms',
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <FormField label="Observaciones — Hábitos y Estilo de Vida">
        <textarea
          style={TEXTAREA}
          rows={3}
          value={form.habitos_obs}
          onChange={e => set('habitos_obs', e.target.value)}
          placeholder="Observaciones adicionales sobre hábitos, rutinas, contexto relevante para el plan de manejo..."
        />
      </FormField>
    </div>
  );
}
