-- ============================================================
--  BiometricOS — SEED HISTÓRICO para el usuario logueado
--  Crea 5 sesiones de los últimos 7 días con telemetría real
--  vinculada al usuario que está haciendo la presentación.
--
--  INSTRUCCIONES:
--  1. Reemplaza 'TU-UUID-AQUI' con el UUID de tu usuario.
--     (Supabase → Authentication → Users → copia el UUID)
--  2. Ejecuta en: Supabase Dashboard → SQL Editor
-- ============================================================

DO $$
DECLARE
  -- ⚠️  CAMBIA ESTO: UUID de tu usuario (Authentication → Users)
  my_user_id uuid := 'TU-UUID-AQUI';

  -- Carrera del usuario (se obtiene automáticamente de su perfil)
  my_career_id uuid;

  -- IDs de sesiones históricas
  s1 uuid := gen_random_uuid();
  s2 uuid := gen_random_uuid();
  s3 uuid := gen_random_uuid();
  s4 uuid := gen_random_uuid();
  s5 uuid := gen_random_uuid();

  now_ts timestamptz := now();
BEGIN

  -- Verificar que el usuario existe en profiles
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = my_user_id) THEN
    RAISE EXCEPTION 'Usuario % no encontrado en profiles. Verifica el UUID.', my_user_id;
  END IF;

  -- Obtener career_id del perfil
  SELECT career_id INTO my_career_id FROM profiles WHERE id = my_user_id;

  -- ── 1. Crear 5 sesiones de los últimos 7 días ─────────────
  INSERT INTO study_sessions (id, student_id, career_id, status, started_at, ended_at, subject_name_override)
  VALUES
    -- Hace 6 días — sesión normal
    (s1, my_user_id, my_career_id, 'completed',
     now_ts - interval '6 days 14 hours',
     now_ts - interval '6 days 12 hours 10 minutes',
     'Cálculo II'),

    -- Hace 5 días — sesión con advertencia
    (s2, my_user_id, my_career_id, 'completed',
     now_ts - interval '5 days 16 hours',
     now_ts - interval '5 days 14 hours 30 minutes',
     'Algoritmos y Estructuras'),

    -- Hace 3 días — sesión crítica (época de prueba)
    (s3, my_user_id, my_career_id, 'completed',
     now_ts - interval '3 days 13 hours',
     now_ts - interval '3 days 10 hours 45 minutes',
     'Prueba Redes'),

    -- Ayer — sesión normal tarde
    (s4, my_user_id, my_career_id, 'completed',
     now_ts - interval '1 day 19 hours',
     now_ts - interval '1 day 18 hours',
     'Sistemas Operativos'),

    -- Hoy — sesión de esta mañana
    (s5, my_user_id, my_career_id, 'completed',
     now_ts - interval '4 hours',
     now_ts - interval '2 hours 30 minutes',
     'Ingeniería de Software');

  -- ── 2. Insertar telemetría vinculada a cada sesión ──────────
  -- Campos: session_id, student_anon_id, career_id,
  --         ear_left, ear_right, blinks_per_minute, blink_count,
  --         fatigue_level, blue_light_active, created_at

  INSERT INTO telemetry_logs
    (session_id, student_anon_id, career_id, ear_left, ear_right,
     blinks_per_minute, blink_count, fatigue_level, blue_light_active, created_at)
  VALUES
    -- === S1: Cálculo II — NORMAL ===
    (s1, my_user_id, my_career_id, 0.320, 0.315, 17, 8,  'normal',   false, now_ts - interval '6 days 13 hours 45 minutes'),
    (s1, my_user_id, my_career_id, 0.310, 0.308, 16, 8,  'normal',   false, now_ts - interval '6 days 13 hours 15 minutes'),
    (s1, my_user_id, my_career_id, 0.305, 0.300, 15, 7,  'normal',   false, now_ts - interval '6 days 12 hours 45 minutes'),

    -- === S2: Algoritmos — WARNING ===
    (s2, my_user_id, my_career_id, 0.290, 0.285, 14, 7,  'normal',   false, now_ts - interval '5 days 15 hours 45 minutes'),
    (s2, my_user_id, my_career_id, 0.245, 0.240, 11, 5,  'warning',  false, now_ts - interval '5 days 15 hours 15 minutes'),
    (s2, my_user_id, my_career_id, 0.230, 0.225, 10, 5,  'warning',  false, now_ts - interval '5 days 14 hours 45 minutes'),
    (s2, my_user_id, my_career_id, 0.300, 0.295, 14, 7,  'normal',   false, now_ts - interval '5 days 14 hours 30 minutes'),

    -- === S3: Prueba Redes — CRÍTICO ===
    (s3, my_user_id, my_career_id, 0.270, 0.265, 13, 6,  'normal',   false, now_ts - interval '3 days 12 hours 30 minutes'),
    (s3, my_user_id, my_career_id, 0.230, 0.225, 10, 5,  'warning',  false, now_ts - interval '3 days 12 hours'),
    (s3, my_user_id, my_career_id, 0.185, 0.180,  7, 3,  'critical', true,  now_ts - interval '3 days 11 hours 30 minutes'),
    (s3, my_user_id, my_career_id, 0.165, 0.160,  6, 3,  'critical', true,  now_ts - interval '3 days 11 hours'),
    (s3, my_user_id, my_career_id, 0.175, 0.170,  7, 3,  'critical', true,  now_ts - interval '3 days 10 hours 30 minutes'),
    (s3, my_user_id, my_career_id, 0.290, 0.285, 14, 7,  'normal',   false, now_ts - interval '3 days 10 hours'),

    -- === S4: Sistemas Operativos — NORMAL ===
    (s4, my_user_id, my_career_id, 0.330, 0.325, 18, 9,  'normal',   false, now_ts - interval '1 day 18 hours 45 minutes'),
    (s4, my_user_id, my_career_id, 0.320, 0.315, 17, 8,  'normal',   false, now_ts - interval '1 day 18 hours 30 minutes'),

    -- === S5: Ingeniería de Software — WARNING (esta mañana) ===
    (s5, my_user_id, my_career_id, 0.300, 0.295, 15, 7,  'normal',   false, now_ts - interval '3 hours 45 minutes'),
    (s5, my_user_id, my_career_id, 0.255, 0.250, 12, 6,  'warning',  false, now_ts - interval '3 hours 15 minutes'),
    (s5, my_user_id, my_career_id, 0.240, 0.235, 11, 5,  'warning',  false, now_ts - interval '2 hours 45 minutes'),
    (s5, my_user_id, my_career_id, 0.310, 0.305, 16, 8,  'normal',   false, now_ts - interval '2 hours 30 minutes');

  RAISE NOTICE '✅ Historial demo creado: 5 sesiones + 19 registros de telemetría para usuario %', my_user_id;
END $$;

-- ── Verificar ──────────────────────────────────────────────────
SELECT
  ss.subject_name_override AS materia,
  ss.started_at::date AS fecha,
  fmtDuration(ss.started_at::text, ss.ended_at::text) AS duracion,
  COUNT(tl.id) AS logs,
  ROUND(AVG(tl.blinks_per_minute), 1) AS bpm_prom,
  COUNT(*) FILTER (WHERE tl.fatigue_level = 'critical') AS criticos
FROM study_sessions ss
LEFT JOIN telemetry_logs tl ON tl.session_id = ss.id
WHERE ss.student_id = 'TU-UUID-AQUI'   -- ← mismo UUID que arriba
GROUP BY ss.id, ss.subject_name_override, ss.started_at, ss.ended_at
ORDER BY ss.started_at DESC;
