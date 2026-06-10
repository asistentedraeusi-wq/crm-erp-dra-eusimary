import type { Lead, SeguimientoSemanal } from '../context/LeadsContext';
import { subirSoporteHTML } from './soportes';

function val(v: string | undefined | null, fallback = '—'): string {
  return v?.trim() || fallback;
}

function fecha(str: string): string {
  if (!str) return '—';
  const [y, m, d] = str.split('-');
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return `${parseInt(d)} de ${meses[parseInt(m) - 1]} de ${y}`;
}

function chip(label: string, color: string, bg: string): string {
  return `<span style="display:inline-block;background:${bg};border:1px solid ${color}44;border-radius:20px;padding:2px 10px;font-size:11px;font-weight:700;color:${color};margin:2px;">${label}</span>`;
}

function metrica(label: string, value: string, unit = ''): string {
  return `
    <div style="background:#F9FAFB;border-radius:8px;padding:10px;border:1px solid #E5E7EB;text-align:center;">
      <div style="font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.06em;">${label}</div>
      <div style="font-size:16px;font-weight:800;color:#0A3D2E;margin-top:2px;">${val(value)}<span style="font-size:11px;font-weight:400;color:#6B7280;margin-left:2px;">${unit}</span></div>
    </div>`;
}

function adherenciaColor(a: string): [string, string] {
  if (a === 'excelente') return ['#16A34A', '#F0FDF4'];
  if (a === 'regular')   return ['#D97706', '#FEF3C7'];
  if (a === 'bajo')      return ['#DC2626', '#FEF2F2'];
  return ['#9CA3AF', '#F9FAFB'];
}

export function buildSeguimientoSemanaHTML(lead: Lead, semana: number, sem: SeguimientoSemanal): string {
  const isCtrl = [4, 8, 12].includes(semana);
  const isS1   = lead.plan === 'S1';
  const [aColor, aBg] = adherenciaColor(sem.adherencia ?? '');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<title>Seguimiento Sem ${semana} — ${lead.name}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Segoe UI',Arial,sans-serif; background:#fff; color:#111827; font-size:13px; }
  @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } @page { size:A4; margin:15mm 18mm; } }
</style>
</head>
<body>

<div style="background:#0A3D2E;padding:20px 32px;display:flex;align-items:center;justify-content:space-between;">
  <div>
    <div style="font-size:16px;font-weight:800;color:#fff;">Dr. Contreras Esthétiques</div>
    <div style="font-size:10px;color:rgba(255,255,255,0.55);text-transform:uppercase;letter-spacing:0.06em;margin-top:2px;">Seguimiento Clínico — ${lead.plan === 'S1' ? 'Control Metabólico' : 'Bienestar Integral'}</div>
  </div>
  <div style="background:rgba(255,255,255,0.12);border-radius:10px;padding:8px 16px;border:1px solid rgba(212,175,55,0.3);text-align:right;">
    <div style="font-size:9px;font-weight:700;color:#D4AF37;text-transform:uppercase;letter-spacing:0.1em;">${isCtrl ? '⭐ Control Médico' : 'Registro Semanal'}</div>
    <div style="font-size:18px;font-weight:800;color:#fff;margin-top:2px;">Semana ${semana}</div>
    <div style="font-size:10px;color:rgba(255,255,255,0.55);margin-top:1px;">${sem.fecha ? fecha(sem.fecha) : '—'}</div>
  </div>
</div>
<div style="height:3px;background:linear-gradient(to right,#D4AF37,#12C49A);"></div>

<div style="padding:24px 32px;display:flex;flex-direction:column;gap:18px;">

  <!-- Paciente -->
  <div style="background:#F0FDF4;border-radius:12px;padding:14px 18px;border:1px solid #16A34A33;display:flex;align-items:center;justify-content:space-between;">
    <div>
      <div style="font-size:16px;font-weight:800;color:#0A3D2E;">${lead.name}</div>
      <div style="font-size:11px;color:#6B7280;margin-top:2px;">${lead.age} años · ${lead.city} · ${lead.email}</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;">Plan</div>
      <div style="font-size:20px;font-weight:800;color:#0A3D2E;">${lead.plan ?? '—'}</div>
    </div>
  </div>

  <!-- Métricas principales -->
  <div>
    <div style="font-size:10px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:10px;">Métricas de la Semana</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;">
      ${metrica('Peso', sem.peso, 'kg')}
      ${metrica('Cintura', sem.cintura, 'cm')}
      ${metrica('P. Arterial', sem.pa, 'mmHg')}
      ${isS1 ? metrica('Dosis GLP-1', sem.dosis) : metrica('Días ejercicio', sem.dias_ejercicio)}
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:8px;">
      ${isS1 ? metrica('Sitio inyección', sem.sitio_inyeccion) : ''}
      ${metrica('Días ejercicio', sem.dias_ejercicio)}
      ${metrica('Vasos agua', sem.vasos_agua, '/día')}
    </div>
  </div>

  <!-- Síntomas y adherencia -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
    <div>
      <div style="font-size:10px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:8px;">Síntomas reportados</div>
      <div>${sem.sintomas?.length ? sem.sintomas.map(s => chip(s, '#374151', '#F3F4F6')).join('') : chip('Sin síntomas', '#16A34A', '#F0FDF4')}</div>
    </div>
    <div>
      <div style="font-size:10px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:8px;">Adherencia nutricional</div>
      ${sem.adherencia
        ? `<div style="background:${aBg};border:1px solid ${aColor}44;border-radius:8px;padding:10px 16px;display:inline-flex;align-items:center;gap:8px;"><span style="font-size:18px;font-weight:800;color:${aColor};text-transform:capitalize;">${sem.adherencia}</span></div>`
        : '<span style="font-size:13px;color:#9CA3AF;">No registrada</span>'}
    </div>
  </div>

  ${sem.notas ? `
  <div>
    <div style="font-size:10px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:8px;">Notas clínicas</div>
    <div style="background:#F9FAFB;border-radius:10px;padding:14px;border:1px solid #E5E7EB;font-size:13px;color:#374151;line-height:1.7;">${sem.notas}</div>
  </div>` : ''}

  ${isCtrl ? `
  <div style="background:#FFFDF0;border-radius:12px;padding:16px 20px;border:2px solid #D4AF37;">
    <div style="font-size:11px;font-weight:800;color:#92400E;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:14px;">⭐ Control Médico — Semana ${semana}</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:12px;">
      <div style="background:#fff;border-radius:8px;padding:10px;border:1px solid #D4AF3766;text-align:center;">
        <div style="font-size:9px;font-weight:700;color:#92400E;text-transform:uppercase;">% Grasa</div>
        <div style="font-size:18px;font-weight:800;color:#92400E;margin-top:2px;">${val(sem.control_grasa)}</div>
      </div>
      <div style="background:#fff;border-radius:8px;padding:10px;border:1px solid #D4AF3766;text-align:center;">
        <div style="font-size:9px;font-weight:700;color:#92400E;text-transform:uppercase;">Kg Masa Magra</div>
        <div style="font-size:18px;font-weight:800;color:#92400E;margin-top:2px;">${val(sem.control_magra)}</div>
      </div>
      ${isS1 && sem.control_nueva_dosis ? `
      <div style="background:#fff;border-radius:8px;padding:10px;border:1px solid #D4AF3766;text-align:center;">
        <div style="font-size:9px;font-weight:700;color:#92400E;text-transform:uppercase;">Nueva Dosis</div>
        <div style="font-size:18px;font-weight:800;color:#92400E;margin-top:2px;">${sem.control_nueva_dosis}</div>
      </div>` : ''}
      ${sem.control_prox_fecha ? `
      <div style="background:#fff;border-radius:8px;padding:10px;border:1px solid #D4AF3766;text-align:center;">
        <div style="font-size:9px;font-weight:700;color:#92400E;text-transform:uppercase;">Próximo control</div>
        <div style="font-size:13px;font-weight:700;color:#92400E;margin-top:2px;">${fecha(sem.control_prox_fecha)}</div>
      </div>` : ''}
    </div>
    ${sem.control_indicaciones ? `
    <div>
      <div style="font-size:9px;font-weight:700;color:#92400E;text-transform:uppercase;margin-bottom:6px;">Indicaciones médicas</div>
      <div style="background:#fff;border-radius:8px;padding:12px;border:1px solid #D4AF3766;font-size:13px;color:#374151;line-height:1.7;">${sem.control_indicaciones}</div>
    </div>` : ''}
  </div>` : ''}

</div>

<div style="background:#0A3D2E;padding:14px 32px;display:flex;align-items:center;justify-content:space-between;margin-top:24px;">
  <div style="font-size:10px;font-weight:700;color:#D4AF37;text-transform:uppercase;letter-spacing:0.08em;">Dra. Eusimary Contreras Morales</div>
  <div style="font-size:9px;color:rgba(255,255,255,0.4);">Generado: ${new Date().toLocaleDateString('es-CO',{day:'2-digit',month:'long',year:'numeric'})}</div>
</div>

</body></html>`;
}

export async function guardarControlSeguimiento(
  lead: Lead,
  semana: number,
  sem: SeguimientoSemanal,
): Promise<boolean> {
  const html    = buildSeguimientoSemanaHTML(lead, semana, sem);
  const isCtrl  = [4, 8, 12].includes(semana);
  const nombre  = isCtrl
    ? `Control Médico Semana ${semana} — ${lead.name}`
    : `Seguimiento Semana ${semana} — ${lead.name}`;

  const resultado = await subirSoporteHTML(lead.id, nombre, 'seguimiento', html);
  return Boolean(resultado);
}
