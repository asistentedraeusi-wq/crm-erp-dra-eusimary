import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Eye } from 'lucide-react';
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
  const [modoEdicion, setModoEdicion] = useState(false);

  const esNueva = !id || id === 'nueva';

  const state = location.state as { leadPrefill?: Partial<HCForm>; leadId?: string } | null;
  const leadPrefill = state?.leadPrefill;
  const leadId = state?.leadId;

  useEffect(() => {
    if (!esNueva && id) {
      setLoading(true);
      obtenerHistoria(id).then(({ data, error }) => {
        if (error || !data) {
          setError('Historia clínica no encontrada.');
        } else {
          setDatos(data.datos);
        }
        setLoading(false);
      });
    }
  }, [id, esNueva]);

  // Al entrar en modo edición, hacer scroll al inicio
  function activarEdicion() {
    setModoEdicion(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

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
              color: '#6B7280', fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', padding: '6px 0',
            }}
          >
            <ArrowLeft size={16} /> Volver
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

            {/* Badge estado */}
            {esNueva && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: '#E6FAF5', border: '1px solid #12C49A33',
                borderRadius: '20px', padding: '4px 12px',
              }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#12C49A' }} className="animate-pulse" />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#0A3D2E', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Nueva Historia Clínica
                </span>
              </div>
            )}

            {!esNueva && !modoEdicion && datos && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: '#F9FAFB', border: '1px solid #E5E7EB',
                borderRadius: '20px', padding: '4px 12px',
              }}>
                <Eye size={12} color="#9CA3AF" />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Vista de lectura
                </span>
              </div>
            )}

            {!esNueva && modoEdicion && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: '#FFF8E7', border: '1px solid #D4AF3744',
                borderRadius: '20px', padding: '4px 12px',
              }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D97706' }} className="animate-pulse" />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#92400E', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Modo edición — 2ª Cita
                </span>
              </div>
            )}

            {/* Botón continuar / ver */}
            {!esNueva && datos && !modoEdicion && (
              <button
                onClick={activarEdicion}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: '#0A3D2E', color: '#fff', border: 'none',
                  borderRadius: '10px', padding: '8px 18px',
                  fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(10,61,46,0.3)',
                }}
              >
                <Pencil size={14} /> Continuar / 2ª Cita
              </button>
            )}

            {!esNueva && modoEdicion && (
              <button
                onClick={() => setModoEdicion(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'transparent', border: '1px solid #E5E7EB',
                  borderRadius: '10px', padding: '8px 18px',
                  fontSize: '13px', fontWeight: 600, color: '#6B7280', cursor: 'pointer',
                }}
              >
                <Eye size={14} /> Solo lectura
              </button>
            )}

            {/* Botón nueva HC */}
            {!esNueva && (
              <button
                onClick={() => navigate('/historia-clinica/nueva')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: '#12C49A', color: '#fff', border: 'none',
                  borderRadius: '10px', padding: '8px 18px',
                  fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(18,196,154,0.35)',
                }}
              >
                <Plus size={15} /> Nueva HC
              </button>
            )}
          </div>
        </div>

        {/* Contenido */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF', fontSize: '14px' }}>
            Cargando historia clínica...
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

        {!loading && !error && !esNueva && datos && !modoEdicion && (
          <HistoriaClinicaForm initialData={datos} readOnly />
        )}

        {!loading && !error && !esNueva && datos && modoEdicion && (
          <HistoriaClinicaForm initialData={datos} hcId={id} />
        )}
      </div>
    </div>
  );
}
