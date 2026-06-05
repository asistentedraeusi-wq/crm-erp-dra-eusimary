// Edge Function: admin-users
// Gestión de usuarios del sistema — requiere sesión activa con rol 'admin'
// Actions: list | create | update | delete

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

Deno.serve(async (req: Request) => {
  try {
    // Verificar JWT del usuario que llama
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user: caller }, error: authErr } = await supabaseAdmin.auth.getUser(token)
    if (authErr || !caller) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
    }

    // Verificar que el caller es admin
    const { data: callerProfile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', caller.id)
      .single()

    if (callerProfile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } })
    }

    const body = await req.json()
    const { action } = body

    // ── LIST ─────────────────────────────────────────────────────────────────
    if (action === 'list') {
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, name, role, active, created_at')
        .order('created_at')

      const { data: { users: authUsers } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })

      const merged = (profiles ?? []).map(p => {
        const authUser = authUsers?.find(u => u.id === p.id)
        return { ...p, email: authUser?.email ?? '' }
      })

      return new Response(JSON.stringify({ users: merged }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    // ── CREATE ───────────────────────────────────────────────────────────────
    if (action === 'create') {
      const { email, password, name, role, active } = body
      if (!email || !password || !name) {
        return new Response(JSON.stringify({ error: 'missing_fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
      }

      const { data: { user: newUser }, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })

      if (createErr || !newUser) {
        return new Response(JSON.stringify({ error: 'internal_error' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
      }

      await supabaseAdmin.from('profiles').insert({
        id:     newUser.id,
        name,
        role:   role   ?? 'asistente',
        active: active ?? true,
      })

      return new Response(JSON.stringify({ ok: true, id: newUser.id }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    // ── UPDATE ───────────────────────────────────────────────────────────────
    if (action === 'update') {
      const { id, name, role, active, password } = body
      if (!id) return new Response(JSON.stringify({ error: 'missing_id' }), { status: 400, headers: { 'Content-Type': 'application/json' } })

      const patch: Record<string, unknown> = {}
      if (name   !== undefined) patch.name   = name
      if (role   !== undefined) patch.role   = role
      if (active !== undefined) patch.active = active

      if (Object.keys(patch).length > 0) {
        await supabaseAdmin.from('profiles').update(patch).eq('id', id)
      }

      if (password) {
        await supabaseAdmin.auth.admin.updateUserById(id, { password })
      }

      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    // ── DELETE ───────────────────────────────────────────────────────────────
    if (action === 'delete') {
      const { id } = body
      if (!id) return new Response(JSON.stringify({ error: 'missing_id' }), { status: 400, headers: { 'Content-Type': 'application/json' } })

      // No se puede eliminar a uno mismo
      if (id === caller.id) {
        return new Response(JSON.stringify({ error: 'cannot_delete_self' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
      }

      await supabaseAdmin.auth.admin.deleteUser(id)
      // El perfil se elimina en cascada por la FK con auth.users

      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ error: 'unknown_action' }), { status: 400, headers: { 'Content-Type': 'application/json' } })

  } catch (err) {
    console.error('admin-users error:', err)
    return new Response(JSON.stringify({ error: 'internal_error' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
})
