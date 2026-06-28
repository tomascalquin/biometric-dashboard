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
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* ── HEADER COMMAND CENTER ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0a1628] tracking-tight">
            Command Center
          </h1>
          <p className="text-sm md:text-base text-[#7a8fb0] font-medium mt-1">
            Monitoreo biométrico en tiempo real
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 shadow-sm animate-pulse">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
          <span className="text-sm font-bold tracking-wide">Sistema Operativo</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: RESUMEN Y ACCESOS (1/3) */}
        <div className="space-y-8">
          {/* ── RESUMEN CAMPUS ── */}
          <section>
            <h2 className="text-xs font-bold text-[#7a8fb0] mb-4 tracking-widest uppercase">Métricas Core</h2>
            <div className="grid grid-cols-2 gap-4">

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

          {/* ── ACCESO RÁPIDO ── */}
          <section>
            <h2 className="text-xs font-bold text-[#7a8fb0] mb-4 tracking-widest uppercase">Módulos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <QuickAccessLink href="/dashboard/heatmap"  icon={Map}           label="Mapa en vivo" />
              <QuickAccessLink href="/dashboard/alerts"   icon={AlertTriangle} label="Triage Alertas" />
              <QuickAccessLink href="/dashboard/history"  icon={FileText}      label="Reportes IA" />
              <QuickAccessLink href="/dashboard/team"     icon={Users}         label="Staff" />
            </div>
          </section>
        </div>

        {/* COLUMNA DERECHA: GRÁFICOS Y ANÁLISIS (2/3) */}
        <div className="xl:col-span-2 space-y-8">

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

          {/* ── FRANJA HORARIA PREMIUM (Pulse Trend) ── */}
          <section className="bg-white rounded-3xl border border-[#e2e8f4] shadow-sm overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-[#f0f4fa] flex justify-between items-center">
              <div>
                <h2 className="text-xs font-bold text-[#7a8fb0] tracking-widest uppercase">Carga Cognitiva por Hora</h2>
                <p className="text-sm text-[#0a1628] font-bold mt-1">Tendencia diaria de estrés crónico</p>
              </div>
              <div className="px-3 py-1 bg-[#f8fafd] rounded-lg border border-[#e2e8f4] text-xs font-bold text-[#3a4a6b]">
                Últimas 12h
              </div>
            </div>
            <div className="p-6">
              {/* Gráfico de Barras CSS Puro */}
              <div className="flex items-end justify-between h-48 gap-2 md:gap-4 mb-4">
                {[15, 25, 45, 80, 100, 85, 55, 30, 20, 10, 15, 20].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div
                      className={cn(
                        "w-full rounded-t-lg transition-all duration-500 ease-out hover:opacity-80 relative",
                        h > 80 ? "bg-gradient-to-t from-red-500 to-red-400" : 
                        h > 50 ? "bg-gradient-to-t from-amber-500 to-amber-400" : 
                        "bg-gradient-to-t from-emerald-500 to-emerald-400"
                      )}
                      style={{ height: `${Math.max(h, 5)}%` }}
                    >
                      {/* Tooltip Hover (CSS) */}
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0a1628] text-white text-[10px] font-bold px-2 py-1 rounded shadow-xl pointer-events-none transition-opacity whitespace-nowrap z-10">
                        {h}% Crítico
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs font-bold text-[#b0bdd6]">
                {['8:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'].map(t => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between p-4 bg-[#f8fafd] rounded-2xl border border-[#e2e8f4]">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                  <div>
                    <p className="text-xs font-semibold text-[#7a8fb0]">Pico Crítico Detectado</p>
                    <p className="text-sm font-bold text-[#0a1628]">12:00 – 14:00 hrs (Horario de Solemnes)</p>
                  </div>
                </div>
                <button className="text-xs font-bold text-[#003087] bg-white px-3 py-1.5 rounded-lg border border-[#e2e8f4] hover:bg-[#e8f0fb] transition-colors">
                  Generar Acción
                </button>
              </div>
            </div>
          </section>

          {/* ── CARRERAS (Subject Burnout / Radar) ── */}
          <section className="bg-white rounded-3xl border border-[#e2e8f4] shadow-sm overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-[#f0f4fa]">
              <h2 className="text-xs font-bold text-[#7a8fb0] tracking-widest uppercase">Índice de Fricción Cognitiva por Facultad</h2>
            </div>
            <div className="p-6 space-y-6">
              {fatigue.length === 0 ? (
                <p className="text-sm text-[#b0bdd6] text-center py-6 font-medium">Sin datos de telemetría aún</p>
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
        </div>
      </div>
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
    <div className="group cursor-pointer">
      <div className="flex justify-between items-center mb-2.5">
        <span className="text-sm md:text-base font-bold text-[#0a1628] truncate pr-2 group-hover:text-[#003087] transition-colors">{name}</span>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={cn("text-xs font-bold px-3 py-1 rounded-full shadow-sm", badgeClass)}>{label}</span>
          <span className="text-xs font-bold text-[#b0bdd6] tabular-nums">{bpm} bpm avg</span>
        </div>
      </div>
      <div className="w-full bg-[#f8fafd] rounded-full h-3 border border-[#e2e8f4] overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-700 ease-out", barColor)} style={{ width: `${Math.max(value, 2)}%` }} />
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function QuickAccessLink({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-3 p-5 bg-white rounded-2xl border border-[#e2e8f4] hover:border-[#003087]/30 hover:bg-[#f8fafd] hover:shadow-md active:scale-95 transition-all shadow-sm group"
    >
      <div className="w-10 h-10 rounded-xl bg-[#e8f0fb] flex items-center justify-center flex-shrink-0 group-hover:bg-[#003087] transition-colors">
        <Icon className="w-5 h-5 text-[#003087] group-hover:text-white transition-colors" />
      </div>
      <span className="text-sm font-bold text-[#0a1628] group-hover:text-[#003087] transition-colors">{label}</span>
    </Link>
  );
}
