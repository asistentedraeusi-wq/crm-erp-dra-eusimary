import { useEffect } from 'react';
import type { HistoriaClinicaForm, Modalidad, ResultadosComposicion } from '../../../types/historia-clinica';
import { getIMCInfo } from '../../../lib/calculadora/composicion-corporal';
import SectionHeader from '../ui/SectionHeader';
import FormField from '../ui/FormField';
import ModalityToggle from '../ui/ModalityToggle';
import TeleCalc from '../calculadora/TeleCalc';

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
  transition: 'border-color 150ms',
};

const GRID3 = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' } as const;
const GRID4 = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '14px' } as const;

interface Props {
  form: HistoriaClinicaForm;
  set: (k: keyof HistoriaClinicaForm, v: string | Modalidad) => void;
}

export default function S07_ExamenFisico({ form, set }: Props) {
  // Auto-calcular IMC en modo presencial
  useEffect(() => {
    const p = parseFloat(form.peso);
    const t = parseFloat(form.talla) / 100;
    if (p > 0 && t > 0) {
      set('imc', (p / (t * t)).toFixed(1));
    }
  }, [form.peso, form.talla]);

  const imcInfo = getIMCInfo(parseFloat(form.imc));

  function handleTransferir(r: ResultadosComposicion) {
    set('imc',       String(r.bmi));
    set('grasa',     String(r.bf));
    set('grasa_kg',  String(r.fkg));
    set('muscular',  String(r.lpct));
    set('magra_kg',  String(r.lkg));
    set('agua_total',String(r.wtr));
    if (form.tp) set('peso', form.tp);
    if (form.th) set('talla', form.th);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <SectionHeader number={7} title="Examen Fisico" />

      <FormField label="Modalidad de atencion">
        <ModalityToggle value={form.modalidad} onChange={v => set('modalidad', v)} />
      </FormField>

      {/* ── MODO PRESENCIAL ── */}
      {form.modalidad === 'presencial' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={GRID3}>
            <FormField label="Peso (kg)">
              <input style={INPUT} value={form.peso} onChange={e => set('peso', e.target.value)} placeholder="0.0" />
            </FormField>
            <FormField label="Talla (cm)">
              <input style={INPUT} value={form.talla} onChange={e => set('talla', e.target.value)} placeholder="0" />
            </FormField>
            <div>
              <FormField label="IMC (kg/m²)" hint="Calculado automaticamente">
                <input style={{ ...INPUT, background: '#F9FAFB', color: '#0A3D2E', fontWeight: '700' }}
                  value={form.imc} readOnly placeholder="—" />
              </FormField>
              {imcInfo && (
                <p style={{ fontSize: '11px', fontWeight: '600', color: imcInfo.color, margin: '3px 0 0' }}>
                  {imcInfo.label}
                </p>
              )}
            </div>
          </div>

          <div style={GRID4}>
            <FormField label="Grasa corporal (%)">
              <input style={INPUT} value={form.grasa} onChange={e => set('grasa', e.target.value)} placeholder="0.0" />
            </FormField>
            <FormField label="Masa grasa (kg)">
              <input style={INPUT} value={form.grasa_kg} onChange={e => set('grasa_kg', e.target.value)} placeholder="0.0" />
            </FormField>
            <FormField label="Masa magra (%)">
              <input style={INPUT} value={form.muscular} onChange={e => set('muscular', e.target.value)} placeholder="0.0" />
            </FormField>
            <FormField label="Masa magra (kg)">
              <input style={INPUT} value={form.magra_kg} onChange={e => set('magra_kg', e.target.value)} placeholder="0.0" />
            </FormField>
          </div>

          <div style={GRID3}>
            <FormField label="Agua total (L)">
              <input style={INPUT} value={form.agua_total} onChange={e => set('agua_total', e.target.value)} placeholder="0.0" />
            </FormField>
            <FormField label="Perimetro abdominal (cm)">
              <input style={INPUT} value={form.peri_abd} onChange={e => set('peri_abd', e.target.value)} placeholder="0" />
            </FormField>
            <FormField label="Rango grasa optima" hint="Del impedanciometro">
              <input style={INPUT} value={form.fat_range} onChange={e => set('fat_range', e.target.value)} placeholder="Ej: 18-25%" />
            </FormField>
          </div>

          <div style={GRID4}>
            <FormField label="TA (mmHg)">
              <input style={INPUT} value={form.pa} onChange={e => set('pa', e.target.value)} placeholder="120/80" />
            </FormField>
            <FormField label="FC (lpm)">
              <input style={INPUT} value={form.fc} onChange={e => set('fc', e.target.value)} placeholder="72" />
            </FormField>
            <FormField label="Temp. (°C)">
              <input style={INPUT} value={form.temp} onChange={e => set('temp', e.target.value)} placeholder="36.5" />
            </FormField>
            <FormField label="SatO₂ (%)">
              <input style={INPUT} value={form.sato2} onChange={e => set('sato2', e.target.value)} placeholder="98" />
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '14px' }}>
            <FormField label="FR (rpm)">
              <input style={INPUT} value={form.fr} onChange={e => set('fr', e.target.value)} placeholder="16" />
            </FormField>
            <FormField label="Descripcion examen fisico" hint="Hallazgos relevantes al examen">
              <textarea value={form.ef_obs} onChange={e => set('ef_obs', e.target.value)}
                rows={2} placeholder="Estado general, hallazgos por sistemas..."
                style={{
                  borderRadius: '8px', border: '1px solid #E5E7EB', padding: '10px 12px',
                  fontSize: '13px', color: '#111827', background: '#fff',
                  width: '100%', boxSizing: 'border-box', outline: 'none',
                  resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.5',
                }}
              />
            </FormField>
          </div>
        </div>
      )}

      {/* ── MODO TELEMEDICINA ── */}
      {form.modalidad === 'telemedicina' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ background: '#0D7A5F10', borderRadius: '10px', padding: '12px 16px', border: '1px solid #0D7A5F30' }}>
            <p style={{ fontSize: '11px', color: '#0D7A5F', fontWeight: '600', margin: 0 }}>
              Modo Telemedicina — Ingresa las medidas reportadas por el paciente. Los calculos se realizan automaticamente.
            </p>
          </div>

          <div style={GRID4}>
            <FormField label="Peso (kg)" required>
              <input style={INPUT} value={form.tp} onChange={e => set('tp', e.target.value)} placeholder="0.0" />
            </FormField>
            <FormField label="Talla (cm)" required>
              <input style={INPUT} value={form.th} onChange={e => set('th', e.target.value)} placeholder="0" />
            </FormField>
            <FormField label="Edad" required>
              <input style={INPUT} value={form.ta} onChange={e => set('ta', e.target.value)} placeholder="Años" />
            </FormField>
            <FormField label="Sexo biologico">
              <select style={{ ...INPUT, cursor: 'pointer' }} value={form.ts} onChange={e => set('ts', e.target.value)}>
                <option value="F">Femenino</option>
                <option value="M">Masculino</option>
              </select>
            </FormField>
          </div>

          <div style={GRID4}>
            <FormField label="Cintura (cm)" required>
              <input style={INPUT} value={form.tw} onChange={e => set('tw', e.target.value)} placeholder="0" />
            </FormField>
            <FormField label={form.ts === 'M' ? 'Cadera (cm)' : 'Cadera (cm)'} required={form.ts === 'F'}>
              <input style={INPUT} value={form.thip} onChange={e => set('thip', e.target.value)} placeholder="0" />
            </FormField>
            <FormField label="Cuello (cm)" required>
              <input style={INPUT} value={form.tn} onChange={e => set('tn', e.target.value)} placeholder="0" />
            </FormField>
            <FormField label="Pantorrilla (cm)" hint="Sarcopenia">
              <input style={INPUT} value={form.tc} onChange={e => set('tc', e.target.value)} placeholder="0" />
            </FormField>
          </div>

          <div style={GRID3}>
            <FormField label="TA reportada (mmHg)">
              <input style={INPUT} value={form.pa} onChange={e => set('pa', e.target.value)} placeholder="120/80" />
            </FormField>
            <FormField label="FC reportada (lpm)">
              <input style={INPUT} value={form.fc} onChange={e => set('fc', e.target.value)} placeholder="72" />
            </FormField>
          </div>

          <TeleCalc form={form} onTransferir={handleTransferir} />
        </div>
      )}
    </div>
  );
}
