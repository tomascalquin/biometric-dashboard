-- ============================================================
--  BiometricOS — SEED DE DEMO para presentación (v3 FINAL)
--  Incluye TODOS los campos NOT NULL de telemetry_logs:
--    ear_left, ear_right, blinks_per_minute, fatigue_level
--
--  EJECUTAR en: Supabase Dashboard → SQL Editor
-- ============================================================

DO $$
DECLARE
  demo_user_id uuid;   -- perfil real para student_id y student_anon_id
  fallback_id  uuid;

  -- Carreras
  icc_id uuid; med_id uuid; psi_id uuid; iad_id uuid; der_id uuid;

  -- IDs de sesiones (pre-generados para controlarlos)
  s_icc1 uuid := gen_random_uuid(); s_icc2 uuid := gen_random_uuid(); s_icc3 uuid := gen_random_uuid();
  s_med1 uuid := gen_random_uuid(); s_med2 uuid := gen_random_uuid(); s_med3 uuid := gen_random_uuid();
  s_psi1 uuid := gen_random_uuid(); s_psi2 uuid := gen_random_uuid(); s_psi3 uuid := gen_random_uuid();
  s_iad1 uuid := gen_random_uuid(); s_iad2 uuid := gen_random_uuid();
  s_der1 uuid := gen_random_uuid();

  now_ts timestamptz := now();

BEGIN

  -- ── 1. Obtener perfil real (lo usamos para student_id y student_anon_id) ──
  SELECT id INTO demo_user_id FROM profiles LIMIT 1;
  IF demo_user_id IS NULL THEN
    RAISE EXCEPTION 'No hay perfiles en la BD. Registra al menos un usuario primero.';
  END IF;

  -- ── 2. Carreras ──────────────────────────────────────────────
  SELECT id INTO fallback_id FROM careers ORDER BY created_at LIMIT 1;
  SELECT id INTO icc_id FROM careers WHERE code = 'ICC'   LIMIT 1;
  SELECT id INTO med_id FROM careers WHERE code = 'MED-G' LIMIT 1;
  SELECT id INTO psi_id FROM careers WHERE code = 'PSI'   LIMIT 1;
  SELECT id INTO iad_id FROM careers WHERE code = 'IAD'   LIMIT 1;
  SELECT id INTO der_id FROM careers WHERE code = 'DER'   LIMIT 1;

  -- Fallback si no existen esas carreras específicas
  icc_id := COALESCE(icc_id, fallback_id);
  med_id := COALESCE(med_id, fallback_id);
  psi_id := COALESCE(psi_id, fallback_id);
  iad_id := COALESCE(iad_id, fallback_id);
  der_id := COALESCE(der_id, fallback_id);

  -- ── 3. Study sessions ────────────────────────────────────────
  INSERT INTO study_sessions (id, student_id, career_id, status, started_at, ended_at)
  VALUES
    (s_icc1, demo_user_id, icc_id, 'completed', now_ts - interval '8 hours', now_ts - interval '5 hours'),
    (s_icc2, demo_user_id, icc_id, 'completed', now_ts - interval '8 hours', now_ts - interval '5 hours'),
    (s_icc3, demo_user_id, icc_id, 'completed', now_ts - interval '7 hours', now_ts - interval '4 hours'),
    (s_med1, demo_user_id, med_id, 'completed', now_ts - interval '6 hours', now_ts - interval '3 hours'),
    (s_med2, demo_user_id, med_id, 'completed', now_ts - interval '6 hours', now_ts - interval '3 hours'),
    (s_med3, demo_user_id, med_id, 'completed', now_ts - interval '5 hours', now_ts - interval '2 hours'),
    (s_psi1, demo_user_id, psi_id, 'completed', now_ts - interval '5 hours', now_ts - interval '2 hours'),
    (s_psi2, demo_user_id, psi_id, 'completed', now_ts - interval '5 hours', now_ts - interval '2 hours'),
    (s_psi3, demo_user_id, psi_id, 'completed', now_ts - interval '4 hours', now_ts - interval '1 hour'),
    (s_iad1, demo_user_id, iad_id, 'completed', now_ts - interval '5 hours', now_ts - interval '2 hours'),
    (s_iad2, demo_user_id, iad_id, 'completed', now_ts - interval '5 hours', now_ts - interval '2 hours'),
    (s_der1, demo_user_id, der_id, 'completed', now_ts - interval '4 hours', now_ts - interval '1 hour');

  -- ── 4. Telemetría con TODOS los campos NOT NULL ───────────────
  -- ear_left / ear_right: EAR normal ~0.30, warning ~0.22, critical ~0.15
  -- Columnas: session_id, student_anon_id, career_id, ear_left, ear_right,
  --           blinks_per_minute, blink_count, fatigue_level, blue_light_active, created_at

  INSERT INTO telemetry_logs
    (session_id, student_anon_id, career_id, ear_left, ear_right, blinks_per_minute, blink_count, fatigue_level, blue_light_active, created_at)
  VALUES
    -- === ICC — CRÍTICO (época de pruebas) ===
    (s_icc1, demo_user_id, icc_id, 0.2800, 0.2750, 11, 5,  'warning',  false, now_ts - interval '8 hours'),
    (s_icc1, demo_user_id, icc_id, 0.1600, 0.1550,  6, 3,  'critical', true,  now_ts - interval '6.5 hours'),
    (s_icc1, demo_user_id, icc_id, 0.1450, 0.1500,  5, 2,  'critical', true,  now_ts - interval '6 hours'),
    (s_icc1, demo_user_id, icc_id, 0.3100, 0.3050, 13, 6,  'normal',   false, now_ts - interval '5.5 hours'),

    (s_icc2, demo_user_id, icc_id, 0.2600, 0.2650, 12, 5,  'warning',  false, now_ts - interval '8 hours'),
    (s_icc2, demo_user_id, icc_id, 0.2200, 0.2150,  8, 4,  'warning',  false, now_ts - interval '6.5 hours'),
    (s_icc2, demo_user_id, icc_id, 0.1500, 0.1480,  7, 3,  'critical', true,  now_ts - interval '6 hours'),
    (s_icc2, demo_user_id, icc_id, 0.2500, 0.2520, 12, 5,  'warning',  false, now_ts - interval '5.5 hours'),

    (s_icc3, demo_user_id, icc_id, 0.3200, 0.3150, 14, 7,  'normal',   false, now_ts - interval '7 hours'),
    (s_icc3, demo_user_id, icc_id, 0.2300, 0.2280,  9, 4,  'warning',  false, now_ts - interval '6 hours'),
    (s_icc3, demo_user_id, icc_id, 0.1550, 0.1580,  7, 3,  'critical', true,  now_ts - interval '5.5 hours'),
    (s_icc3, demo_user_id, icc_id, 0.3050, 0.3020, 15, 7,  'normal',   false, now_ts - interval '4.5 hours'),

    -- === MEDICINA — WARNING moderado ===
    (s_med1, demo_user_id, med_id, 0.3100, 0.3080, 14, 7,  'normal',   false, now_ts - interval '6 hours'),
    (s_med1, demo_user_id, med_id, 0.2350, 0.2300, 10, 5,  'warning',  false, now_ts - interval '5 hours'),
    (s_med1, demo_user_id, med_id, 0.1700, 0.1680,  8, 4,  'critical', true,  now_ts - interval '4.5 hours'),
    (s_med1, demo_user_id, med_id, 0.3200, 0.3180, 15, 8,  'normal',   false, now_ts - interval '3.5 hours'),

    (s_med2, demo_user_id, med_id, 0.3050, 0.3020, 13, 6,  'normal',   false, now_ts - interval '6 hours'),
    (s_med2, demo_user_id, med_id, 0.2400, 0.2380, 11, 5,  'warning',  false, now_ts - interval '5 hours'),
    (s_med2, demo_user_id, med_id, 0.3100, 0.3080, 14, 7,  'normal',   false, now_ts - interval '4 hours'),

    (s_med3, demo_user_id, med_id, 0.3300, 0.3280, 15, 8,  'normal',   false, now_ts - interval '5 hours'),
    (s_med3, demo_user_id, med_id, 0.2500, 0.2480, 12, 6,  'warning',  false, now_ts - interval '3.5 hours'),
    (s_med3, demo_user_id, med_id, 0.3400, 0.3380, 16, 8,  'normal',   false, now_ts - interval '2.5 hours'),

    -- === PSICOLOGÍA — NORMAL ===
    (s_psi1, demo_user_id, psi_id, 0.3400, 0.3380, 16, 8,  'normal', false, now_ts - interval '5 hours'),
    (s_psi1, demo_user_id, psi_id, 0.3500, 0.3480, 17, 9,  'normal', false, now_ts - interval '4 hours'),
    (s_psi1, demo_user_id, psi_id, 0.3300, 0.3280, 15, 8,  'normal', false, now_ts - interval '3 hours'),

    (s_psi2, demo_user_id, psi_id, 0.3200, 0.3180, 15, 8,  'normal',  false, now_ts - interval '5 hours'),
    (s_psi2, demo_user_id, psi_id, 0.2300, 0.2280,  9, 4,  'warning', false, now_ts - interval '3.5 hours'),
    (s_psi2, demo_user_id, psi_id, 0.3350, 0.3320, 16, 8,  'normal',  false, now_ts - interval '2.5 hours'),

    (s_psi3, demo_user_id, psi_id, 0.3600, 0.3580, 18, 9,  'normal', false, now_ts - interval '4 hours'),
    (s_psi3, demo_user_id, psi_id, 0.3450, 0.3420, 17, 9,  'normal', false, now_ts - interval '3 hours'),

    -- === IAD — MUY CRÍTICO ===
    (s_iad1, demo_user_id, iad_id, 0.2350, 0.2300,  9, 4,  'warning',  false, now_ts - interval '5 hours'),
    (s_iad1, demo_user_id, iad_id, 0.1600, 0.1580,  6, 3,  'critical', true,  now_ts - interval '4 hours'),
    (s_iad1, demo_user_id, iad_id, 0.1450, 0.1420,  5, 2,  'critical', true,  now_ts - interval '3.5 hours'),
    (s_iad1, demo_user_id, iad_id, 0.2200, 0.2180,  8, 4,  'warning',  false, now_ts - interval '2.5 hours'),

    (s_iad2, demo_user_id, iad_id, 0.2250, 0.2220,  8, 4,  'warning',  false, now_ts - interval '4.5 hours'),
    (s_iad2, demo_user_id, iad_id, 0.1550, 0.1520,  7, 3,  'critical', true,  now_ts - interval '4 hours'),
    (s_iad2, demo_user_id, iad_id, 0.1480, 0.1460,  6, 3,  'critical', true,  now_ts - interval '3 hours'),

    -- === DERECHO — NORMAL ===
    (s_der1, demo_user_id, der_id, 0.3400, 0.3380, 16, 8,  'normal', false, now_ts - interval '4 hours'),
    (s_der1, demo_user_id, der_id, 0.3500, 0.3480, 17, 9,  'normal', false, now_ts - interval '3 hours'),
    (s_der1, demo_user_id, der_id, 0.3600, 0.3580, 18, 9,  'normal', false, now_ts - interval '2 hours');

  RAISE NOTICE '✅ Demo seed OK — 12 sesiones y 40 registros de telemetría insertados.';
END $$;

-- ── Verificar resultados ──────────────────────────────────────
SELECT
  COALESCE(c.name, 'Sin carrera')                               AS carrera,
  COUNT(*)                                                      AS total_logs,
  COUNT(*) FILTER (WHERE tl.fatigue_level = 'critical')        AS criticos,
  COUNT(*) FILTER (WHERE tl.fatigue_level = 'warning')         AS warnings,
  COUNT(*) FILTER (WHERE tl.fatigue_level = 'normal')          AS normales,
  ROUND(AVG(tl.blinks_per_minute), 1)                          AS bpm_promedio,
  ROUND(AVG(tl.ear_left), 4)                                   AS ear_promedio
FROM telemetry_logs tl
LEFT JOIN careers c ON c.id = tl.career_id
WHERE tl.created_at > now() - interval '24 hours'
GROUP BY c.name
ORDER BY criticos DESC;
