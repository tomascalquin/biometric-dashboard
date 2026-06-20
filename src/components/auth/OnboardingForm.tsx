'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  GraduationCap, BookOpen, MapPin, User,
  ChevronRight, ChevronLeft, Loader2, CheckCircle, AlertCircle,
} from 'lucide-react';

type University = { id: string; name: string; code: string; logo: string | null };
type Faculty    = { id: string; name: string; code: string };
type Career     = { id: string; name: string; code: string; icon: string | null };
type Sector     = { id: string; name: string; type: string; campus: string };

const STEPS = [
  { icon: User,          label: 'Perfil'      },
  { icon: GraduationCap, label: 'Institución' },
  { icon: BookOpen,      label: 'Carrera'     },
  { icon: MapPin,        label: 'Lugar'       },
];

const YEAR_LABELS = ['1°','2°','3°','4°','5°','6°','7°','8°'];

const TYPE_LABEL: Record<string, string> = {
  biblioteca:  '📚 Biblioteca',
  laboratorio: '🖥️ Laboratorio',
  sala:        '📖 Sala de estudio',
  espacio:     '☕ Espacio abierto',
};

export function OnboardingForm({ userId }: { userId: string }) {
  // useRef para que el cliente no cambie entre renders (evita loops en useEffect)
  const supabase = useRef(createClient()).current;

  const [step, setStep] = useState(1);

  // Catálogos desde BD
  const [universities,     setUniversities]     = useState<University[]>([]);
  const [faculties,        setFaculties]        = useState<Faculty[]>([]);
  const [careers,          setCareers]          = useState<Career[]>([]);
  const [sectors,          setSectors]          = useState<Sector[]>([]);
  const [campuses,         setCampuses]         = useState<string[]>([]);

  // Estado de carga
  const [loadingUnis,   setLoadingUnis]   = useState(true);
  const [loadingFacs,   setLoadingFacs]   = useState(false);
  const [loadingCareers,setLoadingCareers]= useState(false);
  const [loadingSectors,setLoadingSectors]= useState(false);
  const [uniError,      setUniError]      = useState(false);

  // Selecciones
  const [fullName,     setFullName]     = useState('');
  const [universityId, setUniversityId] = useState('');
  const [uniText,      setUniText]      = useState('');   // fallback texto libre
  const [campus,       setCampus]       = useState('');
  const [facultyId,    setFacultyId]    = useState('');
  const [careerId,     setCareerId]     = useState('');
  const [academicYear, setAcademicYear] = useState<number | null>(null);
  const [studyRoom,    setStudyRoom]    = useState('');

  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  // ── Cargar universidades al montar ──
  useEffect(() => {
    setLoadingUnis(true);
    supabase.from('universities').select('id, name, code, logo').order('name')
      .then(({ data, error }) => {
        if (error || !data || data.length === 0) {
          setUniError(true);
        } else {
          setUniversities(data);
        }
        setLoadingUnis(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Cargar campuses cuando cambia universidad ──
  useEffect(() => {
    if (!universityId) { setCampuses([]); setCampus(''); return; }
    supabase.from('campus_sectors').select('campus')
      .eq('university_id', universityId)
      .then(({ data }) => {
        const unique = [...new Set((data ?? []).map(r => r.campus))].sort();
        setCampuses(unique);
        setCampus(unique.length === 1 ? unique[0] : '');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [universityId]);

  // ── Cargar facultades cuando cambia universidad ──
  useEffect(() => {
    if (!universityId) { setFaculties([]); setFacultyId(''); return; }
    setLoadingFacs(true);
    supabase.from('faculties').select('id, name, code')
      .eq('university_id', universityId).order('name')
      .then(({ data }) => {
        setFaculties(data ?? []);
        setFacultyId('');
        setCareers([]);
        setCareerId('');
        setLoadingFacs(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [universityId]);

  // ── Cargar carreras cuando cambia facultad ──
  useEffect(() => {
    if (!facultyId) { setCareers([]); setCareerId(''); return; }
    setLoadingCareers(true);
    supabase.from('careers').select('id, name, code, icon')
      .eq('faculty_id', facultyId).order('name')
      .then(({ data }) => {
        setCareers(data ?? []);
        setCareerId('');
        setLoadingCareers(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facultyId]);

  // ── Cargar sectores cuando cambia campus ──
  useEffect(() => {
    if (!universityId || !campus) { setSectors([]); setStudyRoom(''); return; }
    setLoadingSectors(true);
    supabase.from('campus_sectors').select('id, name, type, campus')
      .eq('university_id', universityId).eq('campus', campus)
      .order('type').order('name')
      .then(({ data }) => {
        setSectors(data ?? []);
        setStudyRoom('');
        setLoadingSectors(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [universityId, campus]);

  function validate(): string | null {
    if (step === 1 && !fullName.trim())                              return 'Ingresa tu nombre completo.';
    if (step === 2 && !universityId && !uniText.trim())              return 'Selecciona o escribe tu universidad.';
    if (step === 2 && campuses.length > 1 && !campus && universityId) return 'Selecciona tu campus.';
    if (step === 3 && faculties.length > 0 && !facultyId)           return 'Selecciona tu facultad.';
    if (step === 3 && careers.length > 0 && !careerId)              return 'Selecciona tu carrera.';
    // El año solo es obligatorio si el selector fue visible (i.e. ya hay carrera seleccionada o escrita)
    if (step === 3 && (careerId || careerText.trim()) && !academicYear) return 'Selecciona tu año académico.';
    return null;
  }

  function handleNext() {
    const err = validate();
    if (err) { setError(err); return; }
    setError(null);
    setStep(s => (s + 1) as 1 | 2 | 3 | 4);
  }

  function handleBack() {
    setError(null);
    setStep(s => (s - 1) as 1 | 2 | 3 | 4);
  }

  async function handleSubmit() {
    setError(null);
    setSaving(true);

    const uniName = universityId
      ? universities.find(u => u.id === universityId)?.name ?? ''
      : uniText.trim();

    // Construir payload dinámicamente: solo incluir columnas que existen en el schema
    // (algunas pueden no estar si la migración no se ejecutó)
    const payload: Record<string, unknown> = {
      full_name:     fullName.trim() || null,
      career_id:     careerId       || null,
      university:    uniName        || null,
      // columnas extra agregadas por MIGRATION_UNIVERSITIES.sql:
      university_id: universityId   || null,
      campus:        campus         || null,
      faculty_id:    facultyId      || null,
      academic_year: academicYear   ?? null,
      study_room:    studyRoom      || null,
    };

    const { error: saveErr } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId);

    if (saveErr) {
      // Si falla por columnas desconocidas, reintenta solo con columnas base
      const { error: fallbackErr } = await supabase
        .from('profiles')
        .update({
          full_name:  fullName.trim() || null,
          career_id:  careerId        || null,
          university: uniName         || null,
        })
        .eq('id', userId);

      if (fallbackErr) {
        setError(`Error al guardar perfil: ${fallbackErr.message}`);
        setSaving(false);
        return;
      }
    }

    // Usar hard navigation para invalidar el cache del Server Component.
    // router.push() no fuerza un re-fetch del servidor en Next.js App Router.
    window.location.href = '/dashboard';
  }

  // Agrupar sectores por tipo
  const sectorsByType = sectors.reduce<Record<string, Sector[]>>((acc, s) => {
    (acc[s.type] = acc[s.type] ?? []).push(s);
    return acc;
  }, {});

  // ── Carrera como texto libre si no hay carreras en BD ──
  const [careerText, setCareerText] = useState('');

  return (
    <div className="w-full max-w-sm mx-auto">

      {/* Stepper */}
      <div className="flex items-center justify-center gap-1 mb-8">
        {STEPS.map((s, i) => {
          const n = i + 1;
          return (
            <div key={n} className="flex items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                n < step    ? 'bg-blue-600 text-white' :
                n === step  ? 'bg-blue-600 text-white ring-4 ring-blue-600/20' :
                              'bg-white/10 text-gray-500'
              }`}>
                {n < step ? <CheckCircle className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-6 h-0.5 rounded ${n < step ? 'bg-blue-600' : 'bg-white/10'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* ════ PASO 1 — Nombre ════ */}
      {step === 1 && (
        <div className="space-y-5">
          <StepHeader icon={<User className="w-7 h-7 text-blue-400" />} title="Tu perfil" sub="¿Cómo te llamamos?" />
          <Field label="Nombre completo">
            <input id="ob-fullname" type="text" value={fullName}
              onChange={e => setFullName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleNext()}
              placeholder="Ej: Sofía Martínez"
              className="input-field"
            />
          </Field>
          <ErrMsg msg={error} />
          <button id="ob-next-1" type="button" onClick={handleNext} className="btn-primary w-full">
            Continuar <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ════ PASO 2 — Universidad + Campus ════ */}
      {step === 2 && (
        <div className="space-y-5">
          <StepHeader icon={<GraduationCap className="w-7 h-7 text-blue-400" />} title="Tu institución" sub="¿En qué universidad estudias?" />

          {loadingUnis ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
              <p className="text-xs text-gray-500">Cargando universidades…</p>
            </div>
          ) : uniError ? (
            /* Fallback: campo de texto libre */
            <Field label="Universidad">
              <input id="ob-uni-text" type="text" value={uniText}
                onChange={e => setUniText(e.target.value)}
                placeholder="Ej: Universidad Adolfo Ibáñez"
                className="input-field"
              />
              <p className="text-[10px] text-yellow-600 mt-1">⚠️ Ejecuta MIGRATION_UNIVERSITIES.sql para ver el listado completo.</p>
            </Field>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {universities.map(u => (
                <button key={u.id} id={`ob-uni-${u.code}`} type="button"
                  onClick={() => { setUniversityId(u.id); setCampus(''); }}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center gap-3 ${
                    universityId === u.id
                      ? 'bg-blue-600/20 border-blue-500 text-white'
                      : 'border-white/10 bg-[#0f1923] text-gray-300 hover:border-white/20'
                  }`}>
                  <span className="text-xl">{u.logo}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{u.name}</p>
                    <p className="text-[10px] text-gray-500">{u.code}</p>
                  </div>
                  {universityId === u.id && <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />}
                </button>
              ))}
            </div>
          )}

          {/* Campus */}
          {universityId && campuses.length > 1 && (
            <Field label="Campus / Sede">
              <select id="ob-campus" value={campus} onChange={e => setCampus(e.target.value)} className="input-field appearance-none">
                <option value="" disabled>Selecciona tu campus…</option>
                {campuses.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          )}

          <ErrMsg msg={error} />
          <div className="flex gap-3">
            <button type="button" onClick={handleBack} className="btn-secondary flex-1">
              <ChevronLeft className="w-4 h-4" /> Atrás
            </button>
            <button id="ob-next-2" type="button" onClick={handleNext} className="btn-primary flex-1">
              Continuar <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ════ PASO 3 — Facultad + Carrera + Año ════ */}
      {step === 3 && (
        <div className="space-y-5">
          <StepHeader icon={<BookOpen className="w-7 h-7 text-blue-400" />} title="Tu carrera" sub="Facultad, carrera y año" />

          {/* Facultad */}
          {loadingFacs ? (
            <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 text-blue-400 animate-spin" /></div>
          ) : faculties.length > 0 ? (
            <Field label="Facultad">
              <select id="ob-faculty" value={facultyId} onChange={e => setFacultyId(e.target.value)} className="input-field appearance-none">
                <option value="" disabled>Selecciona tu facultad…</option>
                {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </Field>
          ) : (
            <Field label="Facultad (opcional)">
              <input type="text" placeholder="Ej: Facultad de Ingeniería" className="input-field" />
            </Field>
          )}

          {/* Carrera */}
          {/* Mostrar siempre (si hay facultyId seleccionado, O si no hay lista de facultades) */}
          {(facultyId || faculties.length === 0) && (
            loadingCareers ? (
              <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 text-blue-400 animate-spin" /></div>
            ) : careers.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Carrera</p>
                <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
                  {careers.map(c => (
                    <button key={c.id} id={`ob-career-${c.code}`} type="button"
                      onClick={() => setCareerId(c.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center gap-3 ${
                        careerId === c.id
                          ? 'bg-blue-600/20 border-blue-500 text-white'
                          : 'border-white/10 bg-[#0f1923] text-gray-300 hover:border-white/20'
                      }`}>
                      {c.icon && <span className="text-lg">{c.icon}</span>}
                      <p className="text-sm font-medium flex-1">{c.name}</p>
                      {careerId === c.id && <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <Field label="Carrera">
                <input type="text" value={careerText} onChange={e => setCareerText(e.target.value)}
                  placeholder="Ej: Ingeniería Civil Informática" className="input-field" />
              </Field>
            )
          )}

          {/* Año académico */}
          {(careerId || careerText) && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Año académico</p>
              <div className="grid grid-cols-4 gap-2">
                {YEAR_LABELS.map((label, i) => (
                  <button key={i} id={`ob-year-${i+1}`} type="button"
                    onClick={() => setAcademicYear(i + 1)}
                    className={`rounded-xl py-2.5 text-xs font-semibold border transition-all ${
                      academicYear === i + 1
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'border-white/10 bg-[#0f1923] text-gray-400 hover:border-white/20'
                    }`}>
                    {label} año
                  </button>
                ))}
              </div>
            </div>
          )}

          <ErrMsg msg={error} />
          <div className="flex gap-3">
            <button type="button" onClick={handleBack} className="btn-secondary flex-1">
              <ChevronLeft className="w-4 h-4" /> Atrás
            </button>
            <button id="ob-next-3" type="button" onClick={handleNext} className="btn-primary flex-1">
              Continuar <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ════ PASO 4 — Sector de estudio ════ */}
      {step === 4 && (
        <div className="space-y-5">
          <StepHeader icon={<MapPin className="w-7 h-7 text-blue-400" />} title="Dónde estudias" sub="¿En qué sector o sala sueles estudiar?" />

          {loadingSectors ? (
            <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 text-blue-400 animate-spin" /></div>
          ) : sectors.length === 0 ? (
            /* Fallback: texto libre */
            <Field label="Sala o sector de estudio">
              <input type="text" value={studyRoom} onChange={e => setStudyRoom(e.target.value)}
                placeholder="Ej: Biblioteca Central, Sala B-101…"
                className="input-field" />
            </Field>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-4 pr-1">
              {Object.entries(sectorsByType).map(([type, list]) => (
                <div key={type} className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{TYPE_LABEL[type] ?? type}</p>
                  {list.map(s => (
                    <button key={s.id} id={`ob-sector-${s.id}`} type="button"
                      onClick={() => setStudyRoom(s.name)}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center gap-3 ${
                        studyRoom === s.name
                          ? 'bg-blue-600/20 border-blue-500 text-white'
                          : 'border-white/10 bg-[#0f1923] text-gray-300 hover:border-white/20'
                      }`}>
                      <p className="text-sm font-medium flex-1">{s.name}</p>
                      {studyRoom === s.name && <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}

          <ErrMsg msg={error} />
          <div className="flex gap-3">
            <button type="button" onClick={handleBack} className="btn-secondary flex-1">
              <ChevronLeft className="w-4 h-4" /> Atrás
            </button>
            <button id="ob-submit" type="button" onClick={handleSubmit}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 text-white font-semibold text-sm px-4 py-3.5 transition-all">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando…</> : '¡Listo! 🎉'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helpers ──
function StepHeader({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="text-center mb-6">
      <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-3">
        {icon}
      </div>
      <h2 className="text-lg font-bold text-white">{title}</h2>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function ErrMsg({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return (
    <div className="rounded-xl bg-red-900/30 border border-red-800/50 px-4 py-3 flex items-center gap-2">
      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
      <p className="text-sm text-red-400">{msg}</p>
    </div>
  );
}
