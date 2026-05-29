-- ============================================================
--  BiometricOS — SEED DE DATOS FALSOS (desarrollo / demo)
--  Ejecutar en Supabase SQL Editor después de SETUP_SUPABASE.sql
--  y de tener al menos UN usuario registrado.
-- ============================================================

DO $$
DECLARE
  -- ── IDs de carreras (del seed de SETUP_SUPABASE.sql)
  v_icc   uuid;
  v_med   uuid;
  v_psi   uuid;
  v_der   uuid;
  v_arq   uuid;
  v_ade   uuid;

  -- ── Primer estudiante registrado en la plataforma
  v_student_id uuid;

  -- ── Sesiones de estudio
  s1 uuid; s2 uuid; s3 uuid; s4 uuid; s5 uuid; s6 uuid;

  -- ── Timestamp base: "hace 20 horas" para que todo quede en la ventana 24h
  t_base timestamptz := now() - interval '20 hours';

BEGIN

  -- ─────────────────────────────────────────────────────────────
  -- 1. Obtener UUIDs de carreras existentes
  -- ─────────────────────────────────────────────────────────────
  SELECT id INTO v_icc FROM careers WHERE code = 'ICC';
  SELECT id INTO v_med FROM careers WHERE code = 'MED-G';
  SELECT id INTO v_psi FROM careers WHERE code = 'PSI';
  SELECT id INTO v_der FROM careers WHERE code = 'DER-G';
  SELECT id INTO v_arq FROM careers WHERE code = 'ARQ-G';
  SELECT id INTO v_ade FROM careers WHERE code = 'ADE';

  -- ─────────────────────────────────────────────────────────────
  -- 2. Obtener el primer estudiante disponible
  --    y asignarle carrera ICC si aún no tiene
  -- ─────────────────────────────────────────────────────────────
  SELECT id INTO v_student_id FROM profiles WHERE role = 'student' LIMIT 1;

  IF v_student_id IS NULL THEN
    RAISE NOTICE 'No hay estudiantes en profiles. Registra al menos un usuario antes de ejecutar este seed.';
    RETURN;
  END IF;

  -- Asignar carrera y universidad al estudiante si no tiene
  UPDATE profiles
  SET
    career_id  = COALESCE(career_id,  v_icc),
    university = COALESCE(university, 'Universidad Adolfo Ibáñez')
  WHERE id = v_student_id;

  -- ─────────────────────────────────────────────────────────────
  -- 3. Sesiones de estudio (últimas 24h, variadas)
  -- ─────────────────────────────────────────────────────────────

  -- Sesión 1: Programación Avanzada — completada, fatiga normal
  INSERT INTO study_sessions (
    student_id, career_id, subject_name_override, status,
    started_at, ended_at,
    avg_bpm, max_bpm, min_bpm, total_blinks,
    dominant_level, blue_light_activations, breaks_taken
  ) VALUES (
    v_student_id, v_icc, 'Programación Avanzada', 'completed',
    t_base,                    t_base + interval '1h 45m',
    16.4, 21, 12, 98,
    'normal', 0, 1
  ) RETURNING id INTO s1;

  -- Sesión 2: Base de Datos — completada, fatiga warning
  INSERT INTO study_sessions (
    student_id, career_id, subject_name_override, status,
    started_at, ended_at,
    avg_bpm, max_bpm, min_bpm, total_blinks,
    dominant_level, blue_light_activations, breaks_taken
  ) VALUES (
    v_student_id, v_icc, 'Base de Datos', 'completed',
    t_base + interval '3h',    t_base + interval '4h 30m',
    13.2, 18, 9, 72,
    'warning', 2, 0
  ) RETURNING id INTO s2;

  -- Sesión 3: Estructuras de Datos — completada, fatiga crítica
  INSERT INTO study_sessions (
    student_id, career_id, subject_name_override, status,
    started_at, ended_at,
    avg_bpm, max_bpm, min_bpm, total_blinks,
    dominant_level, blue_light_activations, breaks_taken
  ) VALUES (
    v_student_id, v_icc, 'Estructuras de Datos', 'completed',
    t_base + interval '6h',    t_base + interval '8h 10m',
    8.7, 14, 5, 43,
    'critical', 5, 0
  ) RETURNING id INTO s3;

  -- Sesión 4: Cálculo Diferencial — completada, normal
  INSERT INTO study_sessions (
    student_id, career_id, subject_name_override, status,
    started_at, ended_at,
    avg_bpm, max_bpm, min_bpm, total_blinks,
    dominant_level, blue_light_activations, breaks_taken
  ) VALUES (
    v_student_id, v_icc, 'Cálculo Diferencial', 'completed',
    t_base + interval '10h',   t_base + interval '11h 20m',
    17.9, 22, 14, 87,
    'normal', 0, 2
  ) RETURNING id INTO s4;

  -- Sesión 5: Redes de Computadores — completada, warning
  INSERT INTO study_sessions (
    student_id, career_id, subject_name_override, status,
    started_at, ended_at,
    avg_bpm, max_bpm, min_bpm, total_blinks,
    dominant_level, blue_light_activations, breaks_taken
  ) VALUES (
    v_student_id, v_icc, 'Redes de Computadores', 'completed',
    t_base + interval '13h',   t_base + interval '14h 45m',
    11.5, 16, 8, 61,
    'warning', 3, 1
  ) RETURNING id INTO s5;

  -- Sesión 6: ACTIVA — Álgebra Lineal (abierta, sin ended_at)
  INSERT INTO study_sessions (
    student_id, career_id, subject_name_override, status,
    started_at
  ) VALUES (
    v_student_id, v_icc, 'Álgebra Lineal', 'active',
    now() - interval '37 minutes'
  ) RETURNING id INTO s6;


  -- ─────────────────────────────────────────────────────────────
  -- 4. Telemetría para las sesiones completadas
  --    ~30 logs por sesión, BPM variados según nivel
  -- ─────────────────────────────────────────────────────────────

  -- ── Sesión 1: Programación Avanzada (NORMAL, BPM 14-21) ──
  INSERT INTO telemetry_logs (session_id, student_anon_id, career_id, ear_left, ear_right, blinks_per_minute, blink_count, fatigue_level, blue_light_active, created_at)
  SELECT s1, v_student_id, v_icc,
    0.28 + (random() * 0.08),
    0.27 + (random() * 0.08),
    (14 + (random() * 7))::int,
    (60 + (i * 2))::int,
    'normal',
    false,
    t_base + (i * interval '3.5 minutes')
  FROM generate_series(1, 30) AS g(i);

  -- ── Sesión 2: Base de Datos (WARNING, BPM 9-15) ──
  INSERT INTO telemetry_logs (session_id, student_anon_id, career_id, ear_left, ear_right, blinks_per_minute, blink_count, fatigue_level, blue_light_active, created_at)
  SELECT s2, v_student_id, v_icc,
    0.22 + (random() * 0.06),
    0.21 + (random() * 0.06),
    (9 + (random() * 6))::int,
    (40 + (i * 1.5))::int,
    CASE WHEN random() < 0.3 THEN 'normal'::fatigue_level ELSE 'warning'::fatigue_level END,
    false,
    t_base + interval '3h' + (i * interval '3 minutes')
  FROM generate_series(1, 30) AS g(i);

  -- ── Sesión 3: Estructuras de Datos (CRITICAL, BPM 5-12) ──
  INSERT INTO telemetry_logs (session_id, student_anon_id, career_id, ear_left, ear_right, blinks_per_minute, blink_count, fatigue_level, blue_light_active, created_at)
  SELECT s3, v_student_id, v_icc,
    0.17 + (random() * 0.05),
    0.16 + (random() * 0.05),
    (5 + (random() * 7))::int,
    (20 + (i * 1.2))::int,
    CASE
      WHEN random() < 0.5 THEN 'critical'::fatigue_level
      WHEN random() < 0.8 THEN 'warning'::fatigue_level
      ELSE 'normal'::fatigue_level
    END,
    CASE WHEN random() < 0.4 THEN true ELSE false END,
    t_base + interval '6h' + (i * interval '4 minutes')
  FROM generate_series(1, 31) AS g(i);

  -- ── Sesión 4: Cálculo Diferencial (NORMAL, BPM 15-22) ──
  INSERT INTO telemetry_logs (session_id, student_anon_id, career_id, ear_left, ear_right, blinks_per_minute, blink_count, fatigue_level, blue_light_active, created_at)
  SELECT s4, v_student_id, v_icc,
    0.30 + (random() * 0.07),
    0.29 + (random() * 0.07),
    (15 + (random() * 7))::int,
    (55 + (i * 2))::int,
    'normal',
    false,
    t_base + interval '10h' + (i * interval '2.5 minutes')
  FROM generate_series(1, 28) AS g(i);

  -- ── Sesión 5: Redes de Computadores (WARNING, BPM 8-15) ──
  INSERT INTO telemetry_logs (session_id, student_anon_id, career_id, ear_left, ear_right, blinks_per_minute, blink_count, fatigue_level, blue_light_active, created_at)
  SELECT s5, v_student_id, v_icc,
    0.21 + (random() * 0.07),
    0.20 + (random() * 0.07),
    (8 + (random() * 7))::int,
    (35 + (i * 1.5))::int,
    CASE WHEN random() < 0.35 THEN 'critical'::fatigue_level ELSE 'warning'::fatigue_level END,
    CASE WHEN random() < 0.2 THEN true ELSE false END,
    t_base + interval '13h' + (i * interval '3 minutes')
  FROM generate_series(1, 29) AS g(i);

  -- ── Sesión 6 ACTIVA: Álgebra Lineal (últimos 37 min, normal-warning) ──
  INSERT INTO telemetry_logs (session_id, student_anon_id, career_id, ear_left, ear_right, blinks_per_minute, blink_count, fatigue_level, blue_light_active, created_at)
  SELECT s6, v_student_id, v_icc,
    0.25 + (random() * 0.07),
    0.24 + (random() * 0.07),
    (12 + (random() * 6))::int,
    (i * 2)::int,
    CASE WHEN random() < 0.7 THEN 'normal'::fatigue_level ELSE 'warning'::fatigue_level END,
    false,
    now() - interval '37 minutes' + (i * interval '3 minutes')
  FROM generate_series(1, 12) AS g(i);


  -- ─────────────────────────────────────────────────────────────
  -- 5. Telemetría de OTRAS carreras (para la vista v_fatigue_by_career)
  --    Usamos el mismo student_id para simplificar
  --    (en producción serían otros alumnos)
  -- ─────────────────────────────────────────────────────────────

  -- Crear sesiones "fantasmas" de otras carreras
  DECLARE
    sf_med uuid; sf_psi uuid; sf_der uuid; sf_arq uuid; sf_ade uuid;
  BEGIN
    INSERT INTO study_sessions (student_id, career_id, subject_name_override, status, started_at, ended_at, avg_bpm, dominant_level)
    VALUES (v_student_id, v_med, 'Anatomía I',         'completed', t_base + interval '2h', t_base + interval '4h',  14.1, 'normal')  RETURNING id INTO sf_med;
    INSERT INTO study_sessions (student_id, career_id, subject_name_override, status, started_at, ended_at, avg_bpm, dominant_level)
    VALUES (v_student_id, v_psi, 'Psicopatología',     'completed', t_base + interval '4h', t_base + interval '6h',   9.8, 'warning') RETURNING id INTO sf_psi;
    INSERT INTO study_sessions (student_id, career_id, subject_name_override, status, started_at, ended_at, avg_bpm, dominant_level)
    VALUES (v_student_id, v_der, 'Derecho Procesal',   'completed', t_base + interval '7h', t_base + interval '9h',  11.2, 'warning') RETURNING id INTO sf_der;
    INSERT INTO study_sessions (student_id, career_id, subject_name_override, status, started_at, ended_at, avg_bpm, dominant_level)
    VALUES (v_student_id, v_arq, 'Diseño Estructural', 'completed', t_base + interval '9h', t_base + interval '11h', 15.8, 'normal')  RETURNING id INTO sf_arq;
    INSERT INTO study_sessions (student_id, career_id, subject_name_override, status, started_at, ended_at, avg_bpm, dominant_level)
    VALUES (v_student_id, v_ade, 'Finanzas Corporativas','completed',t_base + interval '11h',t_base + interval '13h', 7.3, 'critical') RETURNING id INTO sf_ade;

    -- Medicina — normal (BPM 13-18)
    INSERT INTO telemetry_logs (session_id, student_anon_id, career_id, ear_left, ear_right, blinks_per_minute, blink_count, fatigue_level, blue_light_active, created_at)
    SELECT sf_med, v_student_id, v_med, 0.29+(random()*0.07), 0.28+(random()*0.07), (13+(random()*5))::int, (i*2)::int, 'normal', false, t_base+interval '2h'+(i*interval '4min')
    FROM generate_series(1,25) g(i);

    -- Psicología — warning (BPM 10-14)
    INSERT INTO telemetry_logs (session_id, student_anon_id, career_id, ear_left, ear_right, blinks_per_minute, blink_count, fatigue_level, blue_light_active, created_at)
    SELECT sf_psi, v_student_id, v_psi, 0.23+(random()*0.06), 0.22+(random()*0.06), (10+(random()*4))::int, (i*2)::int,
      CASE WHEN random()<0.4 THEN 'warning'::fatigue_level ELSE 'normal'::fatigue_level END, false, t_base+interval '4h'+(i*interval '4min')
    FROM generate_series(1,25) g(i);

    -- Derecho — warning (BPM 9-13)
    INSERT INTO telemetry_logs (session_id, student_anon_id, career_id, ear_left, ear_right, blinks_per_minute, blink_count, fatigue_level, blue_light_active, created_at)
    SELECT sf_der, v_student_id, v_der, 0.22+(random()*0.06), 0.21+(random()*0.06), (9+(random()*4))::int, (i*2)::int,
      CASE WHEN random()<0.5 THEN 'warning'::fatigue_level ELSE 'normal'::fatigue_level END, false, t_base+interval '7h'+(i*interval '4min')
    FROM generate_series(1,25) g(i);

    -- Arquitectura — normal (BPM 14-20)
    INSERT INTO telemetry_logs (session_id, student_anon_id, career_id, ear_left, ear_right, blinks_per_minute, blink_count, fatigue_level, blue_light_active, created_at)
    SELECT sf_arq, v_student_id, v_arq, 0.30+(random()*0.07), 0.29+(random()*0.07), (14+(random()*6))::int, (i*2)::int, 'normal', false, t_base+interval '9h'+(i*interval '4min')
    FROM generate_series(1,25) g(i);

    -- Administración — CRITICAL (BPM 5-9)
    INSERT INTO telemetry_logs (session_id, student_anon_id, career_id, ear_left, ear_right, blinks_per_minute, blink_count, fatigue_level, blue_light_active, created_at)
    SELECT sf_ade, v_student_id, v_ade, 0.16+(random()*0.05), 0.15+(random()*0.05), (5+(random()*4))::int, (i*1)::int,
      CASE WHEN random()<0.6 THEN 'critical'::fatigue_level ELSE 'warning'::fatigue_level END,
      CASE WHEN random()<0.3 THEN true ELSE false END, t_base+interval '11h'+(i*interval '4min')
    FROM generate_series(1,25) g(i);
  END;

  RAISE NOTICE '✅ Seed completado: 6 sesiones + ~280 logs de telemetría insertados para student_id=%', v_student_id;

END $$;


-- ─────────────────────────────────────────────────────────────
-- Verificación rápida
-- ─────────────────────────────────────────────────────────────
SELECT 'study_sessions' AS tabla, COUNT(*) AS total FROM study_sessions
UNION ALL
SELECT 'telemetry_logs', COUNT(*) FROM telemetry_logs
UNION ALL
SELECT 'v_telemetry_summary — avg_bpm', ROUND(avg_bpm::numeric, 1) FROM v_telemetry_summary
UNION ALL
SELECT 'v_fatigue_by_career — rows', COUNT(*) FROM v_fatigue_by_career;
