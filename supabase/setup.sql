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
