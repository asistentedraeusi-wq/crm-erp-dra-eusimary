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
--   BREVO_API_KEY  = <TU_BREVO_API_KEY>   ← NUNCA escribir la clave real en este archivo (está en git)
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

-- ─────────────────────────────────────────────────────────────────────────────
-- INTEGRACIÓN CAL.COM — tabla cal_bookings + Edge Function cal-webhook
-- ─────────────────────────────────────────────────────────────────────────────
-- Flujo:
--   Paciente agenda en Cal.com
--     → Cal.com dispara webhook POST a la Edge Function cal-webhook
--     → Edge Function inserta en tabla cal_bookings
--     → CRM escucha via Supabase Realtime
--     → CRM busca el lead por email y mueve la tarjeta automáticamente:
--         primera_cita  → 03 · Cita Agendada
--         segunda_cita  → 06 · 2da Cita Médica

-- PASO 1: Ejecutar este SQL en Supabase Dashboard → SQL Editor → Run

CREATE TABLE IF NOT EXISTS public.cal_bookings (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz DEFAULT now(),
  cal_uid     text        UNIQUE NOT NULL,
  email       text        NOT NULL,
  nombre      text,
  celular     text,
  event_slug  text        NOT NULL,   -- 'primera_cita' | 'segunda_cita'
  start_time  timestamptz
);

ALTER TABLE public.cal_bookings ENABLE ROW LEVEL SECURITY;

-- El CRM (anon key) puede leer los bookings
CREATE POLICY "anon select cal_bookings"
  ON public.cal_bookings FOR SELECT TO anon USING (true);

-- Activar Realtime para que el CRM reciba notificaciones instantáneas
ALTER PUBLICATION supabase_realtime ADD TABLE public.cal_bookings;

-- PASO 2: Subir la Edge Function cal-webhook en Supabase Dashboard
--   → Edge Functions → "New function" → nombre: cal-webhook
--   → Pegar el contenido de supabase/functions/cal-webhook/index.ts
--   → Activar "Disable JWT Verification" (Cal.com no envía JWT de Supabase)
--   → Deploy
--   → Anotar la URL: https://owzeyoxfltuchknxgjbk.supabase.co/functions/v1/cal-webhook
--   (No necesita secrets nuevos: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son automáticos)

-- PASO 3: Registrar el webhook en Cal.com
--   → cal.com/settings/developer/webhooks → "New Webhook"
--   → Subscriber URL: https://owzeyoxfltuchknxgjbk.supabase.co/functions/v1/cal-webhook
--   → Active triggers: BOOKING_CREATED
--   → Save
--   (Aplica a TODOS los tipos de eventos del calendario de la Dra.)

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFICACIÓN SENDER BREVO — asistente.draeusi@gmail.com
-- ─────────────────────────────────────────────────────────────────────────────
-- Sin este paso los emails transaccionales pueden quedar en spam o no enviarse.
--
-- PASO A: Entrar a app.brevo.com → Senders & Domains (menú izquierdo)
-- PASO B: "Add a sender" → Email: asistente.draeusi@gmail.com
--                                  Nombre: Dra. Eusimary Contreras
-- PASO C: Brevo enviará un email de verificación a asistente.draeusi@gmail.com
-- PASO D: Abrir ese email y hacer clic en "Confirm this email address"
-- Una vez confirmado, los 3 emails automáticos funcionarán sin restricciones:
--   • notify-paraclinicos  → recordatorio 48h al paciente
--   • notify-doctor        → notificación a la Dra. con link Cal.com
--   • notify-orden-medica  → Orden Médica al paciente
