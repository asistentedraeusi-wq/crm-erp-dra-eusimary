// Edge Function: notify-formula-medica
// Envía la Fórmula Médica (prescripción de medicamentos) al email del paciente vía Brevo
// Recibe el HTML ya generado por el CRM (mismo documento normativo que se imprime)

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY') ?? ''
const SENDER_EMAIL  = 'asistente.draeusi@gmail.com'
const SENDER_NAME   = 'Dra. Eusimary Contreras'

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req: Request) => {
  // Preflight CORS — obligatorio o el browser bloquea la llamada real
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: CORS })
  }

  try {
    const { email, nombre, ordenNum, pdfBase64 } = await req.json() as {
      email:       string
      nombre:      string
      ordenNum?:   string
      pdfBase64?:  string
    }

    if (!email) {
      return new Response(JSON.stringify({ skipped: 'no_email' }), {
        status: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const primerNombre = (nombre || 'Paciente').trim().split(' ')[0]
    const ref = ordenNum ? ` · Ref: ${ordenNum}` : ''

    const htmlBody = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F4F7FA;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F7FA;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#0A3D2E,#0D6B4E);padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;">Dra. Eusimary Contreras</h1>
          <p style="margin:4px 0 0;color:rgba(255,255,255,0.65);font-size:13px;">Medicina Estética · Bienestar Integral</p>
        </td></tr>
        <tr><td style="background:#12C49A;padding:12px 40px;text-align:center;">
          <p style="margin:0;color:#fff;font-size:13px;font-weight:700;">℞ ORDEN MÉDICA DE MEDICAMENTOS${ref}</p>
        </td></tr>
        <tr><td style="padding:36px 40px;">
          <h2 style="margin:0 0 16px;color:#0D2244;font-size:20px;font-weight:700;">Hola, ${primerNombre} 👋</h2>
          <p style="margin:0 0 20px;color:#4B5563;font-size:15px;line-height:1.7;">
            Adjuntamos tu <strong>Orden Médica de Medicamentos</strong> emitida por la Dra. Eusimary Contreras.
            Puedes presentar este documento en la farmacia o droguería de tu elección.
          </p>
          <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;padding:16px 20px;margin-bottom:20px;">
            <p style="margin:0;color:#065F46;font-size:13px;font-weight:700;">📎 El PDF con tu orden médica está adjunto a este correo.</p>
          </div>
          <p style="margin:0;color:#6B7280;font-size:13px;line-height:1.7;">
            Si tienes preguntas sobre tu medicación, responde a este correo o contáctanos por WhatsApp.
          </p>
        </td></tr>
        <tr><td style="background:#F8FAFB;border-top:1px solid #E5E7EB;padding:20px 40px;text-align:center;">
          <p style="margin:0;color:#0D2244;font-size:13px;font-weight:700;">Dra. Eusimary Contreras Morales</p>
          <p style="margin:4px 0 0;color:#9CA3AF;font-size:12px;">Medicina Estética · Bienestar Integral · Barranquilla, Colombia</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`

    const payload: Record<string, unknown> = {
      sender:      { name: SENDER_NAME, email: SENDER_EMAIL },
      to:          [{ email, name: nombre }],
      cc:          [{ email: SENDER_EMAIL, name: 'Asistente Dra. Eusimary' }],
      subject:     `℞ Tu Orden Médica de Medicamentos${ref} — Dra. Eusimary Contreras`,
      htmlContent: htmlBody,
    }

    if (pdfBase64) {
      payload.attachment = [{
        content: pdfBase64,
        name:    `Orden_Medica_${ordenNum ?? 'Medicamentos'}_${(nombre || 'Paciente').replace(/\s+/g, '_')}.pdf`,
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
    console.log(`notify-formula-medica → ${res.status}`, JSON.stringify(data))

    return new Response(
      JSON.stringify({ ok: res.ok, status: res.status }),
      { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('notify-formula-medica error:', err)
    return new Response(JSON.stringify({ error: 'internal_error' }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
