-- =====================================================================
-- MIGRACIÓN 003 — Incluir columna fuente en crm_get_leads()
-- Ejecutar en: Supabase → SQL Editor
-- Precondición: la columna fuente ya existe en la tabla leads
-- =====================================================================

CREATE OR REPLACE FUNCTION public.crm_get_leads()
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

GRANT EXECUTE ON FUNCTION public.crm_get_leads() TO anon;

-- =====================================================================
-- VERIFICACIÓN
-- =====================================================================
-- SELECT id, nombre, fuente FROM leads LIMIT 10;
-- =====================================================================
