# PROMPT — Módulo "Kit para el Paciente" | CRM-ERP Dra. Eusimary Contreras

**Destinatario:** Agente Claude Code — Antigravity  
**Proyecto:** CRM-ERP Dra. Eusimary Contreras · Medicina Metabólica & Longevidad  
**Módulo:** Generador automático de Kit para el Paciente desde Historia Clínica  
**Versión:** 1.0 · Junio 2026  
**Elaborado por:** CAST Consultorías SAS

---

## 1. CONTEXTO DEL SISTEMA

Estás desarrollando el CRM-ERP de la **Dra. Eusimary Contreras Morales**, médica especialista en Medicina Metabólica & Longevidad, Barranquilla, Colombia.

El sistema tiene una entidad central: la **Historia Clínica del Paciente**, estructurada en módulos numerados. El módulo que nos ocupa es el **Punto 11 — Plan de Manejo**, donde la Dra. selecciona las recomendaciones clínicas personalizadas para ese paciente.

Al finalizar el Plan de Manejo, la Dra. presiona un botón **"🩺 Generar Kit para el Paciente"** que:

1. Lee todos los datos de la Historia Clínica de ese paciente en Supabase
2. Genera automáticamente un **Kit para el Paciente** en PDF (documento de ~15–20 páginas)
3. Descarga el PDF en el navegador del médico
4. Guarda el PDF en **Supabase Storage**
5. Adjunta el PDF automáticamente en la **tarjeta del Lead/Paciente**, en la pestaña **"Historial"**
6. Marca el kit como disponible para enviarse por WhatsApp/email al paciente

---

## 2. STACK TECNOLÓGICO

```
Frontend:     React 18 + TypeScript + Tailwind CSS
Framework:    Next.js 14 (App Router)
Base datos:   Supabase — PostgreSQL + Auth + Storage + Realtime
PDF:          @react-pdf/renderer v3+ (primera opción)
              Alternativa: API route /api/kit/generate con Puppeteer/Playwright
Email:        Brevo (transaccional) — ya integrado
WhatsApp:     WhatsApp Business API / Meta Cloud API
Estado:       Zustand o React Context (según arquitectura existente)
Deploy:       Vercel
```

**Decisión de PDF:** Usar `@react-pdf/renderer` como primera opción por su integración nativa con React y server-side rendering sin browser. Si la complejidad visual de las 12 hojas de seguimiento supera lo que react-pdf maneja bien, escalar a Puppeteer en una API route de Next.js que renderiza el componente React como HTML y lo convierte a PDF via `puppeteer.page.pdf()`.

---

## 3. ESTRUCTURA DE BASE DE DATOS (SUPABASE)

### Tablas relevantes (ya existentes o a crear):

```sql
-- Tabla principal de pacientes/leads
leads (
  id UUID PRIMARY KEY,
  nombre_completo TEXT,
  cc TEXT,
  fecha_nacimiento DATE,
  sexo TEXT,
  email TEXT,
  whatsapp TEXT,
  programa TEXT, -- 'S1' | 'S2'
  fecha_valoracion DATE,
  proximo_control DATE,
  created_at TIMESTAMPTZ
)

-- Historia clínica
historia_clinica (
  id UUID PRIMARY KEY,
  lead_id UUID REFERENCES leads(id),
  -- Punto 2: Composición corporal
  peso DECIMAL,
  talla DECIMAL,
  imc DECIMAL,
  pct_grasa DECIMAL,
  kg_grasa DECIMAL,
  pct_masa_magra DECIMAL,
  kg_masa_magra DECIMAL,
  agua_litros DECIMAL,
  cintura_cm DECIMAL,
  cadera_cm DECIMAL,
  cuello_cm DECIMAL,
  pantorrilla_cm DECIMAL,
  presion_arterial TEXT,
  rango_grasa_optima TEXT,
  metodo_composicion TEXT, -- 'impedancia' | 'telemedicina'
  -- Comorbilidades
  comorbilidades JSONB, -- array de strings
  -- Programa
  programa TEXT,
  mes_titulacion TEXT, -- '1' | '2' | '3'
  proximo_control DATE,
  -- Punto 11: Plan de Manejo (selecciones de la Dra.)
  plan_manejo JSONB, -- objeto con todas las selecciones
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Kits generados (historial)
kits_paciente (
  id UUID PRIMARY KEY,
  lead_id UUID REFERENCES leads(id),
  historia_clinica_id UUID REFERENCES historia_clinica(id),
  fecha_generacion TIMESTAMPTZ DEFAULT NOW(),
  storage_path TEXT, -- ruta en Supabase Storage
  storage_url TEXT,  -- URL pública o signed URL
  programa TEXT,
  version INTEGER DEFAULT 1,
  enviado_whatsapp BOOLEAN DEFAULT FALSE,
  enviado_email BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

### Estructura del campo `plan_manejo` (JSONB):

```json
{
  "plan_base_nutricional": "bajo-ig",
  "proteinas": ["Pollo", "Pescado", "Huevo"],
  "vegetales": ["Espinaca", "Brócoli", "Lechuga"],
  "restricciones": ["Arroz blanco", "Azúcar", "Jugos"],
  "snacks": ["Maní 25g", "Huevos duros"],
  "hidratacion_vasos": "12",
  "tipo_aerobico": "caminata",
  "minutos_sesion": "40",
  "dias_semana_aerobico": "5",
  "entrenamiento_fuerza": "inicial",
  "dias_fuerza": ["Miércoles", "Viernes"],
  "suplementacion": ["Vitamina D3", "Omega 3"],
  "alertas_especiales": ["Monitorear glucemia", "Reportar náuseas"],
  "nota_medica_personalizada": "Texto libre de la Dra.",
  "condicion_fisica_nivel": "Sedentario — Inicio total"
}
```

---

## 4. DISEÑO VISUAL — SISTEMA COMPLETO

### 4.1 Paleta de Colores

```css
/* COLORES PRINCIPALES */
--teal:         #12C49A   /* Primario — encabezados activos, checkboxes, labels sección, CTA */
--teal-dark:    #0A9278   /* Hover, énfasis, iconos de sección */
--teal-light:   #E1F5EE   /* Fondos de badges teal, highlights suaves */
--gold:         #D4AF37   /* Acento premium — logo, especialidad, elementos de marca */
--navy:         #0B1B3D   /* Header institucional, fondo portada */

/* NEUTRALES — 6 GRISES */
--gray-900:     #111827   /* Texto principal — nombres, datos del paciente */
--gray-700:     #374151   /* Texto secundario — descripciones, instrucciones */
--gray-500:     #6B7280   /* Labels, placeholders, texto de apoyo */
--gray-400:     #9CA3AF   /* Códigos de examen, notas, hint text */
--gray-200:     #E5E7EB   /* Bordes de campos, divisores, líneas de firma */
--gray-50:      #F9FAFB   /* Fondos de sección, footer, header de categorías */

/* SEMÁNTICOS CLÍNICOS */
--sem-green:    #059669   /* Resultado normal, adherencia excelente, prioridad rutinaria */
--sem-green-bg: #D1FAE5   /* Fondo verde clínico */
--sem-green-br: #6EE7B7   /* Borde verde clínico */

--sem-amber:    #D97706   /* Atención, borderline, prioridad preferente */
--sem-amber-bg: #FEF3C7   /* Fondo ámbar */
--sem-amber-br: #FCD34D   /* Borde ámbar */

--sem-red:      #DC2626   /* Urgente, valor crítico, alerta, síntoma grave */
--sem-red-bg:   #FEE2E2   /* Fondo rojo clínico */
--sem-red-br:   #FCA5A5   /* Borde rojo clínico */
```

### 4.2 Tipografía

```
Títulos principales:  Cormorant Garamond — 400/600/700 — serif elegante
Cuerpo y UI:          DM Sans — 300/400/500/600 — sans-serif limpia
Monoespaciado:        JetBrains Mono — códigos de examen, números técnicos

Jerarquía en el Kit PDF:
  H1 Portada:   Cormorant 40px / 300
  H2 Sección:   Cormorant 28px / 600
  Label:        DM Sans 9px / 500 / uppercase / letter-spacing 1.5px
  Cuerpo:       DM Sans 13-14px / 400 / line-height 1.9
  Caption:      DM Sans 11px / 400 / gray-500
```

### 4.3 Ocho Principios de Diseño Apple-Minimalista

```
P1. Espacio en blanco intencional
    El vacío genera jerarquía sin añadir texto. Padding mínimo 16px en secciones.

P2. Tipografía como estructura
    Los pesos (400/500/600) y tamaños hacen el trabajo. No usar líneas decorativas.

P3. Color con propósito único
    Teal = acciones activas únicamente.
    Verde/Ámbar/Rojo = estados clínicos únicamente.
    Gold = identidad de marca únicamente.
    Nunca decorativo.

P4. Jerarquía visual de 3 niveles
    Header institucional → Sección clínica → Campo de dato.
    El ojo sigue el camino sin instrucciones.

P5. Reducción radical de ruido
    Sin sombras (excepto focus rings). Sin gradientes decorativos.
    Sin bordes que no tengan función. Solo 0.5px borders funcionales.

P6. Consistencia de componentes
    Cada campo input, label, sección y card usa el mismo patrón visual.
    Aprender un componente = aprender todos.

P7. Iconografía sin texto de apoyo
    Usar Tabler Icons outline. Cada ícono debe ser autoexplicativo en contexto:
    ti-flask = laboratorio, ti-heart-rate-monitor = metabolismo,
    ti-flame = inflamación, ti-user = paciente.

P8. Micro-transiciones fluidas
    border: 0.15s ease, background: 0.1s ease, all: 0.2s ease.
    El sistema responde al usuario sin sorpresas visuales.
```

---

## 5. ESTRUCTURA DEL KIT PDF — 11 SECCIONES

El Kit generado es un documento PDF de ~15–20 páginas con estas secciones en orden:

### Sección 1 — PORTADA
- Fondo: Navy `#0B1B3D` full-page con patrón de grilla dorado sutil (opacidad 4%)
- **Logo:** ⚠️ PLACEHOLDER — El logo de la Dra. Eusimary en formato PNG/SVG se entregará por el cliente. Usar imagen dinámica desde `public/assets/logo-dra-eusimary.png`. Si no existe, mostrar monograma "EC" en círculo dorado.
- Nombre de la Dra. en Cormorant Garamond dorado
- Especialidad: "Medicina Metabólica & Longevidad" en gold
- Divisor dorado (80px de ancho)
- Título del documento: "Kit de Bienvenida al Programa"
- Box destacado con: nombre del paciente, CC, edad, sexo, peso, IMC, fecha de valoración
- Badge del programa: S1 (dorado) o S2 (verde)
- Pills: Ciencia · Precisión · Transformación
- Footer: URL + WhatsApp + Instagram

### Sección 2 — CARTA DE BIENVENIDA
- Fondo blanco, tarjeta con borde top de 4px en gradiente navy→gold→navy
- Saludo personalizado: "Estimado(a) [nombre.split(' ')[0]],"
- 5 párrafos de texto médico empático (fijo, no editable)
- Cita en bloque: fondo #EEF2FF, borde izquierdo navy 4px
- Firma: línea de 130px + nombre de la Dra. + rol + TP
- Mención a la fecha del próximo control

### Sección 3 — PERFIL METABÓLICO
- Badge: "🏥 Medición directa · Impedanciómetro" O "📱 Estimado por antropometría · Telemedicina · ±3-5%"
- Grid 4 columnas: Peso | % Grasa | % Masa Magra | Cintura
- Grid 4 columnas: Kg Grasa | Kg Masa Magra | Agua (L) | Presión Arterial
- Si hay comorbilidades: alert-box azul con lista
- Los valores vienen auto-poblados desde historia_clinica

### Sección 4 — PROGRAMA Y PROTOCOLO
- **Programa S1:** Timeline de titulación (4 nodos: M1/M2/M3/Cierre)
  - Nodo activo (mes actual) resaltado en dorado con glow
  - Dosis de cada mes debajo del nodo
  - Alert-box dorado: dosis actual del paciente + próximo control
- **Programa S2:** Alert-box verde con descripción del plan bienestar
  - Próxima fecha de control

### Sección 5 — GUÍA NUTRICIONAL
- Alert-box verde: "Proteína primero, siempre" (si S1) o plan base seleccionado (si S2)
- Grid de cards (2 columnas):
  - Card Proteínas: chips de los alimentos seleccionados en plan_manejo.proteinas
  - Card Vegetales: chips de plan_manejo.vegetales
  - Card Restricciones: lista con bullets rojos
  - Card Snacks: chips de plan_manejo.snacks
- Alert-box azul: meta de hidratación (plan_manejo.hidratacion_vasos vasos/día)

### Sección 6 — PLAN DE COMIDAS DIARIO
- Fondo navy #1a2a4a para toda la sección (contraste elegante)
- 6 tiempos de comida en cards oscuras con borde teal:
  Desayuno | Media Mañana | Almuerzo | Media Tarde | Cena | Merienda Opcional
- Reglas de Oro (4 items numerados)

### Sección 7 — PLAN DE EJERCICIOS
- Hero visual: rectángulo navy con emoji running 64px
- 3 cards: Actividad Aeróbica | Duración/Sesión | Total Semanal
  - Valores: plan_manejo.tipo_aerobico, .minutos_sesion, (días × minutos)
- Grid semanal (7 columnas Lun-Dom) con actividad por día
  - Días de fuerza: plan_manejo.dias_fuerza
  - Días cardio: resto de días activos
- Alert-box rojo: señales de parada durante ejercicio

### Sección 8 — MANEJO DE SÍNTOMAS GLP-1
- Solo incluir si programa === 'S1'
- 3 cards:
  - "Síntomas Comunes" (borde top teal/gold): 5 síntomas con manejo
  - "Cómo Manejarlos" (borde top verde): 5 estrategias
  - "Señales de Urgencia" (borde top rojo, ancho completo): grid 2 columnas de alertas
- Box de urgencias rojo: teléfono 123 + WhatsApp Dra.

### Sección 9 — ALERTAS Y SUPLEMENTACIÓN
- Solo incluir si plan_manejo.alertas_especiales.length > 0 O plan_manejo.suplementacion.length > 0
- Card alertas: lista de plan_manejo.alertas_especiales
- Card suplementación: chips de plan_manejo.suplementacion

### Sección 10 — NOTA MÉDICA PERSONAL
- Solo incluir si plan_manejo.nota_medica_personalizada tiene contenido
- Card navy con texto en cursiva
- Firma de la Dra. al pie

### Sección 11 — TABLA DE PROGRESO TRIMESTRAL
- Tabla con 4 filas: Basal | Control 1 (Sem 4) | Control 2 (Sem 8) | Cierre (Sem 12)
- Fila Basal pre-llenada con datos de historia_clinica
- Columnas: Control | Semana | Peso | % Grasa | Kg Grasa | % Masa Magra | Cintura | Dosis GLP-1 | Observación
- **12 Hojas de Seguimiento Semanal** generadas en loop:
  - Semanas 1–12, una hoja por semana
  - Campos: Fecha | Peso | Cintura | PA | Dosis (S1) | Sitio inyección (S1) | Días ejercicio | Vasos agua
  - Síntomas: checkboxes visuales (□ Náuseas □ Estreñimiento □ Fatiga □ Acidez □ Mareo □ Sin síntomas)
  - Escala de adherencia nutricional: 3 círculos de color (verde/amarillo/rojo)
  - Campo notas libre
  - **Semanas 4, 8, 12:** Bloque especial "⭐ Control Médico" con:
    - % Grasa | Kg Masa Magra | Nueva dosis asignada | Fecha próximo control
    - Campo "Indicaciones médicas del control" (espacio grande)

### Sección 12 — FOOTER INSTITUCIONAL
- Fondo navy
- Izquierda: Nombre Dra. + especialidad
- Derecha: URL + WhatsApp + Instagram + fecha de generación + "Elaborado por CAST Consultorías SAS"

---

## 6. INTEGRACIÓN EN HISTORIA CLÍNICA — PUNTO 11

### 6.1 Ubicación en la UI

En la historia clínica del paciente, el **Punto 11 — Plan de Manejo** debe tener esta estructura:

```
[Secciones 1-10 de la historia clínica...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PUNTO 11 — PLAN DE MANEJO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ 11.1 Plan Nutricional Base ] ← Dropdown selector
[ 11.2 Proteínas Recomendadas ] ← Multi-select chips
[ 11.3 Vegetales Prioritarios ] ← Multi-select chips
[ 11.4 Restricciones Alimentarias ] ← Multi-select chips
[ 11.5 Snacks Permitidos ] ← Multi-select chips (max 8)
[ 11.6 Hidratación ] ← Selector (8/10/12/15 vasos)
[ 11.7 Tipo de Ejercicio Aeróbico ] ← Dropdown
[ 11.8 Minutos / Sesión ] ← Selector
[ 11.9 Días por Semana ] ← Selector
[ 11.10 Nivel de Entrenamiento de Fuerza ] ← Selector
[ 11.11 Días de Fuerza ] ← Multi-select días
[ 11.12 Suplementación ] ← Multi-select chips
[ 11.13 Alertas Especiales ] ← Multi-select chips
[ 11.14 Nota Médica Personalizada ] ← Textarea libre

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    [ 💾 Guardar Plan de Manejo ]    ← Guarda en Supabase
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  [ 🩺 Generar Kit para el Paciente ]  ← BOTÓN PRINCIPAL
  Color: background teal #12C49A, texto blanco, ícono ti-file-medical
  Loading state: spinner + "Generando kit personalizado..."
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 6.2 Datos que se auto-poblan desde historia_clinica

El kit toma automáticamente (sin que la Dra. los reingrese):

```typescript
interface KitData {
  // De leads
  nombrePaciente: string;        // leads.nombre_completo
  cc: string;                    // leads.cc
  fechaNacimiento: Date;         // leads.fecha_nacimiento → calcular edad
  sexo: string;                  // leads.sexo
  email: string;                 // leads.email
  whatsapp: string;              // leads.whatsapp
  programa: 'S1' | 'S2';        // leads.programa

  // De historia_clinica — composición corporal
  peso: number;
  talla: number;
  imc: number;                   // calcular si no existe: peso/(talla/100)²
  pctGrasa: number;
  kgGrasa: number;
  pctMasaMagra: number;
  kgMasaMagra: number;
  aguaLitros: number;
  cinturaCm: number;
  presionArterial: string;
  rangoGrasaOptima: string;
  metodoComposicion: 'impedancia' | 'telemedicina';
  comorbilidades: string[];
  mesConjuntoTitulacion: string; // '1' | '2' | '3'
  proximoControl: Date;
  fechaValoracion: Date;

  // De historia_clinica — plan de manejo (punto 11)
  planManejo: PlanManejoData;
}
```

---

## 7. FLUJO DE GENERACIÓN DEL KIT

### 7.1 Función principal `generatePatientKit`

```typescript
// app/actions/kit/generate.ts (Server Action)

'use server'
import { createServerClient } from '@/lib/supabase/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { PatientKitDocument } from '@/components/kit/PatientKitDocument'
import { KitData } from '@/types/kit'

export async function generatePatientKit(leadId: string, historiaClinicaId: string) {
  const supabase = await createServerClient()

  // 1. Obtener datos completos del paciente
  const { data: lead } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single()

  const { data: historia } = await supabase
    .from('historia_clinica')
    .select('*')
    .eq('id', historiaClinicaId)
    .single()

  if (!lead || !historia) throw new Error('Datos del paciente incompletos')

  // 2. Construir objeto KitData
  const kitData: KitData = buildKitData(lead, historia)

  // 3. Renderizar PDF con react-pdf
  const pdfBuffer = await renderToBuffer(<PatientKitDocument data={kitData} />)

  // 4. Guardar en Supabase Storage
  const fileName = `kit_${lead.nombre_completo.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  const storagePath = `kits/${leadId}/${fileName}`

  const { data: storageData, error: storageError } = await supabase.storage
    .from('documentos-clinicos')
    .upload(storagePath, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true
    })

  if (storageError) throw storageError

  // 5. Obtener URL pública (o signed URL si bucket privado)
  const { data: { publicUrl } } = supabase.storage
    .from('documentos-clinicos')
    .getPublicUrl(storagePath)

  // 6. Registrar en tabla kits_paciente
  await supabase.from('kits_paciente').insert({
    lead_id: leadId,
    historia_clinica_id: historiaClinicaId,
    storage_path: storagePath,
    storage_url: publicUrl,
    programa: lead.programa,
    version: 1
  })

  // 7. Retornar buffer para descarga inmediata en el cliente
  return {
    buffer: Array.from(pdfBuffer),
    fileName,
    url: publicUrl
  }
}
```

### 7.2 Componente del botón en Historia Clínica

```typescript
// components/historia-clinica/PuntoManejo/GenerarKitButton.tsx

'use client'
import { useState } from 'react'
import { generatePatientKit } from '@/app/actions/kit/generate'
import { toast } from 'sonner' // o el toast que usen

interface Props {
  leadId: string
  historiaClinicaId: string
  pacienteNombre: string
}

export function GenerarKitButton({ leadId, historiaClinicaId, pacienteNombre }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    try {
      const { buffer, fileName, url } = await generatePatientKit(leadId, historiaClinicaId)

      // Descargar automáticamente en el navegador
      const blob = new Blob([new Uint8Array(buffer)], { type: 'application/pdf' })
      const downloadUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(downloadUrl)

      toast.success(`Kit de ${pacienteNombre} generado y descargado`, {
        description: 'El documento también está disponible en el historial del paciente.',
        action: { label: 'Ver historial', onClick: () => {/* navegar a historial */} }
      })
    } catch (error) {
      toast.error('Error al generar el kit', { description: String(error) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg
        bg-[#12C49A] hover:bg-[#0A9278] text-white font-medium text-sm
        transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <span className="animate-spin">⟳</span>
          Generando kit personalizado...
        </>
      ) : (
        <>
          🩺 Generar Kit para el Paciente
        </>
      )}
    </button>
  )
}
```

### 7.3 Tarjeta del Paciente — Pestaña Historial

```typescript
// components/leads/LeadCard/HistorialTab.tsx

// En la pestaña "Historial" de la tarjeta del Lead, mostrar los kits generados:

interface KitItem {
  id: string
  fecha_generacion: string
  programa: string
  storage_url: string
  enviado_whatsapp: boolean
  enviado_email: boolean
  version: number
}

// Cada kit en el historial se muestra como:
// [📄 Kit v1 · S1 · 03 jun 2026]  [⬇ Descargar] [📱 WhatsApp] [📧 Email]
```

---

## 8. COMPONENTE REACT-PDF DEL KIT

### 8.1 Estructura de archivos

```
components/
  kit/
    PatientKitDocument.tsx    ← Componente raíz del PDF
    sections/
      Portada.tsx             ← Sección 1
      CartaBienvenida.tsx     ← Sección 2
      PerfilMetabolico.tsx    ← Sección 3
      ProgramaProtocolo.tsx   ← Sección 4
      GuiaNutricional.tsx     ← Sección 5
      PlanComidas.tsx         ← Sección 6
      PlanEjercicios.tsx      ← Sección 7
      ManejoSintomas.tsx      ← Sección 8 (solo S1)
      AlertasSuplementacion.tsx ← Sección 9
      NotaMedica.tsx          ← Sección 10
      SeguimientoTrimestral.tsx ← Sección 11 (tabla + 12 hojas)
      FooterInstitucional.tsx ← Sección 12
    shared/
      KitStyles.ts            ← StyleSheet de react-pdf
      KitColors.ts            ← Constantes de color
      KitTypography.ts        ← Estilos tipográficos
```

### 8.2 Colores para react-pdf StyleSheet

```typescript
// components/kit/shared/KitColors.ts
export const KIT_COLORS = {
  teal: '#12C49A',
  tealDark: '#0A9278',
  tealLight: '#E1F5EE',
  gold: '#D4AF37',
  goldLight: '#E8CC6A',
  goldDark: '#A8891A',
  navy: '#0B1B3D',
  navyLight: '#162847',

  gray900: '#111827',
  gray700: '#374151',
  gray500: '#6B7280',
  gray400: '#9CA3AF',
  gray200: '#E5E7EB',
  gray50:  '#F9FAFB',

  semGreen:    '#059669',
  semGreenBg:  '#D1FAE5',
  semAmber:    '#D97706',
  semAmberBg:  '#FEF3C7',
  semRed:      '#DC2626',
  semRedBg:    '#FEE2E2',
  white: '#FFFFFF',
}
```

### 8.3 Notas críticas para react-pdf

```
⚠️ react-pdf NO soporta:
  - Flexbox gap (usar marginRight/marginBottom en cada hijo)
  - CSS grid (usar columnas Flexbox con ancho calculado)
  - position: fixed (usar position: absolute con cautela)
  - Emojis complejos (usar texto simple o evitar)
  - Border-radius en imágenes (usar View wrapper con borderRadius)
  - Web fonts directamente — cargar con Font.register()

✅ react-pdf SÍ soporta:
  - Page, View, Text, Image, Link, StyleSheet
  - flexDirection, flexWrap, justifyContent, alignItems
  - borderLeft (para líneas de acento lateral)
  - page breaks: break: 'avoid' en secciones importantes
  - Fuentes personalizadas con Font.register({ family, src })
```

### 8.4 Registro de fuentes

```typescript
// Al inicio de PatientKitDocument.tsx
import { Font } from '@react-pdf/renderer'

Font.register({
  family: 'Cormorant Garamond',
  fonts: [
    { src: '/fonts/CormorantGaramond-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/CormorantGaramond-SemiBold.ttf', fontWeight: 600 },
    { src: '/fonts/CormorantGaramond-Bold.ttf', fontWeight: 700 },
    { src: '/fonts/CormorantGaramond-Italic.ttf', fontStyle: 'italic' },
  ]
})

Font.register({
  family: 'DM Sans',
  fonts: [
    { src: '/fonts/DMSans-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/DMSans-Medium.ttf', fontWeight: 500 },
    { src: '/fonts/DMSans-SemiBold.ttf', fontWeight: 600 },
  ]
})
// Archivos .ttf deben estar en /public/fonts/
// Descargar de Google Fonts con ttf-downloader o manual
```

---

## 9. LOGO — INSTRUCCIÓN CRÍTICA

```
⚠️ LOGO PLACEHOLDER

El logo oficial de la Dra. Eusimary Contreras será entregado por el cliente
en formato PNG de alta resolución (mínimo 400×400px, fondo transparente).

MIENTRAS NO SE ENTREGUE EL LOGO:
  - Mostrar un rectángulo de 120×45px con borde dorado #D4AF37
  - Fondo: rgba(212,175,55,0.08)
  - Texto interno: "LOGO EC" en DM Sans 10px dorado, centrado

CUANDO SE ENTREGUE:
  - Guardar en: /public/assets/logo-dra-eusimary-principal.png
  - Referencia en react-pdf: <Image src="/assets/logo-dra-eusimary-principal.png" style={{ width: 120, height: 45 }} />
  - La ruta debe ser absoluta o usando process.env.NEXT_PUBLIC_APP_URL

Para el header del PDF en react-pdf usar <Image> con src absoluta.
Para la UI web del kit, usar <img> con src="/assets/logo-dra-eusimary-principal.png".
```

---

## 10. SUPABASE STORAGE — CONFIGURACIÓN

```sql
-- Crear bucket para documentos clínicos
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos-clinicos', 'documentos-clinicos', false);
-- Privado: usar signed URLs (expiración 1 hora para descarga)

-- Política de acceso: solo usuarios autenticados con rol 'medico'
CREATE POLICY "Médico puede subir y leer docs clínicos"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'documentos-clinicos' AND
  auth.jwt() ->> 'role' = 'medico'
)
WITH CHECK (
  bucket_id = 'documentos-clinicos'
);
```

---

## 11. ENVÍO AL PACIENTE

### 11.1 Por WhatsApp (Meta Cloud API)

```typescript
// app/actions/kit/send-whatsapp.ts
export async function sendKitViaWhatsApp(leadId: string, kitId: string) {
  // 1. Obtener datos
  const kit = await getKit(kitId)
  const lead = await getLead(leadId)

  // 2. Generar signed URL del PDF (expira en 24h)
  const signedUrl = await generateSignedUrl(kit.storage_path, 86400)

  // 3. Enviar por WhatsApp Business API
  await sendWhatsAppDocument({
    to: lead.whatsapp,
    documentUrl: signedUrl,
    caption: `Hola ${lead.nombre_completo.split(' ')[0]} 👋 Aquí está tu Kit personalizado del Programa ${lead.programa === 'S1' ? 'Control Metabólico' : 'Bienestar Integral'}. Cualquier duda, escríbeme aquí. — Dra. Eusimary Contreras`,
    filename: `Kit_${lead.nombre_completo.split(' ')[0]}_Dra_Contreras.pdf`
  })

  // 4. Marcar como enviado
  await supabase.from('kits_paciente').update({ enviado_whatsapp: true }).eq('id', kitId)
}
```

### 11.2 Por Email (Brevo)

```typescript
// Usar Brevo transaccional con adjunto base64 del PDF
// Template ya configurado en Brevo — pasar PDF como attachment
```

---

## 12. CHECKLIST DE IMPLEMENTACIÓN

```
FASE 1 — Estructura
[ ] Crear tipos TypeScript: KitData, PlanManejoData, KitRecord
[ ] Crear/actualizar tablas Supabase: historia_clinica (añadir campo plan_manejo)
[ ] Crear tabla kits_paciente
[ ] Configurar Supabase Storage bucket 'documentos-clinicos'
[ ] Instalar @react-pdf/renderer: npm install @react-pdf/renderer

FASE 2 — UI Historia Clínica
[ ] Implementar Punto 11 en el formulario de Historia Clínica
[ ] Conectar selectors al campo plan_manejo (JSONB) con auto-save
[ ] Implementar componente GenerarKitButton
[ ] Agregar loading state y toast notifications

FASE 3 — Generación PDF
[ ] Descargar y colocar fuentes en /public/fonts/
[ ] Crear KitColors.ts y KitStyles base
[ ] Implementar cada sección como componente react-pdf independiente
[ ] Implementar PatientKitDocument.tsx ensamblando todas las secciones
[ ] Probar con datos mock antes de conectar Supabase
[ ] ⚠️ ESPERAR LOGO DEL CLIENTE — implementar placeholder mientras tanto

FASE 4 — Server Action y Storage
[ ] Implementar generatePatientKit server action
[ ] Configurar políticas de Supabase Storage
[ ] Implementar descarga automática en cliente
[ ] Guardar URL en tabla kits_paciente

FASE 5 — Historial del Lead
[ ] Crear pestaña "Historial" en LeadCard
[ ] Mostrar lista de kits generados con fecha, versión y programa
[ ] Botones: Descargar | Enviar WhatsApp | Enviar Email
[ ] Implementar sendKitViaWhatsApp y sendKitViaEmail

FASE 6 — QA
[ ] Probar generación con paciente S1 (todas las secciones incluyendo síntomas)
[ ] Probar generación con paciente S2 (sin sección de síntomas GLP-1)
[ ] Verificar que las 12 hojas semanales se generan correctamente
[ ] Verificar que semanas 4, 8, 12 tienen bloque de control médico
[ ] Probar descarga automática en Chrome, Firefox, Safari
[ ] Probar carga del PDF en Supabase Storage
[ ] Verificar que aparece en historial del Lead
[ ] Verificar envío por WhatsApp con documento adjunto
```

---

## 13. REFERENCIAS DEL DISEÑO

El diseño visual completo de referencia está disponible como archivo HTML interactivo:
`kit_generator_dra_contreras.html`

Este archivo contiene:
- El generador completo con todas las secciones del kit
- El sistema de colores aplicado en funcionamiento
- Las 12 hojas de seguimiento semanal
- La calculadora de composición corporal por telemedicina
- El toggle Presencial/Telemedicina

**Usar ese HTML como referencia visual exacta** para replicar el diseño en react-pdf, manteniendo las mismas proporciones, colores, tipografía y estructura de secciones.

---

## 14. DATOS DE CONTACTO Y CREDENCIALES

```
Dra. Eusimary Contreras Morales
Medicina Metabólica & Longevidad
Esp. Gerencia de la Calidad y la Salud
Barranquilla, Colombia

Web:       https://draeusimary.netlify.app
WhatsApp:  +57 301 625 4865
Email:     contacto.draeusimary@gmail.com
Instagram: @draeusimary
Cal.com:   cal.com/dra-eusimary-contreras

Elaborado por:
CAST Consultorías SAS
Carlos Suárez — CEO
carlos@castconsultorias.com
+57 304 2113374
www.castconsultorias.com
```

---

*Documento elaborado por CAST Consultorías SAS para el CRM-ERP de la Dra. Eusimary Contreras · Barranquilla, Colombia · Junio 2026*
