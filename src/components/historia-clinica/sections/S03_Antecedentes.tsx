import type { HistoriaClinicaForm } from '../../../types/historia-clinica';
import { ANTECEDENTES_PERSONALES, ANTECEDENTES_FAMILIARES, MEDICAMENTOS } from '../../../constants/historia-clinica';
import SectionHeader from '../ui/SectionHeader';
import FormField from '../ui/FormField';
import CheckGroup from '../ui/CheckGroup';

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
  set: (k: keyof HistoriaClinicaForm, v: string | string[]) => void;
}

export default function S03_Antecedentes({ form, set }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <SectionHeader number={2} title="Antecedentes" />

      <div>
        <CheckGroup
          label="Antecedentes personales patologicos"
          items={ANTECEDENTES_PERSONALES}
          selected={form.ant_pers}
          onChange={v => set('ant_pers', v)}
          columns={3}
        />
        <div style={{ marginTop: '10px' }}>
          <FormField label="Observaciones antecedentes personales">
            <textarea style={TEXTAREA} rows={2} value={form.ant_pers_obs}
              onChange={e => set('ant_pers_obs', e.target.value)}
              placeholder="Ampliar informacion sobre antecedentes personales..." />
          </FormField>
        </div>
      </div>

      <div>
        <CheckGroup
          label="Antecedentes familiares"
          items={ANTECEDENTES_FAMILIARES}
          selected={form.ant_fam}
          onChange={v => set('ant_fam', v)}
          columns={2}
        />
        <div style={{ marginTop: '10px' }}>
          <FormField label="Observaciones antecedentes familiares">
            <textarea style={TEXTAREA} rows={2} value={form.ant_fam_obs}
              onChange={e => set('ant_fam_obs', e.target.value)}
              placeholder="Parentesco y detalle..." />
          </FormField>
        </div>
      </div>

      <div>
        <CheckGroup
          label="Medicamentos actuales"
          items={MEDICAMENTOS}
          selected={form.meds}
          onChange={v => set('meds', v)}
          columns={3}
        />
        <div style={{ marginTop: '10px' }}>
          <FormField label="Especificar medicamentos (dosis y frecuencia)">
            <textarea style={TEXTAREA} rows={2} value={form.meds_obs}
              onChange={e => set('meds_obs', e.target.value)}
              placeholder="Nombre del medicamento — dosis — frecuencia..." />
          </FormField>
        </div>
      </div>

      <FormField label="Alergias conocidas">
        <textarea style={TEXTAREA} rows={2} value={form.alergias}
          onChange={e => set('alergias', e.target.value)}
          placeholder="Alergias a medicamentos, alimentos u otras sustancias. Si no tiene, escribir: Ninguna conocida." />
      </FormField>
    </div>
  );
}
