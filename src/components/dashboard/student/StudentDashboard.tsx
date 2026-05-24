import { Lightbulb, Trophy } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function StudentDashboard() {
  return (
    <div className="p-4 space-y-5">
      
      {/* MI ESTADO HOY */}
      <section>
        <h2 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-3 tracking-widest ml-1 uppercase">Mi Estado Hoy</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatusCard 
            title="BPM actual" 
            value="16" 
            unit="bpm" 
            status="Normal" 
            statusColor="text-green-500"
            dotClass="bg-green-500"
          />
          <StatusCard 
            title="Estrés hoy" 
            value="47%" 
            status="▲ Moderado" 
            statusColor="text-orange-500"
            dotClass="bg-orange-500"
          />
          <StatusCard 
            title="Sesión activa" 
            value="45 min" 
            subtitle="Proyecto Inf." 
          />
          <StatusCard 
            title="Alertas hoy" 
            value="2" 
            subtitle="Ver historial" 
            subtitleColor="text-blue-500"
            link="/dashboard/history"
          />
        </div>
      </section>

      {/* MIS MATERIAS */}
      <section className="bg-white dark:bg-[#1a2332] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-4 tracking-widest uppercase">Mis Materias — Semana</h2>
        <div className="space-y-4">
          <SubjectRow name="Proyecto Informática" status="Normal" bpm="14" value={28} level="normal" />
          <SubjectRow name="Cálculo III" status="Warning" bpm="11" value={62} level="warning" />
          <SubjectRow name="Redes y Sistemas" status="Crítico" bpm="8" value={92} level="critical" />
        </div>
      </section>

      {/* RECOMENDACIÓN UAI */}
      <section className="bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-4 flex gap-3">
        <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">Recomendación UAI</h3>
          <p className="text-[11px] text-blue-800 dark:text-blue-400 leading-relaxed">
            Tu nivel de fatiga en Redes y Sistemas es alto. Considera tomar un descanso de 10 min antes de continuar.
          </p>
        </div>
      </section>

      {/* RANKING CARRERA */}
      <section className="bg-white dark:bg-[#1a2332] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase">Ranking Carrera</h2>
          <span className="text-[10px] text-gray-400">ICI · Peñalolén</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-0.5">Tu percentil de bienestar</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-none">Top 38%</p>
            <p className="text-[10px] text-gray-400 mt-1">vs promedio ICI (estrés 52%)</p>
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
