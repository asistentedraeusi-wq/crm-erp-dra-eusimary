import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FileDown } from 'lucide-react';
import { generarHistoriaClinicaPDF } from '../../lib/generarHistoriaClinicaPDF';
import { generarKitPaciente } from '../../lib/generarKitPaciente';
import type { HistoriaClinicaForm as HCForm } from '../../types/historia-clinica';
import { crearHistoriaClinica, actualizarHistoriaClinica } from '../../lib/historia-clinica';
import { useLeads } from '../../context/LeadsContext';
import HeaderHC from './HeaderHC';
import FirmaHC from './FirmaHC';
import S00_HeaderConsulta from './sections/S00_HeaderConsulta';
import S00b_HeaderSegundaCita from './sections/S00b_HeaderSegundaCita';
import S01_Identificacion from './sections/S01_Identificacion';
import S02_Consulta from './sections/S02_Consulta';
import S02b_Consulta2 from './sections/S02b_Consulta2';
import S03_Antecedentes from './sections/S03_Antecedentes';
import S04_Habitos from './sections/S04_Habitos';
import S05_Gineco from './sections/S05_Gineco';
import S06_Sintomas from './sections/S06_Sintomas';
import S07_ExamenFisico from './sections/S07_ExamenFisico';
import S08_Diagnostico from './sections/S08_Diagnostico';
import S09_Paraclínicos from './sections/S09_Paraclínicos';
import S09b_ResultadosLab from './sections/S09b_ResultadosLab';
import S10_PlanManejo from './sections/S10_PlanManejo';
import S11_Consentimiento from './sections/S11_Consentimiento';
import S11b_Consentimiento2 from './sections/S11b_Consentimiento2';
import S12_NotasMedico from './sections/S12_NotasMedico';

const EMPTY: HCForm = {
  nombres: '', apellidos: '', cc: '', tipo_doc: '', fecha_nac: '', edad: '',
  sexo: '', estado_civil: '', escolaridad: '', ocupacion: '', ciudad: '',
  direccion: '', telefono: '', email: '', eps: '', regimen: '',
  fecha_consulta: new Date().toISOString().split('T')[0],
  tipo_consulta: '', programa: '', num_hc: '', motivo: '',
  ant_pers: [], ant_pers_obs: '', ant_fam: [], ant_fam_obs: '',
  meds: [], meds_obs: '', alergias: '',
  tabaco: '', alcohol: '', ejercicio: '', sueno: '', agua: '', dieta: '', habitos_obs: '',
  gineco: false, ciclo: '', fum: '', g: '', p: '', c: '', a: '', anticonc: '',
  sintomas: [], sint_obs: '',
  modalidad: 'presencial',
  peso: '', talla: '', imc: '', peri_abd: '', pa: '', fc: '',
  temp: '', sato2: '', fr: '', grasa: '', grasa_kg: '', muscular: '',
  magra_kg: '', agua_total: '', fat_range: '', ef_obs: '',
  tp: '', th: '', ta: '', ts: 'F', tw: '', thip: '', tn: '', tc: '',
  dx1: '', cie1: '', dx2: '', cie2: '', dx3: '', cie3: '', dx4: '', cie4: '', dx5: '', cie5: '', dx_obs: '',
  examenes: [], exam_otro: '', instr_lab: '',
  res_fecha: '', res_estado: '', res_obs: '', res_archivo_url: '', res_valores: {},
  fecha_2cita: '', tipo_2cita: '', programa_2cita: '', motivo_2cita: '',
  med_nombre: '', med_otro: '', dosis: '', frecuencia: '',
  plan_nf: '', nutricion: '', actividad: '', metas: '', proxima: '',
  pm_plan_base: '', pm_proteinas: [], pm_vegetales: [], pm_restricciones: [],
  pm_snacks: [], pm_hidratacion: '', pm_tipo_aerobico: '', pm_minutos_sesion: '',
  pm_dias_aerobico: '', pm_nivel_fuerza: '', pm_dias_fuerza: [],
  pm_suplementacion: [], pm_alertas: [], pm_nota_medica: '', pm_mes_titulacion: '',
  consent_habeas: false, consent_med: false,
  consent_habeas_2: false, consent_med_2: false,
  notas: '',
};

interface Props {
  initialData?: Partial<HCForm>;
  readOnly?: boolean;
  leadId?: string;
  hcId?: string;
}

export default function HistoriaClinicaForm({ initialData, readOnly = false, leadId, hcId }: Props) {
  const navigate = useNavigate();
  const { moveStage, updateLead, leads } = useLeads();
  const leadEmail = leadId ? leads.find(l => l.id === leadId)?.email : undefined;
  const [form, setForm] = useState<HCForm>({ ...EMPTY, ...initialData });
  const [guardando, setGuardando] = useState(false);
  const esActualizacion = Boolean(hcId);

  // Auto-genera num_hc desde tipo_doc + cc en tiempo real
  useEffect(() => {
    if (!readOnly && form.tipo_doc && form.cc) {
      const generado = `${form.tipo_doc}-${form.cc}`;
      setForm(prev => prev.num_hc === generado ? prev : { ...prev, num_hc: generado });
    }
  }, [form.tipo_doc, form.cc, readOnly]);

  function set(k: keyof HCForm, v: unknown) {
    if (readOnly) return;
    setForm(prev => ({ ...prev, [k]: v }));
  }

  // Guardar 1ª Cita — crea HC nueva
  async function handleGuardarPrimeraCita() {
    if (!form.consent_habeas || !form.consent_med) {
      toast.error('Debes obtener los consentimientos de la 1ª cita antes de guardar.');
      return;
    }
    const requeridos: Array<keyof HCForm> = ['nombres', 'apellidos', 'cc', 'fecha_nac', 'sexo', 'telefono', 'motivo', 'dx1'];
    const faltantes = requeridos.filter(k => !form[k]);
    if (faltantes.length > 0) {
      toast.error(`Campos obligatorios incompletos: ${faltantes.join(', ')}`);
      return;
    }
    if (form.med_nombre && (!form.dosis || !form.frecuencia)) {
      toast.error('Si prescribes un medicamento, debes indicar dosis y frecuencia (Decreto 780/2016).');
      return;
    }
    setGuardando(true);
    const { data, error } = await crearHistoriaClinica(form);
    if (error || !data) {
      console.error('[HC] Error al crear HC:', error?.message);
      toast.error(`Error al guardar: ${error?.message ?? 'Sin conexión a Supabase'}`);
      setGuardando(false);
      return;
    }
    toast.success('Historia clínica de la 1ª cita guardada correctamente.');
    if (leadId) {
      moveStage(leadId, 'paraclínicos');
      updateLead(leadId, { hc_id: data.id });
      // Guardar copia automática en Soportes (cumplimiento Res. 1995/1999)
      generarHistoriaClinicaPDF(form, {
        leadId,
        hcId: data.id,
        silencioso: true,
        onSaved: () => toast.info('Copia de HC guardada en Soportes.', { duration: 3000 }),
        onError: () => toast.warning('HC guardada. Verifica el bucket "soportes" en Supabase.'),
      });
    }
    navigate(`/historia-clinica/${data.id}`);
  }

  // Guardar 2ª Cita — crea HC nueva o actualiza existente según contexto
  async function handleGuardarSegundaCita() {
    if (!form.consent_habeas_2 || !form.consent_med_2) {
      toast.error('Debes obtener los consentimientos de la 2ª cita antes de guardar.');
      return;
    }
    if (form.med_nombre && (!form.dosis || !form.frecuencia)) {
      toast.error('Si prescribes un medicamento, debes indicar dosis y frecuencia (Decreto 780/2016).');
      return;
    }
    setGuardando(true);

    if (esActualizacion && hcId) {
      // HC existente — actualizar
      const { data, error } = await actualizarHistoriaClinica(hcId, form);
      if (error || !data) {
        console.error('[HC] Error al actualizar HC:', error?.message);
        toast.error(`Error al guardar: ${error?.message ?? 'Sin conexión a Supabase'}`);
        setGuardando(false);
        return;
      }
      toast.success('Historia clínica guardada con los datos de la 2ª cita.');
      if (leadId) {
        moveStage(leadId, 'pendiente_inicio');
        // Actualizar copia en Soportes con datos completos de 1ª + 2ª cita
        generarHistoriaClinicaPDF(form, {
          leadId,
          hcId: hcId ?? data.id,
          silencioso: true,
          onSaved: () => toast.info('HC completa guardada en Soportes.', { duration: 3000 }),
          onError: () => toast.warning('HC guardada. Verifica el bucket "soportes" en Supabase.'),
        });
      }
      navigate(`/historia-clinica/${data.id}`);
    } else {
      // HC nueva — crear con todos los datos (incluyendo 2ª cita)
      if (!form.consent_habeas || !form.consent_med) {
        toast.error('Completa también los consentimientos de la 1ª cita.');
        setGuardando(false);
        return;
      }
      const { data, error } = await crearHistoriaClinica(form);
      if (error || !data) {
        console.error('[HC] Error al crear HC (2ª cita):', error?.message);
        toast.error(`Error al guardar: ${error?.message ?? 'Sin conexión a Supabase'}`);
        setGuardando(false);
        return;
      }
      toast.success('Historia clínica guardada con datos de 1ª y 2ª cita.');
      if (leadId) {
        moveStage(leadId, 'pendiente_inicio');
        generarHistoriaClinicaPDF(form, {
          leadId,
          hcId: data.id,
          silencioso: true,
          onSaved: () => toast.info('HC completa guardada en Soportes.', { duration: 3000 }),
          onError: () => toast.warning('HC guardada. Verifica el bucket "soportes" en Supabase.'),
        });
      }
      navigate(`/historia-clinica/${data.id}`);
    }
  }

  const SECTION_STYLE: React.CSSProperties = {
    background: '#fff',
    borderRadius: '14px',
    padding: '24px 28px',
    border: '1px solid #E5E7EB',
    boxShadow: '0 1px 4px rgba(18,196,154,0.07)',
  };

  const CONSENT_BTN: React.CSSProperties = {
    padding: '12px 32px', borderRadius: '10px',
    border: 'none', fontSize: '14px', fontWeight: '700', color: '#fff',
    cursor: guardando ? 'not-allowed' : 'pointer',
    transition: 'all 150ms',
    display: 'flex', alignItems: 'center', gap: '8px',
  };

  const Spinner = () => (
    <svg style={{ animation: 'spin 1s linear infinite', width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );

  return (
    <div>
      <HeaderHC />

      <div style={{ background: '#F9FAFB', padding: '28px 36px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* ── 1ª CITA ─────────────────────────────────────────── */}
        <S00_HeaderConsulta form={form} set={set as (k: keyof HCForm, v: string) => void} readOnly={readOnly} />

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
          <S02_Consulta form={form} set={set as (k: keyof HCForm, v: string) => void} />
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

        {/* Consentimientos 1ª Cita */}
        <div style={{ ...SECTION_STYLE, background: 'linear-gradient(135deg, #E6FAF5, #FFF8E7)', borderColor: '#D4AF37' }}>
          <S11_Consentimiento form={form} set={set as (k: keyof HCForm, v: boolean) => void} />
        </div>

        {/* Botón guardar 1ª Cita */}
        {!readOnly && !esActualizacion && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '4px', paddingBottom: '4px' }}>
            <button type="button" onClick={() => navigate(-1)} style={{
              padding: '12px 24px', borderRadius: '10px',
              border: '1px solid #E5E7EB', background: '#fff',
              fontSize: '14px', fontWeight: '600', color: '#6B7280', cursor: 'pointer',
            }}>
              Cancelar
            </button>
            <button type="button" onClick={handleGuardarPrimeraCita} disabled={guardando}
              style={{ ...CONSENT_BTN, background: guardando ? '#9CA3AF' : '#0A3D2E', boxShadow: guardando ? 'none' : '0 4px 18px rgba(10,61,46,0.35)' }}>
              {guardando ? <><Spinner /> Guardando...</> : '✦ Guardar Historia Clínica — 1ª Cita'}
            </button>
          </div>
        )}

        {/* ── 2ª CITA ─────────────────────────────────────────── */}
        <S00b_HeaderSegundaCita form={form} set={set as (k: keyof HCForm, v: string) => void} readOnly={readOnly} />

        <div style={SECTION_STYLE}>
          <S02b_Consulta2 form={form} set={set as (k: keyof HCForm, v: string) => void} readOnly={readOnly} />
        </div>
        <div style={SECTION_STYLE}>
          <S09b_ResultadosLab form={form} set={set} readOnly={readOnly} />
        </div>
        <div style={SECTION_STYLE}>
          <S10_PlanManejo form={form} set={set as (k: keyof HCForm, v: string | string[]) => void} leadId={leadId} />
        </div>
        <div style={SECTION_STYLE}>
          <S12_NotasMedico form={form} set={set as (k: keyof HCForm, v: string) => void} />
        </div>

        {/* Consentimientos 2ª Cita */}
        <div style={{ ...SECTION_STYLE, background: 'linear-gradient(135deg, #FFFDF0, #FFF8E7)', borderColor: '#D4AF37' }}>
          <S11b_Consentimiento2 form={form} set={set as (k: keyof HCForm, v: boolean) => void} />
        </div>

        {/* Botón guardar 2ª Cita — visible siempre en modo edición */}
        {!readOnly && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '4px', paddingBottom: '4px' }}>
            <button type="button" onClick={() => navigate(-1)} style={{
              padding: '12px 24px', borderRadius: '10px',
              border: '1px solid #E5E7EB', background: '#fff',
              fontSize: '14px', fontWeight: '600', color: '#6B7280', cursor: 'pointer',
            }}>
              Cancelar
            </button>
            <button type="button" onClick={handleGuardarSegundaCita} disabled={guardando}
              style={{ ...CONSENT_BTN, background: guardando ? '#9CA3AF' : '#D97706', boxShadow: guardando ? 'none' : '0 4px 18px rgba(217,119,6,0.35)' }}>
              {guardando ? <><Spinner /> Guardando...</> : '✦ Guardar Historia Clínica — 2ª Cita'}
            </button>
          </div>
        )}

        {/* ── Botones PDF / Kit ── */}
        {form.nombres && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', paddingTop: '8px', paddingBottom: '12px' }}>

            {/* Botón HC PDF */}
            <button
              type="button"
              onClick={async () => {
                await generarHistoriaClinicaPDF(form, {
                  leadId, hcId,
                  onSaved: () => toast.success(leadId ? 'PDF generado y guardado en Soportes.' : 'PDF generado correctamente.'),
                  onError: () => toast.warning('PDF generado. No se pudo guardar en Soportes — verifica el bucket "soportes" en Supabase.'),
                });
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '9px',
                background: '#fff', border: '1.5px solid #0A3D2E',
                borderRadius: '10px', padding: '11px 28px',
                fontSize: '13px', fontWeight: 700, color: '#0A3D2E',
                cursor: 'pointer', boxShadow: '0 2px 8px rgba(10,61,46,0.10)',
                transition: 'all 150ms',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#0A3D2E'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fff'; (e.currentTarget as HTMLButtonElement).style.color = '#0A3D2E'; }}
            >
              <FileDown size={16} />
              Generar PDF — Copia Historia Clínica
            </button>

            {/* Separador */}
            <div style={{ width: '100%', maxWidth: '420px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
              <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Kit del Paciente</span>
              <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
            </div>

            {/* Botón Kit del Paciente */}
            <button
              type="button"
              onClick={async () => {
                if (!form.pm_plan_base) {
                  toast.warning('Completa el Plan de Manejo (Punto 11) antes de generar el Kit.');
                  return;
                }
                await generarKitPaciente(form, {
                  leadId, hcId, leadEmail,
                  onSaved: () => toast.success('Kit generado y guardado en Soportes.', { description: leadEmail ? `Email enviado a ${leadEmail}` : 'Disponible en la pestaña Soportes del paciente.' }),
                  onError: () => toast.warning('Kit generado. No se pudo guardar en Soportes.'),
                  onEmailSent: () => toast.success('Kit enviado al paciente por email.'),
                });
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '9px',
                background: '#12C49A', border: 'none',
                borderRadius: '10px', padding: '13px 32px',
                fontSize: '14px', fontWeight: 700, color: '#fff',
                cursor: 'pointer', boxShadow: '0 4px 18px rgba(18,196,154,0.35)',
                transition: 'all 150ms',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#0A9278'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#12C49A'; }}
            >
              🩺 Generar Kit para el Paciente
            </button>

            {leadId && (
              <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                Ambos documentos se guardan en Soportes del paciente
              </span>
            )}
          </div>
        )}

      </div>

      <FirmaHC form={form} />
    </div>
  );
}
