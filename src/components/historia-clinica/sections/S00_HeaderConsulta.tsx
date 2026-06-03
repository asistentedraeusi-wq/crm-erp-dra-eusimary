import { useState, useRef, useEffect } from 'react';
import type { HistoriaClinicaForm } from '../../../types/historia-clinica';
import { TIPOS_CONSULTA } from '../../../constants/historia-clinica';
import FormField from '../ui/FormField';

const DOC_TYPES = [
  { code: 'CC',        full: 'Cédula de Ciudadanía' },
  { code: 'TI',        full: 'Tarjeta de Identidad' },
  { code: 'RNV',       full: 'Registro Civil' },
  { code: 'Pasaporte', full: 'Pasaporte' },
] as const;

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

interface Props {
  form: HistoriaClinicaForm;
  set: (k: keyof HistoriaClinicaForm, v: string) => void;
  readOnly?: boolean;
}

export default function S00_HeaderConsulta({ form, set, readOnly = false }: Props) {
  const [ddOpen, setDdOpen] = useState(false);
  const ddRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (ddRef.current && !ddRef.current.contains(e.target as Node)) setDdOpen(false);
    }
    document.addEventListener('mousedown', onOutsideClick);
    return () => document.removeEventListener('mousedown', onOutsideClick);
  }, []);

  const selectedDoc = DOC_TYPES.find(d => d.code === form.tipo_doc);

  return (
    <div style={{
      background: '#fff',
      borderRadius: '14px',
      padding: '20px 28px',
      border: '1px solid #D1FAF0',
      borderLeft: '4px solid #12C49A',
      boxShadow: '0 1px 6px rgba(18,196,154,0.10)',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>

        {/* Fecha de consulta */}
        <FormField label="Fecha de consulta" required>
          <input
            style={{ ...INPUT, background: readOnly ? '#F9FAFB' : '#fff' }}
            type="date"
            value={form.fecha_consulta}
            readOnly={readOnly}
            onChange={e => !readOnly && set('fecha_consulta', e.target.value)}
          />
        </FormField>

        {/* Tipo de consulta */}
        <FormField label="Tipo de consulta">
          {readOnly ? (
            <div style={{ ...INPUT, display: 'flex', alignItems: 'center', background: '#F9FAFB', color: form.tipo_consulta ? '#111827' : '#9CA3AF' }}>
              {form.tipo_consulta || 'No especificado'}
            </div>
          ) : (
            <select
              style={{ ...INPUT, cursor: 'pointer' }}
              value={form.tipo_consulta}
              onChange={e => set('tipo_consulta', e.target.value)}
            >
              <option value="">Seleccionar...</option>
              {TIPOS_CONSULTA.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          )}
        </FormField>

        {/* No. Historia Clínica = [tipo_doc▾] + número documento */}
        <FormField label="No. Historia Clínica">
          <div style={{
            display: 'flex',
            height: '40px',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            overflow: 'visible',
            position: 'relative',
          }}>

            {/* Botón tipo doc con dropdown */}
            <div ref={ddRef} style={{ position: 'relative', flexShrink: 0 }}>
              <button
                type="button"
                disabled={readOnly}
                onClick={() => !readOnly && setDdOpen(o => !o)}
                style={{
                  height: '40px',
                  padding: '0 10px',
                  border: 'none',
                  borderRight: '1px solid #E5E7EB',
                  borderRadius: '8px 0 0 8px',
                  background: readOnly ? '#F3F4F6' : '#F0FBF8',
                  color: '#0A3D2E',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: readOnly ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  whiteSpace: 'nowrap',
                  minWidth: '68px',
                  justifyContent: 'center',
                  letterSpacing: '0.04em',
                }}
              >
                {form.tipo_doc || 'Doc.'}
                {!readOnly && (
                  <svg
                    width="10" height="6" viewBox="0 0 10 6" fill="none"
                    style={{ transition: 'transform 150ms', transform: ddOpen ? 'rotate(180deg)' : 'none' }}
                  >
                    <path d="M1 1l4 4 4-4" stroke="#0A3D2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>

              {/* Dropdown menu */}
              {ddOpen && (
                <div style={{
                  position: 'absolute',
                  top: '46px',
                  left: 0,
                  background: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '10px',
                  boxShadow: '0 8px 28px rgba(0,0,0,0.13)',
                  zIndex: 200,
                  overflow: 'hidden',
                  minWidth: '200px',
                }}>
                  {DOC_TYPES.map(dt => {
                    const isSelected = form.tipo_doc === dt.code;
                    return (
                      <button
                        key={dt.code}
                        type="button"
                        onClick={() => { set('tipo_doc', dt.code); setDdOpen(false); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          width: '100%',
                          padding: '10px 14px',
                          border: 'none',
                          borderBottom: '1px solid #F3F4F6',
                          background: isSelected ? '#E6FAF5' : '#fff',
                          color: isSelected ? '#0A3D2E' : '#374151',
                          fontSize: '13px',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '30px',
                          height: '22px',
                          borderRadius: '6px',
                          background: isSelected ? '#12C49A' : '#F3F4F6',
                          color: isSelected ? '#fff' : '#6B7280',
                          fontSize: '11px',
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          flexShrink: 0,
                        }}>
                          {dt.code}
                        </span>
                        <span style={{ fontSize: '12px', color: '#6B7280' }}>{dt.full}</span>
                        {isSelected && (
                          <span style={{ marginLeft: 'auto', color: '#12C49A', fontSize: '14px', fontWeight: 800 }}>✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Input número documento */}
            <input
              type="text"
              readOnly={readOnly}
              value={form.cc}
              onChange={e => !readOnly && set('cc', e.target.value)}
              placeholder={selectedDoc ? `${selectedDoc.full}` : 'Número de documento'}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                padding: '0 12px',
                fontSize: '13px',
                color: form.cc ? '#111827' : '#9CA3AF',
                background: readOnly ? '#F9FAFB' : '#fff',
                fontWeight: form.cc ? 600 : 400,
                letterSpacing: form.cc ? '0.05em' : 'normal',
                borderRadius: '0 8px 8px 0',
              }}
            />
          </div>
        </FormField>

      </div>
    </div>
  );
}
