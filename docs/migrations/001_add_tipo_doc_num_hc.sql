-- =====================================================================
-- MIGRACIÓN 001 — Agregar tipo_doc y num_hc a historias_clinicas
-- Ejecutar en: Supabase → SQL Editor
-- =====================================================================
-- El num_hc es el identificador legible del paciente: "CC-12345678"
-- Permite buscar cualquier historia clínica solo con el número de cédula.
-- =====================================================================

-- 1. Agregar columnas de identificación del paciente
ALTER TABLE historias_clinicas
  ADD COLUMN IF NOT EXISTS tipo_doc  text,
  ADD COLUMN IF NOT EXISTS num_hc    text;

-- 2. Rellenar retroactivamente los registros existentes
--    (si ya tenían paciente_cc, se genera num_hc a partir del tipo_doc del JSONB)
UPDATE historias_clinicas
SET
  tipo_doc = datos->>'tipo_doc',
  num_hc   = CASE
               WHEN datos->>'tipo_doc' IS NOT NULL AND datos->>'cc' IS NOT NULL
               THEN (datos->>'tipo_doc') || '-' || (datos->>'cc')
               ELSE NULL
             END
WHERE tipo_doc IS NULL;

-- 3. Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_hc_paciente_cc  ON historias_clinicas (paciente_cc);
CREATE INDEX IF NOT EXISTS idx_hc_num_hc        ON historias_clinicas (num_hc);
CREATE INDEX IF NOT EXISTS idx_hc_fecha         ON historias_clinicas (fecha_consulta DESC);
CREATE INDEX IF NOT EXISTS idx_hc_tipo_doc      ON historias_clinicas (tipo_doc);

-- 4. (Opcional) Restringir unicidad de num_hc por si no se quieren duplicados:
-- ALTER TABLE historias_clinicas ADD CONSTRAINT uq_num_hc UNIQUE (num_hc);
-- NOTA: comentar la línea anterior si un paciente puede tener varias HCs

-- =====================================================================
-- VERIFICACIÓN — Ejecutar después para confirmar que todo quedó bien:
-- =====================================================================
-- SELECT id, num_hc, tipo_doc, paciente_cc, fecha_consulta
-- FROM historias_clinicas
-- ORDER BY fecha_consulta DESC
-- LIMIT 10;
--
-- Buscar por CC del paciente:
-- SELECT * FROM historias_clinicas WHERE paciente_cc = '12345678';
--
-- Buscar por num_hc:
-- SELECT * FROM historias_clinicas WHERE num_hc = 'CC-12345678';
-- =====================================================================
