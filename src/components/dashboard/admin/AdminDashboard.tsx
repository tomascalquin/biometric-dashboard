import { ArrowUp, Map, AlertTriangle, FileText, Users } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function AdminDashboard() {
  return (
    <div className="p-4 space-y-5">
      
      {/* Sección: Resumen Campus */}
      <section>
        <h2 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-3 tracking-widest ml-1 uppercase">Resumen Campus - Hoy</h2>
        <div className="bg-white dark:bg-[#1a2332] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-0.5">
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Estrés promedio UAI</p>
              <p className="text-3xl font-bold text-red-600 leading-none">68%</p>
              <p className="text-[10px] text-gray-400 flex items-center gap-0.5 mt-1">
                <ArrowUp className="w-3 h-3" /> Alto - sobre umbral
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Alumnos en riesgo</p>
              <p className="text-3xl font-bold text-orange-500 leading-none">142</p>
              <p className="text-[10px] text-gray-400 mt-1">de 3.840 activos</p>
            </div>
            <div className="space-y-0.5 pt-1 border-t border-gray-100 dark:border-gray-800">
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Salas críticas</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 leading-none">6</p>
              <p className="text-[10px] text-gray-400 mt-1">BPM promedio &lt; 9</p>
            </div>
            <div className="space-y-0.5 pt-1 border-t border-gray-100 dark:border-gray-800">
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Alertas enviadas</p>
              <p className="text-3xl font-bold text-blue-500 leading-none">24</p>
              <p className="text-[10px] text-gray-400 mt-1">al equipo de salud</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección: Carreras */}
      <section>
        <h2 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-3 tracking-widest ml-1 uppercase">Carrera — Nivel de Fatiga</h2>
        <div className="bg-white dark:bg-[#1a2332] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
          <CareerProgress name="Ing. Civil Informática" value={82} bpm="8 - 9" level="critical" />
          <CareerProgress name="Ing. Comercial" value={61} bpm="11" level="warning" />
          <CareerProgress name="Derecho" value={55} bpm="13" level="warning" />
          <CareerProgress name="Psicología" value={34} bpm="14" level="normal" />
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
