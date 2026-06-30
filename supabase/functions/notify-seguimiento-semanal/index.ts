// Edge Function: notify-seguimiento-semanal
// Envía el reporte de seguimiento semanal al paciente vía Brevo con PDF adjunto

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY') ?? ''
const SENDER_EMAIL  = 'asistente.draeusi@gmail.com'
const SENDER_NAME   = 'Dra. Eusimary Contreras'

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: CORS })
  }

  try {
    const { email, nombre, semana, plan, pdfBase64 } = await req.json() as {
      email:      string
      nombre:     string
      semana:     number
      plan?:      string
      pdfBase64?: string
    }

    if (!email) {
      return new Response(JSON.stringify({ skipped: 'no_email' }), {
        status: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const primerNombre  = (nombre || 'Paciente').trim().split(' ')[0]
    const planLabel     = plan === 'S1' ? 'Control Metabólico Premium' : plan === 'S2' ? 'Bienestar Integral' : 'Programa Personalizado'
    const esControl     = [4, 8, 12].includes(semana)
    const tituloSemana  = esControl ? `⭐ Control Médico — Semana ${semana}` : `📊 Seguimiento — Semana ${semana}`

    const htmlBody = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F4F7FA;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F7FA;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#0A3D2E,#0D6B4E);padding:28px 40px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;">Dra. Eusimary Contreras</h1>
          <p style="margin:4px 0 0;color:rgba(255,255,255,0.65);font-size:13px;">Medicina Estética · Bienestar Integral</p>
        </td></tr>
        <tr><td style="background:${esControl ? '#D4AF37' : '#12C49A'};padding:10px 40px;text-align:center;">
          <p style="margin:0;color:#fff;font-size:13px;font-weight:700;">${tituloSemana}</p>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <h2 style="margin:0 0 14px;color:#0D2244;font-size:18px;font-weight:700;">Hola, ${primerNombre} 👋</h2>
          <p style="margin:0 0 16px;color:#4B5563;font-size:14px;line-height:1.7;">
            Te compartimos el reporte de tu <strong>Semana ${semana}</strong> del programa
            <strong>${planLabel}</strong> con la Dra. Eusimary Contreras.
          </p>
          <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;padding:14px 18px;margin-bottom:18px;">
            <p style="margin:0;color:#065F46;font-size:13px;font-weight:700;">
              📎 Tu reporte completo está adjunto en PDF — incluye tus métricas, evolución vs. inicio${semana > 1 ? ` y comparativo con la semana ${semana - 1}` : ''}, y un mensaje personalizado.
            </p>
          </div>
          ${esControl ? `
          <div style="background:#FFFDF0;border:1.5px solid #D4AF3766;border-radius:10px;padding:14px 18px;margin-bottom:18px;">
            <p style="margin:0 0 4px;color:#92400E;font-size:12px;font-weight:800;">⭐ Semana de Control Médico</p>
            <p style="margin:0;color:#78350F;font-size:13px;line-height:1.6;">Esta es una semana de control especial. Revisa el PDF con las indicaciones de la Dra. Eusimary para las próximas semanas.</p>
          </div>
          ` : ''}
          <p style="margin:0;color:#6B7280;font-size:12px;line-height:1.7;">
            Recuerda registrar tu seguimiento cada semana. La constancia es la clave de tu transformación.
            Si tienes dudas, responde a este correo o escríbenos por WhatsApp.
          </p>
        </td></tr>
        <tr><td style="background:#F8FAFB;border-top:1px solid #E5E7EB;padding:18px 40px;text-align:center;">
          <p style="margin:0;color:#0D2244;font-size:12px;font-weight:700;">Dra. Eusimary Contreras Morales</p>
          <p style="margin:4px 0 0;color:#9CA3AF;font-size:11px;">Medicina Estética · Bienestar Integral · Barranquilla, Colombia</p>
          <p style="margin:4px 0 0;color:#9CA3AF;font-size:11px;">WhatsApp +57 301 625 4865 · draeusimary.netlify.app</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`

    const payload: Record<string, unknown> = {
      sender:      { name: SENDER_NAME, email: SENDER_EMAIL },
      to:          [{ email, name: nombre }],
      cc:          [{ email: SENDER_EMAIL, name: 'Asistente Dra. Eusimary' }],
      subject:     `${esControl ? '⭐ Control Médico' : '📊 Seguimiento'} Semana ${semana} · ${nombre} · Dra. Eusimary Contreras`,
      htmlContent: htmlBody,
    }

    if (pdfBase64) {
      payload.attachment = [{
        content: pdfBase64,
        name:    `Seguimiento_Semana_${semana}_${(nombre || 'Paciente').replace(/\s+/g, '_')}.pdf`,
      }]
    }

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key':      BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept':       'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    console.log(`notify-seguimiento-semanal sem${semana} → ${res.status}`, JSON.stringify(data))

    return new Response(
      JSON.stringify({ ok: res.ok, status: res.status }),
      { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('notify-seguimiento-semanal error:', err)
    return new Response(JSON.stringify({ error: 'internal_error' }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
