export default function HeaderHC() {
  return (
    <div>
      {/* Banner principal */}
      <div style={{
        background: 'linear-gradient(135deg, #0A3D2E, #0D5240)',
        padding: '28px 36px',
        borderRadius: '14px 14px 0 0',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
          <div>
            <p style={{ color: '#E6FAF5', fontSize: '11px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 6px' }}>
              Historia Clinica — BluePrint Session
            </p>
            <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '800', margin: '0 0 4px', lineHeight: 1.2 }}>
              Dra. Eusimary Contreras Morales
            </h1>
            <p style={{ color: '#86EFAC', fontSize: '12px', margin: '0 0 10px' }}>
              Medica Cirujana &nbsp;·&nbsp; Esp. Gerencia de la Calidad y Salud
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <span style={{ color: '#D4AF37', fontSize: '11px', fontWeight: '600' }}>R.M. 13-8793-05</span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>|</span>
              <span style={{ color: '#E6FAF5', fontSize: '11px' }}>+57 301 625 4865</span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>|</span>
              <span style={{ color: '#E6FAF5', fontSize: '11px' }}>draeusimary.netlify.app</span>
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px', margin: '0 0 2px' }}>Medicina Metabolica y Longevidad</p>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px', margin: 0 }}>Barranquilla, Colombia</p>
          </div>
        </div>
      </div>

      {/* Banda normativa */}
      <div style={{
        background: '#FCA5A5',
        padding: '8px 36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap',
      }}>
        <p style={{ fontSize: '11px', fontWeight: '800', color: '#7F1D1D', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
          DOCUMENTO CLINICO CONFIDENCIAL
        </p>
        <p style={{ fontSize: '10px', color: '#991B1B', margin: 0 }}>
          Ley 23/1981 · Ley 1581/2012 · Res. 1995/1999 · Ley 1438/2011 · Decreto 780/2016 &nbsp;|&nbsp; Custodia minima 20 anos
        </p>
      </div>
    </div>
  );
}
