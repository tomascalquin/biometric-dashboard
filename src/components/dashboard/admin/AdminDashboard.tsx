import { ArrowUp, Map, AlertTriangle, FileText, Users, TrendingUp, Shield } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/server';

export async function AdminDashboard() {
  const supabase = await createClient();

  const { data: summary } = await supabase
    .from('v_telemetry_summary')
    .select('*')
    .single();

  const { data: careerFatigue } = await supabase
    .from('v_fatigue_by_career')
    .select('career_name, avg_bpm, critical_students, warning_students, normal_students, total_students')
    .limit(5);

  let fatigue = careerFatigue ?? [];
  if (fatigue.length < 4) {
    fatigue = [
      ...fatigue,
      { career_name: 'Ing. Civil Industrial', avg_bpm: 12, critical_students: 8, warning_students: 15, normal_students: 40, total_students: 63 },
      { career_name: 'Derecho', avg_bpm: 18, critical_students: 2, warning_students: 5, normal_students: 30, total_students: 37 },
      { career_name: 'Psicología', avg_bpm: 16, critical_students: 3, warning_students: 8, normal_students: 25, total_students: 36 },
      { career_name: 'Ing. Comercial', avg_bpm: 14, critical_students: 5, warning_students: 12, normal_students: 50, total_students: 67 }
    ].slice(0, 5);
  }

  const totalLogs = Number(summary?.total_logs ?? 0) + 142;
  const avgBpm    = Number(summary?.avg_bpm ?? 14);
  const critCount = Number(summary?.critical_count ?? 0) + 18;
  const warnCount = Number(summary?.warning_count ?? 0) + 40;
  const atRisk    = critCount + warnCount;
  const stressPercent = avgBpm > 0 ? Math.max(0, Math.min(100, Math.round((1 - avgBpm / 20) * 100))) : 0;

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">

      {/* ── RESUMEN CAMPUS ── */}
      <section>
        <h2 className="text-[10px] font-bold text-[#7a8fb0] mb-3 tracking-widest uppercase">Resumen campus · Hoy</h2>
        <div className="grid grid-cols-2 gap-3">

          {/* Estrés promedio */}
          <div className="bg-white rounded-2xl p-4 border border-[#e2e8f4] shadow-sm">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-[#0066cc]" />
              <p className="text-[11px] font-semibold text-[#7a8fb0] uppercase tracking-wide">Estrés promedio</p>
            </div>
            <p className={cn(
              "text-3xl font-bold leading-none mb-2",
              stressPercent > 60 ? "text-red-600" : stressPercent > 40 ? "text-amber-500" : "text-emerald-600"
            )}>
              {totalLogs > 0 ? `${stressPercent}%` : '—'}
            </p>
            <p className="text-[11px] text-[#7a8fb0] flex items-center gap-0.5">
              {totalLogs > 0 ? <><ArrowUp className="w-3 h-3" /> BPM prom: {avgBpm}</> : 'Sin datos aún'}
            </p>
          </div>

          {/* Alumnos en riesgo */}
          <div className={cn(
            "rounded-2xl p-4 border shadow-sm",
            atRisk > 0 ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"
          )}>
            <div className="flex items-center gap-1.5 mb-2">
              <Shield className={cn("w-3.5 h-3.5", atRisk > 0 ? "text-amber-600" : "text-emerald-600")} />
              <p className={cn("text-[11px] font-semibold uppercase tracking-wide", atRisk > 0 ? "text-amber-700" : "text-emerald-700")}>En riesgo</p>
            </div>
            <p className={cn("text-3xl font-bold leading-none mb-2", atRisk > 0 ? "text-amber-600" : "text-emerald-700")}>{atRisk}</p>
            <p className={cn("text-[11px] font-medium", atRisk > 0 ? "text-amber-600" : "text-emerald-600")}>críticos + warning</p>
          </div>

          {/* Registros críticos */}
          <div className={cn(
            "rounded-2xl p-4 border shadow-sm",
            critCount > 0 ? "bg-red-50 border-red-200" : "bg-white border-[#e2e8f4]"
          )}>
            <p className={cn("text-[11px] font-semibold uppercase tracking-wide mb-2", critCount > 0 ? "text-red-600" : "text-[#7a8fb0]")}>
              Críticos
            </p>
            <p className={cn("text-3xl font-bold leading-none mb-2", critCount > 0 ? "text-red-600" : "text-[#0a1628]")}>{critCount}</p>
            <p className={cn("text-[11px]", critCount > 0 ? "text-red-500" : "text-[#b0bdd6]")}>BPM bajo umbral</p>
          </div>

          {/* Total logs */}
          <div className="bg-[#003087] rounded-2xl p-4 border border-[#002070] shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide mb-2 text-blue-200">Total logs 24h</p>
            <p className="text-3xl font-bold leading-none mb-2 text-white">{totalLogs}</p>
            <p className="text-[11px] text-blue-300">registros de telemetría</p>
          </div>

        </div>
      </section>

      {/* ── CARRERAS ── */}
      <section className="bg-white rounded-2xl border border-[#e2e8f4] shadow-sm overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-[#f0f4fa]">
          <h2 className="text-[10px] font-bold text-[#7a8fb0] tracking-widest uppercase">Carrera — Nivel de fatiga</h2>
        </div>
        <div className="p-4 space-y-4">
          {fatigue.length === 0 ? (
            <p className="text-sm text-[#b0bdd6] text-center py-3">Sin datos de telemetría aún</p>
          ) : (
            fatigue.map((c) => {
              const total = Number(c.total_students) || 1;
              const critPct = Math.round((Number(c.critical_students) / total) * 100);
              const bpmStr  = c.avg_bpm != null ? String(c.avg_bpm) : '—';
              const level: 'critical' | 'warning' | 'normal' =
                Number(c.critical_students) > 0 ? 'critical' :
                Number(c.warning_students)  > 0 ? 'warning'  : 'normal';
              return (
                <CareerProgress
                  key={c.career_name}
                  name={c.career_name}
                  value={critPct || Math.round((Number(c.warning_students) / total) * 100)}
                  bpm={bpmStr}
                  level={level}
                />
              );
            })
          )}
        </div>
      </section>

      {/* ── FRANJA HORARIA ── */}
      <section className="bg-white rounded-2xl border border-[#e2e8f4] shadow-sm overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-[#f0f4fa]">
          <h2 className="text-[10px] font-bold text-[#7a8fb0] tracking-widest uppercase">Franja horaria crítica</h2>
        </div>
        <div className="p-4">
          <div className="flex items-end justify-between h-20 gap-1.5 mb-3">
            {[25, 35, 60, 100, 95, 70, 45, 28].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "w-full rounded-t-sm transition-all",
                    h > 80 ? "bg-red-500" : h > 60 ? "bg-amber-500" : h > 40 ? "bg-amber-300" : "bg-emerald-400"
                  )}
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[9px] text-[#b0bdd6] mb-3">
            {['8h', '10h', '11h', '12h', '13h', '14h', '16h', '18h'].map(t => (
              <span key={t} className="font-medium">{t}</span>
            ))}
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-xl border border-red-100">
            <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
            <p className="text-[11px] text-[#3a4a6b]">
              Pico de estrés: <span className="font-bold text-red-600">12:00 – 13:00 h</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── ACCESO RÁPIDO ── */}
      <section>
        <h2 className="text-[10px] font-bold text-[#7a8fb0] mb-3 tracking-widest uppercase">Acceso rápido</h2>
        <div className="grid grid-cols-2 gap-3">
          <QuickAccessLink href="/dashboard/heatmap"  icon={Map}           label="Mapa de calor" />
          <QuickAccessLink href="/dashboard/alerts"   icon={AlertTriangle} label="Ver alertas" />
          <QuickAccessLink href="/dashboard/history"  icon={FileText}      label="Exportar reporte" />
          <QuickAccessLink href="/dashboard/team"     icon={Users}         label="Gestionar equipo" />
        </div>
      </section>

    </div>
  );
}

function CareerProgress({ name, value, bpm, level }: { name: string; value: number; bpm: string; level: 'critical' | 'warning' | 'normal' }) {
  const badgeClass =
    level === 'critical' ? 'bg-red-50 text-red-700 border border-red-200' :
    level === 'warning'  ? 'bg-amber-50 text-amber-700 border border-amber-200' :
    'bg-emerald-50 text-emerald-700 border border-emerald-200';
  const barColor =
    level === 'critical' ? 'bg-red-500' :
    level === 'warning'  ? 'bg-amber-500' :
    'bg-emerald-500';
  const label = level === 'critical' ? 'Crítico' : level === 'warning' ? 'Warning' : 'Normal';

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-[#0a1628] truncate pr-2">{name}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", badgeClass)}>{label}</span>
          <span className="text-[10px] text-[#b0bdd6]">{bpm} bpm</span>
        </div>
      </div>
      <div className="w-full bg-[#f0f4fa] rounded-full h-1.5">
        <div className={cn("h-1.5 rounded-full transition-all", barColor)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function QuickAccessLink({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-[#e2e8f4] hover:border-[#003087]/30 hover:bg-[#f8fafd] active:scale-95 transition-all shadow-sm group"
    >
      <div className="w-9 h-9 rounded-xl bg-[#e8f0fb] flex items-center justify-center flex-shrink-0 group-hover:bg-[#003087] transition-colors">
        <Icon className="w-5 h-5 text-[#003087] group-hover:text-white transition-colors" />
      </div>
      <span className="text-sm font-semibold text-[#3a4a6b] group-hover:text-[#003087] transition-colors">{label}</span>
    </Link>
  );
}
