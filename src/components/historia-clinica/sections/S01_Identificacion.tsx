import type { HistoriaClinicaForm } from '../../../types/historia-clinica';
import { TIPOS_DOC, ESTADOS_CIVILES, ESCOLARIDADES, REGIMENES } from '../../../constants/historia-clinica';
import SectionHeader from '../ui/SectionHeader';
import FormField from '../ui/FormField';

const INPUT = {
  height: '40px',
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  padding: '0 12px',
  fontSize: '13px',
  color: '#111827',
  background: '#fff',
  width: '100%',
  boxSizing: 'border-box' as const,
  outline: 'none',
  transition: 'border-color 150ms',
};

const SELECT = { ...INPUT };
const GRID2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' };
const GRID3 = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' };

interface Props {
  form: HistoriaClinicaForm;
  set: (k: keyof HistoriaClinicaForm, v: string) => void;
}

export default function S01_Identificacion({ form, set }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <SectionHeader number={1} title="Identificacion del Paciente" />

      <div style={GRID2}>
        <FormField label="Nombres" required>
          <input style={INPUT} value={form.nombres} onChange={e => set('nombres', e.target.value)} placeholder="Nombres completos" />
        </FormField>
        <FormField label="Apellidos" required>
          <input style={INPUT} value={form.apellidos} onChange={e => set('apellidos', e.target.value)} placeholder="Apellidos completos" />
        </FormField>
      </div>

      <div style={GRID3}>
        <FormField label="Tipo documento">
          <select style={SELECT} value={form.tipo_doc} onChange={e => set('tipo_doc', e.target.value)}>
            <option value="">Seleccionar...</option>
            {TIPOS_DOC.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </FormField>
        <FormField label="Numero de documento" required>
          <input style={INPUT} value={form.cc} onChange={e => set('cc', e.target.value)} placeholder="0000000000" />
        </FormField>
        <FormField label="Fecha de nacimiento" required>
          <input style={INPUT} type="date" value={form.fecha_nac} onChange={e => set('fecha_nac', e.target.value)} />
        </FormField>
      </div>

      <div style={GRID3}>
        <FormField label="Edad">
          <input style={INPUT} value={form.edad} onChange={e => set('edad', e.target.value)} placeholder="Años" />
        </FormField>
        <FormField label="Sexo biologico" required>
          <select style={SELECT} value={form.sexo} onChange={e => set('sexo', e.target.value)}>
            <option value="">Seleccionar...</option>
            <option value="Femenino">Femenino</option>
            <option value="Masculino">Masculino</option>
          </select>
        </FormField>
        <FormField label="Estado civil">
          <select style={SELECT} value={form.estado_civil} onChange={e => set('estado_civil', e.target.value)}>
            <option value="">Seleccionar...</option>
            {ESTADOS_CIVILES.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </FormField>
      </div>

      <div style={GRID2}>
        <FormField label="Escolaridad">
          <select style={SELECT} value={form.escolaridad} onChange={e => set('escolaridad', e.target.value)}>
            <option value="">Seleccionar...</option>
            {ESCOLARIDADES.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </FormField>
        <FormField label="Ocupacion">
          <input style={INPUT} value={form.ocupacion} onChange={e => set('ocupacion', e.target.value)} placeholder="Ocupacion actual" />
        </FormField>
      </div>

      <div style={GRID2}>
        <FormField label="Ciudad de residencia">
          <input style={INPUT} value={form.ciudad} onChange={e => set('ciudad', e.target.value)} placeholder="Ciudad" />
        </FormField>
        <FormField label="Direccion">
          <input style={INPUT} value={form.direccion} onChange={e => set('direccion', e.target.value)} placeholder="Direccion completa" />
        </FormField>
      </div>

      <div style={GRID2}>
        <FormField label="Telefono / Celular" required>
          <input style={INPUT} value={form.telefono} onChange={e => set('telefono', e.target.value)} placeholder="+57 300 000 0000" />
        </FormField>
        <FormField label="Correo electronico">
          <input style={INPUT} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="correo@email.com" />
        </FormField>
      </div>

      <div style={GRID2}>
        <FormField label="EPS / Aseguradora">
          <input style={INPUT} value={form.eps} onChange={e => set('eps', e.target.value)} placeholder="Nombre EPS o Aseguradora" />
        </FormField>
        <FormField label="Regimen">
          <select style={SELECT} value={form.regimen} onChange={e => set('regimen', e.target.value)}>
            <option value="">Seleccionar...</option>
            {REGIMENES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </FormField>
      </div>
    </div>
  );
}
