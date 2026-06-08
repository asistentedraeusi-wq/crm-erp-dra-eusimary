-- ─────────────────────────────────────────────────────────────────────────────
-- Migración 002 — tabla crm_leads
-- Almacena el estado completo del pipeline CRM compartido entre todos los
-- usuarios autenticados (admin + asistente).
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query → Run
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.crm_leads (
  id               text        PRIMARY KEY,
  name             text        NOT NULL DEFAULT '',
  phone            text        NOT NULL DEFAULT '',
  email            text        NOT NULL DEFAULT '',
  age              integer     NOT NULL DEFAULT 0,
  city             text        NOT NULL DEFAULT '',
  stage            text        NOT NULL DEFAULT 'nuevo',
  date             text        NOT NULL DEFAULT '',
  plan             text,
  tags             jsonb       NOT NULL DEFAULT '[]',
  source           text,
  notes            text,
  meta             text,
  objetivo         text,
  condicion        text,
  fuente           text,
  filtro_pagado    boolean,
  pago_confirmado  boolean,
  plan_inicio      text,
  seguimiento      jsonb,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;

-- Solo usuarios autenticados (admin + asistente) pueden leer y escribir
CREATE POLICY "crm_leads_select"
  ON public.crm_leads FOR SELECT TO authenticated USING (true);

CREATE POLICY "crm_leads_insert"
  ON public.crm_leads FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "crm_leads_update"
  ON public.crm_leads FOR UPDATE TO authenticated USING (true);

CREATE POLICY "crm_leads_delete"
  ON public.crm_leads FOR DELETE TO authenticated USING (true);

-- ─── Realtime ─────────────────────────────────────────────────────────────────
-- Permite que ambos usuarios vean los cambios del otro en tiempo real
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_leads;

-- ─── Trigger updated_at ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS crm_leads_updated_at ON public.crm_leads;
CREATE TRIGGER crm_leads_updated_at
  BEFORE UPDATE ON public.crm_leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
