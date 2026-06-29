'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { TrendingDown, TrendingUp, Minus, Calendar, ChevronLeft, ChevronRight, Activity, Zap, Brain, Building2, Clock, AlertTriangle } from 'lucide-react';

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
  stressScore: number | null;
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
  const stress = Math.max(0, Math.min(100, 100 - (bpm / 25) * 100));
  return Math.round(stress);
}

function stressToLevel(stress: number | null): FatigueLevel {
  if (stress === null) return 'normal';
  if (stress >= 65) return 'critical';
  if (stress >= 40) return 'warning';
  return 'normal';
}

export default function HistoryPage() {
  const supabase = createClient();
  const [period, setPeriod] = useState<Period>('week');
  const [offset, setOffset] = useState(0);
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: rawTelemetry } = await supabase
      .from('telemetry_logs')
      .select('blinks_per_minute, fatigue_level, created_at, session_id')
      .in('student_anon_id', [user.id, '00000000-0000-0000-0000-000000000000'])
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

    const { data: rawSessions } = await supabase
      .from('study_sessions')
      .select('id, started_at, ended_at, subject_name_override, avg_bpm, dominant_level')
      .in('student_id', [user.id, '00000000-0000-0000-0000-000000000000'])
      .gte('started_at', from.toISOString())
      .lte('started_at', to.toISOString())
      .order('started_at', { ascending: false })
      .limit(8);

    setSessions(rawSessions ?? []);
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

  const pointsWithData = dataPoints.filter(p => p.hasData);
  const avgStress = pointsWithData.length ? Math.round(pointsWithData.reduce((s, p) => s + (p.stressScore ?? 0), 0) / pointsWithData.length) : null;
  const maxStress = pointsWithData.length ? Math.max(...pointsWithData.map(p => p.stressScore ?? 0)) : null;
  const criticalDays = pointsWithData.filter(p => p.level === 'critical').length;

  const avgBpmGlobal = pointsWithData.length ? Math.round(pointsWithData.reduce((s, p) => s + (p.avgBpm ?? 0), 0) / pointsWithData.length) : null;

  // ── Vacation band detection ───────────────────────────────────────────────
  function isVacation(date: Date): boolean {
    const m = date.getMonth() + 1;
    const d = date.getDate();
    return (m === 12 && d >= 15) || m === 1 || m === 2 || (m === 3 && d <= 5);
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24">
      
      {/* ── HEADER PREMIUM UAI ── */}
      <div className="bg-[#003087] text-white pt-12 pb-24 px-6 rounded-b-[40px] relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          <Building2 className="w-96 h-96" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#001f5c] to-transparent opacity-50" />
        
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase backdrop-blur-md border border-white/20 flex items-center gap-1.5">
              <Activity className="w-3 h-3" />
              UAI Analytics
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Métricas de <br className="sm:hidden" />Rendimiento
          </h1>
          <p className="text-[#a3c2ff] text-sm sm:text-base font-medium max-w-md">
            Visualización avanzada del estrés cognitivo y fatiga a través de telemetría biométrica de alta precisión.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-16 relative z-20 space-y-6">

        {/* ── STATS HERO CARDS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="col-span-2 bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-gray-400 mb-4">
                <Brain className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Estrés Promedio</span>
              </div>
              <div className="flex items-end gap-3">
                <span className={cn("text-5xl font-black tracking-tighter leading-none", 
                  avgStress === null ? "text-gray-300" : avgStress >= 65 ? "text-red-500" : avgStress >= 40 ? "text-amber-500" : "text-emerald-500"
                )}>
                  {avgStress !== null ? `${avgStress}%` : '—'}
                </span>
                {avgStress !== null && (
                  <span className={cn("text-xs font-bold mb-1.5 px-2 py-0.5 rounded-md", 
                    avgStress >= 65 ? "bg-red-50 text-red-600" : avgStress >= 40 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                  )}>
                    {avgStress >= 65 ? 'Nivel Crítico' : avgStress >= 40 ? 'Nivel Moderado' : 'Nivel Óptimo'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-gray-400 mb-4">
              <Zap className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Picos Críticos</span>
            </div>
            <div>
              <span className="text-3xl font-black text-[#0a1628] leading-none">{criticalDays}</span>
              <p className="text-xs text-gray-400 font-medium mt-1">alertas detectadas</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-gray-400 mb-4">
              <Clock className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">BPM Prom.</span>
            </div>
            <div>
              <span className="text-3xl font-black text-[#0a1628] leading-none">{avgBpmGlobal ?? '—'}</span>
              <p className="text-xs text-gray-400 font-medium mt-1">parpadeos / min</p>
            </div>
          </div>
        </div>

        {/* ── CHART SECTION ── */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          
          {/* Chart Header & Controls */}
          <div className="p-5 sm:p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#0a1628]">Evolución Histórica</h2>
              <p className="text-xs text-gray-400 font-medium mt-0.5">Análisis de la fatiga a lo largo del tiempo</p>
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

          <div className="px-5 py-4 bg-gray-50/50 flex items-center justify-between">
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
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="flex-1 bg-gray-100 rounded-t-xl" style={{ height: `${20 + Math.random() * 80}%` }} />
                ))}
              </div>
            ) : dataPoints.every(d => !d.hasData) ? (
              <div className="h-[250px] flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Activity className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-base font-bold text-gray-400">Sin registros biométricos</p>
                <p className="text-xs text-gray-400 mt-1">No hay datos suficientes para generar la visualización en este periodo.</p>
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
                                <span className="text-xs font-medium text-gray-300">Estrés</span>
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
        </div>

        {/* ── SESSION BREAKDOWN ── */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#0a1628] uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#003087]" />
              Desglose de Sesiones
            </h2>
            <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2.5 py-1 rounded-full">{sessions.length} registradas</span>
          </div>

          {sessions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm font-bold text-gray-400">Sin sesiones en este periodo</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {sessions.map((s) => {
                const level = (s.dominant_level ?? 'normal') as FatigueLevel;
                const avgBpm = s.avg_bpm ? Math.round(s.avg_bpm) : null;
                const stress = bpmToStress(avgBpm);
                
                return (
                  <div key={s.id} className="p-5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors group">
                    <div className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm shrink-0",
                      level === 'critical' ? 'bg-red-50 text-red-500' : level === 'warning' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'
                    )}>
                      {level === 'critical' ? <AlertTriangle className="w-5 h-5" /> : level === 'warning' ? <Activity className="w-5 h-5" /> : <Brain className="w-5 h-5" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className="text-sm font-bold text-[#0a1628] truncate">{s.subject_name_override ?? 'Sesión de Análisis'}</h3>
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-md",
                          level === 'critical' ? 'bg-red-100 text-red-700' : level === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        )}>
                          {level === 'critical' ? 'CRÍTICO' : level === 'warning' ? 'MODERADO' : 'ÓPTIMO'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {fmtDate(s.started_at)}</span>
                        {s.ended_at && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {fmtDuration(s.started_at, s.ended_at)}</span>}
                      </div>
                    </div>

                    {avgBpm !== null && (
                      <div className="text-right shrink-0">
                        <div className="text-lg font-black text-[#0a1628] leading-none">{stress}%</div>
                        <div className="text-[10px] font-bold text-gray-400 mt-1 tracking-wider uppercase">Estrés</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
