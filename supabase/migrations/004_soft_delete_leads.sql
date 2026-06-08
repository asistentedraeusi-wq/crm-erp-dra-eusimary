-- ─────────────────────────────────────────────────────────────────────────────
-- Migración 004 — Soft-delete en crm_leads
-- Los leads eliminados se marcan con deleted_at (no se borran físicamente).
-- Quedan recuperables por 30 días desde el Dashboard de Supabase.
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query → Run
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.crm_leads
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;

-- El CRM solo lee leads activos (deleted_at IS NULL)
-- Actualizar la política de SELECT para excluir eliminados
DROP POLICY IF EXISTS "crm_leads_select" ON public.crm_leads;
CREATE POLICY "crm_leads_select"
  ON public.crm_leads FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

-- Vista auxiliar para ver leads eliminados desde el Dashboard
CREATE OR REPLACE VIEW public.crm_leads_papelera AS
  SELECT * FROM public.crm_leads
  WHERE deleted_at IS NOT NULL
  ORDER BY deleted_at DESC;
