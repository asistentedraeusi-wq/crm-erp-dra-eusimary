-- ─────────────────────────────────────────────────────────────────────────────
-- Migración 003 — tabla soportes + bucket Storage
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Tabla soportes ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.soportes (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id    text        NOT NULL,
  nombre     text        NOT NULL DEFAULT '',
  tipo       text        NOT NULL DEFAULT 'otro',
  url        text        NOT NULL DEFAULT '',
  hc_id      text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.soportes ENABLE ROW LEVEL SECURITY;

-- Usuarios autenticados (admin + asistente) pueden leer, insertar y eliminar
CREATE POLICY "soportes_select" ON public.soportes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "soportes_insert" ON public.soportes
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "soportes_delete" ON public.soportes
  FOR DELETE TO authenticated USING (true);

-- ─── Bucket Storage "soportes" ───────────────────────────────────────────────
-- Ejecutar TAMBIÉN en el SQL Editor (Supabase permite crear buckets por SQL):
INSERT INTO storage.buckets (id, name, public)
  VALUES ('soportes', 'soportes', true)
  ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage: usuarios autenticados pueden subir y eliminar
-- Lectura pública (los PDF/HTML se abren sin autenticación via URL directa)
CREATE POLICY "soportes_storage_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'soportes');

CREATE POLICY "soportes_storage_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'soportes');

CREATE POLICY "soportes_storage_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'soportes');
