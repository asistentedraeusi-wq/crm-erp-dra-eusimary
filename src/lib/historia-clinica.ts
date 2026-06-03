import { supabase } from './supabase';
import type { HistoriaClinicaForm, HistoriaClinicaDB } from '../types/historia-clinica';

function requireClient() {
  if (!supabase) throw new Error('Supabase no está configurado. Revisa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env');
  return supabase;
}

export async function crearHistoriaClinica(
  datos: HistoriaClinicaForm
): Promise<{ data: HistoriaClinicaDB | null; error: Error | null }> {
  try {
    const client = requireClient();
    const { data, error } = await client
      .from('historias_clinicas')
      .insert({
        datos,
        paciente_cc:    datos.cc,
        fecha_consulta: datos.fecha_consulta,
        programa:       datos.programa,
        modalidad:      datos.modalidad,
        consent_habeas: datos.consent_habeas,
        consent_med:    datos.consent_med,
      })
      .select()
      .single();

    return {
      data: data as HistoriaClinicaDB | null,
      error: error ? new Error(error.message) : null,
    };
  } catch (e) {
    return { data: null, error: e as Error };
  }
}

export async function obtenerHistoria(id: string): Promise<{ data: HistoriaClinicaDB | null; error: Error | null }> {
  try {
    const client = requireClient();
    const { data, error } = await client
      .from('historias_clinicas')
      .select('*')
      .eq('id', id)
      .single();

    return {
      data: data as HistoriaClinicaDB | null,
      error: error ? new Error(error.message) : null,
    };
  } catch (e) {
    return { data: null, error: e as Error };
  }
}

export async function listarHistorias(limite = 50) {
  try {
    const client = requireClient();
    const { data, error } = await client
      .from('historias_clinicas')
      .select('id, created_at, paciente_cc, fecha_consulta, programa, modalidad')
      .order('fecha_consulta', { ascending: false })
      .limit(limite);

    return { data, error: error ? new Error(error.message) : null };
  } catch (e) {
    return { data: null, error: e as Error };
  }
}

export async function actualizarHistoriaClinica(
  id: string,
  datos: HistoriaClinicaForm
): Promise<{ data: HistoriaClinicaDB | null; error: Error | null }> {
  try {
    const client = requireClient();
    const { data, error } = await client
      .from('historias_clinicas')
      .update({
        datos,
        programa:       datos.programa,
        modalidad:      datos.modalidad,
        consent_habeas: datos.consent_habeas,
        consent_med:    datos.consent_med,
        updated_at:     new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    return {
      data: data as HistoriaClinicaDB | null,
      error: error ? new Error(error.message) : null,
    };
  } catch (e) {
    return { data: null, error: e as Error };
  }
}

export async function buscarPacientePorCC(cc: string): Promise<Partial<HistoriaClinicaForm> | null> {
  try {
    const client = requireClient();
    const { data } = await client
      .from('historias_clinicas')
      .select('datos')
      .eq('paciente_cc', cc)
      .order('fecha_consulta', { ascending: false })
      .limit(1)
      .single();

    return data?.datos as Partial<HistoriaClinicaForm> | null;
  } catch {
    return null;
  }
}
