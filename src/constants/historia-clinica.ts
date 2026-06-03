export const EXAMENES_PARACLÍNICOS = [
  { id: 'hemograma',    label: 'Hemograma completo (con diferencial)' },
  { id: 'glucemia',     label: 'Glucemia en ayunas (Glicemia basal)' },
  { id: 'lipidos',      label: 'Perfil Lipidico Completo (Col. Total, LDL, HDL, TG)' },
  { id: 'acido_urico',  label: 'Acido Urico serico' },
  { id: 'hba1c',        label: 'Hemoglobina Glicosilada (HbA1c)' },
  { id: 'tiroideo',     label: 'Perfil Tiroideo (TSH, T4L, T3L)' },
  { id: 'proteina',     label: 'Proteina Total Serica' },
  { id: 'albumina',     label: 'Albumina Serica' },
  { id: 'bilirrubinas', label: 'Bilirrubinas (Total, Directa, Indirecta)' },
  { id: 'hepaticas',    label: 'Enzimas Hepaticas (ALT, AST, Fosfatasa Alc.)' },
  { id: 'calcio',       label: 'Calcio Serico' },
  { id: 'insulina',     label: 'Insulina en ayunas (HOMA-IR)' },
  { id: 'cortisol',     label: 'Cortisol basal (8am)' },
  { id: 'vit_d',        label: 'Vitamina D (25-OH)' },
  { id: 'vit_b12',      label: 'Vitamina B12 serica' },
  { id: 'ferritina',    label: 'Ferritina serica' },
  { id: 'hierro',       label: 'Hierro serico y TIBC' },
  { id: 'creatinina',   label: 'Creatinina serica y BUN (Funcion renal)' },
  { id: 'pcr',          label: 'Proteina C Reactiva Ultrasensible (PCR-us)' },
  { id: 'orina',        label: 'Uroanalis completo (Parcial de orina)' },
  { id: 'ecg',          label: 'Electrocardiograma 12 derivaciones (ECG)' },
  { id: 'eco_abd',      label: 'Ecografia abdominal total' },
  { id: 'dexa',         label: 'Densitometria osea (DEXA)' },
] as const;

export const ANTECEDENTES_PERSONALES = [
  'Hipertension arterial', 'Diabetes Mellitus tipo 2', 'Dislipidemia',
  'Hipotiroidismo', 'Hipertiroidismo', 'Sindrome ovario poliquistico',
  'Apnea del sueno', 'Higado graso (EHNA)', 'Enfermedad cardiovascular',
  'Enfermedad renal cronica', 'Asma / EPOC', 'Ansiedad / Depresion',
  'Cancer (especificar)', 'Cirugias previas', 'Pancreatitis',
] as const;

export const ANTECEDENTES_FAMILIARES = [
  'Obesidad', 'Diabetes Mellitus tipo 2', 'Hipertension arterial',
  'Enfermedad cardiovascular', 'Cancer de tiroides', 'Cancer de pancreas',
  'Dislipidemia', 'Hipotiroidismo',
] as const;

export const MEDICAMENTOS = [
  'Metformina', 'Insulina', 'Levotiroxina', 'Antihipertensivos',
  'Estatinas', 'Anticonceptivos orales', 'Ansioliticos/Antidepresivos',
  'Corticoides', 'Ninguno',
] as const;

export const SINTOMAS = [
  'Aumento de peso progresivo', 'Dificultad para perder peso',
  'Fatiga / Cansancio cronico', 'Ansiedad por comer / Atracones',
  'Polidipsia (sed excesiva)', 'Poliuria (orinar frecuente)',
  'Ronquidos / Apnea', 'Dolor articular', 'Reflujo gastroesofagico',
  'Irregularidades menstruales', 'Caida de cabello', 'Insomnio',
  'Palpitaciones', 'Disnea al esfuerzo',
] as const;

export const HABITOS_CONFIG = [
  {
    key: 'tabaco' as const,
    label: 'Tabaquismo',
    opciones: ['No fumador', 'Ex-fumador', 'Fumador < 10 cig/dia', 'Fumador >= 10 cig/dia'],
  },
  {
    key: 'alcohol' as const,
    label: 'Alcohol',
    opciones: ['No consume', 'Consumo ocasional', 'Consumo moderado', 'Consumo frecuente (diario)'],
  },
  {
    key: 'ejercicio' as const,
    label: 'Actividad Fisica',
    opciones: ['Sedentario', 'Leve 1-2 veces/sem', 'Moderada 3-4 veces/sem', 'Intensa 5+ veces/sem', 'Atleta competitivo'],
  },
  {
    key: 'sueno' as const,
    label: 'Calidad del Sueno',
    opciones: ['Bueno (7-9h)', 'Regular (6-7h)', 'Malo (< 6h)', 'Insomnio diagnosticado'],
  },
  {
    key: 'agua' as const,
    label: 'Consumo Agua/dia',
    opciones: ['Menos de 1 litro', '1 - 1.5 litros', '1.5 - 2 litros', 'Mas de 2 litros'],
  },
  {
    key: 'dieta' as const,
    label: 'Patron Alimentario',
    opciones: ['Omnivoro', 'Vegetariano', 'Vegano', 'Keto / Low carb', 'Ayuno intermitente 16:8', 'Sin patron definido'],
  },
] as const;

export const PROGRAMAS = [
  { value: 'control_metabolico', label: 'Control Metabolico Premium (GLP-1 / Wegovy) — $500.000/trimestre' },
  { value: 'bienestar_integral', label: 'Bienestar Integral (No farmacologico) — $250.000/trimestre' },
  { value: 'consulta_filtro',    label: 'Consulta Filtro / Primera Evaluacion — $70.000' },
  { value: 'pendiente',          label: 'Pendiente de definicion clinica' },
] as const;

export const TIPOS_CONSULTA = [
  'Primera Consulta / Filtro',
  'Control Mes 1',
  'Control Mes 2',
  'Control Mes 3',
  'Consulta de Urgencia',
  'Control por laboratorio',
] as const;

export const CIE10_FRECUENTES = [
  { code: 'E66',    desc: 'Obesidad' },
  { code: 'E66.01', desc: 'Obesidad por exceso de calorias' },
  { code: 'E11',    desc: 'Diabetes Mellitus tipo 2' },
  { code: 'E78',    desc: 'Hiperlipidemia' },
  { code: 'E03.9',  desc: 'Hipotiroidismo no especificado' },
  { code: 'E28.2',  desc: 'Sindrome de ovario poliquistico' },
  { code: 'I10',    desc: 'Hipertension esencial (primaria)' },
  { code: 'K76.0',  desc: 'Higado graso no clasificado' },
  { code: 'G47.3',  desc: 'Apnea del sueno' },
  { code: 'Z71.3',  desc: 'Consulta de nutricion y dietetica' },
] as const;

export const TIPOS_DOC = ['Cedula de Ciudadania', 'Cedula Extranjeria', 'Pasaporte', 'Tarjeta de Identidad'] as const;
export const ESTADOS_CIVILES = ['Soltero/a', 'Casado/a', 'Union libre', 'Divorciado/a', 'Viudo/a'] as const;
export const ESCOLARIDADES = ['Primaria', 'Secundaria', 'Tecnico/Tecnologo', 'Universitario', 'Postgrado'] as const;
export const REGIMENES = ['Contributivo', 'Subsidiado', 'Particular / Privado', 'Especial'] as const;
