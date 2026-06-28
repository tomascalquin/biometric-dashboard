'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, Shield, LogOut, ChevronRight, User, BookOpen, MapPin, Loader2, CheckCircle, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Profile {
  full_name: string | null;
  university: string | null;
  campus: string | null;
  academic_year: number | null;
  study_room: string | null;
  role: string | null;
  career_id: string | null;
}

export default function SettingsPage() {
  const router = useRouter();
  // useRef para instancia estable (evita re-renders infinitos)
  const supabase = useRef(createClient()).current;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [saved,   setSaved]     = useState(false);
  const [error,   setError]     = useState<string | null>(null);

  // Campos editables
  const [fullName,   setFullName]   = useState('');
  const [studyRoom,  setStudyRoom]  = useState('');

  // Toggles (solo UI, no persisten aún)
  const [blueLight,  setBlueLight]  = useState(false);
  const [pushAlerts, setPushAlerts] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data } = await supabase
        .from('profiles')
        .select('full_name, university, campus, academic_year, study_room, role, career_id')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile(data as Profile);
        setFullName(data.full_name ?? '');
        setStudyRoom((data as any).study_room ?? '');
      }
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSaving(true); setError(null); setSaved(false);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const { error: err } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim() || null, study_room: studyRoom.trim() || null })
      .eq('id', user.id);

    if (err) setError(err.message);
    else setSaved(true);
    setSaving(false);
  };

  const handleExport = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
    const { data } = await supabase
      .from('telemetry_logs')
      .select('created_at, blinks_per_minute, fatigue_level, ear_left, ear_right, blue_light_active')
      .eq('student_anon_id', user.id)
      .gte('created_at', since)
      .order('created_at', { ascending: false });

    if (!data || data.length === 0) { alert('Sin datos para exportar en los últimos 30 días.'); return; }

    const header = 'Fecha,BPM,Nivel de Fatiga,EAR Izquierdo,EAR Derecho,Luz Azul Activa\n';
    const rows = data.map((r) =>
      `${r.created_at},${r.blinks_per_minute},${r.fatigue_level},${r.ear_left ?? ''},${r.ear_right ?? ''},${r.blue_light_active ? 'Sí' : 'No'}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `biometricos_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="p-4 space-y-5">
      <div>
        <h1 className="text-[10px] font-bold text-[#7a8fb0] tracking-widest uppercase mb-0.5">Ajustes</h1>
        <p className="text-[10px] text-[#b0bdd6]">Configura tu experiencia de monitoreo</p>
      </div>

      {/* Mi perfil */}
      <section>
        <h2 className="text-[10px] font-bold text-[#7a8fb0] tracking-widest uppercase mb-2 ml-1">Mi Perfil</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-[#e2e8f4] p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-[#b0bdd6]" />
            </div>
          ) : (
            <>
              {/* Info de solo lectura */}
              {profile?.university && (
                <div className="flex items-center gap-3 py-1">
                  <BookOpen className="w-4 h-4 text-[#7a8fb0] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#7a8fb0]">Universidad</p>
                    <p className="text-sm font-bold text-[#0a1628] truncate">
                      {profile.university}{profile.campus ? ` · ${profile.campus}` : ''}
                      {profile.academic_year ? ` · ${profile.academic_year}° año` : ''}
                    </p>
                  </div>
                </div>
              )}

              {/* Campo editable: Nombre */}
              <div>
                <label className="block text-xs text-[#7a8fb0] mb-1 flex items-center gap-1 font-semibold">
                  <User className="w-3 h-3" /> Nombre completo
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Tu nombre completo"
                  className="w-full rounded-xl border border-[#e2e8f4] bg-white px-3 py-2.5 text-sm text-[#0a1628] placeholder-[#b0bdd6] focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] transition shadow-sm"
                />
              </div>

              {/* Campo editable: Sala habitual */}
              <div>
                <label className="block text-xs text-[#7a8fb0] mb-1 flex items-center gap-1 font-semibold">
                  <MapPin className="w-3 h-3" /> Sala/sector habitual
                </label>
                <input
                  type="text"
                  value={studyRoom}
                  onChange={(e) => setStudyRoom(e.target.value)}
                  placeholder="Ej: Biblioteca Central"
                  className="w-full rounded-xl border border-[#e2e8f4] bg-white px-3 py-2.5 text-sm text-[#0a1628] placeholder-[#b0bdd6] focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] transition shadow-sm"
                />
              </div>

              {error && (
                <p className="text-xs text-red-600">{error}</p>
              )}

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#003087] hover:bg-[#002070] disabled:opacity-60 text-white text-sm font-semibold transition-all shadow-sm"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : null}
                {saving ? 'Guardando…' : saved ? '¡Guardado!' : 'Guardar cambios'}
              </button>
            </>
          )}
        </div>
      </section>

      {/* Monitoreo */}
      <section>
        <h2 className="text-[10px] font-bold text-[#7a8fb0] tracking-widest uppercase mb-2 ml-1">Monitoreo</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-[#e2e8f4] overflow-hidden">
          <ToggleRow title="Filtro de luz azul automático" description="Activar al detectar fatiga crítica" active={blueLight} onToggle={() => setBlueLight(v => !v)} />
          <Divider />
          <ToggleRow title="Notificaciones push" description="Recordatorios de descanso" active={pushAlerts} onToggle={() => setPushAlerts(v => !v)} />
        </div>
      </section>

      {/* Umbrales */}
      <section>
        <h2 className="text-[10px] font-bold text-[#7a8fb0] tracking-widest uppercase mb-2 ml-1">Umbrales de Alerta</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-[#e2e8f4] overflow-hidden">
          <ConfigRow title="BPM crítico" description="Alertar cuando BPM esté bajo" value="< 10 bpm" valueColor="text-red-600" />
          <Divider />
          <ConfigRow title="BPM warning" description="Umbral de advertencia" value="< 15 bpm" valueColor="text-amber-600" />
        </div>
      </section>

      {/* Cuenta */}
      <section>
        <h2 className="text-[10px] font-bold text-[#7a8fb0] tracking-widest uppercase mb-2 ml-1">Cuenta</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-[#e2e8f4] overflow-hidden">
          <button
            onClick={handleExport}
            className="w-full p-4 flex items-center justify-between hover:bg-[#f0f4fa] transition-colors"
          >
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-[#3a4a6b]" />
              <span className="text-sm font-bold text-[#0a1628]">Exportar mis datos (CSV)</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#7a8fb0]" />
          </button>
          <Divider />
          <Link 
            href="/privacidad"
            className="w-full p-4 flex items-center justify-between hover:bg-[#f0f4fa] transition-colors">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-[#3a4a6b]" />
              <span className="text-sm font-bold text-[#0a1628]">Política de privacidad</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#7a8fb0]" />
          </Link>
          <Divider />
          <button
            onClick={handleSignOut}
            className="w-full p-4 flex items-center gap-3 hover:bg-[#f0f4fa] transition-colors"
          >
            <LogOut className="w-5 h-5 text-red-600" />
            <span className="text-sm font-bold text-red-600">Cerrar sesión</span>
          </button>
        </div>
      </section>
    </div>
  );
}

function ToggleRow({ title, description, active, onToggle }: { title: string; description: string; active: boolean; onToggle: () => void }) {
  return (
    <div className="p-4 flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[#0a1628]">{title}</p>
        <p className="text-[10px] text-[#7a8fb0] mt-0.5">{description}</p>
      </div>
      <button onClick={onToggle} className={`w-11 h-6 rounded-full flex items-center px-1 transition-colors flex-shrink-0 ${active ? 'bg-[#003087]' : 'bg-[#e2e8f4]'}`}>
        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${active ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

function ConfigRow({ title, description, value, valueColor = 'text-[#0a1628]' }: { title: string; description: string; value: string; valueColor?: string }) {
  return (
    <div className="p-4 flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[#0a1628]">{title}</p>
        <p className="text-[10px] text-[#7a8fb0] mt-0.5">{description}</p>
      </div>
      <span className={`text-sm font-bold flex-shrink-0 ${valueColor}`}>{value}</span>
    </div>
  );
}

function Divider() { return <div className="h-px bg-[#e2e8f4] mx-4" />; }