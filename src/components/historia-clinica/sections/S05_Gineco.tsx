import type { HistoriaClinicaForm } from '../../../types/historia-clinica';
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
  set: (k: keyof HistoriaClinicaForm, v: string | boolean) => void;
  sexo: string;
}

export default function S05_Gineco({ form, set, sexo }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <SectionHeader number={4} title="Antecedentes Gineco-Obstetricos" />

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          type="button"
          onClick={() => set('gineco', !form.gineco)}
          style={{
            width: '20px', height: '20px', borderRadius: '4px', flexShrink: 0,
            border: form.gineco ? '2px solid #12C49A' : '2px solid #E5E7EB',
            background: form.gineco ? '#12C49A' : '#fff',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 150ms',
          }}
        >
          {form.gineco && <span style={{ color: '#fff', fontSize: '12px', fontWeight: '700', lineHeight: 1 }}>✓</span>}
        </button>
        <span style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>
          Aplica antecedentes gineco-obstetricos
          {sexo === 'Masculino' && <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}> (marcar solo si es relevante)</span>}
        </span>
      </div>

      {form.gineco && (
        <div style={{ padding: '16px', background: '#F9FAFB', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <FormField label="Ciclo menstrual" hint="Regular / Irregular / Ausente">
              <input style={INPUT} value={form.ciclo} onChange={e => set('ciclo', e.target.value)} placeholder="Ej: Regular cada 28 dias" />
            </FormField>
            <FormField label="Fecha ultima menstruacion (FUM)">
              <input style={INPUT} type="date" value={form.fum} onChange={e => set('fum', e.target.value)} />
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '14px', marginTop: '14px' }}>
            <FormField label="G (Gestaciones)">
              <input style={INPUT} value={form.g} onChange={e => set('g', e.target.value)} placeholder="0" />
            </FormField>
            <FormField label="P (Partos)">
              <input style={INPUT} value={form.p} onChange={e => set('p', e.target.value)} placeholder="0" />
            </FormField>
            <FormField label="C (Cesareas)">
              <input style={INPUT} value={form.c} onChange={e => set('c', e.target.value)} placeholder="0" />
            </FormField>
            <FormField label="A (Abortos)">
              <input style={INPUT} value={form.a} onChange={e => set('a', e.target.value)} placeholder="0" />
            </FormField>
          </div>

          <div style={{ marginTop: '14px' }}>
            <FormField label="Metodo anticonceptivo actual">
              <input style={INPUT} value={form.anticonc} onChange={e => set('anticonc', e.target.value)} placeholder="Ej: Anticonceptivos orales, DIU, ninguno..." />
            </FormField>
          </div>
        </div>
      )}
    </div>
  );
}
