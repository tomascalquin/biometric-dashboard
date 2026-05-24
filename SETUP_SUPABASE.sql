-- ============================================================
--  BiometricOS — Schema completo para Supabase (PostgreSQL)
--  Orden de ejecución: correr TODO el script de una vez
--  en el SQL Editor de Supabase.
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 0. EXTENSIONES
-- ────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";


-- ────────────────────────────────────────────────────────────
-- 1. ENUMS
-- ────────────────────────────────────────────────────────────
drop type if exists fatigue_level cascade;
drop type if exists user_role cascade;
drop type if exists session_status cascade;
drop type if exists theme_pref cascade;
drop type if exists lang_pref cascade;

create type fatigue_level  as enum ('normal', 'warning', 'critical');
create type user_role      as enum ('student', 'admin');
create type session_status as enum ('active', 'paused', 'completed', 'aborted');
create type theme_pref     as enum ('system', 'light', 'dark');
create type lang_pref      as enum ('es', 'en');


-- ────────────────────────────────────────────────────────────
-- 2. CATÁLOGOS (sin dependencias)
-- ────────────────────────────────────────────────────────────

-- Limpiar tablas anteriores si existen
drop table if exists subjects cascade;
drop table if exists careers cascade;
drop table if exists faculties cascade;

-- 2.1 Facultades
create table faculties (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null unique,
  code        text not null unique,       -- ej. 'ING', 'MED'
  created_at  timestamptz not null default now()
);

-- 2.2 Carreras
create table careers (
  id          uuid primary key default uuid_generate_v4(),
  faculty_id  uuid not null references faculties(id) on delete restrict,
  name        text not null,
  code        text not null unique,       -- ej. 'ICC', 'MED-G'
  icon        text,                      -- emoji o URL de ícono
  created_at  timestamptz not null default now(),
  unique (faculty_id, name)
);

-- 2.3 Materias / Asignaturas
create table subjects (
  id          uuid primary key default uuid_generate_v4(),
  career_id   uuid not null references careers(id) on delete restrict,
  name        text not null,
  code        text,
  created_at  timestamptz not null default now()
);


-- ────────────────────────────────────────────────────────────
-- 3. PERFILES DE USUARIO
--    Extiende auth.users de Supabase Auth.
-- ────────────────────────────────────────────────────────────

-- Limpiar tablas anteriores si existen (en orden de dependencias)
drop table if exists telemetry_logs cascade;
drop table if exists study_sessions cascade;
drop table if exists user_settings cascade;
drop table if exists profiles cascade;

-- IMPORTANTE: Deshabilitamos RLS temporalmente para que los triggers funcionen
create table profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  role            user_role not null default 'student',
  full_name       text,
  avatar_url      text,
  career_id       uuid references careers(id) on delete set null,
  -- Campos solo relevantes para admins:
  faculty_id      uuid references faculties(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Sin RLS por ahora, lo habilitaremos al final
-- alter table profiles enable row level security;

-- Trigger: sincronizar updated_at automáticamente
drop trigger if exists trg_profiles_updated_at on profiles;
drop function if exists set_updated_at();

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute procedure set_updated_at();

-- Trigger: crear perfil y user_settings automáticamente al registrar usuario en Auth
drop trigger if exists trg_on_auth_user_created on auth.users;
drop function if exists handle_new_user();

create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  -- Insertar en profiles
  insert into profiles (id, role, full_name, avatar_url)
  values (
    new.id,
    'student',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  
  -- Insertar en user_settings (en la misma función)
  insert into user_settings (user_id)
  values (new.id);
  
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();


-- ────────────────────────────────────────────────────────────
-- 4. CONFIGURACIÓN DE USUARIO
-- ────────────────────────────────────────────────────────────
create table user_settings (
  user_id               uuid primary key references profiles(id) on delete cascade,
  -- Mitigación pasiva
  blue_light_filter     boolean not null default true,
  break_reminders       boolean not null default true,
  reminder_interval_min int     not null default 20 check (reminder_interval_min between 5 and 120),
  sound_alerts          boolean not null default false,
  -- Sensor
  strict_sensor_mode    boolean not null default false,
  ear_threshold         numeric(4,2) not null default 0.25 check (ear_threshold between 0.10 and 0.50),
  bpm_window_sec        int     not null default 60 check (bpm_window_sec between 30 and 300),
  -- Notificaciones
  push_notifications    boolean not null default true,
  -- Privacidad
  anonymous_telemetry   boolean not null default true,
  -- Apariencia
  theme                 theme_pref not null default 'system',
  language              lang_pref  not null default 'es',

  updated_at            timestamptz not null default now()
);
-- Sin RLS por ahora, lo habilitaremos al final

-- NOTA: El trigger trg_on_profile_created ya NO se necesita
-- porque handle_new_user() inserta en user_settings directamente
drop trigger if exists trg_on_profile_created on profiles;
drop function if exists handle_new_profile();


-- ────────────────────────────────────────────────────────────
-- 5. SESIONES DE ESTUDIO
-- ────────────────────────────────────────────────────────────
create table study_sessions (
  id                    uuid primary key default uuid_generate_v4(),
  student_id            uuid not null references profiles(id) on delete cascade,
  subject_id            uuid references subjects(id) on delete set null,
  subject_name_override text,            -- si el alumno escribe el nombre libre
  career_id             uuid references careers(id) on delete set null,
  status                session_status not null default 'active',
  started_at            timestamptz not null default now(),
  ended_at              timestamptz,
  duration_min          int generated always as (
                          extract(epoch from (ended_at - started_at)) / 60
                        ) stored,
  -- Métricas agregadas (calculadas al cerrar la sesión)
  avg_bpm               numeric(5,2),
  max_bpm               int,
  min_bpm               int,
  total_blinks          int,
  dominant_level        fatigue_level,
  blue_light_activations int default 0,
  breaks_taken          int default 0,

  created_at            timestamptz not null default now()
);

create index idx_study_sessions_student on study_sessions(student_id);
create index idx_study_sessions_started on study_sessions(started_at desc);
create index idx_study_sessions_status  on study_sessions(status);


-- ────────────────────────────────────────────────────────────
-- 6. TELEMETRÍA EN TIEMPO REAL
--    Una fila cada ~30 segundos por sesión activa.
-- ────────────────────────────────────────────────────────────
create table telemetry_logs (
  id                  bigint primary key generated always as identity,
  session_id          uuid not null references study_sessions(id) on delete cascade,
  student_anon_id     uuid not null references profiles(id) on delete cascade,
  career_id           uuid references careers(id) on delete set null,

  -- Métricas del sensor
  ear_left            numeric(6,4) not null check (ear_left  >= 0),
  ear_right           numeric(6,4) not null check (ear_right >= 0),
  blinks_per_minute   int not null check (blinks_per_minute >= 0),
  blink_count         int not null default 0,
  fatigue_level       fatigue_level not null,
  blue_light_active   boolean not null default false,

  -- Contexto temporal
  created_at          timestamptz not null default now()
);

-- Índices de consulta frecuente
create index idx_telemetry_session    on telemetry_logs(session_id);
create index idx_telemetry_student    on telemetry_logs(student_anon_id);
create index idx_telemetry_created    on telemetry_logs(created_at desc);
create index idx_telemetry_level      on telemetry_logs(fatigue_level);
create index idx_telemetry_career     on telemetry_logs(career_id);

-- Particionado por tiempo (opcional, activar si el volumen es alto)
-- Se deja comentado para activar manualmente:
-- ALTER TABLE telemetry_logs PARTITION BY RANGE (created_at);


-- ────────────────────────────────────────────────────────────
-- 7. VISTAS ÚTILES
-- ────────────────────────────────────────────────────────────

-- 7.1 Resumen de telemetría global (para el dashboard admin)
create or replace view v_telemetry_summary as
select
  count(*)                                                    as total_logs,
  round(avg(blinks_per_minute), 1)                           as avg_bpm,
  count(*) filter (where fatigue_level = 'critical')         as critical_count,
  count(*) filter (where fatigue_level = 'warning')          as warning_count,
  count(*) filter (where fatigue_level = 'normal')           as normal_count,
  count(*) filter (where blue_light_active = true)           as blue_light_activations,
  max(created_at)                                            as last_log_at
from telemetry_logs
where created_at >= now() - interval '24 hours';

-- 7.2 Fatiga por carrera (para el panel de barras apiladas)
create or replace view v_fatigue_by_career as
select
  c.id                                                                as career_id,
  c.name                                                              as career_name,
  c.icon,
  count(distinct t.student_anon_id)                                   as total_students,
  round(avg(t.blinks_per_minute), 1)                                  as avg_bpm,
  count(*) filter (where t.fatigue_level = 'critical')                as critical_logs,
  count(*) filter (where t.fatigue_level = 'warning')                 as warning_logs,
  count(*) filter (where t.fatigue_level = 'normal')                  as normal_logs,
  -- Estudiantes únicos en cada nivel (basado en el último log por alumno)
  count(distinct t.student_anon_id) filter (
    where t.fatigue_level = 'critical'
  )                                                                   as critical_students,
  count(distinct t.student_anon_id) filter (
    where t.fatigue_level = 'warning'
  )                                                                   as warning_students,
  count(distinct t.student_anon_id) filter (
    where t.fatigue_level = 'normal'
  )                                                                   as normal_students
from telemetry_logs t
join careers c on c.id = t.career_id
where t.created_at >= now() - interval '24 hours'
group by c.id, c.name, c.icon
order by critical_students desc;

-- 7.3 Historial de sesiones de un estudiante (para /sesiones)
create or replace view v_student_sessions as
select
  ss.id,
  ss.student_id,
  coalesce(sub.name, ss.subject_name_override)  as subject_name,
  sub.code                                       as subject_code,
  c.name                                         as career_name,
  c.icon                                         as career_icon,
  ss.status,
  ss.started_at,
  ss.ended_at,
  ss.duration_min,
  ss.avg_bpm,
  ss.max_bpm,
  ss.min_bpm,
  ss.total_blinks,
  ss.dominant_level,
  ss.blue_light_activations,
  ss.breaks_taken
from study_sessions ss
left join subjects sub on sub.id = ss.subject_id
left join careers  c   on c.id   = ss.career_id;

-- 7.4 Alertas recientes (últimos 60 min, nivel warning o critical)
create or replace view v_recent_alerts as
select
  t.id,
  t.student_anon_id,
  t.fatigue_level,
  t.blinks_per_minute                     as bpm,
  c.name                                  as career_name,
  t.created_at
from telemetry_logs t
left join careers c on c.id = t.career_id
where
  t.fatigue_level in ('warning', 'critical')
  and t.created_at >= now() - interval '60 minutes'
order by t.created_at desc
limit 50;


-- ────────────────────────────────────────────────────────────
-- 8. ROW LEVEL SECURITY (RLS)
-- Ejecutar esto al FINAL, después de todos los triggers
-- ────────────────────────────────────────────────────────────

-- Primero, deshabilitamos RLS si estaba activo
alter table profiles disable row level security;
alter table user_settings disable row level security;
alter table study_sessions disable row level security;
alter table telemetry_logs disable row level security;
alter table faculties disable row level security;
alter table careers disable row level security;
alter table subjects disable row level security;

-- Limpiar políticas antiguas
drop policy if exists "profiles: own read" on profiles;
drop policy if exists "profiles: own update" on profiles;
drop policy if exists "profiles: admin read all" on profiles;
drop policy if exists "profiles: trigger insert" on profiles;
drop policy if exists "settings: own read/write" on user_settings;
drop policy if exists "sessions: own read/write" on study_sessions;
drop policy if exists "sessions: admin read all" on study_sessions;
drop policy if exists "telemetry: own insert" on telemetry_logs;
drop policy if exists "telemetry: own read" on telemetry_logs;
drop policy if exists "telemetry: admin read all" on telemetry_logs;
drop policy if exists "faculties: authenticated read" on faculties;
drop policy if exists "careers: authenticated read" on careers;
drop policy if exists "subjects: authenticated read" on subjects;

-- ⚠️ RLS DESHABILITADO POR AHORA
-- Una vez que el registro funcione, puedes habilitar RLS manualmente:
-- 1. Ve a Supabase Console
-- 2. Database → Tables → profiles
-- 3. Security tab → Enable RLS
-- 4. Luego habilita para el resto de tablas

-- Mantener RLS deshabilitado mientras testeas el registro


-- ────────────────────────────────────────────────────────────
-- 9. FUNCIONES DE AYUDA
-- ────────────────────────────────────────────────────────────

-- 9.1 Cierra una sesión y calcula sus métricas agregadas
create or replace function close_study_session(p_session_id uuid)
returns void language plpgsql security definer as $$
declare
  v_student_id uuid;
begin
  -- Validar que la sesión pertenece al usuario actual
  select student_id into v_student_id
  from study_sessions where id = p_session_id;

  if v_student_id is distinct from auth.uid() then
    raise exception 'No autorizado';
  end if;

  update study_sessions ss
  set
    status        = 'completed',
    ended_at      = now(),
    avg_bpm       = sub.avg_bpm,
    max_bpm       = sub.max_bpm,
    min_bpm       = sub.min_bpm,
    total_blinks  = sub.total_blinks,
    dominant_level = sub.dominant_level,
    blue_light_activations = sub.blue_light_activations
  from (
    select
      round(avg(blinks_per_minute), 2)                              as avg_bpm,
      max(blinks_per_minute)                                        as max_bpm,
      min(blinks_per_minute)                                        as min_bpm,
      max(blink_count)                                              as total_blinks,
      -- Nivel dominante = el más frecuente
      mode() within group (order by fatigue_level)                  as dominant_level,
      count(*) filter (where blue_light_active = true)              as blue_light_activations
    from telemetry_logs
    where session_id = p_session_id
  ) sub
  where ss.id = p_session_id;
end;
$$;

-- 9.2 Resumen de telemetría para el admin (últimas N horas)
create or replace function get_telemetry_summary(p_hours int default 24)
returns table (
  total_logs     bigint,
  avg_bpm        numeric,
  critical_count bigint,
  warning_count  bigint,
  normal_count   bigint,
  last_log_at    timestamptz
) language sql security definer as $$
  select
    count(*)                                               as total_logs,
    round(avg(blinks_per_minute), 1)                      as avg_bpm,
    count(*) filter (where fatigue_level = 'critical')    as critical_count,
    count(*) filter (where fatigue_level = 'warning')     as warning_count,
    count(*) filter (where fatigue_level = 'normal')      as normal_count,
    max(created_at)                                       as last_log_at
  from telemetry_logs
  where created_at >= now() - (p_hours || ' hours')::interval;
$$;


-- ────────────────────────────────────────────────────────────
-- 10. DATOS SEMILLA (seed)
-- ────────────────────────────────────────────────────────────

-- Facultades
insert into faculties (name, code) values
  ('Facultad de Ingeniería',              'ING'),
  ('Facultad de Medicina',                'MED'),
  ('Facultad de Ciencias Sociales',       'CSOC'),
  ('Facultad de Derecho',                 'DER'),
  ('Facultad de Arquitectura y Diseño',   'ARQ'),
  ('Facultad de Administración',          'ADM');

-- Carreras
insert into careers (faculty_id, name, code, icon)
select id, 'Ingeniería Civil en Computación', 'ICC', '💻'
  from faculties where code = 'ING';

insert into careers (faculty_id, name, code, icon)
select id, 'Medicina General', 'MED-G', '🩺'
  from faculties where code = 'MED';

insert into careers (faculty_id, name, code, icon)
select id, 'Psicología', 'PSI', '🧠'
  from faculties where code = 'CSOC';

insert into careers (faculty_id, name, code, icon)
select id, 'Derecho', 'DER-G', '⚖️'
  from faculties where code = 'DER';

insert into careers (faculty_id, name, code, icon)
select id, 'Arquitectura', 'ARQ-G', '🏛️'
  from faculties where code = 'ARQ';

insert into careers (faculty_id, name, code, icon)
select id, 'Administración de Empresas', 'ADE', '📊'
  from faculties where code = 'ADM';

-- Materias de ejemplo (ICC)
insert into subjects (career_id, name, code)
select c.id, s.name, s.code
from careers c
cross join (values
  ('Programación Avanzada',    'ICC-301'),
  ('Base de Datos',            'ICC-302'),
  ('Estructuras de Datos',     'ICC-201'),
  ('Redes de Computadores',    'ICC-401'),
  ('Cálculo Diferencial',      'MAT-101'),
  ('Álgebra Lineal',           'MAT-102')
) as s(name, code)
where c.code = 'ICC';
