import type { HistoriaClinicaForm } from '../../../types/historia-clinica';
import { SINTOMAS } from '../../../constants/historia-clinica';
import SectionHeader from '../ui/SectionHeader';
import FormField from '../ui/FormField';
import CheckGroup from '../ui/CheckGroup';

interface Props {
  form: HistoriaClinicaForm;
  set: (k: keyof HistoriaClinicaForm, v: string | string[]) => void;
}

export default function S06_Sintomas({ form, set }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <SectionHeader number={5} title="Sintomatologia Actual" />

      <CheckGroup
        label="Seleccionar sintomas presentes"
        items={SINTOMAS}
        selected={form.sintomas}
        onChange={v => set('sintomas', v)}
        columns={2}
      />

      <FormField label="Observaciones y evolucion de sintomas">
        <textarea
          value={form.sint_obs}
          onChange={e => set('sint_obs', e.target.value)}
          placeholder="Tiempo de evolucion, intensidad, factores agravantes o atenuantes..."
          rows={3}
          style={{
            borderRadius: '8px', border: '1px solid #E5E7EB', padding: '10px 12px',
            fontSize: '13px', color: '#111827', background: '#fff',
            width: '100%', boxSizing: 'border-box', outline: 'none',
            resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.5',
          }}
        />
      </FormField>
    </div>
  );
}
