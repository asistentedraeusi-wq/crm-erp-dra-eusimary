// Edge Function: cal-webhook
// Recibe webhooks de Cal.com (BOOKING_CREATED) y guarda en tabla cal_bookings
// El CRM escucha via Supabase Realtime y auto-mueve la tarjeta del lead

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son secrets automáticos en Supabase Edge Functions
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  try {
    const body = await req.json() as {
      triggerEvent: string
      payload: {
        uid:            string
        eventTypeSlug?: string
        type?:          string
        startTime?:     string
        attendees?: Array<{
          email:        string
          name?:        string
          phoneNumber?: string
        }>
      }
    }

    const { triggerEvent, payload } = body

    // Solo procesamos reservas nuevas; cancelaciones y reschedulings se ignoran
    if (triggerEvent !== 'BOOKING_CREATED') {
      return new Response(
        JSON.stringify({ skipped: triggerEvent }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const attendee = payload?.attendees?.[0]
    if (!attendee?.email) {
      return new Response(
        JSON.stringify({ skipped: 'no_attendee_email' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Determinar tipo de cita por el slug del evento
    const slug = (payload.eventTypeSlug ?? payload.type ?? '').toLowerCase()
    const event_slug = slug.includes('segunda') ? 'segunda_cita' : 'primera_cita'

    const { error } = await supabase
      .from('cal_bookings')
      .upsert(
        {
          cal_uid:    payload.uid,
          email:      attendee.email.toLowerCase().trim(),
          nombre:     attendee.name   ?? '',
          celular:    attendee.phoneNumber ?? '',
          event_slug,
          start_time: payload.startTime ?? null,
        },
        { onConflict: 'cal_uid' }
      )

    if (error) {
      console.error('cal-webhook DB error:', error)
      throw error
    }

    console.log(`cal-webhook OK: ${event_slug} — ${attendee.email}`)
    return new Response(
      JSON.stringify({ ok: true, event_slug, email: attendee.email }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('cal-webhook error:', err)
    return new Response(
      JSON.stringify({ error: 'internal_error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
