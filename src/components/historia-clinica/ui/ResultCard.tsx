interface ResultCardProps {
  value: string;
  label: string;
  category?: string;
  categoryColor?: string;
}

export default function ResultCard({ value, label, category, categoryColor = '#6B7280' }: ResultCardProps) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #E5E7EB',
      borderRadius: '10px',
      padding: '10px 14px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      <p style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: 0, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </p>
      <p style={{ fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '3px 0 0' }}>
        {label}
      </p>
      {category && (
        <p style={{ fontSize: '11px', fontWeight: '600', color: categoryColor, margin: '4px 0 0' }}>
          {category}
        </p>
      )}
    </div>
  );
}
