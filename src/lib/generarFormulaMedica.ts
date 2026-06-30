import type { HistoriaClinicaForm } from '../types/historia-clinica';

export function getNextOrdenMedNum(): string {
  const year = new Date().getFullYear();
  const key  = `crm_om_seq_${year}`;
  const seq  = (parseInt(localStorage.getItem(key) ?? '0') + 1);
  localStorage.setItem(key, String(seq));
  return `OM-${year}-${String(seq).padStart(4, '0')}`;
}

function fechaColombia(date: Date): string {
  const meses = [
    'enero','febrero','marzo','abril','mayo','junio',
    'julio','agosto','septiembre','octubre','noviembre','diciembre',
  ];
  return `${date.getDate()} de ${meses[date.getMonth()]} de ${date.getFullYear()}`;
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

export function buildFormulaMedicaHTML(form: HistoriaClinicaForm, logoUrl: string, ordenNum?: string): string {
  const fecha         = fechaColombia(new Date());
  const programaCorto = getProgramaCorto(form.programa);
  const numControl    = ordenNum ?? '';

  // Construir filas de medicamentos
  const medicamentos: { nombre: string; dosis: string; frecuencia: string }[] = [];
  if (form.med_nombre.trim()) {
    medicamentos.push({ nombre: form.med_nombre.trim(), dosis: form.dosis?.trim() || '—', frecuencia: form.frecuencia?.trim() || '—' });
  }
  if (form.med_otro?.trim()) {
    medicamentos.push({ nombre: form.med_otro.trim(), dosis: '—', frecuencia: '—' });
  }

  const medRows = medicamentos.map((med, i) => `
    <div style="padding:16px 20px;background:${i % 2 === 0 ? '#F0FBF7' : '#fff'};
         ${i < medicamentos.length - 1 ? 'border-bottom:1.5px solid #D1FAE5;' : ''}">
      <div style="display:flex;align-items:flex-start;gap:14px;">
        <div style="width:32px;height:32px;border-radius:50%;background:#12C49A;
             display:flex;align-items:center;justify-content:center;flex-shrink:0;
             font-size:13px;font-weight:900;color:#fff;">${i + 1}</div>
        <div style="flex:1;">
          <div style="font-size:14px;font-weight:800;color:#0A3D2E;line-height:1.4;margin-bottom:8px;">${med.nombre}</div>
          <div style="display:flex;gap:24px;flex-wrap:wrap;">
            <div>
              <div style="font-size:9px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.1em;">Dosis</div>
              <div style="font-size:13px;font-weight:700;color:#111827;margin-top:2px;">${med.dosis}</div>
            </div>
            <div>
              <div style="font-size:9px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.1em;">Frecuencia</div>
              <div style="font-size:13px;font-weight:700;color:#111827;margin-top:2px;">${med.frecuencia}</div>
            </div>
          </div>
        </div>
        <div style="font-size:22px;font-weight:900;color:#D4AF37;flex-shrink:0;">℞</div>
      </div>
    </div>`).join('');

  const sinMedicamentos = medicamentos.length === 0 ? `
    <div style="padding:24px;text-align:center;color:#9CA3AF;font-size:13px;">
      No se especificaron medicamentos.
    </div>` : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Fórmula Médica — ${form.nombres} ${form.apellidos}</title>
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

  <!-- HEADER -->
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
      <img src="${logoUrl}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:2px solid rgba(212,175,55,0.6);box-shadow:0 0 0 3px rgba(255,255,255,0.15);" alt="Logo" />
    </div>
  </div>
  <div style="height:2px;background:#D4AF37;"></div>

  <!-- BANNER -->
  <div style="background:#E6FAF5;border-bottom:2px solid rgba(18,196,154,0.3);padding:13px 36px;display:flex;align-items:center;justify-content:space-between;">
    <div style="text-align:center;flex:1;">
      <div style="font-size:15px;font-weight:900;color:#0A3D2E;text-transform:uppercase;letter-spacing:1.5px;">
        F&oacute;rmula M&eacute;dica &mdash; Prescripci&oacute;n de Medicamentos
      </div>
      <div style="font-size:12px;font-weight:700;color:#0D7A5F;margin-top:3px;">
        ${programaCorto}
      </div>
    </div>
    ${numControl ? `<div style="background:#0A3D2E;border-radius:8px;padding:6px 14px;text-align:center;flex-shrink:0;">
      <div style="font-size:8px;font-weight:700;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.1em;">No. Control</div>
      <div style="font-size:13px;font-weight:900;color:#D4AF37;letter-spacing:0.5px;">${numControl}</div>
    </div>` : ''}
  </div>

  <!-- CUERPO -->
  <div style="padding:22px 36px;">

    <!-- DATOS DEL PACIENTE -->
    <div style="border:1px solid #E5E7EB;border-radius:10px;overflow:hidden;margin-bottom:20px;background:#F9FAFB;">
      <div style="padding:7px 16px;border-bottom:1px solid #E5E7EB;display:flex;align-items:center;gap:10px;">
        <span style="font-size:9px;font-weight:800;color:#6B7280;text-transform:uppercase;letter-spacing:0.1em;white-space:nowrap;">Datos del Paciente</span>
        <div style="flex:1;height:1.5px;background:linear-gradient(90deg,#D4AF37,transparent);"></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1px 1fr;">
        <div style="padding:14px 18px;display:flex;flex-direction:column;gap:11px;">
          <div><div class="fl">Paciente</div><div class="fv">${form.nombres} ${form.apellidos}</div></div>
          <div><div class="fl">Documento de identidad</div><div class="fv">${form.tipo_doc || 'CC'}&nbsp;${form.cc || '&mdash;'}</div></div>
          <div><div class="fl">Edad</div><div class="fv">${form.edad ? form.edad + ' a&ntilde;os' : '&mdash;'}</div></div>
        </div>
        <div style="background:#E5E7EB;margin:8px 0;"></div>
        <div style="padding:14px 18px;display:flex;flex-direction:column;gap:11px;">
          <div><div class="fl">Fecha de prescripci&oacute;n</div><div class="fvt">${fecha}</div></div>
          <div><div class="fl">Ciudad</div><div class="fv">${form.ciudad || 'Barranquilla'}</div></div>
          <div><div class="fl">Programa cl&iacute;nico</div><div class="fvt">${programaCorto}</div></div>
        </div>
      </div>
    </div>

    <!-- PRESCRIPCIÓN -->
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
      <span style="font-size:9.5px;font-weight:800;color:#0A3D2E;text-transform:uppercase;letter-spacing:0.1em;white-space:nowrap;">
        Prescripci&oacute;n &mdash; ${medicamentos.length}&nbsp;medicamento${medicamentos.length !== 1 ? 's' : ''}
      </span>
      <div style="flex:1;height:1.5px;background:linear-gradient(90deg,#D4AF37,transparent);"></div>
    </div>
    <div style="border:1.5px solid #D1FAE5;border-radius:10px;overflow:hidden;margin-bottom:20px;">
      ${medRows}${sinMedicamentos}
    </div>

    <!-- INSTRUCCIONES -->
    <div style="display:flex;border:1px solid #D4AF37;border-radius:8px;overflow:hidden;margin-bottom:32px;">
      <div style="width:4px;background:#12C49A;flex-shrink:0;"></div>
      <div style="flex:1;background:#FFF8E7;padding:13px 16px;">
        <div style="font-size:9.5px;font-weight:800;color:#92400E;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">
          Instrucciones Generales
        </div>
        <div style="display:flex;flex-direction:column;gap:5px;">
          ${[
            'Tomar el medicamento según la pauta indicada. No modificar dosis sin consultar.',
            'Conservar en lugar fresco y seco, alejado de la luz solar directa.',
            'Consultar ante cualquier efecto adverso o reacción inesperada.',
            'Esta fórmula médica es válida por <strong>30 días</strong> a partir de la fecha de emisión.',
            'Presentar esta prescripción original en la farmacia o droguería de su elección.',
          ].map(item => `
          <div style="display:flex;align-items:flex-start;gap:8px;font-size:12px;color:#374151;line-height:1.55;">
            <span style="color:#12C49A;font-size:7px;margin-top:4px;flex-shrink:0;">&#9679;</span>
            <span>${item}</span>
          </div>`).join('')}
        </div>
      </div>
    </div>

    <!-- FIRMA -->
    <div style="text-align:center;">
      <div style="display:inline-block;min-width:240px;">
        <div style="border-top:1.5px solid #0A3D2E;padding-top:9px;margin-top:52px;">
          <div style="font-size:13px;font-weight:800;color:#0A3D2E;">Dra. Eusimary Contreras Morales</div>
          <div style="font-size:10.5px;color:#6B7280;margin-top:3px;line-height:1.65;">
            M&eacute;dica Cirujana &nbsp;&middot;&nbsp; R.M. 13-8793-05<br>
            Medicina Metab&oacute;lica &amp; Longevidad
          </div>
        </div>
      </div>
    </div>

  </div>

  <!-- FOOTER -->
  <div>
    <div style="height:2px;background:#D4AF37;"></div>
    <div style="height:3px;background:#12C49A;"></div>
    <div style="background:#0A3D2E;padding:11px 36px;text-align:center;">
      <div style="font-size:10px;font-weight:600;color:rgba(255,255,255,0.8);margin-bottom:3px;">
        draeusimary.netlify.app &nbsp;&middot;&nbsp; asistente.draeusi@gmail.com &nbsp;&middot;&nbsp; WhatsApp +57 301 625 4865
      </div>
      <div style="font-size:8.5px;color:rgba(255,255,255,0.45);letter-spacing:0.06em;text-transform:uppercase;">
        V&aacute;lida 30 d&iacute;as &nbsp;&middot;&nbsp; Documento M&eacute;dico Confidencial &nbsp;&middot;&nbsp; Res. 1995/1999 MINSALUD
        ${numControl ? `&nbsp;&middot;&nbsp; Ref: ${numControl}` : ''}
      </div>
    </div>
  </div>

  <script>window.onload = function(){ window.print(); }</script>
</body>
</html>`;
}

export function generarFormulaMedica(form: HistoriaClinicaForm, logoUrl?: string, ordenNum?: string): void {
  const logo = logoUrl ?? `${window.location.origin}/logo-dra-eusimary.jpg`;
  const html  = buildFormulaMedicaHTML(form, logo, ordenNum);
  const win   = window.open('', '_blank', 'width=880,height=960');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
