-- ============================================================
--  BiometricOS — PATCH: Agregar columna 'university' a profiles
--  Ejecutar en Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS university text;

-- Verificar que se aplicó
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'profiles'
ORDER BY ordinal_position;
