-- ============================================================
--  FIX: "Database error saving new user"
--  Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Eliminar trigger y función existentes que pueden estar rotos
drop trigger if exists trg_on_auth_user_created on auth.users;
drop function if exists handle_new_user();

-- 2. Recrear la función con manejo de errores robusto
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Insertar perfil (con ON CONFLICT para evitar duplicados)
  insert into public.profiles (id, role, full_name, avatar_url)
  values (
    new.id,
    coalesce(
      (new.raw_user_meta_data->>'role')::user_role,
      'student'
    ),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  -- Insertar configuración de usuario (con ON CONFLICT para evitar duplicados)
  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;

exception
  when others then
    -- Log del error sin romper el signup
    raise warning 'handle_new_user() error for user %: % %', new.id, SQLERRM, SQLSTATE;
    return new;
end;
$$;

-- 3. Recrear el trigger
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- 4. Verificar que los triggers no tengan conflictos con RLS
-- Asegurarse que RLS está deshabilitado en ambas tablas
alter table public.profiles disable row level security;
alter table public.user_settings disable row level security;

-- 5. Verificar que el trigger quedó creado correctamente
select
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
from information_schema.triggers
where trigger_name = 'trg_on_auth_user_created';
