import type { HistoriaClinicaForm } from '../types/historia-clinica';
import { EXAMENES_PARACLÍNICOS, PROGRAMAS } from '../constants/historia-clinica';
import { subirSoporteHTML } from './soportes';

function fecha(str: string): string {
  if (!str) return '—';
  const [y, m, d] = str.split('-');
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return `${parseInt(d)} de ${meses[parseInt(m) - 1]} de ${y}`;
}

function val(v: string | undefined | null, fallback = '—'): string {
  return v?.trim() || fallback;
}

function programaLabel(v: string): string {
  return PROGRAMAS.find(p => p.value === v)?.label ?? v ?? '—';
}

function examLabel(id: string): string {
  return (EXAMENES_PARACLÍNICOS as readonly { id: string; label: string }[]).find(e => e.id === id)?.label ?? id;
}

function consentBadge(ok: boolean): string {
  return ok
    ? `<span style="display:inline-flex;align-items:center;gap:5px;background:#E6FAF5;border:1px solid #12C49A;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;color:#0A3D2E;">✓ Firmado</span>`
    : `<span style="display:inline-flex;align-items:center;gap:5px;background:#FEF2F2;border:1px solid #FCA5A5;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;color:#DC2626;">○ Pendiente</span>`;
}

function sectionTitle(n: number | string, title: string, color = '#0A3D2E'): string {
  return `
    <div style="display:flex;align-items:center;gap:10px;margin:20px 0 10px;">
      <div style="width:24px;height:24px;border-radius:6px;background:${color};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#fff;flex-shrink:0;">${n}</div>
      <span style="font-size:12px;font-weight:800;color:${color};text-transform:uppercase;letter-spacing:0.08em;">${title}</span>
      <div style="flex:1;height:1px;background:${color}22;"></div>
    </div>`;
}

function row2(label1: string, val1: string, label2: string, val2: string): string {
  return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:8px;">
      <div><span style="font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">${label1}</span><br/><span style="font-size:13px;color:#111827;">${val1}</span></div>
      <div><span style="font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">${label2}</span><br/><span style="font-size:13px;color:#111827;">${val2}</span></div>
    </div>`;
}

function row3(l1: string, v1: string, l2: string, v2: string, l3: string, v3: string): string {
  return `
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:8px;">
      <div><span style="font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">${l1}</span><br/><span style="font-size:13px;color:#111827;">${v1}</span></div>
      <div><span style="font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">${l2}</span><br/><span style="font-size:13px;color:#111827;">${v2}</span></div>
      <div><span style="font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">${l3}</span><br/><span style="font-size:13px;color:#111827;">${v3}</span></div>
    </div>`;
}

function block(label: string, content: string): string {
  if (!content || content === '—') return '';
  return `<div style="margin-bottom:10px;"><span style="font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">${label}</span><div style="font-size:13px;color:#111827;margin-top:3px;line-height:1.6;">${content}</div></div>`;
}

function tagList(items: string[]): string {
  if (!items.length) return '<span style="font-size:13px;color:#9CA3AF;">Ninguno registrado</span>';
  return items.map(i => `<span style="display:inline-block;background:#F3F4F6;border:1px solid #E5E7EB;border-radius:6px;padding:3px 9px;font-size:11px;color:#374151;margin:2px;">${i}</span>`).join('');
}

export function buildHistoriaClinicaHTML(form: HistoriaClinicaForm): string {
  const logoUrl = `${window.location.origin}/logo-dra-eusimary.jpg`;
  const tiene2daCita = Boolean(form.fecha_2cita);
  const nombreCompleto = `${val(form.nombres)} ${val(form.apellidos)}`;

  // ── Examen físico ────────────────────────────────────────────
  const esPres = form.modalidad !== 'telemedicina';
  const examFisico = esPres
    ? row3('Peso',''+val(form.peso),'Talla',''+val(form.talla),'IMC',''+val(form.imc))
      + row3('P. Abdominal',''+val(form.peri_abd),'Presión Art.',''+val(form.pa),'Frec. Card.',''+val(form.fc))
      + row3('Temperatura',''+val(form.temp),'SatO₂',''+val(form.sato2),'% Grasa',''+val(form.grasa))
      + (form.ef_obs ? block('Observaciones',''+val(form.ef_obs)) : '')
    : row3('Talla (ref)',''+val(form.th),'Peso (ref)',''+val(form.tw),'Abdomen (ref)',''+val(form.ta))
      + row3('Cuello (ref)',''+val(form.tn),'Cintura (ref)',''+val(form.tc),'Cadera (ref)',''+val(form.thip));

  // ── Resultados lab ───────────────────────────────────────────
  const resFilas = form.examenes.map(id => {
    const r = form.res_valores?.[id];
    const estado = r?.estado || '';
    const color = estado === 'normal' ? '#10B981' : estado === 'anormal' ? '#F59E0B' : estado === 'critico' ? '#DC2626' : '#9CA3AF';
    return `<tr>
      <td style="padding:6px 10px;font-size:12px;color:#374151;border-bottom:1px solid #F3F4F6;">${examLabel(id)}</td>
      <td style="padding:6px 10px;font-size:12px;color:#111827;border-bottom:1px solid #F3F4F6;">${r?.valor || '—'} ${r?.unidad || ''}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #F3F4F6;"><span style="display:inline-block;background:${color}22;color:${color};font-size:11px;font-weight:700;border-radius:5px;padding:2px 8px;">${estado || 'pendiente'}</span></td>
      <td style="padding:6px 10px;font-size:11px;color:#6B7280;border-bottom:1px solid #F3F4F6;">${r?.obs || ''}</td>
    </tr>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<title>Historia Clínica — ${nombreCompleto}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background:#fff; color:#111827; font-size:13px; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page-break { page-break-before: always; }
    @page { size: A4; margin: 15mm 18mm; }
  }
</style>
</head>
<body>

<!-- ENCABEZADO -->
<div style="background:#0A3D2E;border-radius:0;padding:22px 32px;display:flex;align-items:center;gap:20px;">
  <img src="${logoUrl}" style="width:66px;height:66px;border-radius:50%;object-fit:cover;border:2px solid rgba(212,175,55,0.6);flex-shrink:0;" onerror="this.style.display='none'"/>
  <div style="flex:1;">
    <div style="font-size:18px;font-weight:800;color:#fff;letter-spacing:0.02em;">Dr. Contreras Esthétiques</div>
    <div style="font-size:11px;color:rgba(255,255,255,0.65);letter-spacing:0.06em;text-transform:uppercase;margin-top:3px;">Medicina Metabólica &amp; Longevidad — Dra. Eusimary Contreras Morales</div>
  </div>
  <div style="text-align:right;">
    <div style="background:rgba(255,255,255,0.12);border-radius:10px;padding:8px 16px;border:1px solid rgba(212,175,55,0.3);">
      <div style="font-size:9px;font-weight:700;color:#D4AF37;text-transform:uppercase;letter-spacing:0.1em;">Historia Clínica</div>
      <div style="font-size:15px;font-weight:800;color:#fff;margin-top:3px;">${val(form.num_hc,'Sin número')}</div>
      <div style="font-size:10px;color:rgba(255,255,255,0.55);margin-top:2px;">${fecha(form.fecha_consulta)}</div>
    </div>
  </div>
</div>
<div style="height:4px;background:linear-gradient(to right,#D4AF37,#12C49A);"></div>

<div style="padding:28px 32px;">

<!-- IDENTIFICACIÓN DEL PACIENTE -->
${sectionTitle(1,'Identificación del Paciente')}
<div style="background:#F9FAFB;border-radius:12px;padding:16px 20px;border:1px solid #E5E7EB;">
  ${row2('Nombre completo', nombreCompleto, 'Número de documento', `${val(form.tipo_doc)} ${val(form.cc)}`)}
  ${row3('Fecha de nacimiento', fecha(form.fecha_nac), 'Edad', val(form.edad)+' años', 'Sexo biológico', val(form.sexo))}
  ${row3('Estado civil', val(form.estado_civil), 'Escolaridad', val(form.escolaridad), 'Ocupación', val(form.ocupacion))}
  ${row2('Ciudad', val(form.ciudad), 'Dirección', val(form.direccion))}
  ${row3('Teléfono / Celular', val(form.telefono), 'Correo electrónico', val(form.email), 'EPS / Aseguradora', val(form.eps))}
</div>

<!-- ═══════════════ 1ª CITA ═══════════════ -->
<div style="margin:28px 0 16px;display:flex;align-items:center;gap:10px;">
  <div style="flex:1;height:2px;background:linear-gradient(to right,#0A3D2E,#12C49A44);border-radius:2px;"></div>
  <div style="background:#0A3D2E;border-radius:20px;padding:5px 18px;font-size:11px;font-weight:800;color:#fff;letter-spacing:0.08em;white-space:nowrap;">1ª CITA MÉDICA</div>
  <div style="flex:1;height:2px;background:linear-gradient(to left,#0A3D2E,#12C49A44);border-radius:2px;"></div>
</div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;">
  <div style="background:#E6FAF5;border-radius:10px;padding:12px;border:1px solid #12C49A33;">
    <div style="font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">Fecha de consulta</div>
    <div style="font-size:13px;font-weight:600;color:#0A3D2E;margin-top:3px;">${fecha(form.fecha_consulta)}</div>
  </div>
  <div style="background:#E6FAF5;border-radius:10px;padding:12px;border:1px solid #12C49A33;">
    <div style="font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">Tipo de consulta</div>
    <div style="font-size:13px;font-weight:600;color:#0A3D2E;margin-top:3px;">${val(form.tipo_consulta)}</div>
  </div>
  <div style="background:#E6FAF5;border-radius:10px;padding:12px;border:1px solid #12C49A33;">
    <div style="font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">Programa clínico</div>
    <div style="font-size:11px;font-weight:600;color:#0A3D2E;margin-top:3px;line-height:1.4;">${programaLabel(form.programa)}</div>
  </div>
</div>

${sectionTitle(2,'Motivo de Consulta')}
<div style="background:#F9FAFB;border-radius:10px;padding:14px;border:1px solid #E5E7EB;font-size:13px;color:#374151;line-height:1.7;">${val(form.motivo,'No registrado')}</div>

${sectionTitle(3,'Antecedentes')}
<div style="background:#F9FAFB;border-radius:12px;padding:16px;border:1px solid #E5E7EB;">
  <div style="margin-bottom:12px;"><div style="font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">Antecedentes personales</div>${tagList(form.ant_pers)}${form.ant_pers_obs ? `<div style="font-size:12px;color:#6B7280;margin-top:6px;">${form.ant_pers_obs}</div>` : ''}</div>
  <div style="margin-bottom:12px;"><div style="font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">Antecedentes familiares</div>${tagList(form.ant_fam)}${form.ant_fam_obs ? `<div style="font-size:12px;color:#6B7280;margin-top:6px;">${form.ant_fam_obs}</div>` : ''}</div>
  <div style="margin-bottom:6px;"><div style="font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">Medicamentos actuales</div>${tagList(form.meds)}${form.meds_obs ? `<div style="font-size:12px;color:#6B7280;margin-top:6px;">${form.meds_obs}</div>` : ''}</div>
  ${form.alergias ? `<div><span style="font-size:10px;font-weight:700;color:#DC2626;text-transform:uppercase;letter-spacing:0.05em;">⚠ Alergias:</span> <span style="font-size:13px;color:#DC2626;">${form.alergias}</span></div>` : ''}
</div>

${sectionTitle(4,'Hábitos')}
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
  ${[['Tabaco',form.tabaco],['Alcohol',form.alcohol],['Ejercicio',form.ejercicio],['Sueño',form.sueno],['Agua / día',form.agua],['Patrón alimentario',form.dieta]].map(([l,v])=>`<div style="background:#F9FAFB;border-radius:8px;padding:10px;border:1px solid #E5E7EB;"><div style="font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.04em;">${l}</div><div style="font-size:12px;color:#374151;margin-top:3px;">${v||'—'}</div></div>`).join('')}
</div>

${form.gineco && form.sexo === 'Femenino' ? `
${sectionTitle(5,'Antecedentes Ginecológicos')}
<div style="background:#F9FAFB;border-radius:12px;padding:16px;border:1px solid #E5E7EB;">
  ${row3('Ciclo menstrual', val(form.ciclo), 'FUM', fecha(form.fum), 'Anticonceptivos', val(form.anticonc))}
  ${row3('Gestas (G)', val(form.g), 'Partos (P)', val(form.p), 'Cesáreas (C)', val(form.c))}
</div>` : ''}

${sectionTitle(6,'Síntomas Referidos')}
<div style="background:#F9FAFB;border-radius:10px;padding:14px;border:1px solid #E5E7EB;">${tagList(form.sintomas)}${form.sint_obs ? `<div style="font-size:12px;color:#6B7280;margin-top:8px;">${form.sint_obs}</div>` : ''}</div>

${sectionTitle(7,`Examen Físico — ${form.modalidad === 'telemedicina' ? 'Telemedicina (datos referidos)' : 'Presencial'}`)}
<div style="background:#F9FAFB;border-radius:12px;padding:16px;border:1px solid #E5E7EB;">${examFisico}</div>

${sectionTitle(8,'Diagnóstico')}
<div style="background:#F9FAFB;border-radius:12px;padding:16px;border:1px solid #E5E7EB;">
  <div style="margin-bottom:10px;display:flex;align-items:baseline;gap:10px;"><span style="background:#0A3D2E;color:#fff;font-size:11px;font-weight:700;border-radius:5px;padding:2px 8px;flex-shrink:0;">DX1</span><span style="font-size:13px;color:#111827;">${val(form.dx1)}</span>${form.cie1?`<span style="font-size:11px;color:#6B7280;border:1px solid #E5E7EB;border-radius:5px;padding:2px 8px;">CIE-10: ${form.cie1}</span>`:''}</div>
  ${form.dx2 ? `<div style="display:flex;align-items:baseline;gap:10px;"><span style="background:#374151;color:#fff;font-size:11px;font-weight:700;border-radius:5px;padding:2px 8px;flex-shrink:0;">DX2</span><span style="font-size:13px;color:#111827;">${form.dx2}</span>${form.cie2?`<span style="font-size:11px;color:#6B7280;border:1px solid #E5E7EB;border-radius:5px;padding:2px 8px;">CIE-10: ${form.cie2}</span>`:''}</div>` : ''}
</div>

${form.examenes.length > 0 ? `
${sectionTitle(9,'Paraclínicos Solicitados')}
<div style="background:#F9FAFB;border-radius:10px;padding:14px;border:1px solid #E5E7EB;">${form.examenes.map(id=>`<div style="font-size:12px;color:#374151;padding:4px 0;border-bottom:1px solid #F3F4F6;display:flex;align-items:center;gap:8px;"><span style="color:#12C49A;font-weight:800;">✓</span>${examLabel(id)}</div>`).join('')}${form.exam_otro?`<div style="font-size:12px;color:#374151;padding:4px 0;display:flex;align-items:center;gap:8px;"><span style="color:#12C49A;font-weight:800;">✓</span>Otro: ${form.exam_otro}</div>`:''}</div>` : ''}

<!-- Consentimientos 1ª Cita -->
${sectionTitle('✦','Consentimientos Informados — 1ª Cita','#D4AF37')}
<div style="background:linear-gradient(135deg,#E6FAF5,#FFF8E7);border-radius:12px;padding:16px;border:1px solid #D4AF37;">
  <div style="display:flex;gap:20px;align-items:center;">
    <div style="flex:1;display:flex;align-items:center;gap:10px;">${consentBadge(form.consent_habeas)}<span style="font-size:12px;color:#374151;">Habeas Data — Ley 1581/2012</span></div>
    <div style="flex:1;display:flex;align-items:center;gap:10px;">${consentBadge(form.consent_med)}<span style="font-size:12px;color:#374151;">Consentimiento Médico — Ley 23/1981</span></div>
  </div>
</div>

${tiene2daCita ? `
<!-- ═══════════════ 2ª CITA ═══════════════ -->
<div class="page-break"></div>
<div style="margin:28px 0 16px;display:flex;align-items:center;gap:10px;">
  <div style="flex:1;height:2px;background:linear-gradient(to right,#D97706,#D4AF3744);border-radius:2px;"></div>
  <div style="background:#D97706;border-radius:20px;padding:5px 18px;font-size:11px;font-weight:800;color:#fff;letter-spacing:0.08em;white-space:nowrap;">2ª CITA MÉDICA</div>
  <div style="flex:1;height:2px;background:linear-gradient(to left,#D97706,#D4AF3744);border-radius:2px;"></div>
</div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;">
  <div style="background:#FFF8E7;border-radius:10px;padding:12px;border:1px solid #D4AF3744;">
    <div style="font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">Fecha 2ª Cita</div>
    <div style="font-size:13px;font-weight:600;color:#92400E;margin-top:3px;">${fecha(form.fecha_2cita)}</div>
  </div>
  <div style="background:#FFF8E7;border-radius:10px;padding:12px;border:1px solid #D4AF3744;">
    <div style="font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">Tipo de consulta</div>
    <div style="font-size:13px;font-weight:600;color:#92400E;margin-top:3px;">${val(form.tipo_2cita)}</div>
  </div>
  <div style="background:#FFF8E7;border-radius:10px;padding:12px;border:1px solid #D4AF3744;">
    <div style="font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">Estado paraclínicos</div>
    <div style="font-size:13px;font-weight:600;color:#92400E;margin-top:3px;">${val(form.res_estado,'Pendientes')}</div>
  </div>
</div>

${form.examenes.length > 0 ? `
${sectionTitle('9b','Resultados de Laboratorio','#D97706')}
<table style="width:100%;border-collapse:collapse;background:#FEFCE8;border-radius:12px;overflow:hidden;border:1px solid #D4AF3744;">
  <thead><tr style="background:#D97706;">
    <th style="padding:8px 10px;font-size:11px;font-weight:700;color:#fff;text-align:left;">Examen</th>
    <th style="padding:8px 10px;font-size:11px;font-weight:700;color:#fff;text-align:left;">Valor</th>
    <th style="padding:8px 10px;font-size:11px;font-weight:700;color:#fff;text-align:left;">Estado</th>
    <th style="padding:8px 10px;font-size:11px;font-weight:700;color:#fff;text-align:left;">Observación</th>
  </tr></thead>
  <tbody>${resFilas || `<tr><td colspan="4" style="padding:12px;text-align:center;font-size:12px;color:#9CA3AF;">Sin resultados registrados</td></tr>`}</tbody>
</table>
${form.res_obs ? `<div style="background:#FFF8E7;border-radius:10px;padding:14px;border:1px solid #D4AF3744;margin-top:10px;"><span style="font-size:10px;font-weight:700;color:#92400E;text-transform:uppercase;letter-spacing:0.05em;">Interpretación clínica</span><div style="font-size:13px;color:#374151;margin-top:5px;line-height:1.7;">${form.res_obs}</div></div>` : ''}
` : ''}

${sectionTitle(10,'Datos de la Consulta — 2ª Cita','#D97706')}
${block('Programa clínico asignado', programaLabel(form.programa))}
${block('Motivo de la 2ª cita / Evolución', val(form.motivo))}

${sectionTitle(11,'Plan de Manejo','#D97706')}
<div style="background:#FFFDF0;border-radius:12px;padding:16px;border:1px solid #EDD97A;">
  ${form.med_nombre ? `<div style="background:#fff;border-radius:8px;padding:12px;border:1px solid #E5E7EB;margin-bottom:12px;">${row3('Medicamento', val(form.med_nombre), 'Dosis', val(form.dosis), 'Frecuencia', val(form.frecuencia))}</div>` : ''}
  ${block('Plan no farmacológico', val(form.plan_nf))}
  ${block('Plan nutricional', val(form.nutricion))}
  ${block('Prescripción de actividad física', val(form.actividad))}
  ${block('Metas terapéuticas', val(form.metas))}
  ${form.proxima ? `<div style="margin-top:10px;display:inline-flex;align-items:center;gap:8px;background:#E6FAF5;border-radius:8px;padding:8px 14px;border:1px solid #12C49A33;"><span style="font-size:11px;font-weight:700;color:#0A3D2E;">📅 Próxima cita:</span><span style="font-size:13px;color:#0A3D2E;font-weight:600;">${fecha(form.proxima)}</span></div>` : ''}
</div>

${form.notas ? `
${sectionTitle(13,'Notas del Médico','#D97706')}
<div style="background:#FFFDF0;border-radius:10px;padding:14px;border:1px solid #EDD97A;font-size:13px;color:#374151;line-height:1.7;">${form.notas}</div>
` : ''}

<!-- Consentimientos 2ª Cita -->
${sectionTitle('✦','Consentimientos Informados — 2ª Cita','#D4AF37')}
<div style="background:linear-gradient(135deg,#FFFDF0,#FFF8E7);border-radius:12px;padding:16px;border:1px solid #D4AF37;">
  <div style="display:flex;gap:20px;align-items:center;">
    <div style="flex:1;display:flex;align-items:center;gap:10px;">${consentBadge(form.consent_habeas_2)}<span style="font-size:12px;color:#374151;">Ratificación Habeas Data — Ley 1581/2012</span></div>
    <div style="flex:1;display:flex;align-items:center;gap:10px;">${consentBadge(form.consent_med_2)}<span style="font-size:12px;color:#374151;">Consentimiento Plan de Tratamiento — Ley 23/1981</span></div>
  </div>
</div>
` : ''}

</div>

<!-- PIE DE PÁGINA -->
<div style="background:#0A3D2E;padding:18px 32px;margin-top:24px;display:flex;align-items:center;justify-content:space-between;">
  <div>
    <div style="font-size:11px;font-weight:700;color:#D4AF37;text-transform:uppercase;letter-spacing:0.08em;">Dra. Eusimary Contreras Morales</div>
    <div style="font-size:10px;color:rgba(255,255,255,0.6);margin-top:2px;">Médica General — Medicina Metabólica &amp; Longevidad</div>
  </div>
  <div style="text-align:center;">
    <div style="font-size:10px;color:rgba(255,255,255,0.5);">asistente.draeusi@gmail.com</div>
    <div style="font-size:10px;color:rgba(255,255,255,0.5);">+57 301 625 4865 · draeusimary.netlify.app</div>
  </div>
  <div style="text-align:right;">
    <div style="font-size:9px;color:rgba(255,255,255,0.4);">Documento generado: ${new Date().toLocaleDateString('es-CO',{day:'2-digit',month:'long',year:'numeric'})}</div>
    <div style="font-size:9px;color:rgba(255,255,255,0.4);margin-top:2px;">Confidencial — Uso exclusivo del paciente y equipo médico</div>
  </div>
</div>

</body></html>`;

  return html;
}

interface GenOpts {
  leadId?: string;
  hcId?:   string;
  onSaved?: (url: string) => void;
  onError?: () => void;
}

export async function generarHistoriaClinicaPDF(
  form: HistoriaClinicaForm,
  opts: GenOpts = {},
): Promise<void> {
  const html = buildHistoriaClinicaHTML(form);

  // Abrir ventana de impresión de inmediato (no bloquear por la subida)
  const win = window.open('', '_blank', 'width=960,height=1200');
  if (!win) {
    alert('Activa las ventanas emergentes en tu navegador para generar el PDF.');
    return;
  }
  win.document.write(html);
  win.document.close();
  win.onload = () => { win.focus(); win.print(); };

  // Subida paralela a Soportes si hay leadId
  if (opts.leadId) {
    const nombreDoc = `Historia Clínica ${form.num_hc || form.cc || 'Paciente'}`;
    const resultado = await subirSoporteHTML(
      opts.leadId,
      nombreDoc,
      'historia_clinica',
      html,
      opts.hcId,
    );
    if (resultado) {
      opts.onSaved?.(resultado.url);
    } else {
      opts.onError?.();
    }
  }
}
