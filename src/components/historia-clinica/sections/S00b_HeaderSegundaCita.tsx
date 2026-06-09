import type { HistoriaClinicaForm } from '../../../types/historia-clinica';
import FormField from '../ui/FormField';
import { Stethoscope } from 'lucide-react';

const INPUT: React.CSSProperties = {
  height: '40px',
  borderRadius: '8px',
  border: '1px solid #F3D77A',
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

export default function S00b_HeaderSegundaCita({ form, set, readOnly = false }: Props) {
  return (
    <div>
      {/* Separador sutil entre 1ª y 2ª cita */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0 12px' }}>
        <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <Stethoscope size={11} color="#D97706" />
          <span style={{ fontSize: '10px', fontWeight: 600, color: '#D97706', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
            2ª Cita Médica
          </span>
        </div>
        <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
      </div>

      {/* Panel header 2ª cita */}
      <div style={{
        background: '#FFFDF0',
        borderRadius: '14px',
        padding: '20px 28px',
        border: '1px solid #EDD97A',
        borderLeft: '4px solid #D4AF37',
        boxShadow: '0 1px 6px rgba(212,175,55,0.12)',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

          {/* Fecha 2ª cita */}
          <FormField label="Fecha 2ª Cita" required>
            <input
              style={{ ...INPUT, background: readOnly ? '#FEFCE8' : '#fff' }}
              type="date"
              value={form.fecha_2cita}
              readOnly={readOnly}
              onChange={e => !readOnly && set('fecha_2cita', e.target.value)}
            />
          </FormField>

          {/* No. Historia Clínica — read-only, ya identificado en S00 */}
          <FormField label="No. Historia Clínica">
            <div style={{
              height: '40px',
              borderRadius: '8px',
              border: '1px solid #F3D77A',
              background: '#FEFCE8',
              display: 'flex',
              alignItems: 'center',
              padding: '0 14px',
              gap: '8px',
            }}>
              {form.num_hc ? (
                <>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#D4AF37',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    borderRadius: '5px',
                    padding: '2px 7px',
                    flexShrink: 0,
                  }}>
                    {form.tipo_doc || 'DOC'}
                  </span>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#0A3D2E',
                    letterSpacing: '0.05em',
                  }}>
                    {form.cc}
                  </span>
                </>
              ) : (
                <span style={{ fontSize: '13px', color: '#9CA3AF' }}>
                  Completa la identificación
                </span>
              )}
            </div>
          </FormField>

        </div>
      </div>
    </div>
  );
}
