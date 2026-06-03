interface SectionHeaderProps {
  number: number | string;
  title: string;
  gold?: boolean;
}

export default function SectionHeader({ number, title, gold = false }: SectionHeaderProps) {
  const badgeBg = gold ? '#D4AF37' : '#12C49A';
  const titleColor = '#0A3D2E';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '14px', borderBottom: `2px solid ${gold ? '#D4AF37' : '#12C49A'}`, marginBottom: '20px' }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%',
        background: badgeBg, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '13px', fontWeight: '800', flexShrink: 0,
      }}>
        {number}
      </div>
      <h2 style={{ fontSize: '13px', fontWeight: '800', color: titleColor, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
        {title}
      </h2>
    </div>
  );
}
