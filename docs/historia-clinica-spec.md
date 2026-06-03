# Historia Clinica BluePrint Session — Especificacion Tecnica
## Dra. Eusimary Contreras Morales — Medicina Metabolica y Longevidad
## CAST Consultorias SAS — Barranquilla, Colombia

> Adaptada de Next.js a Vite + React + TypeScript + Tailwind CSS v4 + React Router DOM

---

## Stack del proyecto
- Vite + React + TypeScript
- Tailwind CSS v4 (espaciado SIEMPRE con `style={{}}` inline)
- React Router DOM v7
- Supabase client-side (anon key)
- sonner (toasts)

## Rutas implementadas
- `/historia-clinica/nueva` — Formulario nueva HC
- `/historia-clinica/:id` — Ver HC existente (read-only)

## Archivos del modulo
```
src/
├── types/historia-clinica.ts
├── constants/historia-clinica.ts
├── lib/
│   ├── calculadora/composicion-corporal.ts
│   └── historia-clinica.ts
├── components/historia-clinica/
│   ├── HeaderHC.tsx
│   ├── FirmaHC.tsx
│   ├── HistoriaClinicaForm.tsx
│   ├── calculadora/TeleCalc.tsx
│   ├── ui/
│   │   ├── SectionHeader.tsx
│   │   ├── FormField.tsx
│   │   ├── CheckGroup.tsx
│   │   ├── ResultCard.tsx
│   │   └── ModalityToggle.tsx
│   └── sections/
│       ├── S01_Identificacion.tsx
│       ├── S02_Consulta.tsx
│       ├── S03_Antecedentes.tsx
│       ├── S04_Habitos.tsx
│       ├── S05_Gineco.tsx
│       ├── S06_Sintomas.tsx
│       ├── S07_ExamenFisico.tsx
│       ├── S08_Diagnostico.tsx
│       ├── S09_Paraclínicos.tsx
│       ├── S10_PlanManejo.tsx
│       ├── S11_Consentimiento.tsx
│       └── S12_NotasMedico.tsx
└── pages/HistoriaClinicaPage.tsx
```

## Tabla Supabase: historias_clinicas
Ver schema SQL completo en el original del prompt o ejecutar el SQL en Supabase Editor.

## Paleta de colores
- Teal: #12C49A (PRIMARY)
- Teal-dark: #0A3D2E
- Teal-mid: #0D7A5F
- Teal-bg: #E6FAF5
- Gold: #D4AF37
- Gold-light: #FFF8E7

## Datos de la Dra.
- Nombre: Dra. Eusimary Contreras Morales
- Especialidad: Medica Cirujana | Esp. Gerencia de la Calidad y Salud
- RM: R.M. 13-8793-05
- Tel: +57 314 582 21 69
- Web: draeusimary.netlify.app
- Ciudad: Barranquilla, Colombia

---
*Generado por CAST Consultorias SAS — Junio 2026*
