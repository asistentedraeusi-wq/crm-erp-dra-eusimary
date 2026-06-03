export type Regimen = 'Contributivo' | 'Subsidiado' | 'Particular / Privado' | 'Especial';

export interface ResultadoExamen {
  valor:  string;
  unidad: string;
  estado: '' | 'normal' | 'anormal' | 'critico';
  obs:    string;
}

export type Sexo = 'Femenino' | 'Masculino';
export type Modalidad = 'presencial' | 'telemedicina';
export type SexoBiologico = 'F' | 'M';

export interface HistoriaClinicaForm {
  // S01 — Identificacion
  nombres:        string;
  apellidos:      string;
  cc:             string;
  tipo_doc:       string;
  fecha_nac:      string;
  edad:           string;
  sexo:           Sexo | '';
  estado_civil:   string;
  escolaridad:    string;
  ocupacion:      string;
  ciudad:         string;
  direccion:      string;
  telefono:       string;
  email:          string;
  eps:            string;
  regimen:        Regimen | '';

  // S02 — Consulta
  fecha_consulta: string;
  tipo_consulta:  string;
  programa:       'control_metabolico' | 'bienestar_integral' | 'consulta_filtro' | 'pendiente' | '';
  num_hc:         string;
  motivo:         string;

  // S03 — Antecedentes
  ant_pers:       string[];
  ant_pers_obs:   string;
  ant_fam:        string[];
  ant_fam_obs:    string;
  meds:           string[];
  meds_obs:       string;
  alergias:       string;

  // S04 — Habitos
  tabaco:         string;
  alcohol:        string;
  ejercicio:      string;
  sueno:          string;
  agua:           string;
  dieta:          string;

  // S05 — Ginecologico
  gineco:         boolean;
  ciclo:          string;
  fum:            string;
  g:              string;
  p:              string;
  c:              string;
  a:              string;
  anticonc:       string;

  // S06 — Sintomas
  sintomas:       string[];
  sint_obs:       string;

  // S07 — Examen Fisico
  modalidad:      Modalidad;
  // Presencial
  peso:           string;
  talla:          string;
  imc:            string;
  peri_abd:       string;
  pa:             string;
  fc:             string;
  temp:           string;
  sato2:          string;
  fr:             string;
  grasa:          string;
  grasa_kg:       string;
  muscular:       string;
  magra_kg:       string;
  agua_total:     string;
  fat_range:      string;
  ef_obs:         string;
  // Telemedicina (inputs)
  tp:             string;
  th:             string;
  ta:             string;
  ts:             SexoBiologico;
  tw:             string;
  thip:           string;
  tn:             string;
  tc:             string;

  // S08 — Diagnostico
  dx1:            string;
  cie1:           string;
  dx2:            string;
  cie2:           string;

  // S09 — Paraclínicos
  examenes:       string[];
  exam_otro:      string;
  instr_lab:      string;

  // S09b — Resultados de Laboratorio (2da Cita)
  res_fecha:      string;
  res_estado:     '' | 'pendientes' | 'parciales' | 'completos';
  res_obs:        string;
  res_archivo_url: string;
  res_valores:    Record<string, ResultadoExamen>;

  // S10 — Plan de Manejo
  med_nombre:     string;
  dosis:          string;
  frecuencia:     string;
  plan_nf:        string;
  nutricion:      string;
  actividad:      string;
  metas:          string;
  proxima:        string;

  // S11 — Consentimientos
  consent_habeas: boolean;
  consent_med:    boolean;

  // S12 — Notas medico
  notas:          string;
}

export interface HistoriaClinicaDB {
  id:             string;
  created_at:     string;
  updated_at:     string;
  datos:          HistoriaClinicaForm;
  paciente_cc:    string;
  fecha_consulta: string;
  programa:       string;
  profesional_id: string;
}

export interface ResultadosComposicion {
  bmi:         number;
  bmiCat:      [string, string];
  bf:          number;
  bfCat:       [string, string];
  navy:        number | null;
  deur:        number | null;
  fkg:         number;
  lkg:         number;
  lpct:        number;
  wtr:         number;
  wth:         number;
  wthCat:      [string, string];
  wr:          string;
  wrColor:     string;
  optRange:    string;
  fatToLose:   number | null;
  weeksToGoal: number | null;
}
