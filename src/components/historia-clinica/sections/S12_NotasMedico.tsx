import type { HistoriaClinicaForm } from '../../../types/historia-clinica';
import SectionHeader from '../ui/SectionHeader';
import FormField from '../ui/FormField';

interface Props {
  form: HistoriaClinicaForm;
  set: (k: keyof HistoriaClinicaForm, v: string) => void;
}

export default function S12_NotasMedico({ form, set }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <SectionHeader number={12} title="Notas del Medico" />

      <FormField label="Observaciones adicionales" hint="Informacion clinica relevante no contemplada en las secciones anteriores">
        <textarea
          value={form.notas}
          onChange={e => set('notas', e.target.value)}
          rows={6}
          placeholder="Observaciones clinicas adicionales, evolución del caso, contexto relevante, instrucciones especiales para el paciente..."
          style={{
            borderRadius: '8px', border: '1px solid #E5E7EB', padding: '12px 14px',
            fontSize: '13px', color: '#111827', background: '#fff',
            width: '100%', boxSizing: 'border-box', outline: 'none',
            resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.6',
          }}
        />
      </FormField>
    </div>
  );
}
