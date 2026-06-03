import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { HistoriaClinicaForm as HCForm } from '../../types/historia-clinica';
import { crearHistoriaClinica, actualizarHistoriaClinica } from '../../lib/historia-clinica';
import HeaderHC from './HeaderHC';
import FirmaHC from './FirmaHC';
import S01_Identificacion from './sections/S01_Identificacion';
import S02_Consulta from './sections/S02_Consulta';
import S09b_ResultadosLab from './sections/S09b_ResultadosLab';
import S03_Antecedentes from './sections/S03_Antecedentes';
import S04_Habitos from './sections/S04_Habitos';
import S05_Gineco from './sections/S05_Gineco';
import S06_Sintomas from './sections/S06_Sintomas';
import S07_ExamenFisico from './sections/S07_ExamenFisico';
import S08_Diagnostico from './sections/S08_Diagnostico';
import S09_Paraclínicos from './sections/S09_Paraclínicos';
import S10_PlanManejo from './sections/S10_PlanManejo';
import S11_Consentimiento from './sections/S11_Consentimiento';
import S12_NotasMedico from './sections/S12_NotasMedico';

const EMPTY: HCForm = {
  nombres: '', apellidos: '', cc: '', tipo_doc: '', fecha_nac: '', edad: '',
  sexo: '', estado_civil: '', escolaridad: '', ocupacion: '', ciudad: '',
  direccion: '', telefono: '', email: '', eps: '', regimen: '',
  fecha_consulta: new Date().toISOString().split('T')[0],
  tipo_consulta: '', programa: '', num_hc: '', motivo: '',
  ant_pers: [], ant_pers_obs: '', ant_fam: [], ant_fam_obs: '',
  meds: [], meds_obs: '', alergias: '',
  tabaco: '', alcohol: '', ejercicio: '', sueno: '', agua: '', dieta: '',
  gineco: false, ciclo: '', fum: '', g: '', p: '', c: '', a: '', anticonc: '',
  sintomas: [], sint_obs: '',
  modalidad: 'presencial',
  peso: '', talla: '', imc: '', peri_abd: '', pa: '', fc: '',
  temp: '', sato2: '', fr: '', grasa: '', grasa_kg: '', muscular: '',
  magra_kg: '', agua_total: '', fat_range: '', ef_obs: '',
  tp: '', th: '', ta: '', ts: 'F', tw: '', thip: '', tn: '', tc: '',
  dx1: '', cie1: '', dx2: '', cie2: '',
  examenes: [], exam_otro: '', instr_lab: '',
  res_fecha: '', res_estado: '', res_obs: '', res_archivo_url: '', res_valores: {},
  med_nombre: '', dosis: '', frecuencia: '',
  plan_nf: '', nutricion: '', actividad: '', metas: '', proxima: '',
  consent_habeas: false, consent_med: false,
  notas: '',
};

interface Props {
  initialData?: Partial<HCForm>;
  readOnly?: boolean;
  leadId?: string;
  hcId?: string;           // Si existe → actualizar HC existente
}

export default function HistoriaClinicaForm({ initialData, readOnly = false, leadId, hcId }: Props) {
  const navigate = useNavigate();
  const [form, setForm] = useState<HCForm>({ ...EMPTY, ...initialData });
  const [guardando, setGuardando] = useState(false);
  const esActualizacion = Boolean(hcId);

  function set(k: keyof HCForm, v: unknown) {
    if (readOnly) return;
    setForm(prev => ({ ...prev, [k]: v }));
  }

  async function handleGuardar() {
    // Validar consentimientos (Ley 1581/2012 y Ley 23/1981)
    if (!form.consent_habeas || !form.consent_med) {
      toast.error('Debes obtener ambos consentimientos antes de guardar.');
      return;
    }

    // Validar campos obligatorios (Res. 1995/1999)
    const requeridos: Array<keyof HCForm> = ['nombres', 'apellidos', 'cc', 'fecha_nac', 'sexo', 'telefono', 'motivo', 'dx1'];
    const faltantes = requeridos.filter(k => !form[k]);
    if (faltantes.length > 0) {
      toast.error(`Campos obligatorios incompletos: ${faltantes.join(', ')}`);
      return;
    }

    // Decreto 780/2016: si hay medicamento, dosis y frecuencia son obligatorios
    if (form.med_nombre && (!form.dosis || !form.frecuencia)) {
      toast.error('Si prescribes un medicamento, debes indicar dosis y frecuencia (Decreto 780/2016).');
      return;
    }

    setGuardando(true);

    let data, error;
    if (esActualizacion && hcId) {
      ({ data, error } = await actualizarHistoriaClinica(hcId, form));
    } else {
      ({ data, error } = await crearHistoriaClinica(form));
    }

    if (error || !data) {
      toast.error('Error al guardar. Verifica la conexion a Supabase.');
      setGuardando(false);
      return;
    }

    setForm(prev => ({ ...prev, num_hc: data.id.slice(0, 8).toUpperCase() }));
    toast.success(esActualizacion ? 'Historia clinica actualizada correctamente.' : 'Historia clinica guardada correctamente.');
    navigate(`/historia-clinica/${data.id}`);
  }

  const SECTION_STYLE: React.CSSProperties = {
    background: '#fff',
    borderRadius: '14px',
    padding: '24px 28px',
    border: '1px solid #E5E7EB',
    boxShadow: '0 1px 4px rgba(18,196,154,0.07)',
  };

  return (
    <div>
      <HeaderHC />

      {/* Formulario */}
      <div style={{ background: '#F9FAFB', padding: '28px 36px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        <div style={SECTION_STYLE}>
          <S01_Identificacion form={form} set={set as (k: keyof HCForm, v: string) => void} />
        </div>

        <div style={SECTION_STYLE}>
          <S03_Antecedentes form={form} set={set as (k: keyof HCForm, v: string | string[]) => void} />
        </div>

        <div style={SECTION_STYLE}>
          <S04_Habitos form={form} set={set as (k: keyof HCForm, v: string) => void} />
        </div>

        <div style={SECTION_STYLE}>
          <S05_Gineco form={form} set={set as (k: keyof HCForm, v: string | boolean) => void} sexo={form.sexo} />
        </div>

        <div style={SECTION_STYLE}>
          <S06_Sintomas form={form} set={set as (k: keyof HCForm, v: string | string[]) => void} />
        </div>

        <div style={SECTION_STYLE}>
          <S07_ExamenFisico form={form} set={set as (k: keyof HCForm, v: string) => void} />
        </div>

        <div style={SECTION_STYLE}>
          <S08_Diagnostico form={form} set={set as (k: keyof HCForm, v: string) => void} />
        </div>

        <div style={SECTION_STYLE}>
          <S09_Paraclínicos form={form} set={set as (k: keyof HCForm, v: string | string[]) => void} leadId={leadId} />
        </div>

        <div style={SECTION_STYLE}>
          <S09b_ResultadosLab form={form} set={set} readOnly={readOnly} />
        </div>

        <div style={SECTION_STYLE}>
          <S02_Consulta form={form} set={set as (k: keyof HCForm, v: string) => void} />
        </div>

        <div style={SECTION_STYLE}>
          <S10_PlanManejo form={form} set={set as (k: keyof HCForm, v: string) => void} />
        </div>

        <div style={{ ...SECTION_STYLE, background: 'linear-gradient(135deg, #E6FAF5, #FFF8E7)', borderColor: '#D4AF37' }}>
          <S11_Consentimiento form={form} set={set as (k: keyof HCForm, v: boolean) => void} />
        </div>

        <div style={SECTION_STYLE}>
          <S12_NotasMedico form={form} set={set as (k: keyof HCForm, v: string) => void} />
        </div>

        {/* Boton guardar */}
        {!readOnly && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                padding: '12px 24px', borderRadius: '10px',
                border: '1px solid #E5E7EB', background: '#fff',
                fontSize: '14px', fontWeight: '600', color: '#6B7280',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleGuardar}
              disabled={guardando}
              style={{
                padding: '12px 32px', borderRadius: '10px',
                border: 'none', background: guardando ? '#9CA3AF' : '#12C49A',
                fontSize: '14px', fontWeight: '700', color: '#fff',
                cursor: guardando ? 'not-allowed' : 'pointer',
                boxShadow: guardando ? 'none' : '0 4px 18px rgba(18,196,154,0.4)',
                transition: 'all 150ms',
              }}
            >
              {guardando ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg style={{ animation: 'spin 1s linear infinite', width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Guardando...
                </span>
              ) : esActualizacion ? 'Actualizar Historia Clínica' : 'Guardar Historia Clínica'}
            </button>
          </div>
        )}
      </div>

      <FirmaHC form={form} />
    </div>
  );
}
