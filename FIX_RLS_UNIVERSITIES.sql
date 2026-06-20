-- ============================================================
--  FIX: Políticas RLS para tablas nuevas
--  Las tablas universities y campus_sectors necesitan permitir
--  lectura a usuarios autenticados (y anónimos para el listado).
-- ============================================================

-- Habilitar RLS en las tablas nuevas (por si no está activo)
ALTER TABLE universities    ENABLE ROW LEVEL SECURITY;
ALTER TABLE campus_sectors  ENABLE ROW LEVEL SECURITY;

-- Permitir SELECT público (anon + authenticated) en universities
DROP POLICY IF EXISTS "universities_public_read" ON universities;
CREATE POLICY "universities_public_read"
  ON universities FOR SELECT
  USING (true);

-- Permitir SELECT público en campus_sectors
DROP POLICY IF EXISTS "campus_sectors_public_read" ON campus_sectors;
CREATE POLICY "campus_sectors_public_read"
  ON campus_sectors FOR SELECT
  USING (true);

-- Verificar que los datos existen
SELECT code, name FROM universities ORDER BY code;
SELECT university_id, campus, COUNT(*) AS sectores
FROM campus_sectors GROUP BY university_id, campus;
