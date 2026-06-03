interface CheckGroupProps {
  label: string;
  items: readonly string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  columns?: 2 | 3;
}

export default function CheckGroup({ label, items, selected, onChange, columns = 2 }: CheckGroupProps) {
  function toggle(item: string) {
    onChange(selected.includes(item) ? selected.filter(s => s !== item) : [...selected, item]);
  }

  return (
    <div>
      {label && (
        <p style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>
          {label}
        </p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: '6px' }}>
        {items.map(item => {
          const active = selected.includes(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() => toggle(item)}
              style={{
                textAlign: 'left',
                padding: '8px 12px',
                borderRadius: '8px',
                border: active ? '2px solid #12C49A' : '1px solid #E5E7EB',
                background: active ? '#E6FAF5' : '#F9FAFB',
                fontSize: '12px',
                color: active ? '#0A3D2E' : '#374151',
                fontWeight: active ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 150ms',
                lineHeight: '1.3',
              }}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}
