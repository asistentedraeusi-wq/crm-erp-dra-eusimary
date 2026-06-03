import type { Modalidad } from '../../../types/historia-clinica';

interface ModalityToggleProps {
  value: Modalidad;
  onChange: (v: Modalidad) => void;
}

export default function ModalityToggle({ value, onChange }: ModalityToggleProps) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      borderRadius: '10px', border: '1px solid #E5E7EB',
      overflow: 'hidden',
    }}>
      <button
        type="button"
        onClick={() => onChange('presencial')}
        style={{
          padding: '10px',
          fontSize: '13px', fontWeight: '600',
          background: value === 'presencial' ? '#0A3D2E' : '#F9FAFB',
          color: value === 'presencial' ? '#fff' : '#6B7280',
          border: 'none',
          borderRight: '1px solid #E5E7EB',
          cursor: 'pointer',
          transition: 'all 150ms',
        }}
      >
        Presencial
      </button>
      <button
        type="button"
        onClick={() => onChange('telemedicina')}
        style={{
          padding: '10px',
          fontSize: '13px', fontWeight: '600',
          background: value === 'telemedicina' ? '#0D7A5F' : '#F9FAFB',
          color: value === 'telemedicina' ? '#fff' : '#6B7280',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 150ms',
        }}
      >
        Telemedicina
      </button>
    </div>
  );
}
