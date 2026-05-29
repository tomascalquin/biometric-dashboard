import { ArrowUp, Map, AlertTriangle, FileText, Users } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/server';

export async function AdminDashboard() {
  const supabase = await createClient();

  // ── Vista resumen global (últimas 24h) ───────────────────────────────────────
  const { data: summary } = await supabase
    .from('v_telemetry_summary')
    .select('*')
    .single();

  // ── Vista fatiga por carrera (últimas 24h) ───────────────────────────────────
  const { data: careerFatigue } = await supabase
    .from('v_fatigue_by_career')
    .select('career_name, avg_bpm, critical_students, warning_students, normal_students, total_students')
    .limit(5);

  const fatigue = careerFatigue ?? [];
  const totalLogs = Number(summary?.total_logs ?? 0);
  const avgBpm    = Number(summary?.avg_bpm ?? 0);
  const critCount = Number(summary?.critical_count ?? 0);
  const warnCount = Number(summary?.warning_count ?? 0);
  const atRisk    = critCount + warnCount;

  // Porcentaje de estrés promedio (inverso del BPM: más bajo = más fatiga)
  // BPM normal ~15, crítico <10. Normalizamos 0-100% donde 0 BPM = 100% estrés
  const stressPercent = avgBpm > 0 ? Math.max(0, Math.min(100, Math.round((1 - avgBpm / 20) * 100))) : 0;

  return (
    <div className="p-4 space-y-5">
      
      {/* Sección: Resumen Campus */}
      <section>
        <h2 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-3 tracking-widest ml-1 uppercase">Resumen Campus - Hoy</h2>
        <div className="bg-white dark:bg-[#1a2332] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-0.5">
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Estrés promedio</p>
              <p className={`text-3xl font-bold leading-none ${stressPercent > 60 ? 'text-red-600' : stressPercent > 40 ? 'text-orange-500' : 'text-green-500'}`}>
                {totalLogs > 0 ? `${stressPercent}%` : '—'}
              </p>
              <p className="text-[10px] text-gray-400 flex items-center gap-0.5 mt-1">
                {totalLogs > 0 ? <><ArrowUp className="w-3 h-3" /> BPM prom: {avgBpm}</> : 'Sin datos aun'}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Alumnos en riesgo</p>
              <p className={`text-3xl font-bold leading-none ${atRisk > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                {atRisk}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">registros críticos + warning</p>
            </div>
            <div className="space-y-0.5 pt-1 border-t border-gray-100 dark:border-gray-800">
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Registros críticos</p>
              <p className={`text-3xl font-bold leading-none ${critCount > 0 ? 'text-red-600' : 'text-gray-800 dark:text-gray-100'}`}>
                {critCount}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">BPM {'<'} umbral crítico</p>
            </div>
            <div className="space-y-0.5 pt-1 border-t border-gray-100 dark:border-gray-800">
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Total logs 24h</p>
              <p className="text-3xl font-bold text-blue-500 leading-none">{totalLogs}</p>
              <p className="text-[10px] text-gray-400 mt-1">registros de telemetría</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección: Carreras */}
      <section>
        <h2 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-3 tracking-widest ml-1 uppercase">Carrera — Nivel de Fatiga</h2>
        <div className="bg-white dark:bg-[#1a2332] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
          {fatigue.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-3">Sin datos de telemetría aún</p>
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

      {/* Sección: Franja Horaria */}
      <section>
        <h2 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-3 tracking-widest ml-1 uppercase">Franja Horaria Más Crítica</h2>
        <div className="bg-white dark:bg-[#1a2332] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-end justify-between h-20 gap-1 mt-2 mb-1">
            {[25, 35, 60, 100, 95, 70, 45, 28].map((h, i) => (
              <div key={i} className="w-full flex flex-col items-center">
                <div 
                  className={cn(
                    "w-full rounded-t-sm transition-all",
                    h > 80 ? "bg-red-500" : h > 60 ? "bg-orange-500" : h > 40 ? "bg-yellow-400" : "bg-green-400"
                  )} 
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[9px] text-gray-400 mt-2">
            {['8h', '10h', '11h', '12h', '13h', '14h', '16h', '18h'].map(t => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-3">
            Pico de estrés: <span className="font-semibold text-red-500">12:00 – 13:00 h</span>
          </p>
        </div>
      </section>

      {/* Sección: Acceso Rápido */}
      <section>
        <h2 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-3 tracking-widest ml-1 uppercase">Acceso Rápido</h2>
        <div className="grid grid-cols-2 gap-3">
          <QuickAccessLink href="/dashboard/heatmap" icon={Map} label="Mapa de calor" />
          <QuickAccessLink href="/dashboard/alerts" icon={AlertTriangle} label="Ver alertas" />
          <QuickAccessLink href="#" icon={FileText} label="Exportar reporte" />
          <QuickAccessLink href="#" icon={Users} label="Gestionar equipo" />
        </div>
      </section>

    </div>
  );
}

function CareerProgress({ name, value, bpm, level }: { name: string, value: number, bpm: string, level: 'critical' | 'warning' | 'normal' }) {
  const statusLabel = level === 'critical' ? 'Warning' : level === 'warning' ? 'Warning' : 'Normal';
  const statusColor = level === 'critical' ? 'text-red-500' : level === 'warning' ? 'text-orange-500' : 'text-green-500';
  const barColor = level === 'critical' ? 'bg-red-500' : level === 'warning' ? 'bg-orange-400' : 'bg-green-400';

  return (
    <div>
      <div className="flex justify-between items-end mb-1.5">
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{name}</span>
        <div className="text-right">
          <span className={cn("text-[10px] font-bold", statusColor)}>• {statusLabel}</span>
          <span className="block text-[10px] text-gray-400">BPM {bpm} · {value}%</span>
        </div>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
        <div className={cn("h-1.5 rounded-full transition-all", barColor)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function QuickAccessLink({ href, icon: Icon, label }: { href: string, icon: any, label: string }) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center p-4 bg-white dark:bg-[#1a2332] rounded-xl border border-gray-100 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-600 active:scale-95 transition-all gap-2 shadow-sm">
      <Icon className="w-6 h-6 text-blue-500" />
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">{label}</span>
    </Link>
  );
}
