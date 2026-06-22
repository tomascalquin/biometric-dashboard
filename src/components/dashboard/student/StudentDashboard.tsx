import { Lightbulb, Trophy } from 'lucide-react';
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

  // Labels de estado basados en nivel dominante de fatiga
  const levelLabel: Record<FatigueLevel, string> = {
    normal:   'Normal',
    warning:  '▲ Moderado',
    critical: '▲ Alto',
  };
  const levelColor: Record<FatigueLevel, string> = {
    normal:   'text-green-500',
    warning:  'text-orange-500',
    critical: 'text-red-600',
  };
  const levelDot: Record<FatigueLevel, string> = {
    normal:   'bg-green-500',
    warning:  'bg-orange-500',
    critical: 'bg-red-600',
  };

  const currentLevel = dominantLevel ?? 'normal';

  return (
    <div className="p-4 space-y-5">
      
      {/* MI ESTADO HOY */}
      <section>
        <h2 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-3 tracking-widest ml-1 uppercase">Mi Estado Hoy</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatusCard 
            title="BPM actual" 
            value={avgBpm !== null ? String(avgBpm) : '—'} 
            unit={avgBpm !== null ? 'bpm' : undefined}
            status={avgBpm !== null ? levelLabel[currentLevel] : 'Sin datos'}
            statusColor={avgBpm !== null ? levelColor[currentLevel] : 'text-gray-400'}
            dotClass={avgBpm !== null ? levelDot[currentLevel] : undefined}
          />
          <StatusCard 
            title="Estrés hoy" 
            value={dominantLevel ? levelLabel[dominantLevel].replace('▲ ', '') : '—'}
            status={dominantLevel ? levelLabel[dominantLevel] : 'Sin datos'}
            statusColor={dominantLevel ? levelColor[dominantLevel] : 'text-gray-400'}
            dotClass={dominantLevel ? levelDot[dominantLevel] : undefined}
          />
          <StatusCard 
            title="Sesión activa" 
            value={sessionMin !== null ? `${sessionMin} min` : '—'}
            subtitle={sessionSubject ?? (sessionMin !== null ? 'Sesión en curso' : 'Sin sesión')}
          />
          <StatusCard 
            title="Alertas hoy" 
            value={String(alertsToday)}
            subtitle={alertsToday > 0 ? 'Ver historial' : 'Sin alertas'}
            subtitleColor={alertsToday > 0 ? 'text-blue-500' : 'text-gray-400'}
            link={alertsToday > 0 ? '/dashboard/history' : undefined}
          />
        </div>
      </section>

      {/* MIS MATERIAS — placeholder informativo si no hay sesiones */}
      <section className="bg-white dark:bg-[#1a2332] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-4 tracking-widest uppercase">Mis Materias — Semana</h2>
        {avgBpm !== null ? (
          <div className="space-y-4">
            <SubjectRow name={sessionSubject ?? 'Sesión sin nombre'} status={levelLabel[currentLevel]} bpm={String(avgBpm)} value={Math.min(100, avgBpm * 5)} level={currentLevel} />
            <p className="text-[10px] text-gray-400 text-center pt-1">Inicia más sesiones para ver el desglose por materia</p>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-gray-400">Sin sesiones registradas hoy</p>
            <p className="text-[10px] text-gray-500 mt-1">Usa el monitor para comenzar a medir</p>
            <Link href="/dashboard/monitor" className="inline-flex items-center gap-1 mt-3 text-xs text-blue-500 font-medium hover:underline">
              Ir al monitor →
            </Link>
          </div>
        )}
      </section>

      {/* GRÁFICO DE ENERGÍA SEMANAL */}
      <section>
        <h2 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-3 tracking-widest ml-1 uppercase">Energía Semanal</h2>
        <div className="bg-white dark:bg-[#1a2332] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-end justify-between h-20 gap-2 mt-2 mb-1">
            {/* Niveles simulados de energía (inverso a la fatiga) para la semana */}
            {[60, 45, 80, 30, 95].map((h, i) => (
              <div key={i} className="w-full flex flex-col items-center">
                <div 
                  className={cn(
                    "w-full rounded-t-md transition-all",
                    h < 40 ? "bg-red-500" : h < 60 ? "bg-orange-400" : "bg-green-400"
                  )} 
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[9px] text-gray-400 mt-2 px-1">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie'].map(t => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <p className="text-[10px] text-gray-500 mt-3 text-center">
            Pico de fatiga detectado el <span className="font-bold text-red-500">Jueves</span>.
          </p>
        </div>
      </section>

      {/* RECOMENDACIÓN */}
      <section className="bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-4 flex gap-3">
        <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">Recomendación</h3>
          <p className="text-[11px] text-blue-800 dark:text-blue-400 leading-relaxed">
            {currentLevel === 'critical'
              ? 'Tu nivel de fatiga es alto. Toma un descanso de 10 minutos antes de continuar.'
              : currentLevel === 'warning'
              ? 'Fatiga moderada detectada. Considera una pausa breve de 5 minutos.'
              : 'Tu estado biométrico es óptimo. ¡Sigue así!'}
          </p>
        </div>
      </section>

      {/* RANKING CARRERA */}
      <section className="bg-white dark:bg-[#1a2332] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase">Ranking Carrera</h2>
          <span className="text-[10px] text-gray-400">{careerName ?? 'Tu carrera'}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-0.5">Tu percentil de bienestar</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-none">—</p>
            <p className="text-[10px] text-gray-400 mt-1">Datos disponibles con más sesiones</p>
          </div>
        </div>
      </section>

    </div>
  );
}

function StatusCard({ 
  title, value, unit, status, statusColor, dotClass, subtitle, subtitleColor = "text-gray-500", link 
}: { 
  title: string; value: string; unit?: string; status?: string; statusColor?: string; dotClass?: string;
  subtitle?: string; subtitleColor?: string; link?: string;
}) {
  const content = (
    <div className="bg-white dark:bg-[#1a2332] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 h-full">
      <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2 font-medium">{title}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-none">{value}</span>
        {unit && <span className="text-xs text-gray-500 ml-0.5">{unit}</span>}
      </div>
      {(status || subtitle) && (
        <div className="mt-2 text-[10px] flex items-center gap-1 font-medium">
          {dotClass && <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dotClass)} />}
          <span className={cn(statusColor || subtitleColor)}>{status || subtitle}</span>
        </div>
      )}
    </div>
  );

  return link ? <Link href={link} className="block h-full">{content}</Link> : content;
}

function SubjectRow({ name, status, bpm, value, level }: { name: string, status: string, bpm: string, value: number, level: 'normal' | 'warning' | 'critical' }) {
  const statusColor = level === 'normal' ? 'text-green-500' : level === 'warning' ? 'text-orange-500' : 'text-red-600';
  const barColor   = level === 'normal' ? 'bg-green-500' : level === 'warning' ? 'bg-orange-500' : 'bg-red-600';

  return (
    <div>
      <div className="flex justify-between items-end mb-1.5">
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{name}</span>
        <div className="text-right">
          <span className={cn("text-[10px] font-bold", statusColor)}>• {status}</span>
          <span className="block text-[10px] text-gray-400">BPM {bpm}</span>
        </div>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
        <div className={cn("h-1.5 rounded-full transition-all", barColor)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
