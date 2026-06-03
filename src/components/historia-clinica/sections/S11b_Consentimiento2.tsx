import type { HistoriaClinicaForm } from '../../../types/historia-clinica';
import SectionHeader from '../ui/SectionHeader';

interface Props {
  form: HistoriaClinicaForm;
  set: (k: keyof HistoriaClinicaForm, v: boolean) => void;
}

function ConsentBox({
  checked, onToggle, title, body,
}: { checked: boolean; onToggle: () => void; title: string; body: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '14px',
        padding: '16px',
        borderRadius: '12px',
        border: checked ? '2px solid #D4AF37' : '1px solid #EDD97A',
        background: checked ? '#FFFDF0' : '#fff',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all 150ms',
        width: '100%',
      }}
    >
      <div style={{
        width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
        border: checked ? '2px solid #D4AF37' : '2px solid #D1D5DB',
        background: checked ? '#D4AF37' : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 150ms',
        marginTop: '1px',
      }}>
        {checked && <span style={{ color: '#fff', fontSize: '14px', fontWeight: '800', lineHeight: 1 }}>✓</span>}
      </div>
      <div>
        <p style={{ fontSize: '13px', fontWeight: '700', color: '#92400E', margin: '0 0 4px' }}>{title}</p>
        <p style={{ fontSize: '12px', color: '#6B7280', margin: 0, lineHeight: '1.5' }}>{body}</p>
      </div>
    </button>
  );
}

export default function S11b_Consentimiento2({ form, set }: Props) {
  const ambosOk = form.consent_habeas_2 && form.consent_med_2;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <SectionHeader number={12} title="Consentimientos Informados — 2ª Cita" gold />

      <div style={{
        background: 'linear-gradient(135deg, #FFFDF0, #FFF8E7)',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid #D4AF37',
      }}>
        <p style={{ fontSize: '12px', color: '#374151', margin: '0 0 14px', lineHeight: '1.5' }}>
          Ratificación de consentimientos para la <strong>segunda cita médica</strong> (Ley 1581/2012 — Ley 23/1981).
          Ambas firmas son obligatorias para actualizar el documento clínico con el plan de tratamiento definitivo.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <ConsentBox
            checked={form.consent_habeas_2}
            onToggle={() => set('consent_habeas_2', !form.consent_habeas_2)}
            title="Ratificación Habeas Data — Ley 1581/2012"
            body="El paciente ratifica la autorización del tratamiento de sus datos personales y de salud para el seguimiento del programa clínico asignado y la evolución de su caso."
          />
          <ConsentBox
            checked={form.consent_med_2}
            onToggle={() => set('consent_med_2', !form.consent_med_2)}
            title="Consentimiento Plan de Tratamiento — Ley 23/1981"
            body="El paciente ha sido informado sobre los resultados de los paraclínicos, el diagnóstico definitivo y el plan de tratamiento (programa S1 o S2), y acepta voluntariamente el manejo propuesto por la Dra. Eusimary Contreras Morales."
          />
        </div>
      </div>

      {!ambosOk && (
        <div style={{
          background: '#FFFBEB', border: '1px solid #FCD34D',
          borderRadius: '10px', padding: '12px 14px',
        }}>
          <p style={{ fontSize: '12px', color: '#92400E', margin: 0, fontWeight: '600' }}>
            Ambas ratificaciones son obligatorias para actualizar la historia clínica con el plan de la 2ª cita.
          </p>
        </div>
      )}
    </div>
  );
}
