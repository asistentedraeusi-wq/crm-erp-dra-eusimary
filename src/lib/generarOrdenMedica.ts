import type { HistoriaClinicaForm } from '../types/historia-clinica';
import { EXAMENES_PARACLÍNICOS } from '../constants/historia-clinica';

// Badge color per exam — spec: hemograma=#10B981, HbA1c=#F59E0B, resto=#12C49A
function getBadgeColor(id: string): string {
  if (id === 'hemograma') return '#10B981';
  if (id === 'hba1c')     return '#F59E0B';
  return '#12C49A';
}

function fechaColombia(date: Date): string {
  const meses = [
    'enero','febrero','marzo','abril','mayo','junio',
    'julio','agosto','septiembre','octubre','noviembre','diciembre',
  ];
  return `${date.getDate()} de ${meses[date.getMonth()]} de ${date.getFullYear()}`;
}

function getProgramaBanner(val: string): string {
  const m: Record<string, string> = {
    control_metabolico: 'Programa Control Metabólico Premium',
    bienestar_integral:  'Programa Bienestar Integral',
    consulta_filtro:     'Consulta Filtro / Primera Evaluación',
    pendiente:           'Medicina Metabólica & Longevidad',
  };
  return m[val] || val || 'Medicina Metabólica & Longevidad';
}

function getProgramaCorto(val: string): string {
  const m: Record<string, string> = {
    control_metabolico: 'Control Metabólico Premium',
    bienestar_integral:  'Bienestar Integral',
    consulta_filtro:     'Consulta Filtro',
    pendiente:           'Por definir',
  };
  return m[val] || val || '—';
}

// Construye el HTML de la Orden Médica. logoUrl permite usar una URL pública para email.
export function buildOrdenMedicaHTML(form: HistoriaClinicaForm, logoUrl: string): string {
  type ExamItem = { id: string; label: string };
  const exams: ExamItem[] = form.examenes
    .map(id => EXAMENES_PARACLÍNICOS.find(e => e.id === id))
    .filter((e): e is ExamItem => Boolean(e));

  const fecha          = fechaColombia(new Date());
  const programaBanner = getProgramaBanner(form.programa);
  const programaCorto  = getProgramaCorto(form.programa);

  const instrDefault = [
    'Muestras en ayuno mínimo <strong>12 horas</strong> antes de la toma.',
    'No suspender medicamentos habituales, salvo indicación médica expresa.',
    'Presentar esta orden original en el laboratorio de su elección.',
    'Orden válida por <strong>30 días</strong> a partir de la fecha de emisión.',
  ];
  const instrItems = form.instr_lab
    ? [...instrDefault, form.instr_lab]
    : instrDefault;

  const examRows = exams.map((exam, i) => `
    <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;
         background:${i % 2 === 0 ? '#E6FAF5' : '#fff'};
         ${i < exams.length - 1 ? 'border-bottom:1px solid #E5E7EB;' : ''}">
      <div style="width:26px;height:26px;border-radius:50%;background:${getBadgeColor(exam.id)};
           display:flex;align-items:center;justify-content:center;flex-shrink:0;
           font-size:10px;font-weight:800;color:#fff;">${i + 1}</div>
      <div style="flex:1;font-size:13px;font-weight:700;color:#111827;">${exam.label}</div>
      <div style="color:#12C49A;font-size:15px;font-weight:900;flex-shrink:0;">&#10003;</div>
    </div>`).join('');

  const instrRows = instrItems.map(item => `
    <div style="display:flex;align-items:flex-start;gap:8px;font-size:12px;color:#374151;line-height:1.55;">
      <span style="color:#12C49A;font-size:7px;margin-top:4px;flex-shrink:0;">&#9679;</span>
      <span>${item}</span>
    </div>`).join('');

  const extraExamenes = form.exam_otro ? `
    <div style="padding:10px 14px;background:#F9FAFB;border:1px solid #E5E7EB;
         border-radius:8px;margin-bottom:16px;">
      <div style="font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;
           letter-spacing:0.06em;margin-bottom:4px;">Otros exámenes solicitados</div>
      <div style="font-size:12px;color:#374151;line-height:1.6;">${form.exam_otro}</div>
    </div>` : '';

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Orden M&eacute;dica &mdash; ${form.nombres} ${form.apellidos}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:Arial,Helvetica,sans-serif;background:#fff;color:#1a1a1a;}
    .fl{font-size:9px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.1em;}
    .fv{font-size:13px;font-weight:700;color:#111827;margin-top:2px;}
    .fvt{font-size:13px;font-weight:700;color:#0A3D2E;margin-top:2px;}
    @media print{
      body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
      @page{margin:0;size:A4 portrait;}
    }
  </style>
</head>
<body>

  <!-- ══ HEADER ══════════════════════════════════════════════ -->
  <div style="display:flex;background:#0A3D2E;">
    <div style="width:4px;background:#12C49A;flex-shrink:0;"></div>
    <div style="flex:1;padding:22px 36px;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="font-size:18px;font-weight:800;color:#fff;letter-spacing:-0.3px;">
          Dra. Eusimary Contreras Morales
        </div>
        <div style="font-size:11px;color:rgba(255,255,255,0.75);margin-top:3px;">
          M&eacute;dica Cirujana &nbsp;&middot;&nbsp; Esp. Gerencia de la Calidad y Salud
        </div>
        <div style="font-size:10.5px;color:rgba(255,255,255,0.6);margin-top:7px;line-height:1.8;">
          R.M. 13-8793-05 &nbsp;&middot;&nbsp; +57 301 625 4865<br>
          draeusimary.netlify.app &nbsp;&middot;&nbsp; Barranquilla, Colombia
        </div>
      </div>
      <!-- Logo Dra. Eusimary -->
      <img src="${logoUrl}"
           style="width:80px;height:80px;border-radius:50%;object-fit:cover;
                  border:2px solid rgba(212,175,55,0.6);
                  box-shadow:0 0 0 3px rgba(255,255,255,0.15);"
           alt="Logo Dra. Eusimary Contreras" />
    </div>
  </div>
  <!-- L&iacute;nea dorada decorativa -->
  <div style="height:2px;background:#D4AF37;"></div>

  <!-- ══ BANNER ═════════════════════════════════════════════ -->
  <div style="background:#E6FAF5;border-bottom:2px solid rgba(18,196,154,0.3);
       padding:13px 36px;text-align:center;">
    <div style="font-size:15px;font-weight:900;color:#0A3D2E;
         text-transform:uppercase;letter-spacing:1.5px;">
      Orden M&eacute;dica de Laboratorio Cl&iacute;nico
    </div>
    <div style="font-size:12px;font-weight:700;color:#0D7A5F;margin-top:3px;">
      ${programaBanner}
    </div>
  </div>

  <!-- ══ CUERPO ══════════════════════════════════════════════ -->
  <div style="padding:22px 36px;">

    <!-- DATOS DEL PACIENTE -->
    <div style="border:1px solid #E5E7EB;border-radius:10px;overflow:hidden;
         margin-bottom:20px;background:#F9FAFB;">
      <!-- Etiqueta + l&iacute;nea dorada -->
      <div style="padding:7px 16px;border-bottom:1px solid #E5E7EB;
           display:flex;align-items:center;gap:10px;">
        <span style="font-size:9px;font-weight:800;color:#6B7280;
              text-transform:uppercase;letter-spacing:0.1em;white-space:nowrap;">
          Datos del Paciente
        </span>
        <div style="flex:1;height:1.5px;
             background:linear-gradient(90deg,#D4AF37,transparent);"></div>
      </div>
      <!-- Dos columnas -->
      <div style="display:grid;grid-template-columns:1fr 1px 1fr;">
        <div style="padding:14px 18px;display:flex;flex-direction:column;gap:11px;">
          <div>
            <div class="fl">Paciente</div>
            <div class="fv">${form.nombres} ${form.apellidos}</div>
          </div>
          <div>
            <div class="fl">Documento de identidad</div>
            <div class="fv">${form.tipo_doc || 'CC'}&nbsp;${form.cc || '&mdash;'}</div>
          </div>
          <div>
            <div class="fl">Edad</div>
            <div class="fv">${form.edad ? form.edad + ' a&ntilde;os' : '&mdash;'}</div>
          </div>
        </div>
        <!-- Divisor vertical -->
        <div style="background:#E5E7EB;margin:8px 0;"></div>
        <div style="padding:14px 18px;display:flex;flex-direction:column;gap:11px;">
          <div>
            <div class="fl">Fecha de la orden</div>
            <div class="fvt">${fecha}</div>
          </div>
          <div>
            <div class="fl">Ciudad</div>
            <div class="fv">${form.ciudad || 'Barranquilla'}</div>
          </div>
          <div>
            <div class="fl">Programa cl&iacute;nico</div>
            <div class="fvt">${programaCorto}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- EXÁMENES SOLICITADOS -->
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
      <span style="font-size:9.5px;font-weight:800;color:#0A3D2E;
            text-transform:uppercase;letter-spacing:0.1em;white-space:nowrap;">
        Ex&aacute;menes Solicitados &mdash; ${exams.length}&nbsp;estudio${exams.length !== 1 ? 's' : ''}
      </span>
      <div style="flex:1;height:1.5px;
           background:linear-gradient(90deg,#D4AF37,transparent);"></div>
    </div>
    <div style="border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;
         margin-bottom:${form.exam_otro ? '10px' : '18px'};">
      ${examRows}
    </div>

    ${extraExamenes}

    <!-- INSTRUCCIONES -->
    <div style="display:flex;border:1px solid #D4AF37;border-radius:8px;
         overflow:hidden;margin-bottom:32px;">
      <div style="width:4px;background:#12C49A;flex-shrink:0;"></div>
      <div style="flex:1;background:#FFF8E7;padding:13px 16px;">
        <div style="font-size:9.5px;font-weight:800;color:#92400E;
             text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">
          Instrucciones para el Paciente
        </div>
        <div style="display:flex;flex-direction:column;gap:5px;">
          ${instrRows}
        </div>
      </div>
    </div>

    <!-- FIRMA -->
    <div style="text-align:center;">
      <div style="display:inline-block;min-width:240px;">
        <div style="border-top:1.5px solid #0A3D2E;padding-top:9px;margin-top:52px;">
          <div style="font-size:13px;font-weight:800;color:#0A3D2E;">
            Dra. Eusimary Contreras Morales
          </div>
          <div style="font-size:10.5px;color:#6B7280;margin-top:3px;line-height:1.65;">
            M&eacute;dica Cirujana &nbsp;&middot;&nbsp; R.M. 13-8793-05<br>
            Medicina Metab&oacute;lica &amp; Longevidad
          </div>
        </div>
      </div>
    </div>

  </div><!-- /body -->

  <!-- ══ FOOTER ═════════════════════════════════════════════ -->
  <div>
    <div style="height:2px;background:#D4AF37;"></div>
    <div style="height:3px;background:#12C49A;"></div>
    <div style="background:#0A3D2E;padding:11px 36px;text-align:center;">
      <div style="font-size:10px;font-weight:600;color:rgba(255,255,255,0.8);margin-bottom:3px;">
        draeusimary.netlify.app &nbsp;&middot;&nbsp; asistente.draeusi@gmail.com &nbsp;&middot;&nbsp; WhatsApp +57 301 625 4865
      </div>
      <div style="font-size:8.5px;color:rgba(255,255,255,0.45);
           letter-spacing:0.06em;text-transform:uppercase;">
        V&aacute;lida 30 d&iacute;as &nbsp;&middot;&nbsp; Documento M&eacute;dico Confidencial &nbsp;&middot;&nbsp; Res. 1995/1999 MINSALUD
      </div>
    </div>
  </div>

  <script>window.onload = function(){ window.print(); }</script>
</body>
</html>`;

  return html;
}

export function generarOrdenMedica(form: HistoriaClinicaForm): void {
  const logoUrl = `${window.location.origin}/logo-dra-eusimary.jpg`;
  const html    = buildOrdenMedicaHTML(form, logoUrl);
  const win     = window.open('', '_blank', 'width=880,height=960');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
