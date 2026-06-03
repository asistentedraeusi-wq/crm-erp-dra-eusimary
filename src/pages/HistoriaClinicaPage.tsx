import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import HistoriaClinicaForm from '../components/historia-clinica/HistoriaClinicaForm';
import type { HistoriaClinicaForm as HCForm } from '../types/historia-clinica';
import { obtenerHistoria } from '../lib/historia-clinica';

export default function HistoriaClinicaPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [datos, setDatos] = useState<Partial<HCForm> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const esNueva = !id || id === 'nueva';

  // Datos pre-llenados desde el lead card (vienen por navigate state)
  const state = location.state as { leadPrefill?: Partial<HCForm>; leadId?: string } | null;
  const leadPrefill = state?.leadPrefill;
  const leadId = state?.leadId;

  useEffect(() => {
    if (!esNueva && id) {
      setLoading(true);
      obtenerHistoria(id).then(({ data, error }) => {
        if (error || !data) {
          setError('Historia clinica no encontrada.');
        } else {
          setDatos(data.datos);
        }
        setLoading(false);
      });
    }
  }, [id, esNueva]);

  return (
    <div className="h-full overflow-y-auto bg-[#F8FAFB]">
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 36px' }}>

        {/* Barra superior */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'transparent', border: 'none',
              color: '#6B7280', fontSize: '14px', fontWeight: '600',
              cursor: 'pointer', padding: '6px 0',
            }}
          >
            <ArrowLeft size={16} /> Volver
          </button>

          {esNueva && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: '#E6FAF5', border: '1px solid #12C49A33',
                borderRadius: '20px', padding: '4px 12px',
              }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#12C49A' }} className="animate-pulse" />
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#0A3D2E', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Nueva Historia Clinica
                </span>
              </div>
            </div>
          )}

          {!esNueva && (
            <button
              onClick={() => navigate('/historia-clinica/nueva')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: '#12C49A', color: '#fff', border: 'none',
                borderRadius: '10px', padding: '8px 18px',
                fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(18,196,154,0.35)',
              }}
            >
              <Plus size={15} /> Nueva HC
            </button>
          )}
        </div>

        {/* Contenido */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF', fontSize: '14px' }}>
            Cargando historia clinica...
          </div>
        )}

        {error && (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FCA5A5',
            borderRadius: '12px', padding: '20px', textAlign: 'center',
            color: '#DC2626', fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        {!loading && !error && esNueva && (
          <HistoriaClinicaForm initialData={leadPrefill} leadId={leadId} />
        )}

        {!loading && !error && !esNueva && datos && (
          <HistoriaClinicaForm initialData={datos} readOnly />
        )}
      </div>
    </div>
  );
}
