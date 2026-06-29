'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { TrendingDown, TrendingUp, Minus, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
type Period = 'day' | 'week' | 'month' | 'year';
type FatigueLevel = 'normal' | 'warning' | 'critical';

interface TelemetryRow {
  blinks_per_minute: number;
  fatigue_level: string;
  created_at: string;
  session_id: string | null;
}

interface Session {
  id: string;
  started_at: string;
  ended_at: string | null;
  subject_name_override: string | null;
  avg_bpm: number | null;
  dominant_level: string | null;
}

interface DataPoint {
  label: string;
  avgBpm: number | null;
  stressScore: number | null; // 0-100
  level: FatigueLevel;
  hasData: boolean;
  date: Date;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDuration(start: string, end: string | null): string {
  if (!end) return 'En curso';
  const mins = Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 60_000);
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h ${mins % 60}min`;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  const time = d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Santiago' });
  const dateStr = d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', timeZone: 'America/Santiago' });
  if (diffDays === 0) return `Hoy · ${time}`;
  if (diffDays === 1) return `Ayer · ${time}`;
  return `${dateStr} · ${time}`;
}

function bpmToStress(bpm: number | null): number {
  if (bpm === null) return 0;
  // BPM < 8 = muy bajo (critical) → estrés alto, BPM 18+ = bueno → estrés bajo
  // Invertimos: stress = 100 - (bpm/25 * 100), clamped
  const stress = Math.max(0, Math.min(100, 100 - (bpm / 25) * 100));
  return Math.round(stress);
}

function stressToLevel(stress: number | null): FatigueLevel {
  if (stress === null) return 'normal';
  if (stress >= 65) return 'critical';
  if (stress >= 40) return 'warning';
  return 'normal';
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const supabase = createClient();
  const [period, setPeriod] = useState<Period>('week');
  const [offset, setOffset] = useState(0); // 0 = current, -1 = one period back, etc.
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // ── Date range calculation ─────────────────────────────────────────────────
  const getDateRange = useCallback((): { from: Date; to: Date; labels: { label: string; date: Date }[] } => {
    const now = new Date();

    if (period === 'day') {
      const base = new Date(now);
      base.setDate(base.getDate() + offset);
      base.setHours(0, 0, 0, 0);
      const end = new Date(base);
      end.setHours(23, 59, 59, 999);
      const labels: { label: string; date: Date }[] = Array.from({ length: 24 }, (_, h) => {
        const d = new Date(base);
        d.setHours(h, 0, 0, 0);
        return { label: `${h}h`, date: d };
      });
      return { from: base, to: end, labels };
    }

    if (period === 'week') {
      const base = new Date(now);
      const day = base.getDay();
      const monday = new Date(base);
      monday.setDate(base.getDate() - ((day + 6) % 7) + offset * 7);
      monday.setHours(0, 0, 0, 0);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
      const labels: { label: string; date: Date }[] = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return { label: dayNames[i], date: d };
      });
      return { from: monday, to: sunday, labels };
    }

    if (period === 'month') {
      const base = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      const end = new Date(base.getFullYear(), base.getMonth() + 1, 0, 23, 59, 59, 999);
      const daysInMonth = end.getDate();
      const labels: { label: string; date: Date }[] = Array.from({ length: daysInMonth }, (_, i) => {
        const d = new Date(base.getFullYear(), base.getMonth(), i + 1);
        return { label: `${i + 1}`, date: d };
      });
      return { from: base, to: end, labels };
    }

    // year
    const year = now.getFullYear() + offset;
    const from = new Date(year, 0, 1);
    const to = new Date(year, 11, 31, 23, 59, 59, 999);
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const labels: { label: string; date: Date }[] = Array.from({ length: 12 }, (_, i) => {
      return { label: monthNames[i], date: new Date(year, i, 1) };
    });
    return { from, to, labels };
  }, [period, offset]);

  // ── Fetch data ────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    const { from, to, labels } = getDateRange();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: rawTelemetry } = await supabase
      .from('telemetry_logs')
      .select('blinks_per_minute, fatigue_level, created_at, session_id')
      .eq('student_anon_id', user.id)
      .gte('created_at', from.toISOString())
      .lte('created_at', to.toISOString())
      .order('created_at', { ascending: true });

    const telemetry: TelemetryRow[] = rawTelemetry ?? [];

    // ── Bucket telemetry into labels ───────────────────────────────────────
    const points: DataPoint[] = labels.map(({ label, date }) => {
      let nextDate: Date;
      if (period === 'day') {
        nextDate = new Date(date);
        nextDate.setHours(date.getHours() + 1);
      } else if (period === 'week') {
        nextDate = new Date(date);
        nextDate.setDate(date.getDate() + 1);
      } else if (period === 'month') {
        nextDate = new Date(date);
        nextDate.setDate(date.getDate() + 1);
      } else {
        nextDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      }

      const bucket = telemetry.filter(t => {
        const d = new Date(t.created_at);
        return d >= date && d < nextDate;
      });

      if (bucket.length === 0) {
        return { label, avgBpm: null, stressScore: null, level: 'normal', hasData: false, date };
      }

      const avgBpm = Math.round(bucket.reduce((s, t) => s + t.blinks_per_minute, 0) / bucket.length);
      const stressScore = bpmToStress(avgBpm);
      const level = stressToLevel(stressScore);
      return { label, avgBpm, stressScore, level, hasData: true, date };
    });

    setDataPoints(points);

    // ── Fetch recent sessions ──────────────────────────────────────────────
    const { data: rawSessions } = await supabase
      .from('study_sessions')
      .select('id, started_at, ended_at, subject_name_override, avg_bpm, dominant_level')
      .eq('student_id', user.id)
      .gte('started_at', from.toISOString())
      .lte('started_at', to.toISOString())
      .order('started_at', { ascending: false })
      .limit(8);

    setSessions(rawSessions ?? []);
    setLoading(false);
  }, [supabase, getDateRange, period]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setOffset(0); }, [period]);

  // ── Period labels ─────────────────────────────────────────────────────────
  const getPeriodLabel = (): string => {
    const { from, to } = getDateRange();
    if (period === 'day') {
      if (offset === 0) return 'Hoy';
      if (offset === -1) return 'Ayer';
      return from.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'short' });
    }
    if (period === 'week') {
      if (offset === 0) return 'Esta semana';
      const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
      return `${from.toLocaleDateString('es-CL', opts)} – ${to.toLocaleDateString('es-CL', opts)}`;
    }
    if (period === 'month') {
      return from.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
    }
    return String(from.getFullYear());
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const pointsWithData = dataPoints.filter(p => p.hasData);
  const avgStress = pointsWithData.length
    ? Math.round(pointsWithData.reduce((s, p) => s + (p.stressScore ?? 0), 0) / pointsWithData.length)
    : null;
  const maxStress = pointsWithData.length ? Math.max(...pointsWithData.map(p => p.stressScore ?? 0)) : null;
  const criticalDays = pointsWithData.filter(p => p.level === 'critical').length;

  const stressLevelLabel = avgStress === null ? '—'
    : avgStress >= 65 ? 'Alto' : avgStress >= 40 ? 'Moderado' : 'Bajo';
  const stressColor = avgStress === null ? 'text-[#7a8fb0]'
    : avgStress >= 65 ? 'text-red-500' : avgStress >= 40 ? 'text-amber-500' : 'text-emerald-500';
  const TrendIcon = avgStress === null ? Minus : avgStress >= 50 ? TrendingUp : TrendingDown;
  const trendIconColor = avgStress === null ? 'text-[#b0bdd6]'
    : avgStress >= 50 ? 'text-red-400' : 'text-emerald-400';

  // ── Chart max height ──────────────────────────────────────────────────────
  const maxVal = Math.max(1, ...pointsWithData.map(p => p.stressScore ?? 0));

  // ── Vacation band detection ───────────────────────────────────────────────
  // Vacation: mid-Dec (15) through early March (5)
  function isVacation(date: Date): boolean {
    const m = date.getMonth() + 1; // 1-12
    const d = date.getDate();
    return (m === 12 && d >= 15) || m === 1 || m === 2 || (m === 3 && d <= 5);
  }

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">

      {/* ── HEADER ── */}
      <div>
        <h1 className="text-[10px] font-bold text-[#7a8fb0] tracking-widest uppercase mb-0.5">
          Historial de Estrés
        </h1>
        <p className="text-[10px] text-[#b0bdd6]">Evolución de tus niveles biométricos</p>
      </div>

      {/* ── PERIOD SELECTOR ── */}
      <div className="bg-white rounded-2xl border border-[#e2e8f4] shadow-sm p-1 flex gap-1">
        {(['day', 'week', 'month', 'year'] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              'flex-1 py-2 rounded-xl text-[11px] font-bold transition-all',
              period === p
                ? 'bg-[#003087] text-white shadow-sm'
                : 'text-[#7a8fb0] hover:text-[#0a1628] hover:bg-[#f0f4fa]'
            )}
          >
            {p === 'day' ? 'Día' : p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Año'}
          </button>
        ))}
      </div>

      {/* ── NAVIGATION ── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setOffset(o => o - 1)}
          className="w-9 h-9 rounded-xl bg-white border border-[#e2e8f4] flex items-center justify-center text-[#7a8fb0] hover:text-[#003087] hover:border-[#003087] transition-all shadow-sm active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-[#7a8fb0]" />
          <span className="text-sm font-bold text-[#0a1628] capitalize">{getPeriodLabel()}</span>
        </div>
        <button
          onClick={() => setOffset(o => Math.min(0, o + 1))}
          disabled={offset >= 0}
          className="w-9 h-9 rounded-xl bg-white border border-[#e2e8f4] flex items-center justify-center text-[#7a8fb0] hover:text-[#003087] hover:border-[#003087] transition-all shadow-sm active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── STATS STRIP ── */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-2xl p-3 border border-[#e2e8f4] shadow-sm text-center">
          <p className="text-[9px] text-[#b0bdd6] font-bold uppercase tracking-wide mb-1">Estrés prom.</p>
          <p className={cn('text-xl font-black leading-none', stressColor)}>
            {avgStress !== null ? `${avgStress}%` : '—'}
          </p>
          <p className="text-[9px] text-[#b0bdd6] mt-1">{stressLevelLabel}</p>
        </div>
        <div className="bg-white rounded-2xl p-3 border border-[#e2e8f4] shadow-sm text-center">
          <p className="text-[9px] text-[#b0bdd6] font-bold uppercase tracking-wide mb-1">Pico máx.</p>
          <p className="text-xl font-black leading-none text-[#0a1628]">
            {maxStress !== null ? `${maxStress}%` : '—'}
          </p>
          <p className="text-[9px] text-[#b0bdd6] mt-1">de estrés</p>
        </div>
        <div className="bg-white rounded-2xl p-3 border border-[#e2e8f4] shadow-sm text-center">
          <p className="text-[9px] text-[#b0bdd6] font-bold uppercase tracking-wide mb-1">Niveles altos</p>
          <p className={cn('text-xl font-black leading-none', criticalDays > 0 ? 'text-red-500' : 'text-emerald-500')}>
            {criticalDays}
          </p>
          <p className="text-[9px] text-[#b0bdd6] mt-1">periodos</p>
        </div>
      </div>

      {/* ── STRESS CHART ── */}
      <div className="bg-white rounded-2xl border border-[#e2e8f4] shadow-sm overflow-hidden">
        <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-[#f0f4fa]">
          <div>
            <h2 className="text-[10px] font-bold text-[#7a8fb0] tracking-widest uppercase">
              Índice de Estrés
            </h2>
            <p className="text-[9px] text-[#b0bdd6] mt-0.5">Calculado desde parpadeos por minuto</p>
          </div>
          <div className={cn('flex items-center gap-1', trendIconColor)}>
            <TrendIcon className="w-4 h-4" />
            <span className="text-[10px] font-bold">{avgStress !== null ? `${avgStress}%` : '—'}</span>
          </div>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="flex items-end justify-between h-32 gap-1 animate-pulse">
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i} className="flex-1 bg-[#f0f4fa] rounded-t-md" style={{ height: `${30 + Math.random() * 60}%` }} />
              ))}
            </div>
          ) : dataPoints.every(d => !d.hasData) ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-2xl bg-[#f0f4fa] flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📊</span>
              </div>
              <p className="text-sm font-bold text-[#7a8fb0]">Sin datos para este periodo</p>
              <p className="text-[10px] text-[#b0bdd6] mt-1">Usa el monitor biométrico para generar registros</p>
            </div>
          ) : (
            <>
              {/* Y-axis labels */}
              <div className="flex gap-2">
                <div className="flex flex-col justify-between h-32 text-right pr-1 py-0.5">
                  {['100%', '75%', '50%', '25%', '0%'].map(l => (
                    <span key={l} className="text-[8px] text-[#b0bdd6] font-medium">{l}</span>
                  ))}
                </div>

                {/* Chart bars */}
                <div className="flex-1 relative">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {[0, 1, 2, 3, 4].map(i => (
                      <div key={i} className="border-t border-[#f0f4fa] w-full" />
                    ))}
                  </div>

                  {/* Vacation banner (only for month/year view) */}
                  {(period === 'month' || period === 'year') && (
                    <div className="absolute inset-0 flex pointer-events-none">
                      {dataPoints.map((dp, i) => (
                        isVacation(dp.date) ? (
                          <div
                            key={i}
                            className="flex-1 bg-emerald-50/70 border-l border-r border-emerald-100"
                            title="Vacaciones de verano"
                          />
                        ) : <div key={i} className="flex-1" />
                      ))}
                    </div>
                  )}

                  {/* Bars */}
                  <div className="relative flex items-end h-32 gap-0.5">
                    {dataPoints.map((dp, i) => {
                      const heightPct = dp.hasData ? Math.max(4, (dp.stressScore ?? 0) / 100 * 100) : 3;
                      const barColor = !dp.hasData
                        ? 'bg-[#f0f4fa]'
                        : dp.level === 'critical' ? 'bg-red-400'
                          : dp.level === 'warning' ? 'bg-amber-400'
                            : 'bg-emerald-400';
                      const isVac = isVacation(dp.date);
                      const isHovered = hoveredIdx === i;

                      return (
                        <div
                          key={i}
                          className="flex-1 flex flex-col items-center justify-end h-full cursor-pointer group relative"
                          onMouseEnter={() => setHoveredIdx(i)}
                          onMouseLeave={() => setHoveredIdx(null)}
                          onTouchStart={() => setHoveredIdx(i)}
                        >
                          {/* Tooltip */}
                          {isHovered && dp.hasData && (
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-10 bg-[#0a1628] text-white rounded-xl px-2.5 py-1.5 text-[9px] font-bold whitespace-nowrap shadow-lg pointer-events-none">
                              <div className="text-white/60 text-[8px]">{dp.label}</div>
                              <div>{dp.stressScore}% estrés</div>
                              <div className="text-white/60">{dp.avgBpm} parpadeos/min</div>
                              {isVac && <div className="text-emerald-400">🌴 Vacaciones</div>}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#0a1628]" />
                            </div>
                          )}
                          <div
                            className={cn(
                              'w-full rounded-t-md transition-all duration-200',
                              barColor,
                              isHovered && 'brightness-110 ring-2 ring-white ring-offset-1',
                              isVac && dp.hasData && 'opacity-70'
                            )}
                            style={{ height: `${heightPct}%` }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* X-axis labels — show every N-th depending on count */}
              {(() => {
                const total = dataPoints.length;
                const step = total <= 12 ? 1 : total <= 31 ? 3 : total <= 52 ? 4 : 1;
                return (
                  <div className="flex mt-1 ml-7">
                    {dataPoints.map((dp, i) => (
                      <div key={i} className="flex-1 text-center">
                        {i % step === 0 && (
                          <span className={cn(
                            'text-[8px] font-medium',
                            hoveredIdx === i ? 'text-[#003087] font-bold' : 'text-[#b0bdd6]'
                          )}>
                            {dp.label}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Legend */}
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#f0f4fa]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
                  <span className="text-[9px] text-[#7a8fb0] font-medium">Bajo</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
                  <span className="text-[9px] text-[#7a8fb0] font-medium">Moderado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-red-400" />
                  <span className="text-[9px] text-[#7a8fb0] font-medium">Alto</span>
                </div>
                {(period === 'month' || period === 'year') && (
                  <div className="flex items-center gap-1.5 ml-auto">
                    <div className="w-2.5 h-2.5 rounded-sm bg-emerald-100 border border-emerald-300" />
                    <span className="text-[9px] text-[#7a8fb0] font-medium">Vacaciones</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── SESSION LIST ── */}
      <section className="bg-white rounded-2xl border border-[#e2e8f4] shadow-sm overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-[#f0f4fa]">
          <h2 className="text-[10px] font-bold text-[#7a8fb0] tracking-widest uppercase">
            Sesiones en el periodo
          </h2>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm font-semibold text-[#7a8fb0]">Sin sesiones registradas</p>
            <p className="text-[10px] text-[#b0bdd6] mt-1">Cambia el periodo o inicia el monitor</p>
          </div>
        ) : (
          <div className="divide-y divide-[#f0f4fa]">
            {sessions.map((s) => {
              const level = (s.dominant_level ?? 'normal') as FatigueLevel;
              const avgBpm = s.avg_bpm ? Math.round(s.avg_bpm) : null;
              const stress = bpmToStress(avgBpm);
              const label = level === 'critical' ? 'Crítico' : level === 'warning' ? 'Moderado' : 'Normal';
              const badgeCls = level === 'critical'
                ? 'bg-red-50 text-red-700 border-red-200'
                : level === 'warning'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200';
              const dotCls = level === 'critical' ? 'bg-red-500' : level === 'warning' ? 'bg-amber-500' : 'bg-emerald-500';

              return (
                <div key={s.id} className="flex items-center justify-between px-4 py-3 gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#0a1628] truncate">
                      {s.subject_name_override ?? 'Sesión de estudio'}
                    </p>
                    <p className="text-[10px] text-[#7a8fb0] mt-0.5">
                      {fmtDate(s.started_at)}
                      {s.ended_at ? ` · ${fmtDuration(s.started_at, s.ended_at)}` : ' · En curso'}
                    </p>
                    {avgBpm !== null && (
                      <p className="text-[9px] text-[#b0bdd6] mt-0.5">
                        {avgBpm} parp/min · Estrés {stress}%
                      </p>
                    )}
                  </div>
                  <span className={cn('px-2.5 py-1 rounded-xl flex items-center gap-1.5 border text-[10px] font-bold flex-shrink-0', badgeCls)}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', dotCls)} />
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}
