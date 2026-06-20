-- ============================================================
--  BiometricOS — SEED de datos (solo datos, sin schema changes)
--  Correr en Supabase SQL Editor si la tabla universities existe
--  pero está vacía (muestra "ejecuta migration...")
-- ============================================================

-- Primero verificamos el estado actual
DO $$
DECLARE
  uni_count int;
  fac_count int;
BEGIN
  SELECT COUNT(*) INTO uni_count FROM universities;
  SELECT COUNT(*) INTO fac_count FROM faculties WHERE university_id IS NOT NULL;
  RAISE NOTICE 'universities: %, faculties con university_id: %', uni_count, fac_count;
END $$;

-- ── Limpiar para reinsertar limpio ──
-- (preserva campus_sectors si ya existen para no romper FKs)
DO $$
BEGIN
  -- Solo borrar campus_sectors si existen
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'campus_sectors') THEN
    DELETE FROM campus_sectors;
  END IF;
END $$;

DELETE FROM careers   WHERE faculty_id IN (SELECT id FROM faculties WHERE university_id IS NOT NULL);
DELETE FROM faculties WHERE university_id IS NOT NULL;
DELETE FROM universities;

-- ── UNIVERSIDADES ──
INSERT INTO universities (name, code, logo) VALUES
  ('Universidad Adolfo Ibáñez',    'UAI',    '🎓'),
  ('Universidad Diego Portales',   'UDP',    '🏛️'),
  ('Universidad del Desarrollo',   'UDD',    '📐'),
  ('Universidad de los Andes',     'UANDES', '⛰️'),
  ('Universidad Finis Terrae',     'UFT',    '🏫')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, logo = EXCLUDED.logo;

-- ── FACULTADES + CARRERAS — UAI ──
WITH uni AS (SELECT id FROM universities WHERE code = 'UAI')
INSERT INTO faculties (name, code, university_id)
SELECT f.name, f.code, uni.id FROM uni,
(VALUES
  ('Escuela de Negocios',               'UAI-NEG'),
  ('Facultad de Ingeniería y Ciencias', 'UAI-ING'),
  ('Facultad de Derecho',               'UAI-DER'),
  ('Escuela de Psicología',             'UAI-PSI'),
  ('Escuela de Gobierno',               'UAI-GOB'),
  ('Escuela de Comunicaciones',         'UAI-COM')
) AS f(name, code);

INSERT INTO careers (faculty_id, name, code, icon)
SELECT f.id, c.name, c.code, c.icon
FROM faculties f
JOIN (VALUES
  ('UAI-ING','Ingeniería Civil',                    'UAI-ICI',  '⚙️'),
  ('UAI-ING','Ingeniería Civil Industrial',          'UAI-ICI-I','🏭'),
  ('UAI-ING','Ingeniería Civil Informática',         'UAI-ICI-C','💻'),
  ('UAI-ING','Ingeniería en Computer Science',       'UAI-CS',   '🖥️'),
  ('UAI-ING','Ingeniería en Diseño',                'UAI-DIS',  '🎨'),
  ('UAI-ING','Ingeniería en Negocios y Tecnología', 'UAI-NBT',  '🚀'),
  ('UAI-NEG','Ingeniería Comercial',                'UAI-ICOM', '📊'),
  ('UAI-DER','Derecho',                             'UAI-DER-G','⚖️'),
  ('UAI-PSI','Psicología',                          'UAI-PSI-G','🧠'),
  ('UAI-COM','Periodismo',                          'UAI-PER',  '📰'),
  ('UAI-COM','Comunicación Estratégica',            'UAI-COME', '📣'),
  ('UAI-GOB','Ciencia Política y Políticas Públicas','UAI-CPOL','🏛️')
) AS c(fcode, name, code, icon) ON f.code = c.fcode;

-- ── FACULTADES + CARRERAS — UDP ──
WITH uni AS (SELECT id FROM universities WHERE code = 'UDP')
INSERT INTO faculties (name, code, university_id)
SELECT f.name, f.code, uni.id FROM uni,
(VALUES
  ('Facultad de Administración y Economía',    'UDP-ADM'),
  ('Facultad de Arquitectura, Arte y Diseño',  'UDP-ARQ'),
  ('Facultad de Ciencias Sociales e Historia', 'UDP-SOC'),
  ('Facultad de Comunicación y Letras',        'UDP-COM'),
  ('Facultad de Derecho',                      'UDP-DER'),
  ('Facultad de Ingeniería y Ciencias',        'UDP-ING'),
  ('Facultad de Medicina',                     'UDP-MED'),
  ('Facultad de Psicología',                   'UDP-PSI')
) AS f(name, code);

INSERT INTO careers (faculty_id, name, code, icon)
SELECT f.id, c.name, c.code, c.icon
FROM faculties f
JOIN (VALUES
  ('UDP-ADM','Ingeniería Comercial',         'UDP-ICOM', '📊'),
  ('UDP-ADM','Economía',                     'UDP-ECO',  '💹'),
  ('UDP-ING','Ingeniería Civil Industrial',  'UDP-ICI',  '🏭'),
  ('UDP-ING','Ingeniería Civil Informática', 'UDP-ICI-C','💻'),
  ('UDP-DER','Derecho',                      'UDP-DER-G','⚖️'),
  ('UDP-PSI','Psicología',                   'UDP-PSI-G','🧠'),
  ('UDP-MED','Medicina',                     'UDP-MED-G','🩺'),
  ('UDP-COM','Periodismo',                   'UDP-PER',  '📰'),
  ('UDP-ARQ','Arquitectura',                 'UDP-ARQ-G','🏗️')
) AS c(fcode, name, code, icon) ON f.code = c.fcode;

-- ── FACULTADES + CARRERAS — UDD ──
WITH uni AS (SELECT id FROM universities WHERE code = 'UDD')
INSERT INTO faculties (name, code, university_id)
SELECT f.name, f.code, uni.id FROM uni,
(VALUES
  ('Facultad de Ingeniería',          'UDD-ING'),
  ('Facultad de Economía y Negocios', 'UDD-NEG'),
  ('Facultad de Derecho',             'UDD-DER'),
  ('Facultad de Psicología',          'UDD-PSI'),
  ('Facultad de Comunicaciones',      'UDD-COM'),
  ('Facultad de Medicina',            'UDD-MED'),
  ('Facultad de Diseño',              'UDD-DIS')
) AS f(name, code);

INSERT INTO careers (faculty_id, name, code, icon)
SELECT f.id, c.name, c.code, c.icon
FROM faculties f
JOIN (VALUES
  ('UDD-ING','Ingeniería Civil Industrial',  'UDD-ICI', '🏭'),
  ('UDD-ING','Ingeniería Civil Informática', 'UDD-ICC', '💻'),
  ('UDD-NEG','Ingeniería Comercial',         'UDD-ICOM','📊'),
  ('UDD-DER','Derecho',                      'UDD-DER-G','⚖️'),
  ('UDD-PSI','Psicología',                   'UDD-PSI-G','🧠'),
  ('UDD-MED','Medicina',                     'UDD-MED-G','🩺'),
  ('UDD-COM','Periodismo y Comunicación',    'UDD-PER', '📰'),
  ('UDD-DIS','Diseño',                       'UDD-DIS-G','🎨')
) AS c(fcode, name, code, icon) ON f.code = c.fcode;

-- ── FACULTADES + CARRERAS — UANDES ──
WITH uni AS (SELECT id FROM universities WHERE code = 'UANDES')
INSERT INTO faculties (name, code, university_id)
SELECT f.name, f.code, uni.id FROM uni,
(VALUES
  ('Facultad de Ingeniería y Ciencias Aplicadas',   'UANDES-ING'),
  ('Facultad de Ciencias Económicas y Empresariales','UANDES-ECO'),
  ('Facultad de Derecho',                            'UANDES-DER'),
  ('Facultad de Medicina',                           'UANDES-MED'),
  ('Facultad de Ciencias Sociales',                  'UANDES-SOC'),
  ('Facultad de Comunicación',                       'UANDES-COM')
) AS f(name, code);

INSERT INTO careers (faculty_id, name, code, icon)
SELECT f.id, c.name, c.code, c.icon
FROM faculties f
JOIN (VALUES
  ('UANDES-ING','Ingeniería Civil Industrial',    'UANDES-ICI', '🏭'),
  ('UANDES-ING','Ingeniería Civil Computación',   'UANDES-ICC', '💻'),
  ('UANDES-ING','Ingeniería Civil Obras Civiles', 'UANDES-IOC', '🏗️'),
  ('UANDES-ECO','Ingeniería Comercial',           'UANDES-ICOM','📊'),
  ('UANDES-ECO','International Business',         'UANDES-IB',  '🌎'),
  ('UANDES-DER','Derecho',                        'UANDES-DER-G','⚖️'),
  ('UANDES-MED','Medicina',                       'UANDES-MED-G','🩺'),
  ('UANDES-SOC','Psicología',                     'UANDES-PSI', '🧠'),
  ('UANDES-COM','Periodismo',                     'UANDES-PER', '📰')
) AS c(fcode, name, code, icon) ON f.code = c.fcode;

-- ── FACULTADES + CARRERAS — UFT ──
WITH uni AS (SELECT id FROM universities WHERE code = 'UFT')
INSERT INTO faculties (name, code, university_id)
SELECT f.name, f.code, uni.id FROM uni,
(VALUES
  ('Facultad de Ingeniería',                           'UFT-ING'),
  ('Facultad de Economía y Negocios',                  'UFT-NEG'),
  ('Facultad de Derecho',                              'UFT-DER'),
  ('Facultad de Medicina y Salud',                     'UFT-MED'),
  ('Facultad de Humanidades y Comunicaciones',         'UFT-COM'),
  ('Facultad de Arquitectura, Diseño y Est. Creativos','UFT-ARQ'),
  ('Facultad de Educación y Ciencias Sociales',        'UFT-EDU')
) AS f(name, code);

INSERT INTO careers (faculty_id, name, code, icon)
SELECT f.id, c.name, c.code, c.icon
FROM faculties f
JOIN (VALUES
  ('UFT-ING','Ingeniería Civil Industrial',              'UFT-ICI', '🏭'),
  ('UFT-ING','Ing. Civil Informática y Telecomunicaciones','UFT-ICC','💻'),
  ('UFT-ING','Ing. Civil en Inteligencia Artificial',    'UFT-IAI', '🤖'),
  ('UFT-NEG','Ingeniería Comercial',                     'UFT-ICOM','📊'),
  ('UFT-DER','Derecho',                                  'UFT-DER-G','⚖️'),
  ('UFT-MED','Medicina',                                 'UFT-MED-G','🩺'),
  ('UFT-MED','Kinesiología',                             'UFT-KIN', '🏃'),
  ('UFT-COM','Periodismo y Comunicación',                'UFT-PER', '📰'),
  ('UFT-ARQ','Arquitectura',                             'UFT-ARQ-G','🏗️'),
  ('UFT-EDU','Psicología',                               'UFT-PSI', '🧠')
) AS c(fcode, name, code, icon) ON f.code = c.fcode;

-- ── CREAR TABLA campus_sectors SI NO EXISTE ──
CREATE TABLE IF NOT EXISTS campus_sectors (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  university_id uuid NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  campus        text NOT NULL DEFAULT 'Principal',
  name          text NOT NULL,
  type          text NOT NULL DEFAULT 'sala',
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Limpiar e insertar sectores
DELETE FROM campus_sectors;

-- UAI — Peñalolén
INSERT INTO campus_sectors (university_id, campus, name, type)
SELECT u.id, 'Peñalolén', s.name, s.type FROM universities u,
(VALUES
  ('Biblioteca Edificio A — Sala Individual',  'biblioteca'),
  ('Biblioteca Edificio A — Sala Grupal',      'biblioteca'),
  ('Biblioteca Edificio A — Zona Silenciosa',  'biblioteca'),
  ('Biblioteca Edificio F — Sala Individual',  'biblioteca'),
  ('Biblioteca Edificio F — Sala Grupal',      'biblioteca'),
  ('Biblioteca Postgrado — Edificio C',        'biblioteca'),
  ('Sala Core — Edificio A',                   'sala'),
  ('Sala Core — Edificio B',                   'sala'),
  ('Sala Core — Edificio C',                   'sala'),
  ('Laboratorios Ingeniería — Edificio D',     'laboratorio'),
  ('Laboratorios Computación — Edificio B',    'laboratorio'),
  ('Centro de Innovación UAI',                 'espacio'),
  ('Auditorio Edificio A',                     'espacio'),
  ('Patio Central / Terraza',                  'espacio')
) AS s(name, type) WHERE u.code = 'UAI';

-- UAI — Viña del Mar
INSERT INTO campus_sectors (university_id, campus, name, type)
SELECT u.id, 'Viña del Mar', s.name, s.type FROM universities u,
(VALUES
  ('Biblioteca Campus Viña — Individual',  'biblioteca'),
  ('Biblioteca Campus Viña — Grupal',      'biblioteca'),
  ('Sala de Estudio Edificio Principal',   'sala'),
  ('Laboratorio Computación Viña',         'laboratorio'),
  ('Patio Central Viña del Mar',           'espacio')
) AS s(name, type) WHERE u.code = 'UAI';

-- UDP — Santiago Centro
INSERT INTO campus_sectors (university_id, campus, name, type)
SELECT u.id, 'Santiago Centro', s.name, s.type FROM universities u,
(VALUES
  ('Biblioteca Nicanor Parra — Individual',  'biblioteca'),
  ('Biblioteca Nicanor Parra — Cubículo',    'biblioteca'),
  ('Biblioteca Nicanor Parra — Silencio',    'biblioteca'),
  ('Biblioteca Derecho',                     'biblioteca'),
  ('Biblioteca Arquitectura, Arte y Diseño', 'biblioteca'),
  ('Sala Alpha — Lab. Computación',          'laboratorio'),
  ('Sala Híbrida — Fac. Ingeniería',         'sala'),
  ('Sala de Estudio — Casa Central',         'sala'),
  ('Centro de Deportes UDP',                 'espacio')
) AS s(name, type) WHERE u.code = 'UDP';

-- UDP — Ciudad Empresarial
INSERT INTO campus_sectors (university_id, campus, name, type)
SELECT u.id, 'Ciudad Empresarial', s.name, s.type FROM universities u,
(VALUES
  ('Biblioteca Ciudad Empresarial', 'biblioteca'),
  ('Sala de Estudio FAE',           'sala'),
  ('Laboratorio Computación FAE',   'laboratorio')
) AS s(name, type) WHERE u.code = 'UDP';

-- UDD — Las Condes
INSERT INTO campus_sectors (university_id, campus, name, type)
SELECT u.id, 'Las Condes', s.name, s.type FROM universities u,
(VALUES
  ('Biblioteca Las Condes — Individual',  'biblioteca'),
  ('Biblioteca Las Condes — Grupal',      'biblioteca'),
  ('Sala de Estudio Edificio Principal',  'sala'),
  ('Laboratorio de Innovación UDD',       'laboratorio'),
  ('Auditorio Campus Las Condes',         'espacio')
) AS s(name, type) WHERE u.code = 'UDD';

-- UDD — Concepción
INSERT INTO campus_sectors (university_id, campus, name, type)
SELECT u.id, 'Concepción', s.name, s.type FROM universities u,
(VALUES
  ('Biblioteca Campus Concepción',           'biblioteca'),
  ('Sala de Estudio Edificio Ainavillo',     'sala'),
  ('Laboratorio Computación Concepción',     'laboratorio')
) AS s(name, type) WHERE u.code = 'UDD';

-- UANDES — Las Condes
INSERT INTO campus_sectors (university_id, campus, name, type)
SELECT u.id, 'Las Condes', s.name, s.type FROM universities u,
(VALUES
  ('Biblioteca José Enrique Diez — Individual', 'biblioteca'),
  ('Biblioteca — Sala Grupal',                  'biblioteca'),
  ('Biblioteca — Zona de Silencio',             'biblioteca'),
  ('Open Lab — Impresión 3D e Innovación',      'laboratorio'),
  ('Sala XR — Realidad Virtual',                'laboratorio'),
  ('Edificio del Reloj — Sala de Estudio',      'sala'),
  ('Espacio Andino',                            'sala'),
  ('Sala Cero',                                 'sala'),
  ('Laboratorios Ingeniería',                   'laboratorio'),
  ('Laboratorios de Ciencias',                  'laboratorio')
) AS s(name, type) WHERE u.code = 'UANDES';

-- UFT — Providencia
INSERT INTO campus_sectors (university_id, campus, name, type)
SELECT u.id, 'Providencia', s.name, s.type FROM universities u,
(VALUES
  ('Biblioteca Central — Individual',      'biblioteca'),
  ('Biblioteca Central — Grupal',          'biblioteca'),
  ('Biblioteca Derecho',                   'biblioteca'),
  ('Sala de Estudio — Casa Central',       'sala'),
  ('Laboratorio Computación',              'laboratorio'),
  ('Casona Henckel — Sala Investigación',  'espacio'),
  ('Teatro Finis Terrae',                  'espacio'),
  ('Sala de Estudio — Fac. Medicina',      'sala')
) AS s(name, type) WHERE u.code = 'UFT';

-- ── COLUMNAS EXTRA en profiles (si no existen) ──
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS university_id  uuid REFERENCES universities(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS campus         text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS academic_year  int CHECK (academic_year BETWEEN 1 AND 8);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS study_room     text;

-- ── Verificación final ──
SELECT u.code,
       COUNT(DISTINCT f.id)  AS facultades,
       COUNT(DISTINCT c.id)  AS carreras,
       COUNT(DISTINCT cs.id) AS sectores
FROM universities u
LEFT JOIN faculties     f  ON f.university_id = u.id
LEFT JOIN careers       c  ON c.faculty_id    = f.id
LEFT JOIN campus_sectors cs ON cs.university_id = u.id
GROUP BY u.code
ORDER BY u.code;
