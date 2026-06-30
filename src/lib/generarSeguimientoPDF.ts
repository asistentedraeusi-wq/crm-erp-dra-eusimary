import type { Lead, SeguimientoSemanal } from '../context/LeadsContext';
import type { HistoriaClinicaForm as HCForm } from '../types/historia-clinica';
import { subirSoporteHTML } from './soportes';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function val(v: string | undefined | null, fallback = '—'): string {
  return v?.trim() || fallback;
}

function fecha(str: string | undefined | null): string {
  if (!str) return '—';
  const [y, m, d] = str.split('-');
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return `${parseInt(d)} de ${meses[parseInt(m) - 1]} de ${y}`;
}

function chip(label: string, color: string, bg: string): string {
  return `<span style="display:inline-block;background:${bg};border:1px solid ${color}44;border-radius:20px;padding:2px 10px;font-size:11px;font-weight:700;color:${color};margin:2px;">${label}</span>`;
}

function metrica(label: string, value: string | undefined | null, unit = ''): string {
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

// Calcula delta y retorna un HTML badge
function deltaBadge(current: string | undefined, reference: string | undefined, lowerBetter = true): string {
  if (!current || !reference) return '';
  const diff = parseFloat(current) - parseFloat(reference);
  if (isNaN(diff) || Math.abs(diff) < 0.01) return '<span style="color:#9CA3AF;font-size:10px;">sin cambio</span>';
  const improved = lowerBetter ? diff < 0 : diff > 0;
  const arrow = diff < 0 ? '↓' : '↑';
  const color = improved ? '#16A34A' : '#DC2626';
  const bg    = improved ? '#D1FAE5' : '#FEE2E2';
  return `<span style="display:inline-block;background:${bg};color:${color};font-size:10px;font-weight:800;padding:2px 7px;border-radius:5px;">${arrow} ${Math.abs(diff).toFixed(1)}</span>`;
}

// Fila de comparación en tabla
function filaComp(label: string, valorRef: string | undefined, valorAct: string | undefined, unit = '', lowerBetter = true): string {
  if (!valorRef && !valorAct) return '';
  return `
  <tr>
    <td style="font-size:11px;color:#374151;font-weight:600;padding:5px 8px;">${label}</td>
    <td style="font-size:11px;color:#6B7280;padding:5px 8px;text-align:center;">${val(valorRef)} <span style="color:#9CA3AF;font-size:9px;">${unit}</span></td>
    <td style="font-size:11px;color:#0A3D2E;font-weight:700;padding:5px 8px;text-align:center;">${val(valorAct)} <span style="color:#9CA3AF;font-size:9px;">${unit}</span></td>
    <td style="padding:5px 8px;text-align:center;">${deltaBadge(valorAct, valorRef, lowerBetter)}</td>
  </tr>`;
}

// Mensaje motivacional basado en progreso
function mensajeMotivacional(
  primerNombre: string,
  semana: number,
  deltaPeso: number | null,
  deltaTotal: number | null,
): string {
  let titulo = '';
  let cuerpo = '';
  let emoji  = '';
  let color  = '#0A3D2E';
  let bg     = '#F0FDF4';
  let border = '#16A34A44';

  if (deltaTotal !== null && deltaTotal <= -5) {
    emoji = '🏆'; titulo = '¡Resultado extraordinario!';
    cuerpo = `${primerNombre}, llevas <strong>${Math.abs(deltaTotal).toFixed(1)} kg menos</strong> desde el inicio del programa. Tu constancia está generando cambios reales y duraderos. ¡Sigue así!`;
    color = '#065F46'; bg = '#D1FAE5'; border = '#16A34A';
  } else if (deltaTotal !== null && deltaTotal <= -2) {
    emoji = '💪'; titulo = '¡Excelente progreso!';
    cuerpo = `${primerNombre}, ya llevas <strong>${Math.abs(deltaTotal).toFixed(1)} kg menos</strong> desde el inicio. Cada semana de disciplina suma. Tu esfuerzo está dando resultados muy visibles.`;
    color = '#065F46'; bg = '#ECFDF5'; border = '#6EE7B7';
  } else if (deltaPeso !== null && deltaPeso < 0) {
    emoji = '✅'; titulo = '¡Vas en la dirección correcta!';
    cuerpo = `${primerNombre}, bajaste <strong>${Math.abs(deltaPeso).toFixed(1)} kg</strong> esta semana. El proceso es gradual y cada paso cuenta. Mantén los hábitos del plan.`;
    color = '#0A3D2E'; bg = '#F0FDF4'; border = '#16A34A44';
  } else if (deltaPeso !== null && Math.abs(deltaPeso) < 0.5) {
    emoji = '🔄'; titulo = 'Semana de consolidación';
    cuerpo = `${primerNombre}, tu peso se mantuvo estable esta semana. Esto es completamente normal en el proceso metabólico. Continúa con el plan y la próxima semana verás el avance.`;
    color = '#92400E'; bg = '#FEF3C7'; border = '#D4AF3744';
  } else if (deltaPeso !== null && deltaPeso > 0) {
    emoji = '💙'; titulo = 'Cada semana es una nueva oportunidad';
    cuerpo = `${primerNombre}, el proceso tiene altibajos y eso es completamente normal. La Dra. Eusimary revisará tu semana en la próxima consulta. Recuerda: la constancia es lo que genera resultados.`;
    color = '#1D4ED8'; bg = '#EFF6FF'; border = '#BFDBFE';
  } else {
    emoji = '🌟'; titulo = `Semana ${semana} registrada`;
    cuerpo = `${primerNombre}, gracias por mantener tu seguimiento al día. La constancia es la clave del éxito en tu programa de salud.`;
  }

  return `
  <div style="background:${bg};border:1.5px solid ${border};border-radius:12px;padding:16px 20px;">
    <div style="font-size:13px;font-weight:800;color:${color};margin-bottom:6px;">${emoji} ${titulo}</div>
    <div style="font-size:12px;color:${color === '#0A3D2E' ? '#374151' : color};line-height:1.7;">${cuerpo}</div>
  </div>`;
}

// ─── Builder principal ────────────────────────────────────────────────────────

export function buildSeguimientoSemanaHTML(
  lead: Lead,
  semana: number,
  sem: SeguimientoSemanal,
  hcForm?: HCForm | null,
  semAnterior?: SeguimientoSemanal | null,
): string {
  const isCtrl  = [4, 8, 12].includes(semana);
  const isS1    = lead.plan === 'S1';
  const isTele  = hcForm?.modalidad === 'telemedicina';
  const [aColor, aBg] = adherenciaColor(sem.adherencia ?? '');

  const primerNombre = lead.name.trim().split(' ')[0];

  // Base para comparación
  const basePeso     = hcForm ? (isTele ? hcForm.tp    : hcForm.peso)    : undefined;
  const baseCintura  = hcForm ? (isTele ? hcForm.tw    : hcForm.peri_abd): undefined;
  const baseCadera   = isTele ? hcForm?.thip : undefined;
  const baseCuello   = isTele ? hcForm?.tn   : undefined;
  const basePantorr  = isTele ? hcForm?.tc   : undefined;
  const baseIMC      = !isTele ? hcForm?.imc       : undefined;
  const baseGrasa    = !isTele ? hcForm?.grasa     : undefined;
  const baseGrasaKg  = !isTele ? hcForm?.grasa_kg  : undefined;
  const baseMagraP   = !isTele ? hcForm?.muscular  : undefined;
  const baseMagraKg  = !isTele ? hcForm?.magra_kg  : undefined;
  const baseAgua     = !isTele ? hcForm?.agua_total: undefined;
  const basePA       = hcForm?.pa;
  const baseFC       = hcForm?.fc;

  // Deltas totales vs inicio (para mensaje motivacional)
  const deltaPesoNum  = basePeso && sem.peso ? parseFloat(sem.peso) - parseFloat(basePeso) : null;
  const deltaTotalNum = deltaPesoNum; // En el futuro se puede poner más lógica

  // Hay datos de comparación con inicio
  const hayBaseline = !!(basePeso || baseCintura || baseIMC);
  // Hay semana anterior
  const haySemAnt   = !!(semAnterior && (semAnterior.peso || semAnterior.cintura));

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<title>Seguimiento Sem ${semana} — ${lead.name}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Segoe UI',Arial,sans-serif; background:#fff; color:#111827; font-size:13px; }
  table { border-collapse:collapse; width:100%; }
  @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } @page { size:A4; margin:15mm 18mm; } }
</style>
</head>
<body>

<!-- HEADER -->
<div style="background:#0A3D2E;padding:20px 32px;display:flex;align-items:center;justify-content:space-between;">
  <div>
    <div style="font-size:16px;font-weight:800;color:#fff;">Dra. Eusimary Contreras Morales</div>
    <div style="font-size:10px;color:rgba(255,255,255,0.55);text-transform:uppercase;letter-spacing:0.06em;margin-top:2px;">
      Seguimiento Clínico · ${lead.plan === 'S1' ? 'Control Metabólico Premium' : 'Bienestar Integral'}
    </div>
  </div>
  <div style="background:rgba(255,255,255,0.12);border-radius:10px;padding:8px 16px;border:1px solid rgba(212,175,55,0.3);text-align:right;">
    <div style="font-size:9px;font-weight:700;color:#D4AF37;text-transform:uppercase;letter-spacing:0.1em;">${isCtrl ? '⭐ Control Médico' : 'Registro Semanal'}</div>
    <div style="font-size:18px;font-weight:800;color:#fff;margin-top:2px;">Semana ${semana}</div>
    <div style="font-size:10px;color:rgba(255,255,255,0.55);margin-top:1px;">${sem.fecha ? fecha(sem.fecha) : '—'}</div>
  </div>
</div>
<div style="height:3px;background:linear-gradient(to right,#D4AF37,#12C49A);"></div>

<div style="padding:22px 32px;display:flex;flex-direction:column;gap:16px;">

  <!-- PACIENTE -->
  <div style="background:#F0FDF4;border-radius:12px;padding:12px 18px;border:1px solid #16A34A33;display:flex;align-items:center;justify-content:space-between;">
    <div>
      <div style="font-size:15px;font-weight:800;color:#0A3D2E;">${lead.name}</div>
      <div style="font-size:11px;color:#6B7280;margin-top:2px;">${lead.age} años · ${lead.city} · ${lead.email || '—'}</div>
    </div>
    <div style="display:flex;gap:12px;align-items:center;">
      ${lead.plan_inicio ? `<div style="font-size:10px;color:#6B7280;">Inicio: <strong>${fecha(lead.plan_inicio)}</strong></div>` : ''}
      <div style="background:#0A3D2E;border-radius:8px;padding:4px 12px;font-size:18px;font-weight:800;color:#D4AF37;">${lead.plan ?? '—'}</div>
    </div>
  </div>

  <!-- MÉTRICAS SEMANA ACTUAL -->
  <div>
    <div style="font-size:10px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:10px;">Métricas de la Semana ${semana}</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
      ${metrica('Peso', sem.peso, 'kg')}
      ${metrica('Cintura', sem.cintura, 'cm')}
      ${metrica('P. Arterial', sem.pa, 'mmHg')}
      ${isS1 ? metrica('Dosis GLP-1', sem.dosis) : metrica('Días ejercicio', sem.dias_ejercicio)}
    </div>
    ${(sem.cadera || sem.cuello || sem.pantorrilla || sem.imc || sem.grasa_pct || sem.fc) ? `
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:8px;">
      ${isTele ? `
        ${sem.cadera    ? metrica('Cadera', sem.cadera, 'cm') : ''}
        ${sem.cuello    ? metrica('Cuello', sem.cuello, 'cm') : ''}
        ${sem.pantorrilla ? metrica('Pantorrilla', sem.pantorrilla, 'cm') : ''}
        ${sem.fc        ? metrica('FC', sem.fc, 'lpm') : ''}
      ` : `
        ${sem.imc         ? metrica('IMC', sem.imc, 'kg/m²') : ''}
        ${sem.grasa_pct   ? metrica('Grasa Corp.', sem.grasa_pct, '%') : ''}
        ${sem.masa_grasa_kg ? metrica('Masa Grasa', sem.masa_grasa_kg, 'kg') : ''}
        ${sem.masa_magra_pct ? metrica('Masa Magra', sem.masa_magra_pct, '%') : ''}
      `}
    </div>
    ${!isTele && (sem.agua_pct || sem.peri_abd || sem.fc || sem.temp || sem.sato2 || sem.fr) ? `
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:8px;">
      ${sem.agua_pct  ? metrica('Agua', sem.agua_pct, 'L') : ''}
      ${sem.peri_abd  ? metrica('Peri. Abd.', sem.peri_abd, 'cm') : ''}
      ${sem.fc        ? metrica('FC', sem.fc, 'lpm') : ''}
      ${sem.temp      ? metrica('Temp.', sem.temp, '°C') : ''}
    </div>
    ` : ''}
    ` : ''}
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:8px;">
      ${isS1 ? metrica('Sitio inyección', sem.sitio_inyeccion) : ''}
      ${metrica('Días ejercicio', sem.dias_ejercicio)}
      ${metrica('Vasos agua', sem.vasos_agua, '/día')}
    </div>
  </div>

  <!-- EVOLUCIÓN VS. EVALUACIÓN INICIAL -->
  ${hayBaseline ? `
  <div>
    <div style="font-size:10px;font-weight:700;color:#0A3D2E;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:10px;">📊 Evolución vs. Evaluación Inicial (Sem. 0)</div>
    <div style="border:1px solid #D1FAE5;border-radius:10px;overflow:hidden;">
      <table>
        <thead>
          <tr style="background:#0A3D2E;">
            <th style="font-size:9px;font-weight:700;color:rgba(255,255,255,0.7);text-transform:uppercase;padding:6px 8px;text-align:left;">Indicador</th>
            <th style="font-size:9px;font-weight:700;color:rgba(255,255,255,0.7);text-transform:uppercase;padding:6px 8px;text-align:center;">Inicio</th>
            <th style="font-size:9px;font-weight:700;color:#D4AF37;text-transform:uppercase;padding:6px 8px;text-align:center;">Sem ${semana}</th>
            <th style="font-size:9px;font-weight:700;color:rgba(255,255,255,0.7);text-transform:uppercase;padding:6px 8px;text-align:center;">Cambio</th>
          </tr>
        </thead>
        <tbody>
          ${filaComp('Peso', basePeso, sem.peso, 'kg')}
          ${filaComp('Cintura', isTele ? baseCintura : baseCintura, sem.cintura, 'cm')}
          ${isTele ? filaComp('Cadera', baseCadera, sem.cadera, 'cm') : ''}
          ${isTele ? filaComp('Cuello', baseCuello, sem.cuello, 'cm') : ''}
          ${isTele ? filaComp('Pantorrilla', basePantorr, sem.pantorrilla, 'cm') : ''}
          ${!isTele ? filaComp('IMC', baseIMC, sem.imc, 'kg/m²') : ''}
          ${!isTele ? filaComp('Grasa Corporal', baseGrasa, sem.grasa_pct, '%') : ''}
          ${!isTele ? filaComp('Masa Grasa', baseGrasaKg, sem.masa_grasa_kg, 'kg') : ''}
          ${!isTele ? filaComp('Masa Magra %', baseMagraP, sem.masa_magra_pct, '%', false) : ''}
          ${!isTele ? filaComp('Masa Magra Kg', baseMagraKg, sem.masa_magra_pct === undefined ? undefined : sem.masa_grasa_kg, 'kg', false) : ''}
          ${!isTele ? filaComp('Agua', baseAgua, sem.agua_pct, 'L', false) : ''}
          ${filaComp('P. Arterial', basePA, sem.pa, 'mmHg')}
          ${filaComp('FC', baseFC, sem.fc, 'lpm')}
        </tbody>
      </table>
    </div>
  </div>
  ` : ''}

  <!-- VS. SEMANA ANTERIOR -->
  ${haySemAnt ? `
  <div>
    <div style="font-size:10px;font-weight:700;color:#0891B2;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:10px;">📈 Comparativo vs. Semana ${semana - 1}</div>
    <div style="border:1px solid #BAE6FD;border-radius:10px;overflow:hidden;">
      <table>
        <thead>
          <tr style="background:#0369A1;">
            <th style="font-size:9px;font-weight:700;color:rgba(255,255,255,0.7);text-transform:uppercase;padding:6px 8px;text-align:left;">Indicador</th>
            <th style="font-size:9px;font-weight:700;color:rgba(255,255,255,0.7);text-transform:uppercase;padding:6px 8px;text-align:center;">Sem ${semana - 1}</th>
            <th style="font-size:9px;font-weight:700;color:#7DD3FC;text-transform:uppercase;padding:6px 8px;text-align:center;">Sem ${semana}</th>
            <th style="font-size:9px;font-weight:700;color:rgba(255,255,255,0.7);text-transform:uppercase;padding:6px 8px;text-align:center;">Cambio</th>
          </tr>
        </thead>
        <tbody>
          ${filaComp('Peso', semAnterior?.peso, sem.peso, 'kg')}
          ${filaComp('Cintura', semAnterior?.cintura, sem.cintura, 'cm')}
          ${filaComp('Cadera', semAnterior?.cadera, sem.cadera, 'cm')}
          ${filaComp('Cuello', semAnterior?.cuello, sem.cuello, 'cm')}
          ${filaComp('IMC', semAnterior?.imc, sem.imc, 'kg/m²')}
          ${filaComp('Grasa %', semAnterior?.grasa_pct, sem.grasa_pct, '%')}
          ${filaComp('Masa Grasa', semAnterior?.masa_grasa_kg, sem.masa_grasa_kg, 'kg')}
          ${filaComp('FC', semAnterior?.fc, sem.fc, 'lpm')}
          ${filaComp('P. Arterial', semAnterior?.pa, sem.pa, 'mmHg')}
        </tbody>
      </table>
    </div>
  </div>
  ` : ''}

  <!-- SÍNTOMAS Y ADHERENCIA -->
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

  <!-- MENSAJE MOTIVACIONAL -->
  ${mensajeMotivacional(primerNombre, semana, deltaPesoNum, deltaTotalNum)}

  ${isCtrl ? `
  <!-- CONTROL MÉDICO -->
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

<!-- FOOTER -->
<div style="background:#0A3D2E;padding:14px 32px;display:flex;align-items:center;justify-content:space-between;margin-top:16px;">
  <div style="font-size:10px;font-weight:700;color:#D4AF37;text-transform:uppercase;letter-spacing:0.08em;">Dra. Eusimary Contreras Morales · R.M. 13-8793-05</div>
  <div style="font-size:9px;color:rgba(255,255,255,0.4);">Generado: ${new Date().toLocaleDateString('es-CO',{day:'2-digit',month:'long',year:'numeric'})}</div>
</div>

</body></html>`;
}

// ─── Guardar en Soportes ──────────────────────────────────────────────────────

export async function guardarControlSeguimiento(
  lead: Lead,
  semana: number,
  sem: SeguimientoSemanal,
  hcForm?: HCForm | null,
  semAnterior?: SeguimientoSemanal | null,
): Promise<boolean> {
  const html    = buildSeguimientoSemanaHTML(lead, semana, sem, hcForm, semAnterior);
  const isCtrl  = [4, 8, 12].includes(semana);
  const nombre  = isCtrl
    ? `Control Médico Semana ${semana} — ${lead.name}`
    : `Seguimiento Semana ${semana} — ${lead.name}`;

  const resultado = await subirSoporteHTML(lead.id, nombre, 'seguimiento', html);
  return Boolean(resultado);
}
