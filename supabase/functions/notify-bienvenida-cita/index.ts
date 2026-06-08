// Edge Function: notify-bienvenida-cita
// Envía email motivacional de bienvenida al paciente tras confirmar el pago de la consulta filtro

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY') ?? ''
const SENDER_EMAIL  = 'asistente.draeusi@gmail.com'
const SENDER_NAME   = 'Dra. Eusimary Contreras'
const LOGO_URL      = 'https://draeusimary.netlify.app/logo-dra-eusimary.jpg'

function buildHTML(nombre: string): string {
  const primerNombre = nombre.trim().split(' ')[0]
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¡Bienvenida a tu transformación!</title>
</head>
<body style="margin:0;padding:0;background:#F4F7FA;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F7FA;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0D2244 0%,#1A3A6E 100%);padding:36px 40px;text-align:center;">
              <img src="${LOGO_URL}" alt="Dra. Eusimary Contreras" width="80" height="80"
                   style="border-radius:50%;border:3px solid rgba(212,175,90,0.6);object-fit:cover;display:block;margin:0 auto 16px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">
                Dra. Eusimary Contreras
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.65);font-size:13px;font-weight:500;">
                Especialista en Medicina Estética y Bienestar
              </p>
            </td>
          </tr>

          <!-- Celebración -->
          <tr>
            <td style="background:#12C49A;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#ffffff;font-size:15px;font-weight:700;letter-spacing:0.3px;">
                ✅ PAGO CONFIRMADO · CITA AGENDADA
              </p>
            </td>
          </tr>

          <!-- Cuerpo -->
          <tr>
            <td style="padding:40px 40px 32px;">

              <h2 style="margin:0 0 8px;color:#0D2244;font-size:24px;font-weight:700;">
                ¡Felicitaciones, ${primerNombre}! 🌟
              </h2>
              <p style="margin:0 0 24px;color:#4B5563;font-size:15px;line-height:1.7;">
                Acabas de dar uno de los pasos más importantes de tu vida: <strong>tomar en serio tu salud</strong>.
                Eso requiere valentía, y tú lo hiciste. Hoy no es solo el día de tu cita — es el inicio de un
                camino que va a transformar cómo te sientes, cómo te ves y cómo te relacionas contigo misma.
              </p>

              <!-- Caja de motivación -->
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="background:linear-gradient(135deg,#F0FDF4,#ECFDF5);border-left:4px solid #12C49A;border-radius:0 12px 12px 0;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 10px;color:#065F46;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">
                      Tu decisión merece ser celebrada
                    </p>
                    <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">
                      Cuidar tu salud no es un lujo — es la mejor inversión que puedes hacer.
                      En tu consulta, la Dra. Eusimary te acompañará con un plan personalizado,
                      diseñado exclusivamente para ti y tus metas.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Info de la cita -->
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="background:#F8FAFB;border:1px solid #E5E7EB;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 14px;color:#0D2244;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">
                      📋 Tu consulta filtro
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0;color:#6B7280;font-size:13px;width:40%;">Paciente</td>
                        <td style="padding:6px 0;color:#0D2244;font-size:13px;font-weight:600;">${nombre}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;color:#6B7280;font-size:13px;border-top:1px solid #F0F0F0;">Estado del pago</td>
                        <td style="padding:6px 0;font-size:13px;font-weight:700;color:#16A34A;border-top:1px solid #F0F0F0;">✓ Confirmado</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;color:#6B7280;font-size:13px;border-top:1px solid #F0F0F0;">Siguiente paso</td>
                        <td style="padding:6px 0;color:#0D2244;font-size:13px;font-weight:600;border-top:1px solid #F0F0F0;">Cita Blueprint personalizada</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 28px;color:#4B5563;font-size:14px;line-height:1.7;">
                En tu próxima cita diseñaremos juntas tu <strong>Blueprint de Salud</strong>: un plan
                completamente adaptado a tu cuerpo, tu estilo de vida y tus objetivos. Llega con toda
                tu energía — ¡lo mejor está por comenzar!
              </p>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://wa.me/573001234567"
                       style="display:inline-block;background:linear-gradient(135deg,#12C49A,#0EA882);color:#ffffff;
                              font-size:14px;font-weight:700;text-decoration:none;padding:14px 32px;
                              border-radius:10px;letter-spacing:0.3px;">
                      💬 Escríbenos si tienes preguntas
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F8FAFB;border-top:1px solid #E5E7EB;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 6px;color:#0D2244;font-size:13px;font-weight:700;">
                Dra. Eusimary Contreras
              </p>
              <p style="margin:0 0 4px;color:#9CA3AF;font-size:12px;">
                Medicina Estética · Bienestar Integral · Barranquilla, Colombia
              </p>
              <p style="margin:12px 0 0;color:#D1D5DB;font-size:11px;">
                Este mensaje fue enviado automáticamente. Si tienes dudas escríbenos directamente.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

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
    const { email, nombre } = await req.json() as {
      email:  string
      nombre: string
    }

    if (!email) {
      return new Response(JSON.stringify({ skipped: 'no_email' }), {
        status: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const htmlContent = buildHTML(nombre || 'Paciente')

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key':      BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept':       'application/json',
      },
      body: JSON.stringify({
        sender:      { name: SENDER_NAME, email: SENDER_EMAIL },
        to:          [{ email, name: nombre }],
        subject:     `✅ ¡Tu cita está confirmada! — Dra. Eusimary Contreras`,
        htmlContent,
      }),
    })

    const data = await res.json()
    console.log(`notify-bienvenida-cita → ${res.status}`, JSON.stringify(data))

    return new Response(
      JSON.stringify({ ok: res.ok, status: res.status }),
      { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('notify-bienvenida-cita error:', err)
    return new Response(JSON.stringify({ error: 'internal_error' }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
