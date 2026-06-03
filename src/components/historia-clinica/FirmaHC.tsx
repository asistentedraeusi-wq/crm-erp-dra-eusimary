import type { HistoriaClinicaForm } from '../../types/historia-clinica';

interface Props {
  form: HistoriaClinicaForm;
}

export default function FirmaHC({ form }: Props) {
  const nombrePaciente = [form.nombres, form.apellidos].filter(Boolean).join(' ') || '________________________________';
  const ccPaciente = form.cc || '________________________________';
  const fechaDoc = form.fecha_consulta
    ? new Date(form.fecha_consulta + 'T12:00:00').toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div style={{ background: 'linear-gradient(135deg, #0A3D2E, #0D5240)', borderRadius: '0 0 14px 14px', padding: '28px 36px' }}>
      <p style={{ fontSize: '11px', fontWeight: '700', color: '#86EFAC', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 20px', textAlign: 'center' }}>
        Firmas y consentimiento — {fechaDoc}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>

        {/* Medico */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ height: '60px', borderBottom: '1px solid rgba(212,175,55,0.4)' }} />
          <p style={{ color: '#fff', fontSize: '13px', fontWeight: '700', margin: 0 }}>
            Dra. Eusimary Contreras Morales
          </p>
          <p style={{ color: '#86EFAC', fontSize: '11px', margin: 0 }}>
            Medica Cirujana · Esp. Gerencia de la Calidad y Salud
          </p>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px', margin: 0 }}>R.M. 13-8793-05</p>
        </div>

        {/* Paciente */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ height: '60px', borderBottom: '1px solid rgba(212,175,55,0.4)' }} />
          <p style={{ color: '#fff', fontSize: '13px', fontWeight: '700', margin: 0 }}>{nombrePaciente}</p>
          <p style={{ color: '#86EFAC', fontSize: '11px', margin: 0 }}>Paciente</p>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px', margin: 0 }}>C.C. {ccPaciente}</p>
        </div>
      </div>

      <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textAlign: 'center', margin: '20px 0 0', lineHeight: '1.6' }}>
        Documento clinico sujeto a custodia minima de 20 anos · Ley 1581/2012 · Res. 1995/1999 · Ley 23/1981<br />
        Sistema CRM-ERP · Dra. Eusimary Contreras Morales · Barranquilla, Colombia
      </p>
    </div>
  );
}
