// Edge Function: notify-doctor
// Llamada desde el CRM cuando un lead llega a "Paraclínicos"
// Envía email de notificación a asistente.draeusi@gmail.com con el link de Cal.com

const BREVO_API_KEY     = Deno.env.get('BREVO_API_KEY') ?? ''
const DOCTOR_EMAIL      = 'asistente.draeusi@gmail.com'
const CAL_URL           = 'https://cal.com/eusi-contreras-morales-hfytax/segunda-cita-medica'

Deno.serve(async (req: Request) => {
  try {
    const { email, nombre, celular } = await req.json()
    if (!nombre) return new Response(JSON.stringify({ skipped: 'no_nombre' }), { status: 200, headers: { 'Content-Type': 'application/json' } })

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F4F6F9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

      <tr>
        <td style="background:#0D2244;border-radius:14px 14px 0 0;padding:24px 32px;text-align:center;">
          <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:3px;color:#12C49A;text-transform:uppercase;">CRM · Notificación Interna</p>
          <h1 style="margin:0;font-size:20px;font-weight:800;color:#fff;">🔬 Paciente en Paraclínicos</h1>
        </td>
      </tr>

      <tr>
        <td style="background:#fff;padding:28px 32px;">
          <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#0D2244;">
            ${nombre}
          </p>
          <p style="margin:0 0 20px;font-size:13px;color:#6B7280;">
            📱 ${celular ?? '—'} &nbsp;·&nbsp; ✉️ ${email ?? '—'}
          </p>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr>
              <td style="background:#FFFBEB;border-left:4px solid #D97706;border-radius:0 10px 10px 0;padding:14px 18px;">
                <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#92400E;text-transform:uppercase;letter-spacing:0.07em;">Estado</p>
                <p style="margin:0;font-size:13px;color:#374151;line-height:1.6;">
                  El paciente fue movido a la columna <strong>05 · Paraclínicos</strong> y recibirá un recordatorio de exámenes en <strong>48 horas</strong>.
                </p>
              </td>
            </tr>
          </table>

          <p style="margin:0 0 10px;font-size:13px;color:#374151;line-height:1.6;">
            Cuando el paciente te contacte con sus resultados, comparte este enlace para agendar la <strong>Segunda Cita Médica</strong>:
          </p>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr>
              <td align="center">
                <a href="${CAL_URL}" style="display:inline-block;background:#0D2244;color:#fff;font-size:13px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:40px;">
                  📅 Agendar Segunda Cita Médica
                </a>
              </td>
            </tr>
          </table>

          <p style="margin:0;font-size:11px;color:#9CA3AF;text-align:center;">
            ${CAL_URL}
          </p>
        </td>
      </tr>

      <tr>
        <td style="background:#F8FAFB;border-top:1px solid #E5E7EB;border-radius:0 0 14px 14px;padding:16px 32px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#9CA3AF;">CRM Dra. Eusimary Contreras · Notificación automática</p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key':      BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept':       'application/json',
      },
      body: JSON.stringify({
        sender:      { name: 'CRM Dra. Eusimary', email: DOCTOR_EMAIL },
        to:          [{ email: DOCTOR_EMAIL, name: 'Dra. Eusimary' }],
        subject:     `🔬 ${nombre} — pendiente de paraclínicos`,
        htmlContent,
      }),
    })

    const data = await res.json()
    console.log(`notify-doctor → ${res.status}`, JSON.stringify(data))

    return new Response(
      JSON.stringify({ ok: res.ok, status: res.status }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('notify-doctor error:', err)
    return new Response(JSON.stringify({ error: 'internal_error' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }
})
