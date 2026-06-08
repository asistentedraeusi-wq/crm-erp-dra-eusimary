import { supabase } from './supabase';

function requireClient() {
  if (!supabase) throw new Error('Supabase no está configurado.');
  return supabase;
}

export interface Soporte {
  id:         string;
  lead_id:    string;
  nombre:     string;
  tipo:       string;
  url:        string;
  hc_id:      string | null;
  created_at: string;
}

export const TIPO_LABELS: Record<string, string> = {
  historia_clinica: 'Historia Clínica',
  orden_medica:     'Orden Médica',
  formula_medica:   'Fórmula Médica',
  resultado_lab:    'Resultado Lab.',
  consentimiento:   'Consentimiento',
  kit_paciente:     'Kit del Paciente',
  otro:             'Documento',
};

export const TIPO_COLORS: Record<string, string> = {
  historia_clinica: '#0A3D2E',
  orden_medica:     '#12C49A',
  formula_medica:   '#D4AF37',
  resultado_lab:    '#D97706',
  consentimiento:   '#6366F1',
  kit_paciente:     '#7C3AED',
  otro:             '#6B7280',
};

export async function listarSoportes(leadId: string) {
  try {
    const client = requireClient();
    const { data, error } = await client
      .from('soportes')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });
    return { data: data as Soporte[] | null, error: error ? new Error(error.message) : null };
  } catch (e) {
    return { data: null, error: e as Error };
  }
}

export async function subirSoporteHTML(
  leadId:      string,
  nombre:      string,
  tipo:        string,
  htmlContent: string,
  hcId?:       string,
): Promise<{ url: string } | null> {
  try {
    const client = requireClient();
    const slug     = nombre.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40);
    const fileName = `${leadId}/${slug}_${Date.now()}.html`;
    const blob     = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });

    const { error: uploadError } = await client.storage
      .from('soportes')
      .upload(fileName, blob, { contentType: 'text/html', upsert: false });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = client.storage
      .from('soportes')
      .getPublicUrl(fileName);

    await client.from('soportes').insert({
      lead_id: leadId,
      nombre,
      tipo,
      url:    publicUrl,
      hc_id:  hcId ?? null,
    });

    return { url: publicUrl };
  } catch {
    return null;
  }
}

export async function subirSoporteArchivo(
  leadId:  string,
  nombre:  string,
  tipo:    string,
  archivo: File,
): Promise<{ url: string } | null> {
  try {
    const client = requireClient();
    const ext      = archivo.name.split('.').pop() ?? 'bin';
    const slug     = nombre.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40);
    const fileName = `${leadId}/${slug}_${Date.now()}.${ext}`;

    const { error: uploadError } = await client.storage
      .from('soportes')
      .upload(fileName, archivo, { contentType: archivo.type, upsert: false });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = client.storage
      .from('soportes')
      .getPublicUrl(fileName);

    await client.from('soportes').insert({
      lead_id: leadId,
      nombre,
      tipo,
      url:    publicUrl,
      hc_id:  null,
    });

    return { url: publicUrl };
  } catch {
    return null;
  }
}

export async function eliminarSoporte(id: string, url: string) {
  try {
    const client = requireClient();
    // Extraer path del storage desde la URL pública
    const match = url.match(/\/soportes\/(.+)$/);
    if (match) {
      await client.storage.from('soportes').remove([match[1]]);
    }
    await client.from('soportes').delete().eq('id', id);
    return { error: null };
  } catch (e) {
    return { error: e as Error };
  }
}
