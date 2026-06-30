-- ================================================================
--  BiometricOS — SEED "Historial de Eventos"
--  Pobla la página /dashboard/alerts con eventos reales de los
--  últimos 3 días (críticos, moderados y normales).
--
--  ✅ NO necesitás reemplazar ningún UUID manualmente.
--     El script detecta el primer usuario con perfil activo
--     automáticamente.  Si querés apuntar a un usuario específico,
--     descomentá la línea `my_user_id := '...'` y pegá tu UUID.
--
--  CÓMO USARLO:
--    Supabase Dashboard → SQL Editor → Nuevo query → Ejecutar
-- ================================================================

DO $$
DECLARE
  my_user_id   uuid;
  my_career_id uuid;
  s_today      uuid := gen_random_uuid();
  s_yesterday  uuid := gen_random_uuid();
  s_two_ago    uuid := gen_random_uuid();
  now_ts       timestamptz := now();
BEGIN

  -- ── 1. Resolver usuario ──────────────────────────────────────
  -- Opción A (automático): toma el primer usuario con perfil.
  -- Opción B (manual):  descomentá la siguiente línea y pegá tu UUID.
  -- my_user_id := 'PEGA-TU-UUID-AQUI';

  SELECT id INTO my_user_id
  FROM   profiles
  WHERE  role IN ('student', 'admin')
  ORDER  BY created_at ASC
  LIMIT  1;

  IF my_user_id IS NULL THEN
    RAISE EXCEPTION '❌ No se encontró ningún perfil. Asegurate de estar logueado y de que tu perfil exista en la tabla profiles.';
  END IF;

  SELECT career_id INTO my_career_id
  FROM   profiles
  WHERE  id = my_user_id;

  RAISE NOTICE '👤 Insertando alertas para usuario: %', my_user_id;

  -- ── 2. Crear sesiones de estudio ─────────────────────────────
  INSERT INTO study_sessions
    (id, student_id, career_id, status, started_at, ended_at, subject_name_override, avg_bpm, dominant_level)
  VALUES
    -- HOY: sesión de mañana con pico crítico
    (s_today,
     my_user_id, my_career_id, 'completed',
     now_ts - interval '5 hours',
     now_ts - interval '2 hours 30 minutes',
     'Ingeniería de Software',
     8, 'critical'),

    -- AYER: sesión larga con advertencias
    (s_yesterday,
     my_user_id, my_career_id, 'completed',
     now_ts - interval '1 day 16 hours',
     now_ts - interval '1 day 13 hours',
     'Algoritmos y Estructuras de Datos',
     11, 'warning'),

    -- HACE 2 DÍAS: sesión de prueba — muy crítica
    (s_two_ago,
     my_user_id, my_career_id, 'completed',
     now_ts - interval '2 days 14 hours',
     now_ts - interval '2 days 11 hours',
     'Prueba Parcial — Redes',
     6, 'critical')

  ON CONFLICT (id) DO NOTHING;

  -- ── 3. Insertar telemetría ────────────────────────────────────
  -- La página /dashboard/alerts filtra:
  --   student_anon_id = user.id  AND  fatigue_level IN ('critical','warning')
  --   AND created_at >= now() - 3 days
  -- También muestra hasta 3 registros 'normal' de hoy.

  INSERT INTO telemetry_logs
    (session_id, student_anon_id, career_id,
     ear_left, ear_right, blinks_per_minute, blink_count,
     fatigue_level, blue_light_active, created_at)
  VALUES

    -- ══ HOY: Ingeniería de Software ══════════════════════════════

    -- Comienzo normal
    (s_today, my_user_id, my_career_id,
     0.318, 0.312, 17, 8, 'normal', false,
     now_ts - interval '4 hours 45 minutes'),

    -- Primera advertencia (~1h dentro)
    (s_today, my_user_id, my_career_id,
     0.265, 0.258, 12, 6, 'warning', false,
     now_ts - interval '4 hours 10 minutes'),

    -- Empeora a crítico
    (s_today, my_user_id, my_career_id,
     0.192, 0.187,  7, 3, 'critical', true,
     now_ts - interval '3 hours 40 minutes'),

    -- Pico crítico
    (s_today, my_user_id, my_career_id,
     0.168, 0.162,  6, 3, 'critical', true,
     now_ts - interval '3 hours 10 minutes'),

    -- Recuperación
    (s_today, my_user_id, my_career_id,
     0.295, 0.290, 15, 7, 'normal', false,
     now_ts - interval '2 hours 45 minutes'),

    -- ══ AYER: Algoritmos ════════════════════════════════════════

    -- Normal al inicio
    (s_yesterday, my_user_id, my_career_id,
     0.305, 0.299, 16, 8, 'normal', false,
     now_ts - interval '1 day 15 hours 50 minutes'),

    -- Advertencia progresiva
    (s_yesterday, my_user_id, my_career_id,
     0.258, 0.252, 12, 6, 'warning', false,
     now_ts - interval '1 day 15 hours 20 minutes'),

    (s_yesterday, my_user_id, my_career_id,
     0.241, 0.236, 11, 5, 'warning', false,
     now_ts - interval '1 day 14 hours 50 minutes'),

    (s_yesterday, my_user_id, my_career_id,
     0.235, 0.230, 10, 5, 'warning', false,
     now_ts - interval '1 day 14 hours 20 minutes'),

    -- Cierre normal
    (s_yesterday, my_user_id, my_career_id,
     0.310, 0.305, 16, 8, 'normal', false,
     now_ts - interval '1 day 13 hours 10 minutes'),

    -- ══ HACE 2 DÍAS: Prueba Parcial ════════════════════════════

    -- Normal antes del examen
    (s_two_ago, my_user_id, my_career_id,
     0.292, 0.287, 15, 7, 'normal', false,
     now_ts - interval '2 days 13 hours 45 minutes'),

    -- Primera señal de alerta
    (s_two_ago, my_user_id, my_career_id,
     0.248, 0.241, 11, 5, 'warning', false,
     now_ts - interval '2 days 13 hours 15 minutes'),

    -- Fatiga severa durante el examen
    (s_two_ago, my_user_id, my_career_id,
     0.188, 0.181,  7, 3, 'critical', true,
     now_ts - interval '2 days 12 hours 45 minutes'),

    (s_two_ago, my_user_id, my_career_id,
     0.162, 0.157,  5, 2, 'critical', true,
     now_ts - interval '2 days 12 hours 15 minutes'),

    -- El peor punto
    (s_two_ago, my_user_id, my_career_id,
     0.150, 0.145,  5, 2, 'critical', true,
     now_ts - interval '2 days 11 hours 45 minutes'),

    -- Recuperación
    (s_two_ago, my_user_id, my_career_id,
     0.278, 0.273, 13, 6, 'warning', false,
     now_ts - interval '2 days 11 hours 15 minutes'),

    (s_two_ago, my_user_id, my_career_id,
     0.308, 0.302, 16, 8, 'normal', false,
     now_ts - interval '2 days 11 hours')

  ON CONFLICT DO NOTHING;

  RAISE NOTICE '✅ Seed completado: 3 sesiones + 17 eventos de telemetría para usuario %', my_user_id;
  RAISE NOTICE '   📋 Resumen → Hoy: 2 críticos + 1 warning | Ayer: 3 warnings | Hace 2 días: 3 críticos + 1 warning';
END $$;


-- ── Verificación ────────────────────────────────────────────────
-- Ejecutá esto por separado para confirmar los datos insertados:

/*
SELECT
  tl.fatigue_level                                     AS nivel,
  tl.blinks_per_minute                                 AS bpm,
  to_char(tl.created_at AT TIME ZONE 'America/Santiago',
          'DD/MM HH24:MI')                             AS fecha_hora,
  ss.subject_name_override                             AS materia
FROM   telemetry_logs  tl
JOIN   study_sessions  ss ON ss.id = tl.session_id
WHERE  tl.student_anon_id = (
         SELECT id FROM profiles
         ORDER  BY created_at ASC LIMIT 1
       )
  AND  tl.created_at >= now() - interval '3 days'
  AND  tl.fatigue_level IN ('critical', 'warning', 'normal')
ORDER  BY tl.created_at DESC;
*/
