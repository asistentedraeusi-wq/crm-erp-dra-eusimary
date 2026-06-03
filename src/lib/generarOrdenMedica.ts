import type { HistoriaClinicaForm } from '../types/historia-clinica';
import { EXAMENES_PARACLÍNICOS } from '../constants/historia-clinica';

export function generarOrdenMedica(form: HistoriaClinicaForm): void {
  const exams = form.examenes
    .map(id => EXAMENES_PARACLÍNICOS.find(e => e.id === id)?.label)
    .filter((l): l is string => Boolean(l));

  const fecha = new Date().toLocaleDateString('es-CO', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Orden Médica — ${form.nombres} ${form.apellidos}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; background: #fff; color: #1a1a1a; font-size: 13px; }

    .header {
      background: linear-gradient(135deg, #0A3D2E 0%, #0D7A5F 100%);
      color: #fff;
      padding: 22px 36px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .dra-name { font-size: 19px; font-weight: 800; letter-spacing: -0.4px; }
    .dra-title { font-size: 11px; opacity: 0.8; margin-top: 3px; }
    .dra-contact { font-size: 11px; opacity: 0.65; margin-top: 6px; line-height: 1.7; }
    .emblem {
      width: 52px; height: 52px;
      border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.35);
      display: flex; align-items: center; justify-content: center;
      font-size: 26px; opacity: 0.9;
    }

    .band-red {
      background: #DC2626;
      color: #fff;
      text-align: center;
      padding: 5px 36px;
      font-size: 8.5px;
      font-weight: 700;
      letter-spacing: 0.09em;
      text-transform: uppercase;
    }

    .doc-title-bar {
      background: #F0FDF9;
      border-bottom: 3px solid #12C49A;
      padding: 14px 36px;
      text-align: center;
    }
    .doc-title-bar h1 {
      font-size: 17px; font-weight: 900;
      color: #0A3D2E; text-transform: uppercase; letter-spacing: 1.5px;
    }
    .doc-title-bar p { font-size: 11px; color: #6B7280; margin-top: 3px; }

    .body { padding: 26px 36px; }

    .patient-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      background: #E6FAF5;
      border: 1px solid rgba(18,196,154,0.25);
      border-radius: 10px;
      padding: 14px 18px;
      margin-bottom: 22px;
    }
    .pfield-label { font-size: 8.5px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.07em; }
    .pfield-value { font-size: 13px; font-weight: 700; color: #0A3D2E; margin-top: 2px; }

    .sec-label {
      font-size: 10px; font-weight: 800; color: #0A3D2E;
      text-transform: uppercase; letter-spacing: 0.08em;
      padding-bottom: 7px;
      border-bottom: 2px solid #12C49A;
      margin-bottom: 12px;
    }

    .exam-list { list-style: none; display: flex; flex-direction: column; gap: 5px; }
    .exam-item {
      display: flex; align-items: center; gap: 12px;
      padding: 9px 14px;
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      font-size: 12.5px; color: #111827;
    }
    .exam-num {
      min-width: 22px; height: 22px;
      background: #12C49A; color: #fff;
      border-radius: 50%; font-size: 10px; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }

    .extra-box {
      margin-top: 10px;
      padding: 10px 14px;
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      font-size: 12px; color: #374151; line-height: 1.6;
    }
    .extra-box strong { display: block; font-size: 9px; text-transform: uppercase; color: #9CA3AF; letter-spacing: 0.06em; margin-bottom: 3px; }

    .alert-box {
      margin-top: 16px;
      background: #FFFBEB;
      border: 1px solid rgba(245,158,11,0.35);
      border-radius: 8px;
      padding: 12px 16px;
    }
    .alert-title { font-size: 9px; font-weight: 800; color: #92400E; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 5px; }
    .alert-text { font-size: 12px; color: #374151; line-height: 1.65; }

    .sig-area {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 48px; margin-top: 52px;
    }
    .sig-col { text-align: center; }
    .sig-line { border-top: 1.5px solid #374151; padding-top: 8px; margin-top: 52px; }
    .sig-name { font-size: 12.5px; font-weight: 700; color: #111827; }
    .sig-sub { font-size: 10px; color: #6B7280; margin-top: 2px; line-height: 1.5; }

    .footer {
      background: #0A3D2E;
      color: rgba(255,255,255,0.55);
      text-align: center;
      padding: 11px 36px;
      font-size: 8.5px;
      letter-spacing: 0.05em;
      margin-top: 48px;
    }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      @page { margin: 0; }
    }
  </style>
</head>
<body>

  <div class="header">
    <div>
      <div class="dra-name">Dra. Eusimary Contreras Morales</div>
      <div class="dra-title">Médica Cirujana &nbsp;|&nbsp; Esp. Gerencia de la Calidad y Salud</div>
      <div class="dra-contact">
        R.M. 13-8793-05 &nbsp;&middot;&nbsp; +57 301 625 4865<br>
        draeusimary.netlify.app &nbsp;&middot;&nbsp; Barranquilla, Colombia
      </div>
    </div>
    <div class="emblem">⚕</div>
  </div>

  <div class="band-red">
    Documento Médico Confidencial &nbsp;&middot;&nbsp; Res. 1995/1999 MINSALUD &nbsp;&middot;&nbsp; Ley 1581/2012 &nbsp;&middot;&nbsp; Decreto 780/2016
  </div>

  <div class="doc-title-bar">
    <h1>Orden de Exámenes Paraclínicos</h1>
    <p>Medicina Metabólica &amp; Longevidad &nbsp;&middot;&nbsp; ${fecha}</p>
  </div>

  <div class="body">

    <div class="patient-grid">
      <div>
        <div class="pfield-label">Paciente</div>
        <div class="pfield-value">${form.nombres} ${form.apellidos}</div>
      </div>
      <div>
        <div class="pfield-label">Documento</div>
        <div class="pfield-value">${form.tipo_doc || 'CC'} ${form.cc || '—'}</div>
      </div>
      <div>
        <div class="pfield-label">Fecha de Orden</div>
        <div class="pfield-value">${fecha}</div>
      </div>
      ${form.edad ? `<div><div class="pfield-label">Edad</div><div class="pfield-value">${form.edad} años</div></div>` : ''}
      ${form.programa ? `<div><div class="pfield-label">Programa</div><div class="pfield-value">${form.programa}</div></div>` : ''}
      ${form.dx1 ? `<div><div class="pfield-label">Diagnóstico</div><div class="pfield-value">${form.cie1 ? `${form.cie1} &mdash; ` : ''}${form.dx1}</div></div>` : ''}
    </div>

    <div class="sec-label">Exámenes Solicitados — ${exams.length} estudio${exams.length !== 1 ? 's' : ''}</div>
    <ul class="exam-list">
      ${exams.map((exam, i) => `
        <li class="exam-item">
          <div class="exam-num">${i + 1}</div>
          <span>${exam}</span>
        </li>
      `).join('')}
    </ul>

    ${form.exam_otro ? `
    <div class="extra-box">
      <strong>Otros exámenes</strong>
      ${form.exam_otro}
    </div>` : ''}

    ${form.instr_lab ? `
    <div class="alert-box">
      <div class="alert-title">⚠&nbsp; Instrucciones para el Laboratorio</div>
      <div class="alert-text">${form.instr_lab}</div>
    </div>` : ''}

    <div class="sig-area">
      <div class="sig-col">
        <div class="sig-line">
          <div class="sig-name">Dra. Eusimary Contreras Morales</div>
          <div class="sig-sub">Médica Cirujana · R.M. 13-8793-05<br>Medicina Metabólica &amp; Longevidad</div>
        </div>
      </div>
      <div class="sig-col">
        <div class="sig-line">
          <div class="sig-name">${form.nombres} ${form.apellidos}</div>
          <div class="sig-sub">${form.tipo_doc || 'CC'} ${form.cc || ''}<br>Paciente</div>
        </div>
      </div>
    </div>

  </div>

  <div class="footer">
    Orden Médica Válida por 30 Días &nbsp;&middot;&nbsp; Medicina Metabólica &amp; Longevidad &nbsp;&middot;&nbsp; +57 301 625 4865 &nbsp;&middot;&nbsp; draeusimary.netlify.app
  </div>

  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=860,height=950');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
