import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import type { HistoriaClinicaForm } from '../../../types/historia-clinica';
import { EXAMENES_PARACLÍNICOS } from '../../../constants/historia-clinica';
import { useLeads } from '../../../context/LeadsContext';
import { supabase } from '../../../lib/supabase';
import { generarOrdenMedica, buildOrdenMedicaHTML } from '../../../lib/generarOrdenMedica';
import { subirSoporteHTML } from '../../../lib/soportes';
import { htmlToPdfBase64 } from '../../../lib/htmlToPdf';
import SectionHeader from '../ui/SectionHeader';
import FormField from '../ui/FormField';

const TEXTAREA: React.CSSProperties = {
  borderRadius: '8px', border: '1px solid #E5E7EB', padding: '10px 12px',
  fontSize: '13px', color: '#111827', background: '#fff',
  width: '100%', boxSizing: 'border-box', outline: 'none',
  resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.5',
};

interface Props {
  form: HistoriaClinicaForm;
  set: (k: keyof HistoriaClinicaForm, v: string | string[]) => void;
  leadId?: string;
}

export default function S09_Paraclínicos({ form, set, leadId }: Props) {
  const { leads, moveStage } = useLeads();

  function toggleExam(id: string) {
    set('examenes',
      form.examenes.includes(id)
        ? form.examenes.filter(e => e !== id)
        : [...form.examenes, id]
    );
  }

  async function handleGenerarOrden() {
    generarOrdenMedica(form);

    if (!leadId) return;

    moveStage(leadId, 'paraclínicos');

    const lead        = leads.find(l => l.id === leadId);
    const nombre      = [form.nombres, form.apellidos].filter(Boolean).join(' ') || lead?.name || '';
    const logoUrl     = 'https://draeusimary.netlify.app/logo-dra-eusimary.jpg';
    const htmlContent = buildOrdenMedicaHTML(form, logoUrl)
      .replace('<script>window.onload = function(){ window.print(); }</script>', '');

    // ── 1. Guardar en Soportes ──────────────────────────────────────────────
    const saved = await subirSoporteHTML(
      leadId,
      `Orden Médica — ${nombre || 'Paciente'}`,
      'orden_medica',
      htmlContent,
    );
    if (saved) {
      toast.success('✓ Orden Médica guardada en Soportes');
    } else {
      toast.warning('Orden generada pero no se guardó en Soportes — verifica el bucket "soportes" en Supabase Storage.');
    }

    // ── 2. Generar PDF para adjuntar al email ──────────────────────────────
    if (!supabase) return;

    const emailPaciente = lead?.email;
    if (!emailPaciente || emailPaciente === 'nuevo@email.com') {
      toast.warning('Sin email válido en el perfil del paciente — no se envió la orden por correo.');
      return;
    }

    toast.success('Generando PDF para enviar al paciente...');
    const pdfBase64 = await htmlToPdfBase64(htmlContent);

    // ── 3. Enviar email con PDF adjunto ────────────────────────────────────
    try {
      const { error } = await supabase.functions.invoke('notify-orden-medica', {
        body: { email: emailPaciente, nombre, htmlContent, pdfBase64 },
      });
      if (error) {
        toast.warning(`Email no enviado: ${error.message ?? 'error desconocido'}`);
      } else {
        toast.success(`✓ Orden Médica enviada a ${emailPaciente} con PDF adjunto`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.warning(`Email no enviado: ${msg}`);
      console.warn('notify-orden-medica:', err);
    }
  }

  const tieneExamenes = form.examenes.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <SectionHeader number={9} title="Paraclínicos Solicitados" />

      <p style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
        Seleccionar examenes a solicitar
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
        {EXAMENES_PARACLÍNICOS.map(exam => {
          const active = form.examenes.includes(exam.id);
          return (
            <button
              key={exam.id}
              type="button"
              onClick={() => toggleExam(exam.id)}
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
              {exam.label}
            </button>
          );
        })}
      </div>

      {tieneExamenes && (
        <div style={{
          background: '#E6FAF5', border: '1px solid rgba(18,196,154,0.3)',
          borderRadius: '10px', padding: '12px 14px',
        }}>
          <p style={{ fontSize: '11px', fontWeight: '700', color: '#0A3D2E', margin: '0 0 4px' }}>
            {form.examenes.length} examen(es) seleccionado(s)
          </p>
          <p style={{ fontSize: '12px', color: '#374151', margin: 0, lineHeight: '1.6' }}>
            {form.examenes.map(id => EXAMENES_PARACLÍNICOS.find(e => e.id === id)?.label).join(' — ')}
          </p>
        </div>
      )}

      <FormField label="Otros examenes no listados">
        <textarea style={TEXTAREA} rows={2} value={form.exam_otro}
          onChange={e => set('exam_otro', e.target.value)}
          placeholder="Especificar examenes adicionales no listados arriba..." />
      </FormField>

      <FormField label="Instrucciones especiales para laboratorio">
        <textarea style={TEXTAREA} rows={2} value={form.instr_lab}
          onChange={e => set('instr_lab', e.target.value)}
          placeholder="Ej: Muestras en ayuno 12h, no suspender medicamentos, etc." />
      </FormField>

      {/* Botón Generar Orden Médica */}
      <div style={{
        marginTop: '8px',
        padding: '16px 18px',
        background: tieneExamenes ? 'linear-gradient(135deg, #E6FAF5, #F0FDF9)' : '#F9FAFB',
        border: tieneExamenes ? '1.5px solid rgba(18,196,154,0.4)' : '1.5px solid #E5E7EB',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        transition: 'all 200ms',
      }}>
        <div>
          <p style={{ fontSize: '13px', fontWeight: '700', color: tieneExamenes ? '#0A3D2E' : '#9CA3AF', margin: 0 }}>
            Generar Orden de Laboratorios / Paraclínicos
          </p>
          <p style={{ fontSize: '11px', color: tieneExamenes ? '#374151' : '#D1D5DB', margin: '2px 0 0' }}>
            {tieneExamenes
              ? `${form.examenes.length} examen(es) · PDF + email automático al paciente`
              : 'Selecciona al menos un examen para generar la orden'}
          </p>
        </div>
        <button
          type="button"
          disabled={!tieneExamenes}
          onClick={handleGenerarOrden}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            padding: '10px 20px',
            borderRadius: '10px',
            border: 'none',
            background: tieneExamenes ? '#0A3D2E' : '#E5E7EB',
            color: tieneExamenes ? '#fff' : '#9CA3AF',
            fontSize: '13px',
            fontWeight: '700',
            cursor: tieneExamenes ? 'pointer' : 'not-allowed',
            boxShadow: tieneExamenes ? '0 4px 14px rgba(10,61,46,0.3)' : 'none',
            transition: 'all 150ms',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          <FileText size={15} />
          Generar Orden Lab.
        </button>
      </div>
    </div>
  );
}
