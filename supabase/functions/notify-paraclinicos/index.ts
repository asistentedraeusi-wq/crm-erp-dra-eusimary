// Edge Function: notify-paraclinicos
// Llamada desde el CRM cuando un lead llega a la etapa "Paraclínicos"
// Agrega el contacto a la lista Brevo "Paraclínicos-Recordatorio" → dispara
// automatización con recordatorio de exámenes a las 48h

const BREVO_API_KEY            = Deno.env.get('BREVO_API_KEY') ?? ''
const BREVO_PARACLINICOS_LIST  = parseInt(Deno.env.get('BREVO_PARACLINICOS_LIST_ID') ?? '3')

Deno.serve(async (req: Request) => {
  try {
    const { email, nombre, celular } = await req.json()

    if (!email) {
      return new Response(JSON.stringify({ skipped: 'no_email' }), {
        status: 200, headers: { 'Content-Type': 'application/json' },
      })
    }

    const partes    = (nombre ?? '').trim().split(' ')
    const firstName = partes[0] ?? ''
    const lastName  = partes.slice(1).join(' ') ?? ''

    const body = {
      email,
      attributes: {
        FIRSTNAME: firstName,
        LASTNAME:  lastName,
        SMS:       celular ?? '',
      },
      listIds:       [BREVO_PARACLINICOS_LIST],
      updateEnabled: true,
    }

    const res = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key':      BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept':       'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    console.log(`notify-paraclinicos → ${res.status}`, JSON.stringify(data))

    return new Response(
      JSON.stringify({ ok: res.ok, status: res.status, contact: email }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('notify-paraclinicos error:', err)
    return new Response(JSON.stringify({ error: 'internal_error' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }
})
