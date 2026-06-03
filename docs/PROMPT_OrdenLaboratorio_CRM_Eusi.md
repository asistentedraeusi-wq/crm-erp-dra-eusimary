# PROMPT — Módulo Orden Médica de Laboratorio
## CRM-ERP Dra. Eusimary Contreras | Antigravity / Claude Code

---

## ROL Y CONTEXTO

Eres el agente de desarrollo del CRM-ERP de la **Dra. Eusimary Contreras Morales**, médica especialista en Medicina Metabólica & Longevidad, Barranquilla, Colombia. El sistema está construido en **Next.js 14 App Router + React + TypeScript + Tailwind CSS + Supabase (PostgreSQL)**.

Tu tarea es implementar el módulo **"Orden Médica de Laboratorio"**, un documento PDF generado automáticamente desde la Historia Clínica del paciente cuando la Dra. selecciona los paraclínicos a ordenar. El PDF resultante debe ser idéntico en diseño al modelo aprobado que se te entrega como referencia visual.

---

## STACK TECNOLÓGICO

```
Frontend:   React 18 + TypeScript + Tailwind CSS
Framework:  Next.js 14 (App Router)
Base datos: Supabase — PostgreSQL + Auth + Storage
PDF Gen:    @react-pdf/renderer  (opción A)  ó  puppeteer/playwright (opción B)
Deploy:     Vercel
```

**Decisión de generación PDF:** Usa `@react-pdf/renderer` para renderizado en cliente/servidor sin dependencias de navegador. Si la complejidad visual lo requiere, escala a Puppeteer con una ruta de API `/api/generar-orden`.

---

## SISTEMA VISUAL — IMPLEMENTACIÓN EXACTA

### Variables CSS (`globals.css` y `tailwind.config.ts`)

```css
/* globals.css */
:root {
  --teal:        #12C49A;   /* PRIMARY — badges, bordes activos, indicadores */
  --teal-dark:   #0A3D2E;   /* Header principal, footer, títulos de sección */
  --teal-mid:    #0D7A5F;   /* Botón activo, etiquetas de sub-sección */
  --teal-bg:     #E6FAF5;   /* Fondos alternados de filas, resumen exámenes */
  --gold:        #D4AF37;   /* Líneas decorativas, acento premium, bordes consentimiento */
  --gold-light:  #FFF8E7;   /* Fondo bloque instrucciones */
  --gray-900:    #111827;   /* Texto principal */
  --gray-700:    #374151;   /* Texto secundario */
  --gray-500:    #6B7280;   /* Etiquetas en caps */
  --gray-400:    #9CA3AF;   /* Placeholders */
  --gray-200:    #E5E7EB;   /* Bordes inactivos, divisores */
  --gray-50:     #F9FAFB;   /* Fondos neutros de cards */
}
```

```typescript
// tailwind.config.ts
colors: {
  teal:  { DEFAULT:'#12C49A', dark:'#0A3D2E', mid:'#0D7A5F', bg:'#E6FAF5' },
  gold:  { DEFAULT:'#D4AF37', light:'#FFF8E7' },
  gray:  { 900:'#111827', 700:'#374151', 500:'#6B7280',
           400:'#9CA3AF', 200:'#E5E7EB',  50:'#F9FAFB' },
  /* Semánticos clínicos — clasificación IMC / estado */
  clinical: {
    green:      '#10B981',   /* IMC normal */
    'green-dk': '#2D6A4F',   /* Saludable / óptimo */
    amber:      '#F59E0B',   /* Sobrepeso leve */
    'amber-dk': '#B45309',   /* Riesgo moderado, sarcopenia */
    orange:     '#F97316',   /* Sobrepeso */
    red:        '#EF4444',   /* Obesidad — candidato GLP-1 */
    'red-dk':   '#DC2626',   /* Alerta crítica, consentimiento sin firmar */
  }
}
```

### 8 Principios de Diseño Apple-Minimalista

1. **Espaciado generoso** — padding interno 22-26px en secciones, gap 14px entre campos.
2. **Tipografía jerárquica** — etiquetas 0.75rem MAYÚSCULAS + letter-spacing; valores 0.875rem; títulos 0.93rem bold.
3. **Un solo color primario vibrante** — Teal `#12C49A` es el único color de alta saturación; todo lo demás es neutral o acento dorado dosificado.
4. **Bordes sutiles** — 1px `#E5E7EB` en reposo; 1.5px `#12C49A` al activarse. Sin sombras dramáticas.
5. **Border-radius consistente** — 8px en campos y cards, 14px en tarjetas de sección principal.
6. **Sombra mínima** — `box-shadow: 0 2px 6px rgba(18,196,154,0.07)` — casi imperceptible.
7. **Iconografía funcional** — cada ícono comunica su estado sin necesitar texto auxiliar. Sin íconos decorativos.
8. **Consistencia de estado visual** — cada elemento UI comunica visualmente su estado (inactivo / activo / error / completado) sin ambigüedad.

---

## ARQUITECTURA DEL MÓDULO

### 1. Estructura de archivos

```
app/
  (crm)/
    historia-clinica/
      [pacienteId]/
        page.tsx                    ← Vista principal HC
        components/
          SeccionParaclinicos.tsx   ← Selector de exámenes (existente)
          OrdenLaboratorio/
            index.tsx               ← Entry point del módulo
            OrdenPreview.tsx        ← Preview del PDF en modal
            GenerarOrdenBtn.tsx     ← Botón que dispara la generación
            OrdenPDFDocument.tsx    ← Documento @react-pdf/renderer
            useOrdenLaboratorio.ts  ← Hook: lógica + Supabase
            tipos.ts                ← Tipos TypeScript del módulo

api/
  generar-orden-pdf/
    route.ts                        ← API route (fallback Puppeteer si aplica)

lib/
  supabase/
    ordenes-laboratorio.ts          ← Queries y mutations Supabase
```

---

### 2. Tipos TypeScript (`tipos.ts`)

```typescript
export interface ExamenLaboratorio {
  id: string;
  codigo: string;              // ej: "HEMO-01"
  nombre: string;              // ej: "Hemograma completo"
  detalle?: string;            // ej: "Cuadro hemático con diferencial"
  categoria: CategoriaExamen;
  colorBadge: string;          // HEX — según semántico clínico o teal
  ordenDefault?: number;       // posición en lista impresa
}

export type CategoriaExamen =
  | 'hematologia'
  | 'quimica_sanguinea'
  | 'lipidos'
  | 'endocrino'
  | 'hepatico'
  | 'renal'
  | 'metabolico';

export interface DatosPacienteOrden {
  nombreCompleto: string;
  cedula: string;
  edad: string;                // ej: "43 años"
  ciudad: string;
  programa: ProgramaClinico;
}

export type ProgramaClinico =
  | 'control_metabolico_premium'
  | 'bienestar_integral';

export interface OrdenLaboratorio {
  id?: string;                 // UUID Supabase (null si no persiste aún)
  pacienteId: string;
  historiaClinicaId: string;
  fecha: string;               // ISO 8601
  examenesSeleccionados: ExamenLaboratorio[];
  datosPaciente: DatosPacienteOrden;
  medico: DatosMedico;
  vigenciaDias: number;        // default 30
  estado: EstadoOrden;
  observaciones?: string;
}

export interface DatosMedico {
  nombre: string;
  registroMedico: string;
  especialidad: string;
  tel: string;
  email: string;
  whatsapp: string;
  web: string;
  ciudad: string;
}

export type EstadoOrden = 'borrador' | 'emitida' | 'entregada' | 'resultados_recibidos';
```

---

### 3. Catálogo de exámenes (`catalogoExamenes`)

Define este catálogo como constante compartida. La historia clínica ya tiene la lista de paraclínicos; este catálogo es el mapeo maestro con metadatos visuales:

```typescript
// lib/catalogoExamenes.ts
import { ExamenLaboratorio } from '@/app/(crm)/historia-clinica/components/OrdenLaboratorio/tipos';

export const CATALOGO_EXAMENES: ExamenLaboratorio[] = [
  { id:'lab-01', codigo:'HEMO-01',  nombre:'Hemograma completo',      detalle:'Cuadro hemático con diferencial',              categoria:'hematologia',      colorBadge:'#10B981', ordenDefault:1  },
  { id:'lab-02', codigo:'GLUC-01',  nombre:'Glucemia en ayunas',      detalle:'Glicemia basal',                              categoria:'quimica_sanguinea', colorBadge:'#12C49A', ordenDefault:2  },
  { id:'lab-03', codigo:'LIPI-01',  nombre:'Perfil Lipídico Completo',detalle:'Colesterol Total, LDL, HDL, Triglicéridos',   categoria:'lipidos',           colorBadge:'#12C49A', ordenDefault:3  },
  { id:'lab-04', codigo:'URIC-01',  nombre:'Ácido Úrico sérico',      detalle:undefined,                                     categoria:'metabolico',        colorBadge:'#12C49A', ordenDefault:4  },
  { id:'lab-05', codigo:'HBAC-01',  nombre:'Hemoglobina Glicosilada', detalle:'HbA1c',                                       categoria:'endocrino',         colorBadge:'#F59E0B', ordenDefault:5  },
  { id:'lab-06', codigo:'TIRO-01',  nombre:'Perfil Tiroideo',         detalle:'TSH, T4 libre, T3 libre',                    categoria:'endocrino',         colorBadge:'#12C49A', ordenDefault:6  },
  { id:'lab-07', codigo:'PROT-01',  nombre:'Proteína Total Sérica',   detalle:undefined,                                     categoria:'hepatico',          colorBadge:'#12C49A', ordenDefault:7  },
  { id:'lab-08', codigo:'ALBU-01',  nombre:'Albúmina Sérica',         detalle:undefined,                                     categoria:'hepatico',          colorBadge:'#12C49A', ordenDefault:8  },
  { id:'lab-09', codigo:'BILI-01',  nombre:'Bilirrubinas',            detalle:'Total, Directa e Indirecta',                 categoria:'hepatico',          colorBadge:'#12C49A', ordenDefault:9  },
  { id:'lab-10', codigo:'ENZI-01',  nombre:'Enzimas Hepáticas',       detalle:'ALT (TGP), AST (TGO), Fosfatasa Alcalina',   categoria:'hepatico',          colorBadge:'#12C49A', ordenDefault:10 },
  { id:'lab-11', codigo:'CALC-01',  nombre:'Calcio Sérico',           detalle:undefined,                                     categoria:'metabolico',        colorBadge:'#12C49A', ordenDefault:11 },
  // Extender según necesidad clínica
];
```

---

### 4. Tabla Supabase

```sql
-- migrations/ordenes_laboratorio.sql
CREATE TABLE ordenes_laboratorio (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id          UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  historia_clinica_id  UUID NOT NULL REFERENCES historias_clinicas(id),
  fecha_emision        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  examenes             JSONB NOT NULL,        -- Array de ExamenLaboratorio[]
  datos_paciente       JSONB NOT NULL,        -- Snapshot de DatosPacienteOrden
  medico_id            UUID REFERENCES medicos(id),
  vigencia_dias        INTEGER DEFAULT 30,
  estado               TEXT DEFAULT 'emitida'
                         CHECK (estado IN ('borrador','emitida','entregada','resultados_recibidos')),
  observaciones        TEXT,
  pdf_url              TEXT,                  -- Supabase Storage URL
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE ordenes_laboratorio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "medico_acceso_propio" ON ordenes_laboratorio
  FOR ALL USING (auth.uid() = medico_id);
```

---

### 5. Hook principal (`useOrdenLaboratorio.ts`)

```typescript
import { useState, useCallback } from 'react';
import { OrdenLaboratorio, ExamenLaboratorio } from './tipos';
import { guardarOrden, generarPDF } from '@/lib/supabase/ordenes-laboratorio';

export function useOrdenLaboratorio(historiaClinicaId: string, pacienteId: string) {
  const [seleccionados, setSeleccionados] = useState<ExamenLaboratorio[]>([]);
  const [generando, setGenerando]         = useState(false);
  const [pdfUrl, setPdfUrl]               = useState<string | null>(null);
  const [error, setError]                 = useState<string | null>(null);

  // Sincroniza con los paraclínicos seleccionados en la sección de Historia Clínica
  // Esta función es llamada por SeccionParaclinicos cuando cambia la selección
  const sincronizarDesdeHC = useCallback((examenes: ExamenLaboratorio[]) => {
    setSeleccionados(examenes);
    setPdfUrl(null); // invalida PDF previo
  }, []);

  const toggleExamen = useCallback((examen: ExamenLaboratorio) => {
    setSeleccionados(prev =>
      prev.find(e => e.id === examen.id)
        ? prev.filter(e => e.id !== examen.id)
        : [...prev, examen].sort((a, b) => (a.ordenDefault ?? 99) - (b.ordenDefault ?? 99))
    );
    setPdfUrl(null);
  }, []);

  const generarYGuardar = useCallback(async (orden: OrdenLaboratorio) => {
    if (seleccionados.length === 0) {
      setError('Selecciona al menos un examen antes de generar la orden.');
      return;
    }
    setGenerando(true);
    setError(null);
    try {
      const url = await generarPDF({ ...orden, examenesSeleccionados: seleccionados });
      setPdfUrl(url);
      await guardarOrden({ ...orden, pdfUrl: url });
    } catch (e) {
      setError('Error generando la orden. Intenta nuevamente.');
      console.error(e);
    } finally {
      setGenerando(false);
    }
  }, [seleccionados]);

  return { seleccionados, toggleExamen, sincronizarDesdeHC,
           generando, pdfUrl, error, generarYGuardar };
}
```

---

### 6. Integración en `SeccionParaclinicos.tsx`

La sección de paraclínicos de la historia clínica ya existe. Agrega el disparo automático así:

```typescript
// Dentro de SeccionParaclinicos.tsx — donde ya existe el checkbox de cada examen
import { useOrdenLaboratorio } from './OrdenLaboratorio/useOrdenLaboratorio';
import { CATALOGO_EXAMENES } from '@/lib/catalogoExamenes';
import GenerarOrdenBtn from './OrdenLaboratorio/GenerarOrdenBtn';

// En el onChange de cada checkbox o al marcar el examen:
const examenesMarcados = CATALOGO_EXAMENES.filter(e =>
  paraclinicosMarcadosEnHC.includes(e.codigo)
);

// Sincroniza automáticamente hacia el módulo de orden
useEffect(() => {
  sincronizarDesdeHC(examenesMarcados);
}, [paraclinicosMarcadosEnHC]);

// Botón de generación — se coloca al final de la sección Paraclínicos
<GenerarOrdenBtn
  examenesCount={seleccionados.length}
  generando={generando}
  pdfUrl={pdfUrl}
  onGenerar={() => generarYGuardar(ordenData)}
/>
```

---

### 7. Documento PDF (`OrdenPDFDocument.tsx`)

Usa `@react-pdf/renderer`. Estructura exacta del documento aprobado:

#### Instalación
```bash
npm install @react-pdf/renderer
```

#### Estructura visual del PDF (secciones en orden)

```
┌─────────────────────────────────────────────────────────┐
│  HEADER — fondo #0A3D2E (teal-dark)                     │
│  [Barra lateral #12C49A 4px] [LOGO circular — ver §8]   │
│  Nombre Dra. | Especialidad | RM | Ciudad                │
│  Línea decorativa #D4AF37 (2px) al pie del header        │
├─────────────────────────────────────────────────────────┤
│  BANNER — fondo #E6FAF5, borde #12C49A, radio 8px        │
│  "ORDEN MÉDICA DE LABORATORIO CLÍNICO"                   │
│  "Programa Control Metabólico Premium"                   │
├─────────────────────────────────────────────────────────┤
│  DATOS DEL PACIENTE — card #F9FAFB, borde #E5E7EB        │
│  Etiqueta "DATOS DEL PACIENTE" + línea dorada            │
│  Col izq: Paciente | CC | Edad                           │
│  Divisor vertical #E5E7EB                                │
│  Col der: Fecha | Ciudad | Programa                      │
├─────────────────────────────────────────────────────────┤
│  LISTA DE EXÁMENES                                       │
│  Etiqueta "EXÁMENES SOLICITADOS" + línea dorada          │
│  Filas alternadas: fondo #E6FAF5 / blanco                │
│  Cada fila: badge circular coloreado | Nombre bold       │
│             | detalle en gris-500 | tick teal derecho    │
│  Borde exterior: 1px #E5E7EB, radio 8px                  │
├─────────────────────────────────────────────────────────┤
│  INSTRUCCIONES — fondo #FFF8E7, borde #D4AF37            │
│  Barra lateral #12C49A + título + 4 ítems con bullet     │
├─────────────────────────────────────────────────────────┤
│  FIRMA — línea #0A3D2E centrada + datos doctora          │
├─────────────────────────────────────────────────────────┤
│  FOOTER — fondo #0A3D2E                                  │
│  Línea #12C49A + línea #D4AF37 (encima)                  │
│  Web | Email: asistente.draeusi@gmail.com | WhatsApp     │
│  "Válida 30 días · Documento confidencial"               │
└─────────────────────────────────────────────────────────┘
```

#### Numeración de badges por color semántico
| Examen | Color badge |
|--------|-------------|
| Hemograma | `#10B981` Verde |
| HbA1c | `#F59E0B` Ámbar |
| Todos los demás | `#12C49A` Teal |

#### Datos del médico (constantes en el documento)
```typescript
export const MEDICO_DEFAULT: DatosMedico = {
  nombre:          'Dra. Eusimary Contreras Morales',
  registroMedico:  '13-8793-05',
  especialidad:    'Médica Cirujana · Esp. Gerencia de la Calidad y Salud',
  tel:             '314 582 21 69',
  email:           'asistente.draeusi@gmail.com',
  whatsapp:        '+57 301 625 4865',
  web:             'draeusimary.netlify.app',
  ciudad:          'Barranquilla, Colombia',
};
```

---

### 8. Logo — INSTRUCCIÓN IMPORTANTE

> **El logo NO debe hardcodearse ni buscarse en ninguna URL pública.**
> Carlos (CEO de CAST Consultorías) entregará la imagen del logo circular
> **"DR. CONTRERAS ESTHÉTIQUES — Medicina Metabólica & Longevidad"**
> directamente al equipo de desarrollo.

**Implementación esperada:**

```typescript
// 1. Sube el logo a Supabase Storage
//    Bucket: 'assets-medico'
//    Path:   'logos/logo-dra-eusimary-circular.jpg'

// 2. En OrdenPDFDocument.tsx — obtén la URL pública al cargar el módulo:
const { data } = supabase.storage
  .from('assets-medico')
  .getPublicUrl('logos/logo-dra-eusimary-circular.jpg');

const logoUrl = data.publicUrl;

// 3. Úsalo en @react-pdf/renderer:
<Image src={logoUrl} style={{ width: 85, height: 85 }} />

// 4. Mientras el logo no esté disponible, renderiza un placeholder
//    con las iniciales "EC" en teal sobre fondo teal-dark.
```

---

### 9. Flujo automático desde Historia Clínica

```
Historia Clínica — Sección Paraclínicos
         │
         │  Doctor marca checkboxes de exámenes
         ▼
SeccionParaclinicos.tsx
  onChange → actualiza estado local HC
  useEffect → llama sincronizarDesdeHC(examenesMarcados)
         │
         ▼
useOrdenLaboratorio.ts
  setSeleccionados(examenes)  ← automático
  [badge contador actualizado en tiempo real]
         │
         │  Doctor hace clic en "Generar Orden"
         ▼
generarYGuardar(orden)
  1. Construye OrdenLaboratorio con datos del paciente desde HC
  2. Renderiza OrdenPDFDocument con @react-pdf/renderer
  3. Sube PDF a Supabase Storage → bucket 'ordenes-lab'
     Path: 'ordenes/{pacienteId}/{fecha-iso}.pdf'
  4. Guarda registro en tabla ordenes_laboratorio
  5. Retorna URL pública del PDF
         │
         ▼
OrdenPreview.tsx
  Abre modal con iframe/embed del PDF generado
  Botones: [Descargar PDF] [Imprimir] [Cerrar]
  Estado visual: badge "Orden emitida ✓" en verde
```

---

### 10. Datos que el formulario toma automáticamente de la Historia Clínica

El documento se auto-completa con estos campos ya registrados en la HC:

| Campo en la Orden | Origen en la Historia Clínica |
|---|---|
| Nombre completo paciente | `paciente.nombre_completo` |
| Número de cédula | `paciente.cedula` |
| Edad | Calculada de `paciente.fecha_nacimiento` |
| Ciudad | `paciente.ciudad_residencia` |
| Programa | `historia_clinica.programa` (Control Metabólico / Bienestar) |
| Fecha de la orden | `new Date()` al momento de generar |
| Exámenes seleccionados | `seccion_paraclinicos.examenes_marcados[]` |

---

### 11. Componente `GenerarOrdenBtn.tsx`

```typescript
interface Props {
  examenesCount: number;
  generando: boolean;
  pdfUrl: string | null;
  onGenerar: () => void;
}

// Comportamiento:
// — examenesCount === 0  → botón deshabilitado + tooltip "Selecciona exámenes"
// — generando === true   → spinner + "Generando orden..."
// — pdfUrl !== null      → botón "Ver orden generada ✓" en teal + botón "Regenerar"
// — estado normal        → "Generar Orden de Laboratorio" con ícono de documento
```

---

### 12. Consideraciones de calidad y producción

- **Sin datos hardcodeados** en el PDF — todo proviene de los parámetros recibidos.
- **Tipografía**: @react-pdf/renderer usa fuentes embebidas. Registra las fuentes:
  ```typescript
  Font.register({ family: 'Helvetica' }); // incluida por defecto en react-pdf
  ```
- **Internacionalización**: fechas en formato colombiano `DD de MMMM de YYYY` usando `date-fns/es`.
- **Accesibilidad**: el modal de previsualización incluye `aria-label` y `role="dialog"`.
- **Historial**: cada orden queda persistida en Supabase con `pdf_url`, permitiendo consultar órdenes anteriores desde el perfil del paciente.
- **Validez**: el campo `vigencia_dias` (default 30) se imprime en el footer y se puede ajustar por orden.
- **Seguridad**: el PDF en Storage se protege con RLS — solo el médico autenticado puede acceder a sus órdenes.

---

### 13. Criterios de aceptación (Definition of Done)

- [ ] Al marcar exámenes en SeccionParaclinicos, el contador del botón se actualiza en tiempo real.
- [ ] Al hacer clic en "Generar Orden", el PDF se genera en menos de 3 segundos.
- [ ] El PDF generado es visualmente idéntico al modelo aprobado (colores, tipografía, layout).
- [ ] El PDF se abre en modal con opción de descarga e impresión.
- [ ] La orden queda guardada en Supabase con su URL y estado `emitida`.
- [ ] Si no hay exámenes seleccionados, el botón muestra estado deshabilitado con mensaje claro.
- [ ] El logo se carga desde Supabase Storage — si no está disponible muestra placeholder con iniciales "EC".
- [ ] Los datos del paciente se toman 100% de la Historia Clínica — sin campos manuales en este flujo.
- [ ] El módulo funciona correctamente en mobile (el médico puede generar la orden desde su teléfono).

---

*Prompt elaborado por CAST Consultorías SAS — Carlos Suárez, CEO*
*Proyecto: CRM-ERP Dra. Eusimary Contreras | Barranquilla, Colombia*
*Versión: 1.0 — Junio 2026*
