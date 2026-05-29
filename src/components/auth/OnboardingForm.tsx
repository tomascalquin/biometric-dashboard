'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { GraduationCap, BookOpen, ChevronRight, Loader2, CheckCircle } from 'lucide-react';

type Faculty = { id: string; name: string; code: string };
type Career  = { id: string; name: string; code: string; icon: string | null };

export function OnboardingForm({ userId }: { userId: string }) {
  const router   = useRouter();
  const supabase = createClient();

  // ── Paso actual (1 o 2)
  const [step, setStep] = useState<1 | 2>(1);

  // ── Datos de catálogos
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [careers,   setCareers]   = useState<Career[]>([]);

  // ── Selecciones del usuario
  const [university,  setUniversity]  = useState('');
  const [facultyId,   setFacultyId]   = useState('');
  const [careerId,    setCareerId]    = useState('');

  // ── UI
  const [loading,    setLoading]    = useState(false);
  const [fetchingCareers, setFetchingCareers] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  // ── Cargar facultades al montar
  useEffect(() => {
    supabase
      .from('faculties')
      .select('id, name, code')
      .order('name')
      .then(({ data }) => setFaculties(data ?? []));
  }, [supabase]);

  // ── Cargar carreras cuando cambia la facultad
  useEffect(() => {
    if (!facultyId) { setCareers([]); setCareerId(''); return; }
    setFetchingCareers(true);
    supabase
      .from('careers')
      .select('id, name, code, icon')
      .eq('faculty_id', facultyId)
      .order('name')
      .then(({ data }) => { setCareers(data ?? []); setCareerId(''); setFetchingCareers(false); });
  }, [facultyId, supabase]);

  // ── Paso 1 → 2
  function handleNextStep() {
    setError(null);
    if (!university.trim()) { setError('Ingresa el nombre de tu universidad.'); return; }
    if (!facultyId)         { setError('Selecciona una facultad.'); return; }
    setStep(2);
  }

  // ── Guardar perfil
  async function handleSubmit() {
    setError(null);
    if (!careerId) { setError('Selecciona una carrera.'); return; }

    setLoading(true);
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ career_id: careerId, university: university.trim() })
      .eq('id', userId);

    if (updateError) {
      setError('Error al guardar. Inténtalo de nuevo.');
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-sm mx-auto">

      {/* ── Indicador de pasos ── */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              s < step  ? 'bg-blue-600 text-white' :
              s === step? 'bg-blue-600 text-white ring-4 ring-blue-600/20' :
                          'bg-white/10 text-gray-500'
            }`}>
              {s < step ? <CheckCircle className="w-4 h-4" /> : s}
            </div>
            {s < 2 && <div className={`w-8 h-0.5 rounded ${s < step ? 'bg-blue-600' : 'bg-white/10'}`} />}
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════
          PASO 1: Universidad y Facultad
          ══════════════════════════════════════════════════════ */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-3">
              <GraduationCap className="w-7 h-7 text-blue-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Tu institución</h2>
            <p className="text-xs text-gray-400 mt-1">¿En qué universidad y facultad estudias?</p>
          </div>

          {/* Universidad */}
          <div className="space-y-1.5">
            <label htmlFor="ob-university" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Universidad
            </label>
            <input
              id="ob-university"
              type="text"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              placeholder="Ej: Universidad Adolfo Ibáñez"
              className="w-full rounded-xl border border-white/10 bg-[#0f1923] px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Facultad */}
          <div className="space-y-1.5">
            <label htmlFor="ob-faculty" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Facultad
            </label>
            <select
              id="ob-faculty"
              value={facultyId}
              onChange={(e) => setFacultyId(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0f1923] px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none"
            >
              <option value="" disabled>Selecciona tu facultad…</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="rounded-xl bg-red-900/30 border border-red-800/50 px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            id="ob-next-step"
            type="button"
            onClick={handleNextStep}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-sm px-4 py-3.5 transition-all"
          >
            Continuar <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          PASO 2: Carrera
          ══════════════════════════════════════════════════════ */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-7 h-7 text-blue-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Tu carrera</h2>
            <p className="text-xs text-gray-400 mt-1">Selecciona la carrera que estás cursando</p>
          </div>

          {/* Lista de carreras como botones */}
          <div className="space-y-2">
            {fetchingCareers ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              </div>
            ) : careers.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-4">No hay carreras para esta facultad.</p>
            ) : (
              careers.map((c) => (
                <button
                  key={c.id}
                  id={`ob-career-${c.code}`}
                  type="button"
                  onClick={() => setCareerId(c.id)}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all flex items-center gap-3 ${
                    careerId === c.id
                      ? 'bg-blue-600/20 border-blue-500 text-white'
                      : 'border-white/10 bg-[#0f1923] text-gray-300 hover:border-white/20'
                  }`}
                >
                  {c.icon && <span className="text-lg">{c.icon}</span>}
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{c.code}</p>
                  </div>
                  {careerId === c.id && (
                    <CheckCircle className="w-4 h-4 text-blue-400 ml-auto flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

          {error && (
            <div className="rounded-xl bg-red-900/30 border border-red-800/50 px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              id="ob-back-step"
              type="button"
              onClick={() => { setStep(1); setError(null); }}
              className="flex-1 rounded-xl border border-white/10 text-gray-400 font-semibold text-sm px-4 py-3.5 hover:bg-white/5 active:scale-[0.98] transition-all"
            >
              Atrás
            </button>
            <button
              id="ob-submit"
              type="button"
              onClick={handleSubmit}
              disabled={loading || !careerId}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 text-white font-semibold text-sm px-4 py-3.5 transition-all"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Guardando…' : 'Listo 🎉'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
