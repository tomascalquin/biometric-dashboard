-- ============================================================
--  BiometricOS — MIGRACIÓN: Universidades privadas reales Chile
--  Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Nueva tabla universidades
CREATE TABLE IF NOT EXISTS universities (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       text NOT NULL UNIQUE,
  code       text NOT NULL UNIQUE,
  logo       text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Agregar university_id a faculties
ALTER TABLE faculties ADD COLUMN IF NOT EXISTS university_id uuid REFERENCES universities(id);

-- 3. Nuevas columnas en profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS university_id  uuid REFERENCES universities(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS campus         text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS academic_year  int CHECK (academic_year BETWEEN 1 AND 8);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS study_room     text;

-- 4. Eliminar constraints UNIQUE simples en faculties que bloquean multi-universidad
--    (varias universidades tienen "Facultad de Derecho", "Facultad de Ingeniería", etc.)
ALTER TABLE faculties DROP CONSTRAINT IF EXISTS faculties_name_key;
ALTER TABLE faculties DROP CONSTRAINT IF EXISTS faculties_code_key;
-- Agregar constraint compuesto: nombre único POR universidad
ALTER TABLE faculties DROP CONSTRAINT IF EXISTS faculties_university_name_key;
ALTER TABLE faculties ADD CONSTRAINT faculties_university_name_key
  UNIQUE (university_id, name);

-- ============================================================
-- LIMPIAR DATOS ANTERIORES (seed ficticio)
-- ============================================================
DELETE FROM subjects;
DELETE FROM careers;
DELETE FROM faculties;
DELETE FROM universities;


-- ============================================================
-- UNIVERSIDADES
-- ============================================================
INSERT INTO universities (name, code, logo) VALUES
  ('Universidad Adolfo Ibáñez',    'UAI',    '🎓'),
  ('Universidad Diego Portales',   'UDP',    '🏛️'),
  ('Universidad del Desarrollo',   'UDD',    '📐'),
  ('Universidad de los Andes',     'UANDES', '⛰️'),
  ('Universidad Finis Terrae',     'UFT',    '🏫');

-- ============================================================
-- FACULTADES — UAI
-- ============================================================
INSERT INTO faculties (name, code, university_id)
SELECT f.name, f.code, u.id
FROM universities u
CROSS JOIN (VALUES
  ('Escuela de Negocios',              'UAI-NEG'),
  ('Facultad de Ingeniería y Ciencias','UAI-ING'),
  ('Facultad de Derecho',              'UAI-DER'),
  ('Escuela de Psicología',            'UAI-PSI'),
  ('Escuela de Gobierno',              'UAI-GOB'),
  ('Escuela de Comunicaciones',        'UAI-COM')
) AS f(name, code)
WHERE u.code = 'UAI';

-- CARRERAS — UAI
INSERT INTO careers (faculty_id, name, code, icon)
SELECT f.id, c.name, c.code, c.icon FROM faculties f
CROSS JOIN (VALUES
  ('UAI-ING','Ingeniería Civil',                       'UAI-ICI', '⚙️'),
  ('UAI-ING','Ingeniería Civil Industrial',             'UAI-ICI-I','🏭'),
  ('UAI-ING','Ingeniería Civil Informática',            'UAI-ICI-C','💻'),
  ('UAI-ING','Ingeniería Civil en Computer Science',    'UAI-CS',  '🖥️'),
  ('UAI-ING','Ingeniería en Diseño',                   'UAI-DIS', '🎨'),
  ('UAI-ING','Ingeniería en Negocios y Tecnología',    'UAI-NBT', '🚀'),
  ('UAI-NEG','Ingeniería Comercial',                   'UAI-ICOM','📊'),
  ('UAI-DER','Derecho',                                'UAI-DER-G','⚖️'),
  ('UAI-PSI','Psicología',                             'UAI-PSI-G','🧠'),
  ('UAI-COM','Periodismo',                             'UAI-PER', '📰'),
  ('UAI-COM','Comunicación Estratégica',               'UAI-COME','📣'),
  ('UAI-GOB','Ciencia Política y Políticas Públicas',  'UAI-CPOL','🏛️')
) AS c(fcode, name, code, icon)
WHERE f.code = c.fcode;

-- ============================================================
-- FACULTADES — UDP
-- ============================================================
INSERT INTO faculties (name, code, university_id)
SELECT f.name, f.code, u.id FROM universities u
CROSS JOIN (VALUES
  ('Facultad de Administración y Economía',     'UDP-ADM'),
  ('Facultad de Arquitectura, Arte y Diseño',   'UDP-ARQ'),
  ('Facultad de Ciencias Sociales e Historia',  'UDP-SOC'),
  ('Facultad de Comunicación y Letras',         'UDP-COM'),
  ('Facultad de Derecho',                       'UDP-DER'),
  ('Facultad de Ingeniería y Ciencias',         'UDP-ING'),
  ('Facultad de Medicina',                      'UDP-MED'),
  ('Facultad de Psicología',                    'UDP-PSI')
) AS f(name, code)
WHERE u.code = 'UDP';

INSERT INTO careers (faculty_id, name, code, icon)
SELECT f.id, c.name, c.code, c.icon FROM faculties f
CROSS JOIN (VALUES
  ('UDP-ADM','Ingeniería Comercial',        'UDP-ICOM','📊'),
  ('UDP-ADM','Economía',                    'UDP-ECO', '💹'),
  ('UDP-ING','Ingeniería Civil Industrial', 'UDP-ICI', '🏭'),
  ('UDP-ING','Ingeniería Civil Informática','UDP-ICI-C','💻'),
  ('UDP-DER','Derecho',                     'UDP-DER-G','⚖️'),
  ('UDP-PSI','Psicología',                  'UDP-PSI-G','🧠'),
  ('UDP-MED','Medicina',                    'UDP-MED-G','🩺'),
  ('UDP-COM','Periodismo',                  'UDP-PER', '📰'),
  ('UDP-ARQ','Arquitectura',                'UDP-ARQ-G','🏗️')
) AS c(fcode, name, code, icon)
WHERE f.code = c.fcode;

-- ============================================================
-- FACULTADES — UDD
-- ============================================================
INSERT INTO faculties (name, code, university_id)
SELECT f.name, f.code, u.id FROM universities u
CROSS JOIN (VALUES
  ('Facultad de Ingeniería',         'UDD-ING'),
  ('Facultad de Economía y Negocios','UDD-NEG'),
  ('Facultad de Derecho',            'UDD-DER'),
  ('Facultad de Psicología',         'UDD-PSI'),
  ('Facultad de Comunicaciones',     'UDD-COM'),
  ('Facultad de Medicina',           'UDD-MED'),
  ('Facultad de Diseño',             'UDD-DIS')
) AS f(name, code)
WHERE u.code = 'UDD';

INSERT INTO careers (faculty_id, name, code, icon)
SELECT f.id, c.name, c.code, c.icon FROM faculties f
CROSS JOIN (VALUES
  ('UDD-ING','Ingeniería Civil Industrial',  'UDD-ICI','🏭'),
  ('UDD-ING','Ingeniería Civil Informática', 'UDD-ICC','💻'),
  ('UDD-NEG','Ingeniería Comercial',         'UDD-ICOM','📊'),
  ('UDD-DER','Derecho',                      'UDD-DER-G','⚖️'),
  ('UDD-PSI','Psicología',                   'UDD-PSI-G','🧠'),
  ('UDD-MED','Medicina',                     'UDD-MED-G','🩺'),
  ('UDD-COM','Periodismo y Comunicación',    'UDD-PER','📰'),
  ('UDD-DIS','Diseño',                       'UDD-DIS-G','🎨')
) AS c(fcode, name, code, icon)
WHERE f.code = c.fcode;

-- ============================================================
-- FACULTADES — UANDES
-- ============================================================
INSERT INTO faculties (name, code, university_id)
SELECT f.name, f.code, u.id FROM universities u
CROSS JOIN (VALUES
  ('Facultad de Ingeniería y Ciencias Aplicadas','UANDES-ING'),
  ('Facultad de Ciencias Económicas y Empresariales','UANDES-ECO'),
  ('Facultad de Derecho',                         'UANDES-DER'),
  ('Facultad de Medicina',                        'UANDES-MED'),
  ('Facultad de Ciencias Sociales',               'UANDES-SOC'),
  ('Facultad de Comunicación',                    'UANDES-COM'),
  ('Facultad de Filosofía y Humanidades',         'UANDES-FIL')
) AS f(name, code)
WHERE u.code = 'UANDES';

INSERT INTO careers (faculty_id, name, code, icon)
SELECT f.id, c.name, c.code, c.icon FROM faculties f
CROSS JOIN (VALUES
  ('UANDES-ING','Ingeniería Civil Industrial',   'UANDES-ICI','🏭'),
  ('UANDES-ING','Ingeniería Civil Computación',  'UANDES-ICC','💻'),
  ('UANDES-ING','Ingeniería Civil Obras Civiles','UANDES-IOC','🏗️'),
  ('UANDES-ECO','Ingeniería Comercial',          'UANDES-ICOM','📊'),
  ('UANDES-ECO','International Business',        'UANDES-IB', '🌎'),
  ('UANDES-DER','Derecho',                       'UANDES-DER-G','⚖️'),
  ('UANDES-MED','Medicina',                      'UANDES-MED-G','🩺'),
  ('UANDES-SOC','Psicología',                    'UANDES-PSI','🧠'),
  ('UANDES-COM','Periodismo',                    'UANDES-PER','📰')
) AS c(fcode, name, code, icon)
WHERE f.code = c.fcode;

-- ============================================================
-- FACULTADES — UFT
-- ============================================================
INSERT INTO faculties (name, code, university_id)
SELECT f.name, f.code, u.id FROM universities u
CROSS JOIN (VALUES
  ('Facultad de Ingeniería',                          'UFT-ING'),
  ('Facultad de Economía y Negocios',                 'UFT-NEG'),
  ('Facultad de Derecho',                             'UFT-DER'),
  ('Facultad de Medicina y Salud',                    'UFT-MED'),
  ('Facultad de Humanidades y Comunicaciones',        'UFT-COM'),
  ('Facultad de Arquitectura, Diseño y Est. Creativos','UFT-ARQ'),
  ('Facultad de Educación y Ciencias Sociales',       'UFT-EDU')
) AS f(name, code)
WHERE u.code = 'UFT';

INSERT INTO careers (faculty_id, name, code, icon)
SELECT f.id, c.name, c.code, c.icon FROM faculties f
CROSS JOIN (VALUES
  ('UFT-ING','Ingeniería Civil Industrial',    'UFT-ICI','🏭'),
  ('UFT-ING','Ing. Civil en Informática y Telecomunicaciones','UFT-ICC','💻'),
  ('UFT-ING','Ing. Civil en Inteligencia Artificial','UFT-IAI','🤖'),
  ('UFT-NEG','Ingeniería Comercial',           'UFT-ICOM','📊'),
  ('UFT-DER','Derecho',                        'UFT-DER-G','⚖️'),
  ('UFT-MED','Medicina',                       'UFT-MED-G','🩺'),
  ('UFT-MED','Kinesiología',                   'UFT-KIN','🏃'),
  ('UFT-COM','Periodismo y Comunicación',      'UFT-PER','📰'),
  ('UFT-ARQ','Arquitectura',                   'UFT-ARQ-G','🏗️'),
  ('UFT-EDU','Psicología',                     'UFT-PSI','🧠')
) AS c(fcode, name, code, icon)
WHERE f.code = c.fcode;

-- ============================================================
-- SECTORES / SALAS DE ESTUDIO POR UNIVERSIDAD
-- Tabla campus_sectors para el onboarding paso 4
-- ============================================================
CREATE TABLE IF NOT EXISTS campus_sectors (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  university_id uuid NOT NULL REFERENCES universities(id),
  campus        text NOT NULL DEFAULT 'Principal',
  name          text NOT NULL,
  type          text NOT NULL DEFAULT 'sala',  -- 'biblioteca','laboratorio','sala','espacio'
  created_at    timestamptz NOT NULL DEFAULT now()
);

DELETE FROM campus_sectors;

-- UAI — Peñalolén
INSERT INTO campus_sectors (university_id, campus, name, type)
SELECT u.id, 'Peñalolén', s.name, s.type FROM universities u
CROSS JOIN (VALUES
  ('Biblioteca Edificio A — Sala Individual',    'biblioteca'),
  ('Biblioteca Edificio A — Sala Grupal',        'biblioteca'),
  ('Biblioteca Edificio A — Zona Silenciosa',    'biblioteca'),
  ('Biblioteca Edificio F — Sala Individual',    'biblioteca'),
  ('Biblioteca Edificio F — Sala Grupal',        'biblioteca'),
  ('Biblioteca Postgrado — Edificio C',          'biblioteca'),
  ('Sala Core — Edificio A',                     'sala'),
  ('Sala Core — Edificio B',                     'sala'),
  ('Sala Core — Edificio C',                     'sala'),
  ('Laboratorios Ingeniería — Edificio D',       'laboratorio'),
  ('Laboratorios Computación — Edificio B',      'laboratorio'),
  ('Centro de Innovación UAI',                   'espacio'),
  ('Auditorio Edificio A',                       'espacio'),
  ('Terraza/Patio Central',                      'espacio')
) AS s(name, type)
WHERE u.code = 'UAI';

-- UAI — Viña del Mar
INSERT INTO campus_sectors (university_id, campus, name, type)
SELECT u.id, 'Viña del Mar', s.name, s.type FROM universities u
CROSS JOIN (VALUES
  ('Biblioteca Campus Viña — Sala Individual',   'biblioteca'),
  ('Biblioteca Campus Viña — Sala Grupal',       'biblioteca'),
  ('Sala de Estudio Edificio Principal',         'sala'),
  ('Laboratorio Computación Viña',               'laboratorio'),
  ('Patio Central Viña del Mar',                 'espacio')
) AS s(name, type)
WHERE u.code = 'UAI';

-- UDP — Santiago Centro
INSERT INTO campus_sectors (university_id, campus, name, type)
SELECT u.id, 'Santiago Centro', s.name, s.type FROM universities u
CROSS JOIN (VALUES
  ('Biblioteca Nicanor Parra — Sala Individual', 'biblioteca'),
  ('Biblioteca Nicanor Parra — Cubículo Grupal', 'biblioteca'),
  ('Biblioteca Nicanor Parra — Zona Silencio',   'biblioteca'),
  ('Biblioteca Derecho',                         'biblioteca'),
  ('Biblioteca Arquitectura, Arte y Diseño',     'biblioteca'),
  ('Sala Alpha — Laboratorio Computación',       'laboratorio'),
  ('Sala Híbrida — Facultad Ingeniería',         'sala'),
  ('Sala de Estudio Abierta — Casa Central',     'sala'),
  ('Centro de Deportes UDP',                     'espacio')
) AS s(name, type)
WHERE u.code = 'UDP';

-- UDP — Ciudad Empresarial
INSERT INTO campus_sectors (university_id, campus, name, type)
SELECT u.id, 'Ciudad Empresarial', s.name, s.type FROM universities u
CROSS JOIN (VALUES
  ('Biblioteca Ciudad Empresarial',              'biblioteca'),
  ('Sala de Estudio FAE',                        'sala'),
  ('Laboratorio Computación FAE',                'laboratorio')
) AS s(name, type)
WHERE u.code = 'UDP';

-- UDD — Santiago (Las Condes)
INSERT INTO campus_sectors (university_id, campus, name, type)
SELECT u.id, 'Santiago — Las Condes', s.name, s.type FROM universities u
CROSS JOIN (VALUES
  ('Biblioteca Campus Las Condes — Individual',  'biblioteca'),
  ('Biblioteca Campus Las Condes — Grupal',      'biblioteca'),
  ('Sala de Estudio Edificio Principal',         'sala'),
  ('Laboratorio de Innovación UDD',              'laboratorio'),
  ('Auditorio Campus Las Condes',                'espacio')
) AS s(name, type)
WHERE u.code = 'UDD';

-- UDD — Concepción
INSERT INTO campus_sectors (university_id, campus, name, type)
SELECT u.id, 'Concepción', s.name, s.type FROM universities u
CROSS JOIN (VALUES
  ('Biblioteca Campus Concepción',               'biblioteca'),
  ('Sala de Estudio Edificio Ainavillo',         'sala'),
  ('Laboratorio Computación Concepción',         'laboratorio')
) AS s(name, type)
WHERE u.code = 'UDD';

-- UANDES — Las Condes
INSERT INTO campus_sectors (university_id, campus, name, type)
SELECT u.id, 'Las Condes', s.name, s.type FROM universities u
CROSS JOIN (VALUES
  ('Biblioteca José Enrique Diez — Individual',  'biblioteca'),
  ('Biblioteca — Sala Grupal (x24 salas)',       'biblioteca'),
  ('Biblioteca — Zona de Silencio',              'biblioteca'),
  ('Open Lab — Impresión 3D e Innovación',       'laboratorio'),
  ('Sala XR — Realidad Virtual',                 'laboratorio'),
  ('Edificio del Reloj — Sala de Estudio',       'sala'),
  ('Espacio Andino',                             'sala'),
  ('Sala Cero',                                  'sala'),
  ('Edificio de Ingeniería — Labs',              'laboratorio'),
  ('Edificio de Ciencias — Laboratorios',        'laboratorio')
) AS s(name, type)
WHERE u.code = 'UANDES';

-- UFT — Providencia
INSERT INTO campus_sectors (university_id, campus, name, type)
SELECT u.id, 'Providencia', s.name, s.type FROM universities u
CROSS JOIN (VALUES
  ('Biblioteca Central — Sala Individual',       'biblioteca'),
  ('Biblioteca Central — Sala Grupal',           'biblioteca'),
  ('Biblioteca Derecho',                         'biblioteca'),
  ('Sala de Estudio — Casa Central',             'sala'),
  ('Laboratorio Computación e Informática',      'laboratorio'),
  ('Casona Henckel — Sala de Investigación',     'espacio'),
  ('Teatro Finis Terrae',                        'espacio'),
  ('Sala de Estudio — Facultad Medicina',        'sala')
) AS s(name, type)
WHERE u.code = 'UFT';

-- ============================================================
-- VERIFICACIÓN
-- ============================================================
SELECT u.code, COUNT(DISTINCT f.id) AS facultades, COUNT(DISTINCT c.id) AS carreras
FROM universities u
LEFT JOIN faculties f ON f.university_id = u.id
LEFT JOIN careers c ON c.faculty_id = f.id
GROUP BY u.code ORDER BY u.code;

SELECT u.code, campus, COUNT(*) AS sectores
FROM campus_sectors cs JOIN universities u ON u.id = cs.university_id
GROUP BY u.code, campus ORDER BY u.code, campus;
