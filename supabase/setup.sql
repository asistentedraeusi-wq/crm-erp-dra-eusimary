-- ─────────────────────────────────────────────────────────────────────────────
-- CRM-ERP Dra. Eusimary Contreras — Setup inicial Supabase
-- Ejecutar UNA VEZ en: Supabase Dashboard → SQL Editor → New query → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Función segura de lectura para el CRM (SECURITY DEFINER bypasa RLS)
--    Permite que el CRM lea los leads del formulario web sin exponer la service_role key
DROP FUNCTION IF EXISTS public.crm_get_leads();

CREATE FUNCTION public.crm_get_leads()
RETURNS TABLE (
  id          uuid,
  created_at  timestamptz,
  nombre      text,
  edad        integer,
  celular     text,
  email       text,
  meta        text,
  objetivo    text,
  condicion   text,
  fuente      text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, created_at, nombre, edad, celular, email, meta, objetivo, condicion, fuente
  FROM public.leads
  ORDER BY created_at ASC;
$$;

-- 2. Permitir que la clave anon ejecute la función
GRANT EXECUTE ON FUNCTION public.crm_get_leads() TO anon;

-- ─────────────────────────────────────────────────────────────────────────────
-- INTEGRACIÓN BREVO — Edge Function notify-lead
-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 1: Subir la Edge Function desde el Dashboard de Supabase
--   → Edge Functions → "New function" → nombre: notify-lead
--   → Pegar el contenido de supabase/functions/notify-lead/index.ts
--   → Activar "Disable JWT Verification" (el webhook no envía JWT)
--   → Deploy

-- PASO 2: Agregar secrets en Supabase Dashboard
--   → Edge Functions → notify-lead → Secrets → Add secret
--   BREVO_API_KEY  = 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
--   BREVO_LIST_ID  = 2

-- PASO 3: Crear el Database Webhook en Supabase Dashboard
--   → Database → Webhooks → "Create a new hook"
--   Nombre:   notify-lead-brevo
--   Tabla:    public.leads
--   Evento:   INSERT
--   Tipo:     Supabase Edge Functions
--   Function: notify-lead
--   → Save

-- Con esto: INSERT en leads → webhook → Edge Function → Brevo lista 2 → 7 emails automáticos

-- ─────────────────────────────────────────────────────────────────────────────
-- INTEGRACIÓN PARACLÍNICOS — Edge Function notify-paraclinicos
-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 1: Crear lista en Brevo Dashboard
--   → Contactos → Listas → Crear lista: "Paraclínicos-Recordatorio" (anota el ID)

-- PASO 2: Agregar secret en Supabase Dashboard
--   → Edge Functions → Secrets → Add secret
--   BREVO_PARACLINICOS_LIST_ID  = <ID de la lista creada en Brevo>
--   (BREVO_API_KEY ya existe, no hay que volver a agregarlo)

-- PASO 3: Subir Edge Function notify-paraclinicos
--   → Edge Functions → "New function" → nombre: notify-paraclinicos
--   → Pegar el contenido de supabase/functions/notify-paraclinicos/index.ts
--   → Activar "Disable JWT Verification"
--   → Deploy

-- PASO 4: Crear automatización en Brevo
--   → Automatizaciones → Nueva automatización
--   → Disparador: "Contacto añadido a una lista" → Paraclínicos-Recordatorio
--   → Acción 1: Esperar 48 horas
--   → Acción 2: Enviar email — asunto: "Recuerda realizarte tus exámenes"
--   → Guardar y activar

-- Con esto: lead llega a columna 05 · Paraclínicos en el CRM →
--   CRM llama Edge Function → Brevo lista Paraclínicos-Recordatorio →
--   automatización espera 48h → envía recordatorio de exámenes al paciente
