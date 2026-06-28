import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'BiometricOS — Historial',
  description: 'Historial de sesiones y métricas de fatiga',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDuration(start: string, end: string | null): string {
  if (!end) return 'En curso';
  const mins = Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 60_000);
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h ${mins % 60}min`;
}

function fmtDate(iso: string): string {
  // Crear fecha con timezone de Chile (UTC-3 en invierno, UTC-4 en verano)
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  
  // Formatear hora en zona horaria de Chile
  const time = d.toLocaleTimeString('es-CL', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'America/Santiago'
  });
  
  // Formatear fecha
  const dateStr = d.toLocaleDateString('es-CL', { 
    day: 'numeric', 
    month: 'short',
    timeZone: 'America/Santiago'
  });
  
  if (diffDays === 0) return `Hoy · ${time}`;
  if (diffDays === 1) return `Ayer · ${time}`;
  return `${dateStr} · ${time}`;
}

function dominantLevel(
  counts: Record<string, number>,
): 'normal' | 'warning' | 'critical' {
  if ((counts['critical'] ?? 0) > 0) return 'critical';
  if ((counts['warning'] ?? 0) > 0) return 'warning';
  return 'normal';
}

export default async function HistoryPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // ── Últimas 10 sesiones ───────────────────────────────────────────────────
  const { data: rawSessions } = await supabase
    .from('study_sessions')
    .select('id, started_at, ended_at, subject_name_override, status, avg_bpm, dominant_level')
    .eq('student_id', user.id)
    .order('started_at', { ascending: false })
    .limit(10);

  const sessions = rawSessions ?? [];

  // ── Telemetría de los últimos 7 días ──────────────────────────────────────
  const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const { data: rawTelemetry } = await supabase
    .from('telemetry_logs')
    .select('blinks_per_minute, fatigue_level, created_at, session_id')
    .eq('student_anon_id', user.id)
    .gte('created_at', sevenDaysAgo);

  const telemetry = rawTelemetry ?? [];

  // ── Métricas por sesión ───────────────────────────────────────────────────
  const telemetryBySession = new Map<string, { bpms: number[]; levels: Record<string, number> }>();
  telemetry.forEach((t) => {
    if (!t.session_id) return;
    const cur = telemetryBySession.get(t.session_id) ?? { bpms: [], levels: {} };
    cur.bpms.push(t.blinks_per_minute);
    cur.levels[t.fatigue_level] = (cur.levels[t.fatigue_level] ?? 0) + 1;
    telemetryBySession.set(t.session_id, cur);
  });

  // ── Resumen semanal ───────────────────────────────────────────────────────
  const weekSessions = sessions.filter(
    (s) => new Date(s.started_at).getTime() >= Date.now() - 7 * 86_400_000,
  );
  const totalMin = weekSessions.reduce((acc, s) => {
    if (!s.ended_at) return acc;
    return acc + Math.floor((new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 60_000);
  }, 0);
  const criticalCount = telemetry.filter((t) => t.fatigue_level === 'critical').length;
  const avgBpmWeek = telemetry.length
    ? Math.round(telemetry.reduce((acc, t) => acc + t.blinks_per_minute, 0) / telemetry.length)
    : null;

  // ── BPM por día (últimos 7 días) ─────────────────────────────────────────
  const dayKeys = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  const bpmByDay = new Map<string, number[]>();
  telemetry.forEach((t) => {
    const day = new Date(t.created_at).toISOString().slice(0, 10);
    const arr = bpmByDay.get(day) ?? [];
    arr.push(t.blinks_per_minute);
    bpmByDay.set(day, arr);
  });
  const dayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const dayData = dayKeys.map((key, i) => {
    const bpms = bpmByDay.get(key) ?? [];
    const avg = bpms.length ? Math.round(bpms.reduce((a, b) => a + b, 0) / bpms.length) : null;
    const dayOfWeek = new Date(key + 'T12:00:00').getDay();
    const label = ['D', 'L', 'M', 'X', 'J', 'V', 'S'][dayOfWeek];
    const maxBpm = 25;
    const pct = avg !== null ? Math.min(100, Math.round((avg / maxBpm) * 100)) : 0;
    let level: 'normal' | 'warning' | 'critical' = 'normal';
    if (avg !== null) {
      if (avg < 10) level = 'critical';
      else if (avg < 15) level = 'warning';
    }
    return { label, avg, pct, level, hasData: avg !== null };
  });

  return (
    <div className="p-4 space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-[10px] font-bold text-[#7a8fb0] tracking-widest uppercase mb-0.5">
          Historial
        </h1>
        <p className="text-[10px] text-[#b0bdd6]">Últimas sesiones de estudio</p>
      </div>

      {/* Últimas Sesiones */}
      <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f4]">
        <h2 className="text-[10px] font-bold text-[#7a8fb0] tracking-widest uppercase mb-4">
          Últimas Sesiones
        </h2>

        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm font-semibold text-[#7a8fb0]">Sin sesiones registradas</p>
            <p className="text-[10px] text-[#b0bdd6] mt-1">
              Inicia el monitor para comenzar a medir
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {sessions.map((s, i) => {
              // Usar avg_bpm y dominant_level guardados en study_sessions (calculados por close_study_session)
              const level = (s.dominant_level ?? 'normal') as 'normal' | 'warning' | 'critical';
              const avgBpm = s.avg_bpm ? Math.round(s.avg_bpm) : null;
              const label = level === 'critical' ? 'Crítico' : level === 'warning' ? 'Warning' : 'Normal';
              return (
                <div key={s.id}>
                  {i > 0 && <div className="h-px bg-[#e2e8f4] w-full" />}
                  <SessionRow
                    name={s.subject_name_override ?? 'Sesión de estudio'}
                    time={`${fmtDate(s.started_at)}${s.ended_at ? ` — ${fmtDuration(s.started_at, s.ended_at)}` : ' · En curso'}`}
                    status={label}
                    level={level}
                    bpm={avgBpm}
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Resumen Semana */}
      <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f4]">
        <h2 className="text-[10px] font-bold text-[#7a8fb0] tracking-widest uppercase mb-4">
          Resumen Semana
        </h2>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <StatBox
            label="Sesiones"
            value={String(weekSessions.length)}
            sub="esta semana"
            valueColor="text-blue-500"
          />
          <StatBox
            label="Horas monitoreadas"
            value={totalMin > 0 ? `${Math.floor(totalMin / 60)}h ${totalMin % 60}m` : '—'}
            sub="acumuladas"
            valueColor="text-green-500"
          />
          <StatBox
            label="Alertas críticas"
            value={String(criticalCount)}
            sub="esta semana"
            valueColor="text-red-500"
          />
          <StatBox
            label="BPM prom."
            value={avgBpmWeek !== null ? String(avgBpmWeek) : '—'}
            sub="semana"
            valueColor="text-orange-500"
          />
        </div>

        {/* Gráfica BPM */}
        <div className="pt-4 border-t border-[#e2e8f4]">
          <p className="text-[10px] text-[#7a8fb0] mb-3 font-semibold">
            Tendencia BPM — últimos 7 días
          </p>
          {dayData.every((d) => !d.hasData) ? (
            <p className="text-[10px] font-semibold text-[#b0bdd6] text-center py-4">
              Sin datos de telemetría esta semana
            </p>
          ) : (
            <div className="flex items-end justify-between h-16 gap-2">
              {dayData.map((d, i) => (
                <Bar key={i} day={d.label} value={d.avg ?? 0} pct={d.pct} level={d.level} hasData={d.hasData} />
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}

function SessionRow({
  name, time, status, level, bpm,
}: {
  name: string; time: string; status: string;
  level: 'normal' | 'warning' | 'critical'; bpm: number | null;
}) {
  const badgeClass =
    level === 'critical'
      ? 'bg-red-50 text-red-700'
      : level === 'warning'
      ? 'bg-amber-50 text-amber-700'
      : 'bg-green-50 text-green-700';
  const dotClass =
    level === 'critical' ? 'bg-red-500' : level === 'warning' ? 'bg-amber-500' : 'bg-green-500';

  return (
    <div className="flex items-center justify-between py-3 gap-2">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[#0a1628] truncate">{name}</p>
        <p className="text-[10px] font-semibold text-[#7a8fb0] mt-0.5 truncate">{time}</p>
        {bpm !== null && (
          <p className="text-[10px] font-semibold text-[#b0bdd6] mt-0.5">BPM prom: {bpm}</p>
        )}
      </div>
      <div className={cn('px-2.5 py-1 rounded-lg flex items-center gap-1.5 flex-shrink-0', badgeClass)}>
        <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dotClass)} />
        <span className="text-[10px] font-bold">{status}</span>
      </div>
    </div>
  );
}

function StatBox({
  label, value, sub, valueColor,
}: {
  label: string; value: string; sub: string; valueColor: string;
}) {
  return (
    <div className="bg-[#f8fafd] border border-[#e2e8f4] rounded-xl p-3">
      <p className="text-[10px] text-[#7a8fb0] font-semibold mb-1">{label}</p>
      <p className={cn('text-xl font-black leading-none', valueColor)}>{value}</p>
      <p className="text-[10px] text-[#b0bdd6] font-semibold mt-1">{sub}</p>
    </div>
  );
}

function Bar({
  day, value, pct, level, hasData,
}: {
  day: string; value: number; pct: number;
  level: 'normal' | 'warning' | 'critical'; hasData: boolean;
}) {
  const color = hasData
    ? level === 'normal' ? 'bg-green-500' : level === 'warning' ? 'bg-amber-500' : 'bg-red-500'
    : 'bg-[#e2e8f4]';
  return (
    <div className="flex flex-col items-center gap-1 w-full">
      <span className="text-[8px] font-semibold text-[#b0bdd6]">{hasData ? value : ''}</span>
      <div
        className={cn('w-full rounded-t-sm transition-all', color)}
        style={{ height: `${Math.max(pct, hasData ? 10 : 4)}%` }}
      />
      <span className="text-[10px] font-bold text-[#7a8fb0]">{day}</span>
    </div>
  );
}
