import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import type { HistoriaClinicaForm } from '../../../types/historia-clinica';
import { CIE10_FRECUENTES } from '../../../constants/historia-clinica';
import SectionHeader from '../ui/SectionHeader';
import FormField from '../ui/FormField';

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

const INPUT: React.CSSProperties = {
  height: '36px',
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  padding: '0 10px',
  fontSize: '12px',
  color: '#111827',
  background: '#fff',
  width: '100%',
  boxSizing: 'border-box',
  outline: 'none',
};

// Slots fijos: dx1/cie1 … dx5/cie5
type DxSlot = 1 | 2 | 3 | 4 | 5;
const DX_KEYS: { dx: keyof HistoriaClinicaForm; cie: keyof HistoriaClinicaForm }[] = [
  { dx: 'dx1', cie: 'cie1' },
  { dx: 'dx2', cie: 'cie2' },
  { dx: 'dx3', cie: 'cie3' },
  { dx: 'dx4', cie: 'cie4' },
  { dx: 'dx5', cie: 'cie5' },
];

interface Props {
  form: HistoriaClinicaForm;
  set: (k: keyof HistoriaClinicaForm, v: string) => void;
}

export default function S08_Diagnostico({ form, set }: Props) {
  // Cuántas filas mostrar (mínimo 1, máximo 5)
  const initialVisible = Math.max(
    1,
    DX_KEYS.reduce((acc, { dx }, i) => (form[dx] ? i + 1 : acc), 1)
  );
  const [visibleRows, setVisibleRows] = useState<DxSlot>(initialVisible as DxSlot);

  // Chips: activo si su código ya está en algún slot visible
  function isChipActive(code: string): boolean {
    return DX_KEYS.slice(0, visibleRows).some(({ cie }) => form[cie] === code);
  }

  function handleChipClick(code: string, desc: string) {
    // Si ya está → quitar del slot que lo tenga
    const idx = DX_KEYS.findIndex(({ cie }) => form[cie] === code);
    if (idx !== -1) {
      set(DX_KEYS[idx].cie, '');
      set(DX_KEYS[idx].dx, '');
      return;
    }
    // Si no está → llenar el primer slot vacío (dentro de los visibles)
    const emptyIdx = DX_KEYS.slice(0, visibleRows).findIndex(({ dx }) => !form[dx]);
    if (emptyIdx !== -1) {
      set(DX_KEYS[emptyIdx].cie, code);
      set(DX_KEYS[emptyIdx].dx, desc);
    } else if (visibleRows < 5) {
      // Abrir siguiente fila y llenarlo
      const next = (visibleRows + 1) as DxSlot;
      setVisibleRows(next);
      set(DX_KEYS[visibleRows].cie, code);
      set(DX_KEYS[visibleRows].dx, desc);
    }
  }

  function clearRow(i: number) {
    set(DX_KEYS[i].dx, '');
    set(DX_KEYS[i].cie, '');
  }

  function addRow() {
    if (visibleRows < 5) setVisibleRows((visibleRows + 1) as DxSlot);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <SectionHeader number={7} title="Diagnostico" />

      {/* ── Chips CIE-10 frecuentes ─────────────────────────────────────── */}
      <div>
        <p style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>
          CIE-10 Frecuentes — click para agregar al diagnóstico
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {CIE10_FRECUENTES.map(c => {
            const active = isChipActive(c.code);
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => handleChipClick(c.code, c.desc)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '20px',
                  border: active ? '2px solid #12C49A' : '1px solid #E5E7EB',
                  background: active ? '#E6FAF5' : '#F9FAFB',
                  fontSize: '11px', fontWeight: '600',
                  color: active ? '#0A3D2E' : '#6B7280',
                  cursor: 'pointer',
                  transition: 'all 150ms',
                }}
              >
                {active && <span style={{ marginRight: '4px' }}>✓</span>}
                {c.code} — {c.desc}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Filas de diagnóstico ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {DX_KEYS.slice(0, visibleRows).map(({ dx, cie }, i) => (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: '28px 2fr 120px',
            gap: '8px',
            alignItems: 'end',
            background: i === 0 ? 'rgba(18,196,154,0.04)' : '#FAFAFA',
            border: `1px solid ${i === 0 ? 'rgba(18,196,154,0.20)' : '#F0F0F0'}`,
            borderRadius: '10px',
            padding: '10px 10px 10px 12px',
          }}>
            {/* Número */}
            <div style={{
              width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
              background: i === 0 ? '#12C49A' : '#E5E7EB',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: '700',
              color: i === 0 ? '#fff' : '#6B7280',
            }}>
              {i + 1}
            </div>

            {/* Descripción */}
            <div>
              <p style={{ fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                {i === 0 ? 'Diagnóstico principal *' : `Diagnóstico ${i + 1}`}
              </p>
              <input
                style={INPUT}
                value={form[dx] as string}
                onChange={e => set(dx, e.target.value)}
                placeholder={i === 0 ? 'Descripción del diagnóstico principal' : 'Diagnóstico adicional...'}
              />
            </div>

            {/* CIE-10 + botón limpiar */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'end' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                  CIE-10
                </p>
                <input
                  style={INPUT}
                  value={form[cie] as string}
                  onChange={e => set(cie, e.target.value)}
                  placeholder="E66"
                />
              </div>
              {i > 0 && (
                <button
                  type="button"
                  onClick={() => clearRow(i)}
                  title="Limpiar"
                  style={{
                    width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
                    border: '1px solid #FEE2E2', background: '#FEF2F2',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <X size={13} color="#EF4444" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Agregar fila ──────────────────────────────────────────────────── */}
      {visibleRows < 5 && (
        <button
          type="button"
          onClick={addRow}
          style={{
            height: '34px', borderRadius: '10px',
            border: '1.5px dashed #D1D5DB', background: 'transparent',
            fontSize: '11px', fontWeight: '600', color: '#6B7280',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '6px', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#12C49A'; (e.currentTarget as HTMLButtonElement).style.color = '#12C49A'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#D1D5DB'; (e.currentTarget as HTMLButtonElement).style.color = '#6B7280'; }}
        >
          <Plus size={12} /> Agregar diagnóstico ({visibleRows}/5)
        </button>
      )}

      {/* ── Observaciones diagnósticas ───────────────────────────────────── */}
      <FormField label="Observaciones diagnósticas">
        <textarea
          style={TEXTAREA}
          rows={3}
          value={form.dx_obs}
          onChange={e => set('dx_obs', e.target.value)}
          placeholder="Notas clínicas adicionales, contexto diagnóstico, impresión diagnóstica libre..."
        />
      </FormField>
    </div>
  );
}
