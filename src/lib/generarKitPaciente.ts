import type { HistoriaClinicaForm } from '../types/historia-clinica';
import { subirSoporteHTML } from './soportes';

// ─── Colores ──────────────────────────────────────────────────────────────────
const C = {
  teal:      '#12C49A', tealDark: '#0A9278', tealLight: '#E6FAF5',
  gold:      '#D4AF37', goldLight: '#FEF3C7', goldDark: '#92400E',
  navy:      '#0B1B3D', navyLight: '#162847',
  gray900:   '#111827', gray700: '#374151', gray500: '#6B7280',
  gray200:   '#E5E7EB', gray50:  '#F9FAFB',
  green:     '#059669', greenBg: '#D1FAE5',
  amber:     '#D97706', amberBg: '#FEF3C7',
  red:       '#DC2626', redBg:   '#FEE2E2',
  white:     '#FFFFFF',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fecha(str: string): string {
  if (!str) return '—';
  const [y, m, d] = str.split('-');
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio',
                 'agosto','septiembre','octubre','noviembre','diciembre'];
  return `${parseInt(d)} de ${meses[parseInt(m)-1]} de ${y}`;
}

function val(v: string | number | undefined | null, fallback = '—'): string {
  if (v === undefined || v === null) return fallback;
  const s = String(v).trim();
  return s || fallback;
}

function esS1(p: string) { return p === 'control_metabolico'; }

function nombre1(form: HistoriaClinicaForm) {
  return val(form.nombres).split(' ')[0];
}

function nombreCompleto(form: HistoriaClinicaForm) {
  return `${val(form.nombres)} ${val(form.apellidos)}`.trim();
}

function calcEdad(fechaNac: string): number {
  if (!fechaNac) return 0;
  const hoy = new Date();
  const nac = new Date(fechaNac);
  let edad = hoy.getFullYear() - nac.getFullYear();
  if (hoy.getMonth() < nac.getMonth() ||
     (hoy.getMonth() === nac.getMonth() && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

function chips(items: string[], bg = C.tealLight, color = '#0A3D2E', border = C.teal + '44'): string {
  if (!items || !items.length) return `<span style="font-size:12px;color:${C.gray500};">—</span>`;
  return items.map(i =>
    `<span style="display:inline-block;background:${bg};border:1px solid ${border};border-radius:20px;padding:4px 12px;font-size:12px;font-weight:600;color:${color};margin:2px 3px 2px 0;">${i}</span>`
  ).join('');
}

function restrictChips(items: string[]): string {
  if (!items || !items.length) return `<span style="font-size:12px;color:${C.gray500};">Ninguna</span>`;
  return items.map(i =>
    `<span style="display:inline-block;background:${C.redBg};border:1px solid #FCA5A5;border-radius:20px;padding:4px 12px;font-size:12px;font-weight:600;color:${C.red};margin:2px 3px 2px 0;">✕ ${i}</span>`
  ).join('');
}

function metricCard(label: string, value: string, unit: string, bg = C.gray50): string {
  return `
    <div style="background:${bg};border:1px solid ${C.gray200};border-radius:10px;padding:14px 12px;text-align:center;">
      <div style="font-size:10px;font-weight:700;color:${C.gray500};text-transform:uppercase;letter-spacing:0.07em;margin-bottom:6px;">${label}</div>
      <div style="font-size:22px;font-weight:800;color:${C.gray900};line-height:1;">${value}</div>
      <div style="font-size:10px;color:${C.gray500};margin-top:3px;">${unit}</div>
    </div>`;
}

function alertBox(text: string, bg: string, color: string, border: string): string {
  return `<div style="background:${bg};border:1px solid ${border};border-radius:10px;padding:12px 16px;font-size:13px;color:${color};line-height:1.6;">${text}</div>`;
}

function sectionBadge(text: string): string {
  return `<div style="display:inline-flex;align-items:center;gap:6px;background:${C.tealLight};border:1px solid ${C.teal}44;border-radius:20px;padding:4px 14px;font-size:11px;font-weight:700;color:#0A3D2E;margin-bottom:14px;letter-spacing:0.04em;">${text}</div>`;
}

function kitSectionHeader(icon: string, title: string, subtitle = ''): string {
  return `
    <div style="margin-bottom:20px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:${subtitle ? '4px' : '0'};">
        <div style="width:36px;height:36px;border-radius:10px;background:${C.teal};display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">${icon}</div>
        <h2 style="font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:600;color:${C.navy};margin:0;">${title}</h2>
      </div>
      ${subtitle ? `<p style="font-size:12px;color:${C.gray500};margin:0 0 0 46px;">${subtitle}</p>` : ''}
      <div style="height:1px;background:${C.gray200};margin-top:12px;"></div>
    </div>`;
}

function infoCard(label: string, value: string): string {
  return `
    <div>
      <div style="font-size:10px;font-weight:700;color:rgba(212,175,55,0.7);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:3px;">${label}</div>
      <div style="font-size:14px;font-weight:600;color:#fff;">${value}</div>
    </div>`;
}

function programaBadge(programa: string): string {
  const isS1 = esS1(programa);
  const color = isS1 ? C.gold : C.teal;
  const bg    = isS1 ? 'rgba(212,175,55,0.2)' : 'rgba(18,196,154,0.2)';
  const label = isS1 ? 'Programa Control Metabólico · S1' : 'Programa Bienestar Integral · S2';
  return `<div style="display:inline-flex;align-items:center;gap:8px;background:${bg};border:1.5px solid ${color};border-radius:24px;padding:8px 20px;font-size:13px;font-weight:700;color:${color};">★ ${label}</div>`;
}

function planBaseLabel(val: string): string {
  const m: Record<string, string> = {
    'bajo-ig': 'Bajo Índice Glicémico', 'cetogenico': 'Cetogénico / Low Carb',
    'mediterraneo': 'Mediterráneo', 'bajo-carbohidratos': 'Bajo en Carbohidratos',
    'proteina-alta': 'Alto en Proteínas',
  };
  return m[val] || val || 'No especificado';
}

function nivelFuerzaLabel(val: string): string {
  const m: Record<string, string> = {
    'inicial': 'Inicial — Sedentario total', 'intermedio': 'Intermedio — Algo de actividad',
    'avanzado': 'Avanzado — Entrenado', 'no_aplica': 'No aplica',
  };
  return m[val] || val || 'No especificado';
}

// ─── SECCIÓN 1 — PORTADA ──────────────────────────────────────────────────────
function buildPortada(form: HistoriaClinicaForm): string {
  const edad = form.edad || String(calcEdad(form.fecha_nac));
  const esPres = form.modalidad !== 'telemedicina';
  const peso   = esPres ? val(form.peso)  : val(form.tw);
  const cintura = esPres ? val(form.peri_abd) : val(form.tc);
  const imc    = val(form.imc);
  return `
  <div style="background:${C.navy};min-height:260mm;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:50px 60px;print-color-adjust:exact;-webkit-print-color-adjust:exact;color-adjust:exact;">
    <!-- Logo placeholder -->
    <div style="border:2px solid ${C.gold};background:rgba(212,175,55,0.08);border-radius:10px;padding:10px 28px;margin-bottom:28px;">
      <span style="font-family:'DM Sans',Arial,sans-serif;font-size:11px;font-weight:700;color:${C.gold};letter-spacing:3px;">LOGO EC</span>
    </div>
    <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:28px;font-weight:300;color:${C.gold};margin:0 0 6px;text-align:center;letter-spacing:1px;">
      Dra. Eusimary Contreras Morales
    </h1>
    <p style="font-family:'DM Sans',Arial,sans-serif;font-size:11px;color:rgba(212,175,55,0.65);letter-spacing:2.5px;text-transform:uppercase;margin:0 0 6px;">
      MEDICINA METABÓLICA &amp; LONGEVIDAD
    </p>
    <p style="font-family:'DM Sans',Arial,sans-serif;font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:1px;margin:0 0 22px;">
      Esp. Gerencia de la Calidad y la Salud · Barranquilla, Colombia
    </p>
    <div style="width:80px;height:1px;background:${C.gold};margin:0 auto 24px;opacity:0.7;"></div>
    <h2 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:38px;font-weight:600;color:#fff;margin:0 0 32px;text-align:center;">
      Kit de Bienvenida al Programa
    </h2>
    <!-- Box paciente -->
    <div style="background:rgba(255,255,255,0.07);border:1px solid rgba(212,175,55,0.35);border-radius:14px;padding:24px 32px;width:100%;max-width:500px;margin:0 auto 24px;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px 24px;">
        ${infoCard('Paciente', nombreCompleto(form))}
        ${infoCard('Documento', `${val(form.tipo_doc)} ${val(form.cc)}`)}
        ${infoCard('Edad', `${edad} años`)}
        ${infoCard('Sexo', val(form.sexo))}
        ${infoCard('Peso', `${peso} kg`)}
        ${infoCard('IMC', imc)}
        ${infoCard('Cintura', `${cintura} cm`)}
        ${infoCard('Fecha valoración', fecha(form.fecha_consulta))}
      </div>
    </div>
    <!-- Badge programa -->
    ${programaBadge(form.programa)}
    <!-- Pills -->
    <div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap;justify-content:center;">
      ${['Ciencia', 'Precisión', 'Transformación'].map(p =>
        `<span style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:20px;padding:5px 16px;font-size:11px;color:rgba(255,255,255,0.7);letter-spacing:1px;">${p}</span>`
      ).join('')}
    </div>
    <!-- Footer portada -->
    <div style="margin-top:auto;padding-top:36px;display:flex;gap:20px;flex-wrap:wrap;justify-content:center;">
      ${['🌐 draeusimary.netlify.app', '📱 +57 301 625 4865', '📷 @draeusimary'].map(c =>
        `<span style="font-size:11px;color:rgba(255,255,255,0.45);">${c}</span>`
      ).join('')}
    </div>
  </div>`;
}

// ─── SECCIÓN 2 — CARTA DE BIENVENIDA ─────────────────────────────────────────
function buildBienvenida(form: HistoriaClinicaForm): string {
  const n1 = nombre1(form);
  const prox = form.proxima ? fecha(form.proxima) : 'próximamente';
  const progLabel = esS1(form.programa) ? 'Control Metabólico' : 'Bienestar Integral';
  return `
  <div style="padding:0 0 24px;">
    ${kitSectionHeader('✉️', 'Carta de Bienvenida')}
    <div style="border:1px solid ${C.gray200};border-radius:12px;overflow:hidden;">
      <div style="height:4px;background:linear-gradient(90deg,${C.navy},${C.gold},${C.navy});"></div>
      <div style="padding:28px 32px;font-family:'DM Sans',Arial,sans-serif;line-height:1.9;color:${C.gray700};font-size:13.5px;">
        <p style="font-size:15px;font-weight:600;color:${C.gray900};margin:0 0 18px;">Estimado(a) ${n1},</p>
        <p style="margin:0 0 14px;">Es un honor recibirte en el <strong>Programa ${progLabel}</strong>. Hoy marcas el inicio de un proceso de transformación respaldado por ciencia, precisión y un equipo comprometido con tu bienestar.</p>
        <p style="margin:0 0 14px;">Este Kit ha sido diseñado exclusivamente para ti. Contiene tu plan nutricional, tu protocolo de ejercicios, la guía de suplementación y las hojas de seguimiento semanal que llevarás durante todo el programa.</p>
        <p style="margin:0 0 14px;">Tu cuerpo tiene una capacidad extraordinaria de adaptarse y mejorar cuando recibe el estímulo correcto. Este programa te entrega ese estímulo de manera <strong>individualizada y basada en evidencia</strong>, considerando tu composición corporal, tus antecedentes y tus objetivos.</p>
        <p style="margin:0 0 14px;">Te invito a leer cada sección con cuidado, llevar tu hoja de seguimiento semanal y escribirme ante cualquier duda o síntoma. Estoy aquí para acompañarte en cada etapa.</p>
        <p style="margin:0 0 20px;">Tu próximo control está programado para el <strong>${prox}</strong>. Te esperaré con mucho gusto.</p>
        <!-- Cita médica -->
        <div style="background:#EEF2FF;border-left:4px solid ${C.navy};border-radius:0 8px 8px 0;padding:14px 18px;margin:0 0 24px;font-style:italic;color:${C.navy};font-size:13px;">
          "El cambio metabólico sostenible no es una carrera, es un proceso de educación y reconexión con tu cuerpo. Confía en la ciencia, confía en ti."
        </div>
        <!-- Firma -->
        <div style="border-top:1px solid ${C.gray200};padding-top:18px;">
          <div style="width:130px;height:1px;background:${C.gray900};margin-bottom:8px;"></div>
          <p style="margin:0;font-size:13px;font-weight:700;color:${C.gray900};">Dra. Eusimary Contreras Morales</p>
          <p style="margin:2px 0 0;font-size:11px;color:${C.gray500};">Médica Especialista · Medicina Metabólica &amp; Longevidad</p>
          <p style="margin:2px 0 0;font-size:11px;color:${C.gray500};">Tarjeta Profesional: [TP]</p>
        </div>
      </div>
    </div>
  </div>`;
}

// ─── SECCIÓN 3 — PERFIL METABÓLICO ───────────────────────────────────────────
function buildPerfilMetabolico(form: HistoriaClinicaForm): string {
  const esPres = form.modalidad !== 'telemedicina';
  const peso    = esPres ? val(form.peso)      : val(form.tw);
  const talla   = esPres ? val(form.talla)     : val(form.th);
  const cintura = esPres ? val(form.peri_abd)  : val(form.tc);
  const grasa   = val(form.grasa);
  const grasaKg = val(form.grasa_kg);
  const magra   = val(form.muscular);
  const magraKg = val(form.magra_kg);
  const agua    = val(form.agua_total);
  const pa      = val(form.pa);
  const imc     = val(form.imc);
  const fatRange = val(form.fat_range);

  const metodoBadge = esPres
    ? `🏥 Medición directa · Impedanciómetro`
    : `📱 Estimado por antropometría · Telemedicina · ±3–5%`;

  const comorbilidades = (form.ant_pers ?? []).filter(Boolean);

  return `
  <div style="padding:0 0 24px;">
    ${kitSectionHeader('📊', 'Perfil Metabólico', 'Composición corporal al inicio del programa')}
    ${sectionBadge(metodoBadge)}
    <!-- Grid 4 columnas — fila 1 -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:10px;">
      ${metricCard('Peso', peso, 'kg')}
      ${metricCard('% Grasa', grasa, '%')}
      ${metricCard('% Masa Magra', magra, '%')}
      ${metricCard('Cintura', cintura, 'cm')}
    </div>
    <!-- Grid 4 columnas — fila 2 -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px;">
      ${metricCard('Kg Grasa', grasaKg, 'kg', C.redBg)}
      ${metricCard('Kg Masa Magra', magraKg, 'kg', C.greenBg)}
      ${metricCard('Agua Total', agua, 'L')}
      ${metricCard('Presión Arterial', pa, 'mmHg')}
    </div>
    <!-- Datos adicionales -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;">
      ${metricCard('IMC', imc, 'kg/m²')}
      ${metricCard('Talla', talla, 'cm')}
      ${fatRange !== '—' ? metricCard('Rango Grasa Óptima', fatRange, '%', C.goldLight) : ''}
    </div>
    ${comorbilidades.length ? `
    ${alertBox(`<strong>Antecedentes / Comorbilidades:</strong>&nbsp; ${comorbilidades.join(' · ')}`, '#EFF6FF', '#1D4ED8', '#BFDBFE')}
    ` : ''}
  </div>`;
}

// ─── SECCIÓN 4 — PROGRAMA Y PROTOCOLO ────────────────────────────────────────
function buildProgramaProtocolo(form: HistoriaClinicaForm): string {
  const prox = form.proxima ? fecha(form.proxima) : '—';
  const mesTit = form.pm_mes_titulacion || '1';

  const titulacion = [
    { num: '1', label: 'Mes 1', dosis: '0.25 mg/semana' },
    { num: '2', label: 'Mes 2', dosis: '0.5 mg/semana' },
    { num: '3', label: 'Mes 3', dosis: '1.0 mg/semana' },
    { num: 'C', label: 'Cierre', dosis: 'Evaluación final' },
  ];

  if (esS1(form.programa)) {
    const nodes = titulacion.map((t, i) => {
      const active = t.num === mesTit;
      const done   = parseInt(t.num) < parseInt(mesTit);
      const bg     = active ? C.gold : (done ? C.green : C.gray200);
      const color  = active || done ? '#fff' : C.gray500;
      return `
        <div style="display:flex;flex-direction:column;align-items:center;flex:1;">
          <div style="width:44px;height:44px;border-radius:50%;background:${bg};display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:${color};${active ? `box-shadow:0 0 0 5px ${C.goldLight};` : ''}position:relative;">
            ${done ? '✓' : t.num}
          </div>
          <div style="font-size:12px;font-weight:700;color:${active ? C.goldDark : C.gray700};margin-top:8px;">${t.label}</div>
          <div style="font-size:11px;color:${C.gray500};text-align:center;">${t.dosis}</div>
          ${i < titulacion.length - 1 ? '' : ''}
        </div>
        ${i < titulacion.length - 1 ? `<div style="flex:none;width:40px;height:2px;background:${done ? C.green : C.gray200};align-self:center;margin-bottom:28px;"></div>` : ''}`;
    });

    return `
    <div style="padding:0 0 24px;">
      ${kitSectionHeader('💉', 'Programa & Protocolo', 'Control Metabólico — GLP-1')}
      <!-- Timeline titulación -->
      <div style="border:1px solid ${C.gray200};border-radius:12px;padding:24px 20px;margin-bottom:16px;">
        <p style="font-size:11px;font-weight:700;color:${C.gray500};text-transform:uppercase;letter-spacing:0.07em;margin:0 0 20px;">Protocolo de Titulación</p>
        <div style="display:flex;align-items:flex-start;justify-content:center;">${nodes.join('')}</div>
      </div>
      ${alertBox(`<strong>⭐ Dosis actual:</strong> ${titulacion.find(t => t.num === mesTit)?.dosis || 'Ver indicaciones'} &nbsp;|&nbsp; <strong>Próximo control:</strong> ${prox}`, C.goldLight, C.goldDark, C.gold + '66')}
    </div>`;
  }

  // S2 — Bienestar Integral
  return `
  <div style="padding:0 0 24px;">
    ${kitSectionHeader('🌿', 'Programa & Protocolo', 'Bienestar Integral')}
    ${alertBox(`<strong>Programa Bienestar Integral (S2):</strong> Plan de estilo de vida integral con nutrición funcional, actividad física personalizada y optimización hormonal y metabólica. Sin medicamentos GLP-1 — el enfoque es 100% natural y adaptado a tu condición. &nbsp;|&nbsp; <strong>Próximo control:</strong> ${prox}`, C.greenBg, C.green, '#6EE7B7')}
  </div>`;
}

// ─── SECCIÓN 5 — GUÍA NUTRICIONAL ────────────────────────────────────────────
function buildGuiaNutricional(form: HistoriaClinicaForm): string {
  const plan = planBaseLabel(form.pm_plan_base);
  const hidra = form.pm_hidratacion || '10';
  const hidraLabel: Record<string,string> = {'8':'8 vasos (2 L)','10':'10 vasos (2.5 L)','12':'12 vasos (3 L)','15':'15 vasos (3.75 L)'};

  const foodCard = (icon: string, title: string, content: string) => `
    <div style="border:1px solid ${C.gray200};border-radius:10px;overflow:hidden;">
      <div style="background:${C.gray50};border-bottom:1px solid ${C.gray200};padding:10px 14px;display:flex;align-items:center;gap:8px;">
        <span style="font-size:16px;">${icon}</span>
        <span style="font-size:12px;font-weight:700;color:${C.gray700};text-transform:uppercase;letter-spacing:0.06em;">${title}</span>
      </div>
      <div style="padding:12px 14px;min-height:70px;">${content}</div>
    </div>`;

  return `
  <div style="padding:0 0 24px;">
    ${kitSectionHeader('🥗', 'Guía Nutricional', `Plan base: ${plan}`)}
    ${alertBox(`🥩 <strong>Regla de Oro:</strong> Proteína primero en cada comida. Luego vegetales y grasas saludables. Los carbohidratos, si aplican, son los últimos en el plato.`, C.greenBg, C.green, '#6EE7B7')}
    <div style="height:12px;"></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
      ${foodCard('🍗', 'Proteínas recomendadas', chips(form.pm_proteinas ?? []))}
      ${foodCard('🥦', 'Vegetales prioritarios', chips(form.pm_vegetales ?? [], C.greenBg, C.green, '#6EE7B7'))}
      ${foodCard('🚫', 'Restricciones alimentarias', restrictChips(form.pm_restricciones ?? []))}
      ${foodCard('🥜', 'Snacks permitidos (máx. 1–2/día)', chips(form.pm_snacks ?? [], C.goldLight, C.goldDark, C.gold + '55'))}
    </div>
    ${alertBox(`💧 <strong>Meta de hidratación:</strong> ${hidraLabel[hidra] || hidra + ' vasos'} de agua pura al día. Distribuye el consumo a lo largo del día. El agua apoya el metabolismo, la saciedad y la eliminación de toxinas.`, '#EFF6FF', '#1D4ED8', '#BFDBFE')}
  </div>`;
}

// ─── SECCIÓN 6 — PLAN DE COMIDAS ─────────────────────────────────────────────
function buildPlanComidas(form: HistoriaClinicaForm): string {
  const plan = form.pm_plan_base || 'bajo-ig';
  const isProt = (form.pm_proteinas ?? []).length > 0;
  const protName = isProt ? (form.pm_proteinas ?? [])[0] : 'proteína';

  const comidas = [
    { hora: '7:00 AM', nombre: 'Desayuno', emoji: '🌅',
      desc: `Proteína + grasa saludable. Ej: 2-3 huevos con aguacate y vegetales salteados. Plan: ${planBaseLabel(plan)}.` },
    { hora: '10:00 AM', nombre: 'Media Mañana', emoji: '☀️',
      desc: `Snack opcional si hay hambre real. Ej: ${(form.pm_snacks ?? ['Maní 25g'])[0] || 'Maní 25g'} o yogur griego sin azúcar.` },
    { hora: '1:00 PM', nombre: 'Almuerzo', emoji: '🍽️',
      desc: `Plato completo: ${protName} + vegetales crudos o cocidos + carbohidrato opcional (si aplica en tu plan).` },
    { hora: '4:00 PM', nombre: 'Media Tarde', emoji: '🌤️',
      desc: `Snack ligero si hay hambre. Ej: ${(form.pm_snacks ?? [])[1] || 'Pepino con limón y sal'} o queso blanco.` },
    { hora: '7:00 PM', nombre: 'Cena', emoji: '🌙',
      desc: `Cena ligera: proteína magra + vegetales. Evitar carbohidratos después de las 6 PM.` },
    { hora: 'Antes dormir', nombre: 'Merienda Opcional', emoji: '💤',
      desc: `Solo si hay hambre nocturna: 1 taza té sin azúcar o 100g yogur griego.` },
  ];

  return `
  <div style="background:${C.navyLight};border-radius:14px;padding:24px 22px;print-color-adjust:exact;-webkit-print-color-adjust:exact;color-adjust:exact;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:18px;">
      <span style="font-size:22px;">🍴</span>
      <h2 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:22px;font-weight:600;color:#fff;margin:0;">Plan de Comidas Diario</h2>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
      ${comidas.map(c => `
        <div style="background:rgba(255,255,255,0.07);border:1px solid ${C.teal}55;border-radius:10px;padding:14px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <span style="font-size:16px;">${c.emoji}</span>
            <div>
              <div style="font-size:12px;font-weight:700;color:${C.teal};">${c.nombre}</div>
              <div style="font-size:10px;color:rgba(255,255,255,0.4);">${c.hora}</div>
            </div>
          </div>
          <p style="font-size:12px;color:rgba(255,255,255,0.75);margin:0;line-height:1.6;">${c.desc}</p>
        </div>`).join('')}
    </div>
    <!-- Reglas de Oro -->
    <div style="background:rgba(212,175,55,0.1);border:1px solid ${C.gold}44;border-radius:10px;padding:14px 16px;">
      <p style="font-size:11px;font-weight:700;color:${C.gold};text-transform:uppercase;letter-spacing:0.08em;margin:0 0 8px;">4 Reglas de Oro</p>
      ${['1. Proteína primero en cada comida.',
         '2. No omitas el desayuno si estás en titulación GLP-1.',
         '3. Mastica despacio — la saciedad llega a los 20 minutos.',
         '4. Si no tienes hambre (especialmente con GLP-1), está bien comer menos.'].map((r,i) =>
        `<p style="font-size:12px;color:rgba(255,255,255,0.75);margin:${i ? '6px' : '0'} 0 0;line-height:1.5;">${r}</p>`
      ).join('')}
    </div>
  </div>`;
}

// ─── SECCIÓN 7 — PLAN DE EJERCICIOS ──────────────────────────────────────────
function buildPlanEjercicios(form: HistoriaClinicaForm): string {
  const tipo    = val(form.pm_tipo_aerobico, 'Caminata');
  const mins    = val(form.pm_minutos_sesion, '30');
  const dias    = val(form.pm_dias_aerobico, '4');
  const nivel   = nivelFuerzaLabel(form.pm_nivel_fuerza);
  const dFuerza = form.pm_dias_fuerza ?? [];
  const totalMin = parseInt(dias) * parseInt(mins);

  const diasSemana = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  const diasFuerzaShort = dFuerza.map(d => d.slice(0,3));

  return `
  <div style="padding:0 0 24px;">
    ${kitSectionHeader('🏃', 'Plan de Ejercicios', nivel)}
    <!-- Hero -->
    <div style="background:linear-gradient(135deg,${C.navy},${C.navyLight});border-radius:12px;padding:20px 24px;margin-bottom:16px;display:flex;align-items:center;gap:16px;print-color-adjust:exact;-webkit-print-color-adjust:exact;color-adjust:exact;">
      <span style="font-size:48px;">🏃‍♂️</span>
      <div>
        <p style="font-size:12px;color:rgba(255,255,255,0.5);margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">Tu programa de ejercicio</p>
        <p style="font-size:20px;font-weight:700;color:#fff;margin:0;">${tipo} · ${mins} min · ${dias} días/semana</p>
      </div>
    </div>
    <!-- 3 tarjetas -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px;">
      ${metricCard('Actividad Aeróbica', tipo, '', '#EFF6FF')}
      ${metricCard('Duración / Sesión', mins, 'minutos')}
      ${metricCard('Total Semanal', String(totalMin), 'min/semana', C.greenBg)}
    </div>
    <!-- Semana visual -->
    <div style="border:1px solid ${C.gray200};border-radius:10px;padding:16px;margin-bottom:14px;">
      <p style="font-size:11px;font-weight:700;color:${C.gray500};text-transform:uppercase;letter-spacing:0.07em;margin:0 0 12px;">Distribución Semanal</p>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;">
        ${diasSemana.map(d => {
          const isFuerza = diasFuerzaShort.includes(d);
          const isCardio = !isFuerza;
          const bg = isFuerza ? C.tealLight : (isCardio ? '#EFF6FF' : C.gray50);
          const color = isFuerza ? '#0A3D2E' : (isCardio ? '#1D4ED8' : C.gray500);
          const label = isFuerza ? '💪' : '🚶';
          return `
            <div style="text-align:center;border:1px solid ${isFuerza ? C.teal+'55' : '#BFDBFE'};border-radius:8px;padding:8px 4px;background:${bg};">
              <div style="font-size:11px;font-weight:700;color:${color};">${d}</div>
              <div style="font-size:14px;margin-top:4px;">${label}</div>
            </div>`;
        }).join('')}
      </div>
      <div style="display:flex;gap:14px;margin-top:10px;">
        <span style="font-size:11px;color:${C.gray500};">💪 Fuerza: ${dFuerza.length ? dFuerza.join(', ') : 'Por definir'}</span>
        <span style="font-size:11px;color:${C.gray500};">🚶 Cardio: restantes ${parseInt(dias) > 0 ? parseInt(dias) + ' días' : ''}</span>
      </div>
    </div>
    ${alertBox(`🛑 <strong>Señales de parada durante el ejercicio:</strong> Dolor en el pecho · Dificultad para respirar · Mareo o desmayo · Dolor de cabeza intenso · Palpitaciones irregulares. Si presentas cualquiera de estos síntomas, detente inmediatamente y consulta.`, C.redBg, C.red, '#FCA5A5')}
  </div>`;
}

// ─── SECCIÓN 8 — SÍNTOMAS GLP-1 (solo S1) ────────────────────────────────────
function buildManejoSintomas(): string {
  const sintomas  = ['Náuseas', 'Vómito', 'Diarrea / estreñimiento', 'Fatiga', 'Acidez'];
  const manejos   = ['Comer pequeñas porciones', 'Evitar comidas grasas', 'Mantenerse hidratado', 'Descanso si es necesario', 'Antiácidos de venta libre'];
  const urgencias = ['Vómito persistente > 24h', 'Deshidratación severa', 'Dolor abdominal intenso', 'Pancreatitis (dolor cinturón)', 'Reacción alérgica severa', 'Glucemia < 70 mg/dL'];

  return `
  <div style="padding:0 0 24px;">
    ${kitSectionHeader('💊', 'Manejo de Síntomas GLP-1', 'Sección exclusiva para Programa S1 — Control Metabólico')}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
      <!-- Síntomas comunes -->
      <div style="border:1px solid ${C.gray200};border-radius:10px;overflow:hidden;">
        <div style="border-top:3px solid ${C.teal};background:${C.gray50};padding:10px 14px;">
          <span style="font-size:12px;font-weight:700;color:${C.gray700};text-transform:uppercase;letter-spacing:0.06em;">Síntomas Comunes</span>
        </div>
        <div style="padding:12px 14px;">
          ${sintomas.map(s => `<div style="font-size:12px;color:${C.gray700};padding:4px 0;border-bottom:1px solid ${C.gray200};">• ${s}</div>`).join('')}
        </div>
      </div>
      <!-- Cómo manejarlos -->
      <div style="border:1px solid ${C.gray200};border-radius:10px;overflow:hidden;">
        <div style="border-top:3px solid ${C.green};background:${C.gray50};padding:10px 14px;">
          <span style="font-size:12px;font-weight:700;color:${C.gray700};text-transform:uppercase;letter-spacing:0.06em;">Cómo Manejarlos</span>
        </div>
        <div style="padding:12px 14px;">
          ${manejos.map(m => `<div style="font-size:12px;color:${C.gray700};padding:4px 0;border-bottom:1px solid ${C.gray200};">✓ ${m}</div>`).join('')}
        </div>
      </div>
    </div>
    <!-- Señales de urgencia -->
    <div style="border:1px solid #FCA5A5;border-radius:10px;overflow:hidden;margin-bottom:12px;">
      <div style="border-top:3px solid ${C.red};background:${C.redBg};padding:10px 14px;">
        <span style="font-size:12px;font-weight:700;color:${C.red};text-transform:uppercase;letter-spacing:0.06em;">🚨 Señales de Urgencia — Acude de Inmediato</span>
      </div>
      <div style="padding:12px 14px;display:grid;grid-template-columns:1fr 1fr;gap:6px;">
        ${urgencias.map(u => `<div style="font-size:12px;color:${C.red};padding:3px 0;">⚠️ ${u}</div>`).join('')}
      </div>
    </div>
    ${alertBox(`📞 <strong>Urgencias:</strong> Línea de Emergencias <strong>123</strong> &nbsp;|&nbsp; 📱 WhatsApp Dra. Eusimary: <strong>+57 301 625 4865</strong>`, C.redBg, C.red, '#FCA5A5')}
  </div>`;
}

// ─── SECCIÓN 9 — ALERTAS & SUPLEMENTACIÓN ────────────────────────────────────
function buildAlertasSuplementacion(form: HistoriaClinicaForm): string {
  const alertas = form.pm_alertas ?? [];
  const suplem  = form.pm_suplementacion ?? [];
  if (!alertas.length && !suplem.length) return '';

  return `
  <div style="padding:0 0 24px;">
    ${kitSectionHeader('⚡', 'Alertas & Suplementación')}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      ${alertas.length ? `
      <div style="border:1px solid ${C.amber}55;border-radius:10px;overflow:hidden;">
        <div style="background:${C.amberBg};border-bottom:1px solid ${C.amber}44;padding:10px 14px;">
          <span style="font-size:12px;font-weight:700;color:${C.amber};text-transform:uppercase;letter-spacing:0.06em;">⚠️ Alertas Especiales</span>
        </div>
        <div style="padding:12px 14px;">
          ${alertas.map(a => `<div style="font-size:12px;color:${C.gray700};padding:5px 0;border-bottom:1px solid ${C.gray200};">• ${a}</div>`).join('')}
        </div>
      </div>` : ''}
      ${suplem.length ? `
      <div style="border:1px solid ${C.teal}44;border-radius:10px;overflow:hidden;">
        <div style="background:${C.tealLight};border-bottom:1px solid ${C.teal}44;padding:10px 14px;">
          <span style="font-size:12px;font-weight:700;color:#0A3D2E;text-transform:uppercase;letter-spacing:0.06em;">💊 Suplementación</span>
        </div>
        <div style="padding:12px 14px;">${chips(suplem)}</div>
      </div>` : ''}
    </div>
  </div>`;
}

// ─── SECCIÓN 10 — NOTA MÉDICA PERSONAL ───────────────────────────────────────
function buildNotaMedica(form: HistoriaClinicaForm): string {
  if (!form.pm_nota_medica) return '';
  return `
  <div style="padding:0 0 24px;">
    ${kitSectionHeader('✍️', 'Nota Médica Personal')}
    <div style="background:${C.navyLight};border-radius:12px;padding:24px 28px;print-color-adjust:exact;-webkit-print-color-adjust:exact;color-adjust:exact;">
      <p style="font-size:14px;color:rgba(255,255,255,0.85);font-style:italic;line-height:1.9;margin:0 0 20px;">
        "${form.pm_nota_medica}"
      </p>
      <div style="border-top:1px solid rgba(255,255,255,0.15);padding-top:14px;">
        <div style="width:100px;height:1px;background:${C.gold};margin-bottom:6px;"></div>
        <p style="font-size:12px;color:${C.gold};font-weight:700;margin:0;">Dra. Eusimary Contreras Morales</p>
        <p style="font-size:11px;color:rgba(255,255,255,0.4);margin:2px 0 0;">Médica Especialista · Medicina Metabólica &amp; Longevidad</p>
      </div>
    </div>
  </div>`;
}

// ─── SECCIÓN 11 — TABLA DE PROGRESO TRIMESTRAL ───────────────────────────────
function buildTablaProgreso(form: HistoriaClinicaForm): string {
  const esPres = form.modalidad !== 'telemedicina';
  const pesoB  = esPres ? val(form.peso)     : val(form.tw);
  const grasaB = val(form.grasa);
  const gkgB   = val(form.grasa_kg);
  const magraB = val(form.muscular);
  const cintB  = esPres ? val(form.peri_abd) : val(form.tc);
  const dosisB = form.pm_mes_titulacion
    ? ['0.25 mg/sem','0.5 mg/sem','1.0 mg/sem'][parseInt(form.pm_mes_titulacion)-1] || '—'
    : '—';

  const filas = [
    { label: 'Basal', semana: 'Inicio', peso: pesoB, grasa: grasaB, gkg: gkgB, magra: magraB, cintura: cintB, dosis: dosisB, obs: 'Inicio programa' },
    { label: 'Control 1', semana: 'Sem 4', peso: '', grasa: '', gkg: '', magra: '', cintura: '', dosis: '', obs: '' },
    { label: 'Control 2', semana: 'Sem 8', peso: '', grasa: '', gkg: '', magra: '', cintura: '', dosis: '', obs: '' },
    { label: 'Cierre', semana: 'Sem 12', peso: '', grasa: '', gkg: '', magra: '', cintura: '', dosis: '', obs: '' },
  ];

  const th = (t: string) => `<th style="font-size:10px;font-weight:700;color:${C.gray500};text-transform:uppercase;letter-spacing:0.06em;padding:8px 10px;text-align:left;border-bottom:2px solid ${C.gray200};">${t}</th>`;
  const td = (t: string) => `<td style="font-size:12px;color:${C.gray700};padding:10px 10px;border-bottom:1px solid ${C.gray200};">${t}</td>`;

  return `
  <div style="padding:0 0 24px;">
    ${kitSectionHeader('📈', 'Tabla de Progreso Trimestral')}
    <div style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;border:1px solid ${C.gray200};border-radius:10px;overflow:hidden;">
        <thead style="background:${C.gray50};">
          <tr>
            ${['Control','Semana','Peso (kg)','% Grasa','Kg Grasa','% Mag. Magra','Cintura (cm)',esS1(form.programa)?'Dosis GLP-1':'—','Observación'].map(th).join('')}
          </tr>
        </thead>
        <tbody>
          ${filas.map((f,i) => `
            <tr style="background:${i===0 ? C.tealLight : (i%2===0 ? C.gray50 : '#fff')};">
              ${td(`<strong>${f.label}</strong>`)}
              ${td(f.semana)}
              ${td(f.peso || '___')}
              ${td(f.grasa || '___')}
              ${td(f.gkg || '___')}
              ${td(f.magra || '___')}
              ${td(f.cintura || '___')}
              ${td(esS1(form.programa) ? (f.dosis || '___') : '—')}
              ${td(f.obs || '')}
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

// ─── HOJAS SEMANALES (12) ─────────────────────────────────────────────────────
function buildHojaSemanal(semana: number, form: HistoriaClinicaForm): string {
  const esControl = [4, 8, 12].includes(semana);
  const isS1 = esS1(form.programa);

  const sint = ['Náuseas','Estreñimiento','Fatiga','Acidez','Mareo','Sin síntomas'];
  const checkboxes = sint.map(s =>
    `<div style="display:flex;align-items:center;gap:6px;font-size:12px;color:${C.gray700};"><span style="display:inline-block;width:14px;height:14px;border:1.5px solid ${C.gray500};border-radius:3px;flex-shrink:0;"></span>${s}</div>`
  ).join('');

  const adherenciaCirculos = `
    <div style="display:flex;gap:10px;align-items:center;">
      <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
        <div style="width:28px;height:28px;border-radius:50%;background:${C.greenBg};border:2px solid ${C.green};"></div>
        <span style="font-size:10px;color:${C.gray500};">Excelente</span>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
        <div style="width:28px;height:28px;border-radius:50%;background:${C.amberBg};border:2px solid ${C.amber};"></div>
        <span style="font-size:10px;color:${C.gray500};">Regular</span>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
        <div style="width:28px;height:28px;border-radius:50%;background:${C.redBg};border:2px solid ${C.red};"></div>
        <span style="font-size:10px;color:${C.gray500};">Bajo</span>
      </div>
    </div>`;

  const inputLine = (label: string, unit = '') => `
    <div style="margin-bottom:10px;">
      <span style="font-size:11px;font-weight:700;color:${C.gray500};text-transform:uppercase;letter-spacing:0.06em;">${label}</span>
      <div style="display:flex;align-items:center;gap:8px;margin-top:4px;">
        <div style="flex:1;height:1px;border-bottom:1.5px solid ${C.gray200};"></div>
        ${unit ? `<span style="font-size:11px;color:${C.gray500};">${unit}</span>` : ''}
      </div>
    </div>`;

  return `
  <div style="padding:0 0 8px;">
    <!-- Header hoja semanal -->
    <div style="display:flex;align-items:center;justify-content:space-between;background:${C.navy};border-radius:10px 10px 0 0;padding:12px 18px;print-color-adjust:exact;-webkit-print-color-adjust:exact;color-adjust:exact;">
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="font-family:'Cormorant Garamond',Georgia,serif;font-size:16px;color:${C.gold};font-weight:600;">Dra. Eusimary Contreras</span>
        <span style="font-size:11px;color:rgba(255,255,255,0.4);">·</span>
        <span style="font-size:11px;color:rgba(255,255,255,0.6);">Seguimiento Semanal</span>
      </div>
      <div style="background:${esControl ? C.gold : C.teal};color:${esControl ? C.navy : '#fff'};border-radius:20px;padding:5px 14px;font-size:12px;font-weight:700;">
        Semana ${semana}${esControl ? ' ⭐' : ''}
      </div>
    </div>
    <div style="border:1px solid ${C.gray200};border-top:none;border-radius:0 0 10px 10px;padding:16px 18px;">
      <!-- Datos básicos -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:14px;">
        <div>
          ${inputLine('Fecha de la semana', 'DD/MM/AAAA')}
          ${inputLine('Peso', 'kg')}
          ${inputLine('Cintura', 'cm')}
          ${inputLine('Presión arterial', 'mmHg')}
        </div>
        <div>
          ${isS1 ? inputLine('Dosis aplicada', 'mg') : ''}
          ${isS1 ? inputLine('Sitio de inyección', '') : ''}
          ${inputLine('Días de ejercicio', '/ 7')}
          ${inputLine('Vasos de agua', '/ día')}
        </div>
      </div>
      <!-- Síntomas -->
      <div style="margin-bottom:14px;">
        <p style="font-size:11px;font-weight:700;color:${C.gray500};text-transform:uppercase;letter-spacing:0.06em;margin:0 0 8px;">Síntomas esta semana</p>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">${checkboxes}</div>
      </div>
      <!-- Adherencia nutricional -->
      <div style="margin-bottom:14px;">
        <p style="font-size:11px;font-weight:700;color:${C.gray500};text-transform:uppercase;letter-spacing:0.06em;margin:0 0 8px;">Adherencia al plan nutricional</p>
        ${adherenciaCirculos}
      </div>
      <!-- Notas libres -->
      <div style="margin-bottom:${esControl ? '14px' : '0'};">
        <p style="font-size:11px;font-weight:700;color:${C.gray500};text-transform:uppercase;letter-spacing:0.06em;margin:0 0 6px;">Notas</p>
        <div style="height:42px;border-bottom:1.5px solid ${C.gray200};"></div>
        <div style="height:42px;border-bottom:1.5px solid ${C.gray200};"></div>
      </div>
      ${esControl ? `
      <!-- Bloque control médico -->
      <div style="background:${C.goldLight};border:1px solid ${C.gold}55;border-radius:8px;padding:14px 16px;margin-top:14px;">
        <p style="font-size:12px;font-weight:700;color:${C.goldDark};text-transform:uppercase;letter-spacing:0.06em;margin:0 0 10px;">⭐ Control Médico — Semana ${semana}</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          ${inputLine('% Grasa medido', '%')}
          ${inputLine('Kg Masa Magra', 'kg')}
          ${isS1 ? inputLine('Nueva dosis asignada', 'mg') : ''}
          ${inputLine('Fecha próximo control', 'DD/MM/AAAA')}
        </div>
        <p style="font-size:11px;font-weight:700;color:${C.goldDark};text-transform:uppercase;letter-spacing:0.06em;margin:10px 0 6px;">Indicaciones médicas del control</p>
        <div style="height:50px;border-bottom:1.5px solid ${C.amber}55;"></div>
        <div style="height:50px;border-bottom:1.5px solid ${C.amber}55;"></div>
      </div>` : ''}
    </div>
  </div>`;
}

// ─── SECCIÓN 12 — FOOTER INSTITUCIONAL ───────────────────────────────────────
function buildFooter(): string {
  const now = new Date().toLocaleDateString('es-CO', { year:'numeric', month:'long', day:'numeric' });
  return `
  <div style="background:${C.navy};border-radius:12px;padding:20px 28px;display:flex;justify-content:space-between;align-items:center;margin-top:8px;print-color-adjust:exact;-webkit-print-color-adjust:exact;color-adjust:exact;">
    <div>
      <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:16px;font-weight:600;color:${C.gold};margin:0 0 4px;">Dra. Eusimary Contreras Morales</p>
      <p style="font-size:11px;color:rgba(255,255,255,0.5);margin:0;">Médica Especialista · Medicina Metabólica &amp; Longevidad</p>
    </div>
    <div style="text-align:right;">
      <p style="font-size:11px;color:rgba(255,255,255,0.5);margin:0;">draeusimary.netlify.app · +57 301 625 4865 · @draeusimary</p>
      <p style="font-size:10px;color:rgba(255,255,255,0.35);margin:4px 0 0;">Generado el ${now} · Elaborado por CAST Consultorías SAS</p>
    </div>
  </div>`;
}

// ─── CONSTRUCTOR PRINCIPAL ────────────────────────────────────────────────────
export function buildKitPacienteHTML(form: HistoriaClinicaForm): string {
  const nombre = nombreCompleto(form);

  const sections: string[] = [
    buildPortada(form),
    `<div style="page-break-before:always;">`,
    buildBienvenida(form),
    buildPerfilMetabolico(form),
    buildProgramaProtocolo(form),
    `</div>`,
    `<div style="page-break-before:always;">`,
    buildGuiaNutricional(form),
    buildPlanComidas(form),
    `</div>`,
    `<div style="page-break-before:always;">`,
    buildPlanEjercicios(form),
    esS1(form.programa) ? buildManejoSintomas() : '',
    `</div>`,
    buildAlertasSuplementacion(form),
    buildNotaMedica(form),
    `<div style="page-break-before:always;">`,
    buildTablaProgreso(form),
    `</div>`,
    // 12 hojas semanales
    ...Array.from({ length: 12 }, (_, i) =>
      `<div style="page-break-before:always;">${buildHojaSemanal(i + 1, form)}</div>`
    ),
    buildFooter(),
  ].filter(Boolean);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Kit del Paciente — ${nombre}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'DM Sans', Arial, Helvetica, sans-serif;
      background: #fff;
      color: #111827;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      color-adjust: exact;
    }
    @page {
      size: A4 portrait;
      margin: 12mm 16mm 14mm;
    }
    @media print {
      body { margin: 0; }
      .no-print { display: none !important; }
    }
    .wrapper {
      max-width: 800px;
      margin: 0 auto;
      padding: 0;
    }
    @keyframes none {}
  </style>
</head>
<body>
<div class="wrapper">
  ${sections.join('\n')}
</div>
<div class="no-print" style="position:fixed;bottom:20px;right:20px;">
  <button onclick="window.print()" style="background:#12C49A;color:#fff;border:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;">
    🖨️ Imprimir / Guardar PDF
  </button>
</div>
</body>
</html>`;
}

// ─── FUNCIÓN PRINCIPAL EXPORT ─────────────────────────────────────────────────
export interface GenKitOpts {
  leadId?:   string;
  hcId?:     string;
  onSaved?:  (url: string) => void;
  onError?:  () => void;
}

export async function generarKitPaciente(
  form: HistoriaClinicaForm,
  opts: GenKitOpts = {},
): Promise<void> {
  const html = buildKitPacienteHTML(form);

  const win = window.open('', '_blank', 'width=960,height=1200');
  if (!win) {
    alert('Activa las ventanas emergentes en tu navegador para generar el Kit.');
    return;
  }
  win.document.write(html);
  win.document.close();
  win.onload = () => { win.focus(); win.print(); };

  if (opts.leadId) {
    const n = `${form.nombres || 'Paciente'} ${form.apellidos || ''}`.trim();
    const nombreDoc = `Kit del Paciente — ${n}`;
    const resultado = await subirSoporteHTML(
      opts.leadId, nombreDoc, 'kit_paciente', html, opts.hcId,
    );
    if (resultado) {
      opts.onSaved?.(resultado.url);
    } else {
      opts.onError?.();
    }
  }
}
