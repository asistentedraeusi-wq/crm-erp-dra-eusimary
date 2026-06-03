import type { ResultadosComposicion } from '../../types/historia-clinica';

interface InputsCalc {
  peso:        number;
  talla:       number;
  edad:        number;
  sexo:        'F' | 'M';
  cintura:     number;
  cadera:      number;
  cuello:      number;
  pantorrilla?: number;
}

export function calcularComposicion(inputs: InputsCalc): ResultadosComposicion | null {
  const { peso, talla, edad, sexo, cintura, cadera, cuello } = inputs;

  const esValido = peso > 0 && talla > 0 && cintura > 0 && cuello > 0 &&
    (sexo === 'M' || cadera > 0);
  if (!esValido) return null;

  // IMC
  const bmi = peso / Math.pow(talla / 100, 2);
  const bmiCat = getBMICat(bmi);

  // % Grasa US Navy (Hodgdon & Beckett 1984)
  let navy: number | null = null;
  try {
    if (sexo === 'M') {
      navy = 495 / (1.0324 - 0.19077 * Math.log10(cintura - cuello) + 0.15456 * Math.log10(talla)) - 450;
    } else {
      navy = 495 / (1.29579 - 0.35004 * Math.log10(cintura + cadera - cuello) + 0.22100 * Math.log10(talla)) - 450;
    }
    navy = Math.max(1, Math.min(70, navy));
    if (!isFinite(navy) || isNaN(navy)) navy = null;
  } catch { navy = null; }

  // % Grasa Deurenberg (1991)
  let deur: number | null = null;
  if (edad > 0) {
    deur = 1.20 * bmi + 0.23 * edad - 10.8 * (sexo === 'M' ? 1 : 0) - 5.4;
    deur = Math.max(1, Math.min(70, deur));
  }

  // % Grasa promedio
  const bf = navy != null
    ? (deur != null ? (navy + deur) / 2 : navy)
    : deur;
  if (!bf) return null;

  const bfCat = getBFCat(bf, sexo);

  // Composicion corporal
  const fkg  = peso * bf / 100;
  const lkg  = peso - fkg;
  const lpct = 100 - bf;
  const wtr  = lkg * 0.73;

  // Indices
  const wth    = cintura / talla;
  const wthCat = getWTHCat(wth);
  const riskLimits = sexo === 'M' ? [94, 102] : [80, 88];
  const wr = cintura < riskLimits[0] ? 'Bajo' : cintura < riskLimits[1] ? 'Moderado' : 'Alto';
  const wrColor = cintura < riskLimits[0] ? '#2D6A4F' : cintura < riskLimits[1] ? '#B45309' : '#C0392B';

  // Meta
  const optRange    = sexo === 'F' ? '18-25' : '10-20';
  const optMax      = sexo === 'F' ? 0.25 : 0.20;
  const fatToLose   = bf > (optMax * 100) ? parseFloat((fkg - peso * (sexo === 'F' ? 0.22 : 0.175)).toFixed(1)) : null;
  const weeksToGoal = fatToLose ? Math.ceil(fatToLose / 0.6) : null;

  return {
    bmi: parseFloat(bmi.toFixed(1)),
    bmiCat,
    bf: parseFloat(bf.toFixed(1)),
    bfCat,
    navy: navy ? parseFloat(navy.toFixed(1)) : null,
    deur: deur ? parseFloat(deur.toFixed(1)) : null,
    fkg: parseFloat(fkg.toFixed(1)),
    lkg: parseFloat(lkg.toFixed(1)),
    lpct: parseFloat(lpct.toFixed(1)),
    wtr: parseFloat(wtr.toFixed(1)),
    wth: parseFloat(wth.toFixed(2)),
    wthCat,
    wr,
    wrColor,
    optRange,
    fatToLose,
    weeksToGoal,
  };
}

function getBMICat(bmi: number): [string, string] {
  if (bmi < 18.5) return ['Bajo peso', '#B45309'];
  if (bmi < 25)   return ['Normal', '#2D6A4F'];
  if (bmi < 30)   return ['Sobrepeso', '#B45309'];
  if (bmi < 35)   return ['Obesidad Grado I', '#C0392B'];
  return ['Obesidad Grado II-III', '#C0392B'];
}

function getBFCat(bf: number, sexo: 'F' | 'M'): [string, string] {
  if (sexo === 'F') {
    if (bf < 21) return ['Optimo atletico', '#2D6A4F'];
    if (bf < 25) return ['Rango saludable', '#2D6A4F'];
    if (bf < 32) return ['Sobrepeso graso', '#B45309'];
    return ['Obesidad', '#C0392B'];
  } else {
    if (bf < 14) return ['Optimo atletico', '#2D6A4F'];
    if (bf < 18) return ['Rango saludable', '#2D6A4F'];
    if (bf < 25) return ['Sobrepeso graso', '#B45309'];
    return ['Obesidad', '#C0392B'];
  }
}

function getWTHCat(wth: number): [string, string] {
  if (wth < 0.46) return ['Excelente', '#2D6A4F'];
  if (wth < 0.50) return ['Optimo', '#2D6A4F'];
  if (wth < 0.57) return ['Moderado', '#B45309'];
  return ['Alto', '#C0392B'];
}

export function getIMCInfo(imc: number): { label: string; color: string; programa?: string } | null {
  if (!imc || imc <= 0) return null;
  if (imc < 18.5) return { label: 'Bajo peso', color: '#3B82F6' };
  if (imc < 25)   return { label: 'Normal — No apto GLP-1', color: '#10B981' };
  if (imc < 27)   return { label: 'Sobrepeso leve — Evaluar Bienestar', color: '#F59E0B' };
  if (imc < 30)   return { label: 'Sobrepeso — Apto Programa Bienestar Integral', color: '#F97316', programa: 'bienestar_integral' };
  return { label: 'Obesidad — Apto Programa Control Metabolico', color: '#EF4444', programa: 'control_metabolico' };
}
