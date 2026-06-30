'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Calendar, ChevronLeft, ChevronRight, Activity } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
type Period = 'day' | 'week' | 'month' | 'year';
type FatigueLevel = 'normal' | 'warning' | 'critical';

interface TelemetryRow {
  blinks_per_minute: number;
  fatigue_level: string;
  created_at: string;
}

interface DataPoint {
  label: string;
  avgBpm: number | null;
  stressScore: number | null;
  level: FatigueLevel;
  hasData: boolean;
  date: Date;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function bpmToStress(bpm: number | null): number {
  if (bpm === null) return 0;
  const stress = Math.max(0, Math.min(100, 100 - (bpm / 25) * 100));
  return Math.round(stress);
}

function stressToLevel(stress: number | null): FatigueLevel {
  if (stress === null) return 'normal';
  if (stress >= 65) return 'critical';
  if (stress >= 40) return 'warning';
  return 'normal';
}

export function AdminHistoryChart() {
  const supabase = createClient();
  const [period, setPeriod] = useState<Period>('week');
  const [offset, setOffset] = useState(0);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
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
        const d = new Date(base); d.setHours(h, 0, 0, 0);
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
        const d = new Date(monday); d.setDate(monday.getDate() + i);
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

    // Administrador: Traemos TODOS los logs en el periodo (o los del dummy seed user)
    // El dummy seed usa el ID 00000000-0000-0000-0000-000000000000, e inserta a nivel global.
    // Usaremos todos los logs globales para hacer un verdadero "Carga Cognitiva" global de la facultad.
    const { data: rawTelemetry } = await supabase
      .from('telemetry_logs')
      .select('blinks_per_minute, fatigue_level, created_at')
      .gte('created_at', from.toISOString())
      .lte('created_at', to.toISOString())
      .order('created_at', { ascending: true });

    const telemetry: TelemetryRow[] = rawTelemetry ?? [];

    const points: DataPoint[] = labels.map(({ label, date }) => {
      let nextDate: Date;
      if (period === 'day') { nextDate = new Date(date); nextDate.setHours(date.getHours() + 1); }
      else if (period === 'week') { nextDate = new Date(date); nextDate.setDate(date.getDate() + 1); }
      else if (period === 'month') { nextDate = new Date(date); nextDate.setDate(date.getDate() + 1); }
      else { nextDate = new Date(date.getFullYear(), date.getMonth() + 1, 1); }

      const bucket = telemetry.filter(t => {
        const d = new Date(t.created_at);
        return d >= date && d < nextDate;
      });

      if (bucket.length === 0) return { label, avgBpm: null, stressScore: null, level: 'normal', hasData: false, date };

      const avgBpm = Math.round(bucket.reduce((s, t) => s + t.blinks_per_minute, 0) / bucket.length);
      const stressScore = bpmToStress(avgBpm);
      const level = stressToLevel(stressScore);
      return { label, avgBpm, stressScore, level, hasData: true, date };
    });

    setDataPoints(points);
    setLoading(false);
  }, [supabase, getDateRange, period]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setOffset(0); }, [period]);

  const getPeriodLabel = (): string => {
    const { from, to } = getDateRange();
    if (period === 'day') {
      if (offset === 0) return 'Hoy';
      if (offset === -1) return 'Ayer';
      return from.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
    }
    if (period === 'week') {
      if (offset === 0) return 'Esta semana';
      const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
      return `${from.toLocaleDateString('es-CL', opts)} – ${to.toLocaleDateString('es-CL', opts)}`;
    }
    if (period === 'month') return from.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
    return String(from.getFullYear());
  };

  function isVacation(date: Date): boolean {
    const m = date.getMonth() + 1;
    const d = date.getDate();
    return (m === 12 && d >= 15) || m === 1 || m === 2 || (m === 3 && d <= 5);
  }

  return (
    <section className="bg-white rounded-3xl border border-[#e2e8f4] shadow-sm overflow-hidden">
      <div className="px-6 pt-6 pb-4 border-b border-[#f0f4fa] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xs font-bold text-[#7a8fb0] tracking-widest uppercase">Evolución Histórica Global</h2>
          <p className="text-sm text-[#0a1628] font-bold mt-1">Carga cognitiva de la facultad a lo largo del tiempo</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="bg-gray-100/80 p-1 rounded-2xl flex gap-1 w-full sm:w-auto">
            {(['day', 'week', 'month', 'year'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  'flex-1 sm:flex-none px-4 py-1.5 rounded-xl text-xs font-bold transition-all',
                  period === p
                    ? 'bg-white text-[#003087] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {p === 'day' ? 'Día' : p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Año'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 py-4 bg-gray-50/50 flex items-center justify-between border-b border-gray-50">
        <button
          onClick={() => setOffset(o => o - 1)}
          className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-500 hover:text-[#003087] transition-all hover:scale-105 active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 text-[#003087]">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-bold capitalize">{getPeriodLabel()}</span>
        </div>
        <button
          onClick={() => setOffset(o => Math.min(0, o + 1))}
          disabled={offset >= 0}
          className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-500 hover:text-[#003087] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* The Chart */}
      <div className="p-5 sm:p-8 pt-6">
        {loading ? (
          <div className="h-[250px] flex items-end justify-between gap-2 sm:gap-4 animate-pulse">
            {Array.from({ length: 12 }).map((_, i) => {
              const deterministicHeight = 20 + ((i * 37) % 80);
              return (
                <div key={i} className="flex-1 bg-gray-100 rounded-t-xl" style={{ height: `${deterministicHeight}%` }} />
              );
            })}
          </div>
        ) : dataPoints.every(d => !d.hasData) ? (
          <div className="h-[250px] flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Activity className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-base font-bold text-gray-400">Sin registros biométricos globales</p>
            <p className="text-xs text-gray-400 mt-1">No hay datos de alumnos generados en este periodo.</p>
          </div>
        ) : (
          <div className="relative h-[250px] flex flex-col justify-end">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
              {[100, 75, 50, 25, 0].map((val, i) => (
                <div key={i} className="flex items-center gap-4 w-full h-0">
                  <span className="text-[9px] font-bold text-gray-300 w-6 text-right">{val}%</span>
                  <div className="flex-1 border-t border-dashed border-gray-200" />
                </div>
              ))}
            </div>

            {/* Vacation banner (only for month/year view) */}
            {(period === 'month' || period === 'year') && (
              <div className="absolute inset-0 flex pointer-events-none z-0 ml-[2.5rem]">
                {dataPoints.map((dp, i) => (
                  isVacation(dp.date) ? (
                    <div
                      key={i}
                      className="flex-1 bg-blue-50/50 border-l border-r border-blue-100/50"
                      title="Vacaciones de verano"
                    />
                  ) : <div key={i} className="flex-1" />
                ))}
              </div>
            )}

            {/* Bars Area */}
            <div className="relative z-10 flex items-end h-[calc(100%-12px)] w-[calc(100%-2.5rem)] ml-[2.5rem] gap-1 sm:gap-2">
              {dataPoints.map((dp, i) => {
                const heightPct = dp.hasData ? Math.max(5, (dp.stressScore ?? 0)) : 0;
                const isHovered = hoveredIdx === i;
                
                let barClass = "from-emerald-400 to-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.3)]";
                if (dp.level === 'critical') barClass = "from-red-500 to-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]";
                else if (dp.level === 'warning') barClass = "from-amber-400 to-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.3)]";

                if (!dp.hasData) barClass = "bg-transparent";

                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-crosshair"
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    {/* Custom Tooltip */}
                    {isHovered && dp.hasData && (
                      <div className="absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                        <div className="bg-[#0a1628]/95 backdrop-blur-md text-white rounded-2xl px-4 py-3 shadow-2xl min-w-[140px] border border-white/10 transform transition-all duration-200 animate-in fade-in slide-in-from-bottom-2">
                          <p className="text-[10px] font-bold text-gray-400 mb-2 border-b border-white/10 pb-1">{dp.label}</p>
                          
                          <div className="flex justify-between items-end mb-1">
                            <span className="text-xs font-medium text-gray-300">Estrés Global</span>
                            <span className={cn("text-lg font-black leading-none", 
                              dp.level === 'critical' ? 'text-red-400' : dp.level === 'warning' ? 'text-amber-400' : 'text-emerald-400'
                            )}>{dp.stressScore}%</span>
                          </div>
                          
                          <div className="flex justify-between items-end">
                            <span className="text-xs font-medium text-gray-300">Fatiga</span>
                            <span className="text-sm font-bold leading-none">{dp.avgBpm} <span className="text-[9px] font-normal text-gray-500">BPM</span></span>
                          </div>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-[#0a1628]/95" />
                      </div>
                    )}
                    
                    {/* The Bar */}
                    <div 
                      className={cn(
                        "w-full rounded-t-lg transition-all duration-500 ease-out",
                        dp.hasData && "bg-gradient-to-t",
                        barClass,
                        isHovered && dp.hasData && "brightness-110 opacity-100",
                        !isHovered && hoveredIdx !== null && dp.hasData && "opacity-40"
                      )}
                      style={{ height: `${heightPct}%` }}
                    >
                      {/* Inner highlight for 3D effect */}
                      {dp.hasData && <div className="w-full h-full rounded-t-lg border-t border-l border-white/20" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* X Axis Labels */}
        {!loading && !dataPoints.every(d => !d.hasData) && (
          <div className="flex mt-3 ml-[2.5rem]">
            {dataPoints.map((dp, i) => {
              const total = dataPoints.length;
              const step = total <= 12 ? 1 : total <= 31 ? 3 : total <= 52 ? 4 : 1;
              return (
                <div key={i} className="flex-1 text-center">
                  {i % step === 0 && (
                    <span className={cn(
                      'text-[9px] font-bold transition-colors',
                      hoveredIdx === i ? 'text-[#003087]' : 'text-gray-400'
                    )}>
                      {dp.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        {!loading && !dataPoints.every(d => !d.hasData) && (
          <div className="flex items-center flex-wrap gap-4 mt-6 pt-4 border-t border-gray-100 ml-[2.5rem]">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-emerald-400 to-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.3)]" />
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Óptimo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-amber-400 to-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.3)]" />
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Moderado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-red-500 to-red-400 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Crítico</span>
            </div>
            {(period === 'month' || period === 'year') && (
              <div className="flex items-center gap-1.5 ml-auto">
                <div className="w-2.5 h-2.5 rounded-sm bg-blue-50 border border-blue-200" />
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Vacaciones</span>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
