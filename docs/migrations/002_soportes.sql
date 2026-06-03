-- =====================================================================
-- MIGRACIÓN 002 — Tabla soportes + bucket Storage
-- Ejecutar en: Supabase → SQL Editor
-- =====================================================================

-- 1. Tabla de soportes / documentos adjuntos por lead
CREATE TABLE IF NOT EXISTS soportes (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id    text        NOT NULL,
  nombre     text        NOT NULL,
  tipo       text        NOT NULL DEFAULT 'otro',
  url        text,
  hc_id      text,
  created_at timestamptz NOT NULL DEFAULT now(),
  metadata   jsonb
);

CREATE INDEX IF NOT EXISTS idx_soportes_lead_id  ON soportes (lead_id);
CREATE INDEX IF NOT EXISTS idx_soportes_tipo     ON soportes (tipo);
CREATE INDEX IF NOT EXISTS idx_soportes_hc_id    ON soportes (hc_id);

-- 2. Activar Row Level Security (RLS) — ajustar según política de auth
ALTER TABLE soportes ENABLE ROW LEVEL SECURITY;

-- Política permisiva para anon (ajustar según seguridad requerida)
CREATE POLICY "soportes_anon_all" ON soportes
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- =====================================================================
-- 3. Bucket de Storage "soportes"
--    Ejecutar DESPUÉS de crear el bucket manualmente en:
--    Supabase → Storage → New bucket → nombre: "soportes" → Public: ON
-- =====================================================================
-- Una vez creado el bucket, este comentario queda como referencia.
-- La subida usa: supabase.storage.from('soportes').upload(path, blob)
-- La URL pública usa: supabase.storage.from('soportes').getPublicUrl(path)

-- =====================================================================
-- VERIFICACIÓN
-- =====================================================================
-- SELECT * FROM soportes ORDER BY created_at DESC LIMIT 10;
-- SELECT lead_id, COUNT(*) as docs FROM soportes GROUP BY lead_id;
-- =====================================================================
