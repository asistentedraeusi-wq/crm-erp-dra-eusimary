// Edge Function: notify-orden-medica
// Envía la Orden Médica de Paraclínicos al email del paciente vía Brevo
// Recibe el HTML ya generado por el CRM (mismo documento normativo que se imprime)

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY') ?? ''
const SENDER_EMAIL  = 'asistente.draeusi@gmail.com'
const SENDER_NAME   = 'Dra. Eusimary Contreras'

Deno.serve(async (req: Request) => {
  try {
    const { email, nombre, htmlContent } = await req.json() as {
      email:       string
      nombre:      string
      htmlContent: string
    }

    if (!email || !htmlContent) {
      return new Response(JSON.stringify({ skipped: 'no_email_or_html' }), {
        status: 200, headers: { 'Content-Type': 'application/json' },
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
        subject:     `🔬 Tu Orden Médica de Laboratorio — Dra. Eusimary Contreras`,
        htmlContent,
      }),
    })

    const data = await res.json()
    console.log(`notify-orden-medica → ${res.status}`, JSON.stringify(data))

    return new Response(
      JSON.stringify({ ok: res.ok, status: res.status }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('notify-orden-medica error:', err)
    return new Response(JSON.stringify({ error: 'internal_error' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }
})
