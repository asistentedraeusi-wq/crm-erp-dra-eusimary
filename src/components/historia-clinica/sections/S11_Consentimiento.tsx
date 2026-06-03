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
        border: checked ? '2px solid #12C49A' : '1px solid #E5E7EB',
        background: checked ? '#E6FAF5' : '#fff',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all 150ms',
        width: '100%',
      }}
    >
      <div style={{
        width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
        border: checked ? '2px solid #12C49A' : '2px solid #D1D5DB',
        background: checked ? '#12C49A' : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 150ms',
        marginTop: '1px',
      }}>
        {checked && <span style={{ color: '#fff', fontSize: '14px', fontWeight: '800', lineHeight: 1 }}>✓</span>}
      </div>
      <div>
        <p style={{ fontSize: '13px', fontWeight: '700', color: '#0A3D2E', margin: '0 0 4px' }}>{title}</p>
        <p style={{ fontSize: '12px', color: '#6B7280', margin: 0, lineHeight: '1.5' }}>{body}</p>
      </div>
    </button>
  );
}

export default function S11_Consentimiento({ form, set }: Props) {
  const ambosOk = form.consent_habeas && form.consent_med;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <SectionHeader number={11} title="Consentimientos Informados" gold />

      <div style={{
        background: 'linear-gradient(135deg, #E6FAF5, #FFF8E7)',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid #D4AF37',
      }}>
        <p style={{ fontSize: '12px', color: '#374151', margin: '0 0 14px', lineHeight: '1.5' }}>
          Conforme a la normativa colombiana (Ley 1581/2012 — Ley 23/1981), ambos consentimientos son
          <strong> obligatorios </strong> para el guardado del documento clinico.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <ConsentBox
            checked={form.consent_habeas}
            onToggle={() => set('consent_habeas', !form.consent_habeas)}
            title="Autorizacion de Habeas Data — Ley 1581/2012"
            body="El paciente autoriza el tratamiento de sus datos personales y de salud para fines medico-asistenciales, de acuerdo con la politica de privacidad de la Dra. Eusimary Contreras Morales."
          />
          <ConsentBox
            checked={form.consent_med}
            onToggle={() => set('consent_med', !form.consent_med)}
            title="Consentimiento Informado Medico — Ley 23/1981"
            body="El paciente ha sido informado sobre su diagnostico, el plan de tratamiento propuesto, los riesgos y beneficios, y acepta voluntariamente el manejo clinico propuesto por la Dra. Eusimary Contreras Morales."
          />
        </div>
      </div>

      {!ambosOk && (
        <div style={{
          background: '#FEF2F2', border: '1px solid #FCA5A5',
          borderRadius: '10px', padding: '12px 14px',
        }}>
          <p style={{ fontSize: '12px', color: '#DC2626', margin: 0, fontWeight: '600' }}>
            Ambos consentimientos son obligatorios conforme a la normativa colombiana.
            El documento no podra guardarse sin esta autorizacion.
          </p>
        </div>
      )}
    </div>
  );
}
