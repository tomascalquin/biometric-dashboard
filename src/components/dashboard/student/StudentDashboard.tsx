import { Lightbulb, Trophy, Activity, Clock, Bell, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { FatigueLevel } from '@/types/telemetry';

interface StudentDashboardProps {
  careerName:     string | null;
  avgBpm:         number | null;
  alertsToday:    number;
  dominantLevel:  FatigueLevel | null;
  sessionMin:     number | null;
  sessionSubject: string | null;
}

export function StudentDashboard({
  careerName,
  avgBpm,
  alertsToday,
  dominantLevel,
  sessionMin,
  sessionSubject,
}: StudentDashboardProps) {

  const levelLabel: Record<FatigueLevel, string> = {
    normal:   'Óptimo',
    warning:  'Moderado',
    critical: 'Alto',
  };
  const levelBadge: Record<FatigueLevel, string> = {
    normal:   'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning:  'bg-amber-50 text-amber-700 border border-amber-200',
    critical: 'bg-red-50 text-red-700 border border-red-200',
  };
  const levelDot: Record<FatigueLevel, string> = {
    normal:   'bg-emerald-500',
    warning:  'bg-amber-500',
    critical: 'bg-red-500',
  };
  const levelBar: Record<FatigueLevel, string> = {
    normal:   'bg-emerald-500',
    warning:  'bg-amber-500',
    critical: 'bg-red-500',
  };

  const currentLevel = dominantLevel ?? 'normal';

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">

      {/* ── ESTADO HOY ── */}
      <section>
        <SectionLabel>Mi estado hoy</SectionLabel>
        <div className="grid grid-cols-2 gap-3">

          {/* BPM Card */}
          <div className="bg-white rounded-2xl p-4 border border-[#e2e8f4] shadow-sm">
            <div className="flex items-center gap-1.5 mb-3">
              <Activity className="w-3.5 h-3.5 text-[#0066cc]" />
              <p className="text-[11px] font-semibold text-[#7a8fb0] uppercase tracking-wide">BPM promedio</p>
            </div>
            <p className="text-3xl font-bold text-[#0a1628] leading-none mb-2">
              {avgBpm !== null ? avgBpm : '—'}
              {avgBpm !== null && <span className="text-sm font-normal text-[#7a8fb0] ml-1">bpm</span>}
            </p>
            {dominantLevel && (
              <span className={cn("inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full", levelBadge[currentLevel])}>
                <span className={cn("w-1.5 h-1.5 rounded-full", levelDot[currentLevel])} />
                {levelLabel[currentLevel]}
              </span>
            )}
            {!dominantLevel && <span className="text-[11px] text-[#b0bdd6]">Sin datos</span>}
          </div>

          {/* Estrés Card */}
          <div className="bg-white rounded-2xl p-4 border border-[#e2e8f4] shadow-sm">
            <div className="flex items-center gap-1.5 mb-3">
              <div className="w-3.5 h-3.5 flex items-center justify-center">
                <div className={cn("w-2.5 h-2.5 rounded-full", dominantLevel ? levelDot[dominantLevel] : "bg-[#b0bdd6]")} />
              </div>
              <p className="text-[11px] font-semibold text-[#7a8fb0] uppercase tracking-wide">Estrés hoy</p>
            </div>
            <p className="text-3xl font-bold text-[#0a1628] leading-none mb-2">
              {dominantLevel ? levelLabel[dominantLevel] : '—'}
            </p>
            {dominantLevel && (
              <span className={cn("inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full", levelBadge[dominantLevel])}>
                Nivel de fatiga
              </span>
            )}
            {!dominantLevel && <span className="text-[11px] text-[#b0bdd6]">Sin datos</span>}
          </div>

          {/* Sesión Card */}
          <div className="bg-white rounded-2xl p-4 border border-[#e2e8f4] shadow-sm">
            <div className="flex items-center gap-1.5 mb-3">
              <Clock className="w-3.5 h-3.5 text-[#0066cc]" />
              <p className="text-[11px] font-semibold text-[#7a8fb0] uppercase tracking-wide">Sesión activa</p>
            </div>
            <p className="text-3xl font-bold text-[#0a1628] leading-none mb-2">
              {sessionMin !== null ? `${sessionMin}` : '—'}
              {sessionMin !== null && <span className="text-sm font-normal text-[#7a8fb0] ml-1">min</span>}
            </p>
            <p className="text-[11px] text-[#7a8fb0] truncate">
              {sessionSubject ?? (sessionMin !== null ? 'Sesión en curso' : 'Sin sesión')}
            </p>
          </div>

          {/* Alertas Card */}
          {alertsToday > 0 ? (
            <Link href="/dashboard/history" className="block">
              <div className="bg-red-50 rounded-2xl p-4 border border-red-200 shadow-sm h-full">
                <div className="flex items-center gap-1.5 mb-3">
                  <Bell className="w-3.5 h-3.5 text-red-500" />
                  <p className="text-[11px] font-semibold text-red-500 uppercase tracking-wide">Alertas hoy</p>
                </div>
                <p className="text-3xl font-bold text-red-600 leading-none mb-2">{alertsToday}</p>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-600">
                  Ver historial <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ) : (
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 shadow-sm">
              <div className="flex items-center gap-1.5 mb-3">
                <Bell className="w-3.5 h-3.5 text-emerald-600" />
                <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">Alertas hoy</p>
              </div>
              <p className="text-3xl font-bold text-emerald-700 leading-none mb-2">0</p>
              <span className="text-[11px] text-emerald-600 font-medium">Sin alertas ✓</span>
            </div>
          )}
        </div>
      </section>

      {/* ── MIS MATERIAS ── */}
      <section className="bg-white rounded-2xl border border-[#e2e8f4] shadow-sm overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-[#f0f4fa]">
          <SectionLabel className="mb-0">Mis materias — Semana</SectionLabel>
        </div>
        <div className="p-4">
          {avgBpm !== null ? (
            <div className="space-y-4">
              <SubjectRow
                name={sessionSubject ?? 'Sesión sin nombre'}
                status={levelLabel[currentLevel]}
                bpm={String(avgBpm)}
                value={Math.min(100, avgBpm * 5)}
                level={currentLevel}
                levelBar={levelBar}
              />
              <p className="text-[10px] text-[#b0bdd6] text-center">
                Inicia más sesiones para ver el desglose completo
              </p>
            </div>
          ) : (
            <div className="text-center py-5">
              <div className="w-10 h-10 rounded-full bg-[#f0f4fa] flex items-center justify-center mx-auto mb-3">
                <Activity className="w-5 h-5 text-[#b0bdd6]" />
              </div>
              <p className="text-sm font-medium text-[#3a4a6b] mb-1">Sin sesiones registradas</p>
              <p className="text-[11px] text-[#b0bdd6] mb-3">Usa el monitor para comenzar a medir tu bienestar</p>
              <Link
                href="/dashboard/monitor"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#003087] bg-[#e8f0fb] px-3 py-1.5 rounded-lg hover:bg-[#d0e0f7] transition-colors"
              >
                Ir al monitor <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── ENERGÍA SEMANAL ── */}
      <section className="bg-white rounded-2xl border border-[#e2e8f4] shadow-sm overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-[#f0f4fa]">
          <SectionLabel className="mb-0">Energía semanal</SectionLabel>
        </div>
        <div className="p-4">
          <div className="flex items-end justify-between h-20 gap-2 mt-1 mb-3">
            {[
              { v: 60, d: 'Lun' }, { v: 45, d: 'Mar' }, { v: 80, d: 'Mié' },
              { v: 30, d: 'Jue' }, { v: 95, d: 'Vie' },
            ].map(({ v, d }) => (
              <div key={d} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "w-full rounded-t-md transition-all",
                    v < 40 ? "bg-red-400" : v < 60 ? "bg-amber-400" : "bg-emerald-400"
                  )}
                  style={{ height: `${v}%` }}
                />
                <span className="text-[9px] text-[#b0bdd6] font-medium">{d}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[#7a8fb0] text-center">
            Pico de fatiga detectado el <span className="font-bold text-red-500">Jueves</span>
          </p>
        </div>
      </section>

      {/* ── RECOMENDACIÓN ── */}
      <section className="bg-[#e8f0fb] rounded-2xl p-4 border border-[#cddaf5] flex gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#003087] flex items-center justify-center flex-shrink-0 mt-0.5">
          <Lightbulb className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#003087] mb-1">Recomendación UAI</h3>
          <p className="text-[12px] text-[#3a4a6b] leading-relaxed">
            {currentLevel === 'critical'
              ? 'Tu nivel de fatiga es alto. Toma un descanso de 10 minutos antes de continuar.'
              : currentLevel === 'warning'
              ? 'Fatiga moderada detectada. Considera una pausa breve de 5 minutos.'
              : 'Tu estado biométrico es óptimo. ¡Seguí así y mantené el rendimiento!'}
          </p>
        </div>
      </section>

      {/* ── RANKING ── */}
      <section className="bg-white rounded-2xl border border-[#e2e8f4] shadow-sm p-4">
        <div className="flex justify-between items-center mb-4">
          <SectionLabel className="mb-0">Ranking carrera</SectionLabel>
          <span className="text-[10px] text-[#b0bdd6] font-medium">{careerName ?? 'Tu carrera'}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#e8f0fb] flex items-center justify-center flex-shrink-0">
            <Trophy className="w-6 h-6 text-[#003087]" />
          </div>
          <div>
            <p className="text-[11px] text-[#7a8fb0] mb-1">Tu percentil de bienestar</p>
            <p className="text-2xl font-bold text-[#0a1628] leading-none">—</p>
            <p className="text-[10px] text-[#b0bdd6] mt-1">Disponible con más sesiones registradas</p>
          </div>
        </div>
      </section>

    </div>
  );
}

/* ── Sub-components ── */

function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn("text-[10px] font-bold text-[#7a8fb0] mb-3 tracking-widest uppercase", className)}>
      {children}
    </h2>
  );
}

function SubjectRow({
  name, status, bpm, value, level, levelBar
}: {
  name: string; status: string; bpm: string; value: number;
  level: 'normal' | 'warning' | 'critical';
  levelBar: Record<string, string>;
}) {
  const badgeClass =
    level === 'normal' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
    level === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
    'bg-red-50 text-red-700 border border-red-200';

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-[#0a1628]">{name}</span>
        <div className="text-right flex items-center gap-2">
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", badgeClass)}>{status}</span>
          <span className="text-[10px] text-[#b0bdd6]">{bpm} bpm</span>
        </div>
      </div>
      <div className="w-full bg-[#f0f4fa] rounded-full h-1.5">
        <div className={cn("h-1.5 rounded-full transition-all", levelBar[level])} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

