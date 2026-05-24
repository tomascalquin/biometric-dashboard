import { cn } from '@/lib/utils';

export default function HistoryPage() {
  return (
    <div className="p-4 space-y-5">

      {/* Header */}
      <div>
        <h2 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase mb-0.5">Historial</h2>
        <p className="text-[10px] text-gray-400">Últimas sesiones de estudio</p>
      </div>

      {/* Últimas Sesiones */}
      <section className="bg-white dark:bg-[#1a2332] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase mb-4">Últimas Sesiones</h3>
        <div className="space-y-0">
          <SessionRow name="Redes y Sistemas"   time="Hoy · 14:00 – 15:30"    status="Crítico"  level="critical" />
          <Divider />
          <SessionRow name="Proyecto Informática" time="Hoy · 09:00 – 10:45"  status="Normal"   level="normal" />
          <Divider />
          <SessionRow name="Cálculo III"         time="Ayer · 16:00 – 17:20"  status="Warning"  level="warning" />
          <Divider />
          <SessionRow name="Taller de Software"  time="Ayer · 10:00 – 12:00"  status="Normal"   level="normal" />
          <Divider />
          <SessionRow name="Redes y Sistemas"   time="Lun · 08:30 – 10:00"   status="Crítico"  level="critical" />
        </div>
      </section>

      {/* Resumen Semana */}
      <section className="bg-white dark:bg-[#1a2332] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase mb-4">Resumen Semana</h3>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <StatBox label="Sesiones totales"  value="12"     sub="esta semana"  valueColor="text-blue-500" />
          <StatBox label="Horas monitoreadas" value="18.5 h" sub="acumuladas"  valueColor="text-green-500" />
          <StatBox label="Alertas críticas"  value="4"      sub="esta semana"  valueColor="text-red-500" />
          <StatBox label="BPM prom."         value="11"     sub="semana"       valueColor="text-orange-500" />
        </div>

        {/* Gráfica BPM */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-3 font-medium">Tendencia BPM — últimos 7 días</p>
          <div className="flex items-end justify-between h-16 gap-2">
            <Bar day="L" value={13} pct={80} level="normal" />
            <Bar day="M" value={11} pct={60} level="warning" />
            <Bar day="X" value={9}  pct={40} level="critical" />
            <Bar day="J" value={14} pct={90} level="normal" />
            <Bar day="V" value={12} pct={70} level="warning" />
            <Bar day="S" value={10} pct={50} level="critical" />
            <Bar day="D" value={8}  pct={30} level="critical" />
          </div>
        </div>
      </section>

    </div>
  );
}

function SessionRow({ name, time, status, level }: { name: string; time: string; status: string; level: 'normal' | 'warning' | 'critical' }) {
  const badgeClass = level === 'critical'
    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
    : level === 'warning'
    ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
    : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400';
  const dotClass = level === 'critical' ? 'bg-red-500' : level === 'warning' ? 'bg-orange-500' : 'bg-green-500';

  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{name}</p>
        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{time}</p>
      </div>
      <div className={cn("px-2.5 py-1 rounded-lg flex items-center gap-1.5", badgeClass)}>
        <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dotClass)} />
        <span className="text-[10px] font-bold">{status}</span>
      </div>
    </div>
  );
}

function StatBox({ label, value, sub, valueColor }: { label: string; value: string; sub: string; valueColor: string }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3">
      <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className={cn("text-xl font-bold leading-none", valueColor)}>{value}</p>
      <p className="text-[10px] text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-gray-100 dark:bg-gray-800 w-full" />;
}

function Bar({ day, value, pct, level }: { day: string; value: number; pct: number; level: 'normal' | 'warning' | 'critical' }) {
  const color = level === 'normal' ? 'bg-green-500' : level === 'warning' ? 'bg-orange-500' : 'bg-red-500';
  return (
    <div className="flex flex-col items-center gap-1 w-full">
      <span className="text-[8px] text-gray-400">{value}</span>
      <div className={cn("w-full rounded-t-sm", color)} style={{ height: `${pct}%` }} />
      <span className="text-[10px] font-medium text-gray-500">{day}</span>
    </div>
  );
}
