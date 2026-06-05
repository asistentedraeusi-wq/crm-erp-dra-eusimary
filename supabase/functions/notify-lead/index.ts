// Edge Function: notify-lead
// Trigger: INSERT en public.leads (via Database Webhook en Supabase Dashboard)
// Acción:   Agrega el contacto a Brevo lista Lead-Magnet-Guia → dispara automatización 7 emails

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY') ?? ''
const BREVO_LIST_ID = parseInt(Deno.env.get('BREVO_LIST_ID') ?? '2')

Deno.serve(async (req: Request) => {
  try {
    const payload = await req.json()

    // Supabase Database Webhook envía: { type: 'INSERT', table: 'leads', record: {...}, ... }
    const record = payload.record ?? payload

    if (!record?.email) {
      return new Response(JSON.stringify({ skipped: 'no_email' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Solo leads de la guía entran al funnel de Brevo
    if (record.fuente !== 'guia') {
      return new Response(JSON.stringify({ skipped: 'fuente_no_guia', fuente: record.fuente }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Separar nombre y apellido
    const partes = (record.nombre ?? '').trim().split(' ')
    const firstName = partes[0] ?? ''
    const lastName = partes.slice(1).join(' ') ?? ''

    const brevoPayload = {
      email: record.email,
      attributes: {
        FIRSTNAME: firstName,
        LASTNAME: lastName,
        SMS: record.celular ?? '',
      },
      listIds: [BREVO_LIST_ID],
      updateEnabled: true,   // si ya existe el contacto, lo actualiza y lo agrega a la lista
    }

    const res = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(brevoPayload),
    })

    const data = await res.json()

    console.log(`Brevo → status ${res.status}`, JSON.stringify(data))

    return new Response(
      JSON.stringify({ ok: res.ok, status: res.status, contact: record.email }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('notify-lead error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
