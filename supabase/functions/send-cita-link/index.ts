// Edge Function: send-cita-link
// Envía al lead el enlace de Cal.com para agendar su cita (1ª, 2ª o Libre)
// CC automático a asistente.draeusi@gmail.com

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY') ?? ''
const SENDER_EMAIL  = 'asistente.draeusi@gmail.com'
const SENDER_NAME   = 'Dra. Eusimary Contreras'
const LOGO_URL      = 'https://draeusimary.netlify.app/logo-dra-eusimary.jpg'

interface Payload {
  email:  string
  nombre: string
  tipo:   '1era' | '2da' | 'libre'
  calUrl: string
}

const TIPO_INFO: Record<string, { titulo: string; subtitulo: string; headerColor: string; badgeText: string; badgeColor: string }> = {
  '1era': {
    titulo:      '1ª Cita Médica Especializada',
    subtitulo:   'Control Metabólico y Bienestar',
    headerColor: '#0A3D2E',
    badgeText:   '📋 AGENDA TU 1ª CITA',
    badgeColor:  '#12C49A',
  },
  '2da': {
    titulo:      '2ª Cita Médica',
    subtitulo:   'Seguimiento y Plan de Manejo',
    headerColor: '#92400E',
    badgeText:   '📅 AGENDA TU 2ª CITA',
    badgeColor:  '#D97706',
  },
  'libre': {
    titulo:      'Cita de Consulta Libre',
    subtitulo:   'Consulta adicional con la Dra. Eusimary',
    headerColor: '#1E1B4B',
    badgeText:   '💬 AGENDA TU CITA',
    badgeColor:  '#6366F1',
  },
}

function buildHTML(nombre: string, tipo: string, calUrl: string): string {
  const primerNombre = nombre.trim().split(' ')[0]
  const info = TIPO_INFO[tipo] ?? TIPO_INFO['1era']

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Agenda tu cita — Dra. Eusimary Contreras</title>
</head>
<body style="margin:0;padding:0;background:#F4F7FA;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F7FA;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,${info.headerColor} 0%,${info.headerColor}CC 100%);padding:36px 40px;text-align:center;">
              <img src="${LOGO_URL}" alt="Dra. Eusimary Contreras" width="80" height="80"
                   style="border-radius:50%;border:3px solid rgba(212,175,90,0.6);object-fit:cover;display:block;margin:0 auto 16px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Dra. Eusimary Contreras</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.65);font-size:13px;">Medicina Estética · Bienestar Integral</p>
            </td>
          </tr>

          <!-- Badge tipo cita -->
          <tr>
            <td style="background:${info.badgeColor};padding:14px 40px;text-align:center;">
              <p style="margin:0;color:#ffffff;font-size:14px;font-weight:700;letter-spacing:0.5px;">${info.badgeText}</p>
            </td>
          </tr>

          <!-- Cuerpo -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 8px;color:#0D2244;font-size:22px;font-weight:700;">
                Hola, ${primerNombre} 👋
              </h2>
              <p style="margin:0 0 24px;color:#4B5563;font-size:15px;line-height:1.7;">
                La Dra. Eusimary te invita a agendar tu
                <strong>${info.titulo}</strong> —
                ${info.subtitulo}. Solo da clic en el botón y elige el horario que mejor te quede.
              </p>

              <!-- Info cita -->
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="background:#F8FAFB;border:1px solid #E5E7EB;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:7px 0;color:#6B7280;font-size:13px;width:40%;border-bottom:1px solid #F0F0F0;">Paciente</td>
                        <td style="padding:7px 0;color:#0D2244;font-size:13px;font-weight:600;border-bottom:1px solid #F0F0F0;">${nombre}</td>
                      </tr>
                      <tr>
                        <td style="padding:7px 0;color:#6B7280;font-size:13px;border-bottom:1px solid #F0F0F0;">Tipo</td>
                        <td style="padding:7px 0;color:#0D2244;font-size:13px;font-weight:600;border-bottom:1px solid #F0F0F0;">${info.titulo}</td>
                      </tr>
                      <tr>
                        <td style="padding:7px 0;color:#6B7280;font-size:13px;">Modalidad</td>
                        <td style="padding:7px 0;color:#0D2244;font-size:13px;font-weight:600;">Presencial · Barranquilla</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA principal -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <a href="${calUrl}"
                       style="display:inline-block;background:${info.badgeColor};color:#ffffff;
                              font-size:15px;font-weight:700;text-decoration:none;
                              padding:16px 40px;border-radius:12px;letter-spacing:0.3px;">
                      📆 Agendar mi cita ahora
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;color:#9CA3AF;font-size:12px;text-align:center;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:
              </p>
              <p style="margin:0;color:#6366F1;font-size:11px;text-align:center;word-break:break-all;">
                <a href="${calUrl}" style="color:${info.badgeColor};">${calUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F8FAFB;border-top:1px solid #E5E7EB;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 4px;color:#0D2244;font-size:13px;font-weight:700;">Dra. Eusimary Contreras Morales</p>
              <p style="margin:0 0 4px;color:#9CA3AF;font-size:12px;">Medicina Estética · Bienestar Integral · Barranquilla, Colombia</p>
              <p style="margin:10px 0 0;color:#D1D5DB;font-size:11px;">
                Este mensaje fue enviado desde el consultorio de la Dra. Eusimary Contreras.
                Si tienes dudas escríbenos directamente a este correo.
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
    const { email, nombre, tipo, calUrl } = await req.json() as Payload

    if (!email || !calUrl) {
      return new Response(JSON.stringify({ skipped: 'missing_params' }), {
        status: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const htmlContent = buildHTML(nombre || 'Paciente', tipo || '1era', calUrl)

    const tipoLabels: Record<string, string> = {
      '1era':  '1ª Cita Médica — Dra. Eusimary Contreras',
      '2da':   '2ª Cita Médica — Dra. Eusimary Contreras',
      'libre': 'Cita de Consulta — Dra. Eusimary Contreras',
    }
    const subject = `📆 ${tipoLabels[tipo] ?? tipoLabels['1era']}`

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
        cc:          [{ email: SENDER_EMAIL, name: 'Asistente Dra. Eusimary' }],
        subject,
        htmlContent,
      }),
    })

    const data = await res.json()
    console.log(`send-cita-link → ${res.status}`, JSON.stringify(data))

    return new Response(
      JSON.stringify({ ok: res.ok, status: res.status }),
      { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('send-cita-link error:', err)
    return new Response(JSON.stringify({ error: 'internal_error' }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
