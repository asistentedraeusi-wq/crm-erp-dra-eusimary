-- ─── Tabla profiles ──────────────────────────────────────────────────────────
-- Almacena nombre, rol y estado activo de cada usuario de Supabase Auth

create table if not exists public.profiles (
  id         uuid references auth.users(id) on delete cascade primary key,
  name       text    not null default '',
  role       text    not null default 'asistente' check (role in ('admin', 'asistente')),
  active     boolean not null default true,
  created_at timestamptz default now()
);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;

-- Función auxiliar SECURITY DEFINER para evitar recursión en las políticas RLS
create or replace function public.get_my_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- Todo usuario puede leer su propio perfil
do $$ begin
  create policy "profiles_own_select" on public.profiles for select using (auth.uid() = id);
exception when duplicate_object then null; end $$;

-- Admin puede leer todos los perfiles
do $$ begin
  create policy "profiles_admin_select" on public.profiles for select using (public.get_my_role() = 'admin');
exception when duplicate_object then null; end $$;

-- Admin puede actualizar cualquier perfil
do $$ begin
  create policy "profiles_admin_update" on public.profiles for update using (public.get_my_role() = 'admin');
exception when duplicate_object then null; end $$;

-- INSERT solo para el propio usuario (auto-registro) — el admin usa service_role via Edge Function
do $$ begin
  create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
exception when duplicate_object then null; end $$;

-- ─── Datos iniciales ─────────────────────────────────────────────────────────
-- Ejecutar DESPUÉS de crear los usuarios en Authentication > Users del dashboard.
-- Reemplaza <UUID_CARLOS> y <UUID_EUSIMARY> con los IDs reales de cada usuario.
--
-- insert into public.profiles (id, name, role, active) values
--   ('<UUID_CARLOS>',   'Carlos Suárez',           'admin',     true),
--   ('<UUID_EUSIMARY>', 'Dra. Eusimary Contreras',  'asistente', true);
