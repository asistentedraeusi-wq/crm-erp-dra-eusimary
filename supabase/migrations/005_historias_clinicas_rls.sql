-- =====================================================================
-- MIGRACIÓN 005 — RLS completo para historias_clinicas
-- Ejecutar en: Supabase → SQL Editor → New query → Run
-- =====================================================================
-- Problema: El usuario asistente no puede guardar HC porque la tabla
-- historias_clinicas no tiene políticas RLS para INSERT y UPDATE que
-- cubran a todos los usuarios autenticados.
-- =====================================================================

-- 1. Asegurar que RLS está activado
ALTER TABLE public.historias_clinicas ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas anteriores para recrear limpiamente
DROP POLICY IF EXISTS "hc_select"  ON public.historias_clinicas;
DROP POLICY IF EXISTS "hc_insert"  ON public.historias_clinicas;
DROP POLICY IF EXISTS "hc_update"  ON public.historias_clinicas;
DROP POLICY IF EXISTS "hc_delete"  ON public.historias_clinicas;
DROP POLICY IF EXISTS "Enable read access for authenticated users"  ON public.historias_clinicas;
DROP POLICY IF EXISTS "Enable insert for authenticated users"       ON public.historias_clinicas;
DROP POLICY IF EXISTS "Enable update for authenticated users"       ON public.historias_clinicas;

-- 3. Crear políticas para TODOS los usuarios autenticados
--    (admin + asistente + cualquier usuario con cuenta en Supabase Auth)

CREATE POLICY "hc_select"
  ON public.historias_clinicas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "hc_insert"
  ON public.historias_clinicas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "hc_update"
  ON public.historias_clinicas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Borrado físico deshabilitado (las HCs son permanentes por ley colombiana)

-- =====================================================================
-- VERIFICACIÓN — Ejecutar para confirmar que las políticas existen:
-- =====================================================================
-- SELECT schemaname, tablename, policyname, cmd, roles
-- FROM pg_policies
-- WHERE tablename = 'historias_clinicas';
-- =====================================================================
