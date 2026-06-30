// Edge Function: notify-kit-paciente
// Envía el Kit del Paciente (plan completo de manejo) al email del paciente vía Brevo

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
    const { email, nombre, htmlContent } = await req.json() as {
      email:       string
      nombre:      string
      htmlContent: string
    }

    if (!email || !htmlContent) {
      return new Response(JSON.stringify({ skipped: 'no_email_or_html' }), {
        status: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

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
        subject:     `🩺 Tu Kit del Paciente — Plan de Manejo Personalizado · Dra. Eusimary Contreras`,
        htmlContent,
      }),
    })

    const data = await res.json()
    console.log(`notify-kit-paciente → ${res.status}`, JSON.stringify(data))

    return new Response(
      JSON.stringify({ ok: res.ok, status: res.status }),
      { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('notify-kit-paciente error:', err)
    return new Response(JSON.stringify({ error: 'internal_error' }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
