import { toast } from 'sonner';
import type { HistoriaClinicaForm } from '../../../types/historia-clinica';
import { useLeads } from '../../../context/LeadsContext';
import { supabase } from '../../../lib/supabase';
import { generarFormulaMedica, buildFormulaMedicaHTML } from '../../../lib/generarFormulaMedica';
import { subirSoporteHTML } from '../../../lib/soportes';
import SectionHeader from '../ui/SectionHeader';
import FormField from '../ui/FormField';

const INPUT: React.CSSProperties = {
  height: '40px', borderRadius: '8px', border: '1px solid #E5E7EB',
  padding: '0 12px', fontSize: '13px', color: '#111827', background: '#fff',
  width: '100%', boxSizing: 'border-box', outline: 'none',
};

const TEXTAREA: React.CSSProperties = {
  borderRadius: '8px', border: '1px solid #E5E7EB', padding: '10px 12px',
  fontSize: '13px', color: '#111827', background: '#fff',
  width: '100%', boxSizing: 'border-box', outline: 'none',
  resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.5',
};

const SELECT: React.CSSProperties = {
  ...INPUT, cursor: 'pointer', appearance: 'none' as const,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: '32px',
};

interface Props {
  form: HistoriaClinicaForm;
  set: (k: keyof HistoriaClinicaForm, v: string | string[]) => void;
  leadId?: string;
}

// ─── Opciones de los selectores del Kit ──────────────────────────────────────

const PLANES_BASE = [
  { value: 'bajo-ig',           label: 'Bajo Índice Glicémico' },
  { value: 'cetogenico',        label: 'Cetogénico / Low Carb' },
  { value: 'mediterraneo',      label: 'Mediterráneo' },
  { value: 'bajo-carbohidratos',label: 'Bajo en Carbohidratos' },
  { value: 'proteina-alta',     label: 'Alto en Proteínas' },
];

const PROTEINAS = [
  'Pollo', 'Pavo', 'Res magra', 'Pescado azul', 'Atún', 'Camarón',
  'Huevo entero', 'Clara de huevo', 'Cerdo magro', 'Queso blanco',
  'Yogur griego', 'Tofu',
];

const VEGETALES = [
  'Espinaca', 'Brócoli', 'Coliflor', 'Lechuga', 'Pepino', 'Tomate',
  'Pimentón', 'Cebolla', 'Repollo', 'Calabacín', 'Berenjena',
  'Apio', 'Zanahoria', 'Espárrago',
];

const RESTRICCIONES = [
  'Arroz blanco', 'Pan', 'Pasta', 'Azúcar', 'Jugos', 'Gaseosas',
  'Alcohol', 'Frituras', 'Ultra-procesados', 'Embutidos',
  'Harinas refinadas', 'Miel', 'Dulces',
];

const SNACKS = [
  'Maní 25g', 'Almendras 20g', 'Huevos duros', 'Yogur griego sin azúcar',
  'Apio con hummus', 'Queso cottage', 'Nueces 15g', 'Pepino con limón',
];

const TIPOS_AEROBICO = [
  'Caminata', 'Trote ligero', 'Bicicleta', 'Natación', 'Baile', 'Elíptica', 'Cardio funcional',
];

const NIVELES_FUERZA = [
  { value: 'inicial',    label: 'Inicial — Sedentario total' },
  { value: 'intermedio', label: 'Intermedio — Algo de actividad' },
  { value: 'avanzado',   label: 'Avanzado — Entrenado' },
  { value: 'no_aplica',  label: 'No aplica' },
];

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const SUPLEMENTACION = [
  'Vitamina D3', 'Omega 3', 'Magnesio Glicinato', 'Zinc', 'Vitamina B12',
  'Berberina', 'Cromo', 'Probióticos', 'Coenzima Q10', 'L-Carnitina',
  'Colágeno hidrolizado', 'Hierro', 'Ácido Fólico',
];

const ALERTAS = [
  'Monitorear glucemia', 'Reportar náuseas', 'Evitar ayuno > 12h',
  'Tomar con comida', 'Hidratación estricta', 'Evitar alcohol',
  'Reportar dolor abdominal', 'Control PA diario', 'Reportar palpitaciones',
  'Evitar sol intenso',
];

const MESES_TITULACION = [
  { value: '1', label: 'Mes 1 — 0.25 mg/semana' },
  { value: '2', label: 'Mes 2 — 0.5 mg/semana' },
  { value: '3', label: 'Mes 3 — 1.0 mg/semana' },
];

const MEDICAMENTOS_LISTA = [
  { label: 'Semaglutida 0.25 mg/dosis — Ozempic® (inyectable semanal)',      nombre: 'Semaglutida 0.25 mg/dosis (Ozempic®) — Solución inyectable subcutánea, pluma precargada 1.5 mL. Aplicación semanal el mismo día de la semana.' },
  { label: 'Semaglutida 0.5 mg/dosis — Ozempic® (inyectable semanal)',       nombre: 'Semaglutida 0.5 mg/dosis (Ozempic®) — Solución inyectable subcutánea, pluma precargada 1.5 mL. Aplicación semanal el mismo día de la semana.' },
  { label: 'Semaglutida 1.0 mg/dosis — Ozempic® (inyectable semanal)',       nombre: 'Semaglutida 1.0 mg/dosis (Ozempic®) — Solución inyectable subcutánea, pluma precargada 3 mL. Aplicación semanal el mismo día de la semana.' },
  { label: 'Semaglutida 0.25 mg/dosis — Wegovy® (inyectable semanal)',       nombre: 'Semaglutida 0.25 mg/dosis (Wegovy®) — Solución inyectable subcutánea, pluma precargada. Aplicación semanal el mismo día de la semana.' },
  { label: 'Semaglutida 0.50 mg/dosis — Wegovy® (inyectable semanal)',       nombre: 'Semaglutida 0.50 mg/dosis (Wegovy®) — Solución inyectable subcutánea, pluma precargada. Aplicación semanal el mismo día de la semana.' },
  { label: 'Semaglutida 1.0 mg/dosis — Wegovy® (inyectable semanal)',        nombre: 'Semaglutida 1.0 mg/dosis (Wegovy®) — Solución inyectable subcutánea, pluma precargada. Aplicación semanal el mismo día de la semana.' },
  { label: 'Semaglutida 2.4 mg/dosis — Wegovy® (inyectable semanal)',        nombre: 'Semaglutida 2.4 mg/dosis (Wegovy®) — Solución inyectable subcutánea, pluma precargada. Aplicación semanal el mismo día de la semana.' },
  { label: 'Liraglutida 1.2 mg/dosis — Saxenda® (inyectable diario)',        nombre: 'Liraglutida 1.2 mg/dosis (Saxenda®) — Solución inyectable subcutánea, pluma precargada 3 mL. Aplicación diaria a la misma hora.' },
  { label: 'Liraglutida 1.8 mg/dosis — Victoza® (inyectable diario)',        nombre: 'Liraglutida 1.8 mg/dosis (Victoza®) — Solución inyectable subcutánea, pluma precargada 3 mL. Aplicación diaria a la misma hora.' },
  { label: 'Tirzepatida 2.5 mg/dosis — Mounjaro® (inyectable semanal)',      nombre: 'Tirzepatida 2.5 mg/dosis (Mounjaro®) — Solución inyectable subcutánea, pluma precargada. Aplicación semanal el mismo día de la semana.' },
  { label: 'Tirzepatida 5 mg/dosis — Mounjaro® (inyectable semanal)',        nombre: 'Tirzepatida 5 mg/dosis (Mounjaro®) — Solución inyectable subcutánea, pluma precargada. Aplicación semanal el mismo día de la semana.' },
  { label: 'Tirzepatida 10 mg/dosis — Mounjaro® (inyectable semanal)',       nombre: 'Tirzepatida 10 mg/dosis (Mounjaro®) — Solución inyectable subcutánea, pluma precargada. Aplicación semanal el mismo día de la semana.' },
  { label: 'Metformina 500 mg — tableta (vía oral)',                          nombre: 'Metformina Clorhidrato 500 mg — Tableta de liberación inmediata. Administrar con alimentos para reducir efectos gastrointestinales.' },
  { label: 'Metformina 850 mg — tableta (vía oral)',                          nombre: 'Metformina Clorhidrato 850 mg — Tableta de liberación inmediata. Administrar con alimentos para reducir efectos gastrointestinales.' },
  { label: 'Metformina XR 1000 mg — tableta liberación prolongada',          nombre: 'Metformina Clorhidrato 1000 mg XR — Tableta de liberación prolongada. Administrar con la cena. No partir ni triturar.' },
  { label: 'Empagliflozina 10 mg — Jardiance® (vía oral)',                   nombre: 'Empagliflozina 10 mg (Jardiance®) — Tableta. Administrar vía oral, una vez al día con o sin alimentos.' },
  { label: 'Empagliflozina 25 mg — Jardiance® (vía oral)',                   nombre: 'Empagliflozina 25 mg (Jardiance®) — Tableta. Administrar vía oral, una vez al día con o sin alimentos.' },
  { label: 'Levotiroxina 25 mcg — (vía oral)',                               nombre: 'Levotiroxina Sódica 25 mcg — Tableta. Administrar en ayunas, 30 minutos antes del desayuno.' },
  { label: 'Levotiroxina 50 mcg — (vía oral)',                               nombre: 'Levotiroxina Sódica 50 mcg — Tableta. Administrar en ayunas, 30 minutos antes del desayuno.' },
  { label: 'Levotiroxina 100 mcg — (vía oral)',                              nombre: 'Levotiroxina Sódica 100 mcg — Tableta. Administrar en ayunas, 30 minutos antes del desayuno.' },
];

// ─── Sub-componentes internos ─────────────────────────────────────────────────

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>
      {children}
    </p>
  );
}

function ChipGroup({ items, selected, onChange }: {
  items: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  function toggle(item: string) {
    onChange(selected.includes(item) ? selected.filter(s => s !== item) : [...selected, item]);
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
      {items.map(item => {
        const active = selected.includes(item);
        return (
          <button key={item} type="button" onClick={() => toggle(item)} style={{
            padding: '5px 12px', borderRadius: '20px',
            border: active ? '1.5px solid #12C49A' : '1px solid #E5E7EB',
            background: active ? '#E6FAF5' : '#F9FAFB',
            fontSize: '12px', fontWeight: active ? 700 : 400,
            color: active ? '#0A3D2E' : '#6B7280',
            cursor: 'pointer', transition: 'all 120ms', lineHeight: '1',
          }}>
            {item}
          </button>
        );
      })}
    </div>
  );
}

function KitBlock({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{ border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden' }}>
      <div style={{ background: '#F0FBF7', borderBottom: '1px solid #D1FAE5', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '14px' }}>{icon}</span>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#0A3D2E', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</span>
      </div>
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {children}
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function S10_PlanManejo({ form, set, leadId }: Props) {
  const esS1 = form.programa === 'control_metabolico';
  const { leads } = useLeads();

  async function handleGenerarFormula() {
    generarFormulaMedica(form);

    if (!leadId) return;

    const lead      = leads.find(l => l.id === leadId);
    const nombre    = [form.nombres, form.apellidos].filter(Boolean).join(' ') || lead?.name || '';
    const logoUrl   = 'https://draeusimary.netlify.app/logo-dra-eusimary.jpg';
    const htmlContent = buildFormulaMedicaHTML(form, logoUrl)
      .replace('<script>window.onload = function(){ window.print(); }</script>', '');

    await subirSoporteHTML(leadId, `Fórmula Médica — ${nombre || 'Paciente'}`, 'formula_medica', htmlContent);
    toast.success('Fórmula generada · Guardada en Soportes y enviada al paciente');

    if (supabase && lead?.email) {
      supabase.functions.invoke('notify-formula-medica', {
        body: { email: lead.email, nombre, htmlContent },
      }).catch((err: unknown) => console.warn('notify-formula-medica:', err));
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <SectionHeader number={13} title="Plan de Manejo" />

      {/* ── Medicación farmacológica ── */}
      <div style={{ padding: '14px', background: '#F9FAFB', borderRadius: '10px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <SubLabel>Medicación farmacológica</SubLabel>

        {/* Selector + Dosis + Frecuencia */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '14px' }}>
          <FormField label="Medicamento (seleccionar de la lista)">
            <select
              style={SELECT}
              value={form.med_nombre}
              onChange={e => set('med_nombre', e.target.value)}
            >
              <option value="">— Seleccionar medicamento —</option>
              {MEDICAMENTOS_LISTA.map(m => (
                <option key={m.nombre} value={m.nombre}>{m.label}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Dosis">
            <input style={INPUT} value={form.dosis} onChange={e => set('dosis', e.target.value)}
              placeholder="Ej: 0.25 mg" />
          </FormField>
          <FormField label="Frecuencia">
            <input style={INPUT} value={form.frecuencia} onChange={e => set('frecuencia', e.target.value)}
              placeholder="Ej: 1 vez/semana" />
          </FormField>
        </div>

        {/* Medicamento libre (no está en la lista) */}
        <FormField label="Otro medicamento (escribir si no está en la lista)">
          <input
            style={INPUT}
            value={form.med_otro ?? ''}
            onChange={e => set('med_otro', e.target.value)}
            placeholder="Nombre completo del medicamento adicional, dosis y vía de administración..."
          />
        </FormField>

        {/* Botón Generar Orden Médica */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={handleGenerarFormula}
            disabled={!form.med_nombre && !form.med_otro}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              height: '40px', padding: '0 20px', borderRadius: '10px',
              background: (form.med_nombre || form.med_otro) ? '#0A3D2E' : '#E5E7EB',
              color: (form.med_nombre || form.med_otro) ? '#fff' : '#9CA3AF',
              fontWeight: 700, fontSize: '13px', border: 'none',
              cursor: (form.med_nombre || form.med_otro) ? 'pointer' : 'not-allowed',
              boxShadow: (form.med_nombre || form.med_otro) ? '0 2px 10px rgba(10,61,46,0.25)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: '16px' }}>℞</span>
            Generar Orden Médica
          </button>
        </div>
      </div>

      {/* ── Plan no farmacológico (texto libre para HC) ── */}
      <FormField label="Plan no farmacológico">
        <textarea style={TEXTAREA} rows={2} value={form.plan_nf}
          onChange={e => set('plan_nf', e.target.value)}
          placeholder="Intervenciones sin medicamentos: suplementación, cambios de hábitos, etc." />
      </FormField>

      {/* ── Metas terapéuticas ── */}
      <FormField label="Metas terapéuticas">
        <textarea style={TEXTAREA} rows={2} value={form.metas}
          onChange={e => set('metas', e.target.value)}
          placeholder="Objetivos clínicos a 1, 3 y 6 meses: peso meta, HbA1c, etc." />
      </FormField>

      {/* ── Próxima cita ── */}
      <FormField label="Próxima cita / Control">
        <input style={INPUT} type="date" value={form.proxima} onChange={e => set('proxima', e.target.value)} />
      </FormField>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* KIT DEL PACIENTE — datos estructurados                        */}
      {/* ══════════════════════════════════════════════════════════════ */}

      <div style={{ background: 'linear-gradient(135deg, #E6FAF5, #FFF8E7)', border: '1.5px solid #12C49A44', borderRadius: '12px', padding: '4px 16px 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 0 10px' }}>
          <span style={{ fontSize: '18px' }}>🩺</span>
          <div>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 800, color: '#0A3D2E', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Kit del Paciente — Datos estructurados
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: '#6B7280' }}>
              Completa para generar el documento personalizado del programa
            </p>
          </div>
        </div>
      </div>

      {/* Mes de titulación — solo S1 */}
      {esS1 && (
        <div style={{ padding: '14px', background: '#FFFBF0', borderRadius: '10px', border: '1px solid #FCD34D44' }}>
          <SubLabel>Mes de titulación GLP-1 actual</SubLabel>
          <div style={{ display: 'flex', gap: '8px' }}>
            {MESES_TITULACION.map(m => {
              const active = form.pm_mes_titulacion === m.value;
              return (
                <button key={m.value} type="button" onClick={() => set('pm_mes_titulacion', m.value)} style={{
                  flex: 1, padding: '10px', borderRadius: '8px',
                  border: active ? '2px solid #D97706' : '1px solid #E5E7EB',
                  background: active ? '#FEF3C7' : '#fff',
                  fontSize: '12px', fontWeight: active ? 700 : 400,
                  color: active ? '#92400E' : '#6B7280', cursor: 'pointer',
                  transition: 'all 120ms', textAlign: 'center',
                }}>
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Plan nutricional base */}
      <KitBlock title="Plan Nutricional" icon="🥗">
        <FormField label="Plan base">
          <select style={SELECT} value={form.pm_plan_base} onChange={e => set('pm_plan_base', e.target.value)}>
            <option value="">— Seleccionar plan —</option>
            {PLANES_BASE.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </FormField>

        <div>
          <SubLabel>Proteínas recomendadas</SubLabel>
          <ChipGroup items={PROTEINAS} selected={form.pm_proteinas ?? []} onChange={v => set('pm_proteinas', v)} />
        </div>

        <div>
          <SubLabel>Vegetales prioritarios</SubLabel>
          <ChipGroup items={VEGETALES} selected={form.pm_vegetales ?? []} onChange={v => set('pm_vegetales', v)} />
        </div>

        <div>
          <SubLabel>Restricciones alimentarias</SubLabel>
          <ChipGroup items={RESTRICCIONES} selected={form.pm_restricciones ?? []} onChange={v => set('pm_restricciones', v)} />
        </div>

        <div>
          <SubLabel>Snacks permitidos</SubLabel>
          <ChipGroup items={SNACKS} selected={form.pm_snacks ?? []} onChange={v => set('pm_snacks', v)} />
        </div>

        <div>
          <SubLabel>Meta de hidratación</SubLabel>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[['8','8 vasos · 2 L'],['10','10 vasos · 2.5 L'],['12','12 vasos · 3 L'],['15','15 vasos · 3.75 L']].map(([v,l]) => {
              const active = form.pm_hidratacion === v;
              return (
                <button key={v} type="button" onClick={() => set('pm_hidratacion', v)} style={{
                  flex: 1, padding: '8px', borderRadius: '8px',
                  border: active ? '2px solid #12C49A' : '1px solid #E5E7EB',
                  background: active ? '#E6FAF5' : '#fff',
                  fontSize: '11px', fontWeight: active ? 700 : 400,
                  color: active ? '#0A3D2E' : '#6B7280', cursor: 'pointer',
                  transition: 'all 120ms', textAlign: 'center',
                }}>
                  {l}
                </button>
              );
            })}
          </div>
        </div>
      </KitBlock>

      {/* Plan de ejercicios */}
      <KitBlock title="Plan de Ejercicios" icon="🏃">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <FormField label="Tipo aeróbico">
            <select style={SELECT} value={form.pm_tipo_aerobico} onChange={e => set('pm_tipo_aerobico', e.target.value)}>
              <option value="">— Seleccionar —</option>
              {TIPOS_AEROBICO.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </FormField>
          <FormField label="Minutos / sesión">
            <select style={SELECT} value={form.pm_minutos_sesion} onChange={e => set('pm_minutos_sesion', e.target.value)}>
              <option value="">— Seleccionar —</option>
              {['20','30','40','45','60'].map(m => <option key={m} value={m}>{m} min</option>)}
            </select>
          </FormField>
          <FormField label="Días / semana">
            <select style={SELECT} value={form.pm_dias_aerobico} onChange={e => set('pm_dias_aerobico', e.target.value)}>
              <option value="">— Seleccionar —</option>
              {['3','4','5','6'].map(d => <option key={d} value={d}>{d} días</option>)}
            </select>
          </FormField>
        </div>

        <FormField label="Nivel entrenamiento de fuerza">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {NIVELES_FUERZA.map(n => {
              const active = form.pm_nivel_fuerza === n.value;
              return (
                <button key={n.value} type="button" onClick={() => set('pm_nivel_fuerza', n.value)} style={{
                  flex: 1, minWidth: '130px', padding: '8px 10px', borderRadius: '8px',
                  border: active ? '2px solid #12C49A' : '1px solid #E5E7EB',
                  background: active ? '#E6FAF5' : '#fff',
                  fontSize: '11px', fontWeight: active ? 700 : 400,
                  color: active ? '#0A3D2E' : '#6B7280', cursor: 'pointer',
                  transition: 'all 120ms', textAlign: 'center',
                }}>
                  {n.label}
                </button>
              );
            })}
          </div>
        </FormField>

        <div>
          <SubLabel>Días de entrenamiento de fuerza</SubLabel>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {DIAS_SEMANA.map(dia => {
              const active = (form.pm_dias_fuerza ?? []).includes(dia);
              return (
                <button key={dia} type="button" onClick={() => {
                  const prev = form.pm_dias_fuerza ?? [];
                  set('pm_dias_fuerza', active ? prev.filter(d => d !== dia) : [...prev, dia]);
                }} style={{
                  padding: '6px 12px', borderRadius: '20px',
                  border: active ? '1.5px solid #12C49A' : '1px solid #E5E7EB',
                  background: active ? '#E6FAF5' : '#F9FAFB',
                  fontSize: '12px', fontWeight: active ? 700 : 400,
                  color: active ? '#0A3D2E' : '#6B7280', cursor: 'pointer',
                  transition: 'all 120ms',
                }}>
                  {dia.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>
      </KitBlock>

      {/* Suplementación & Alertas */}
      <KitBlock title="Suplementación & Alertas" icon="💊">
        <div>
          <SubLabel>Suplementación indicada</SubLabel>
          <ChipGroup items={SUPLEMENTACION} selected={form.pm_suplementacion ?? []} onChange={v => set('pm_suplementacion', v)} />
        </div>

        <div>
          <SubLabel>Alertas especiales</SubLabel>
          <ChipGroup items={ALERTAS} selected={form.pm_alertas ?? []} onChange={v => set('pm_alertas', v)} />
        </div>

        <FormField label="Nota médica personalizada para el kit">
          <textarea style={TEXTAREA} rows={3} value={form.pm_nota_medica}
            onChange={e => set('pm_nota_medica', e.target.value)}
            placeholder="Mensaje personalizado de la Dra. para este paciente (aparecerá en el Kit)..." />
        </FormField>
      </KitBlock>

    </div>
  );
}
