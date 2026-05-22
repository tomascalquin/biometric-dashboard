import { ArrowUp, ArrowRight, Map, AlertTriangle, FileText, Users } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function AdminDashboard() {
  return (
    <div className="p-4 space-y-6">
      
      {/* Sección: Resumen Campus */}
      <section className="bg-white dark:bg-[#1a2332] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-4 tracking-wider">RESUMEN CAMPUS - HOY</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">Estrés promedio UAI</p>
            <p className="text-3xl font-bold text-red-600">68%</p>
            <p className="text-[10px] text-gray-400 flex items-center">
              <ArrowUp className="w-3 h-3 mr-1" /> Alto - sobre umbral
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">Alumnos en riesgo</p>
            <p className="text-3xl font-bold text-orange-500">142</p>
            <p className="text-[10px] text-gray-400">de 3.840 activos</p>
          </div>
          <div className="space-y-1 pt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">Salas críticas</p>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">6</p>
            <p className="text-[10px] text-gray-400">BPM promedio &lt; 9</p>
          </div>
          <div className="space-y-1 pt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">Alertas enviadas</p>
            <p className="text-3xl font-bold text-blue-500">24</p>
            <p className="text-[10px] text-gray-400">al equipo de salud</p>
          </div>
        </div>
      </section>

      {/* Sección: Carreras */}
      <section className="bg-white dark:bg-[#1a2332] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-4 tracking-wider">CARRERAS — NIVEL DE FATIGA</h2>
        
        <div className="space-y-4">
          <CareerProgress name="Ing. Civil Informática" value={82} status="Warning" bpm="8" color="bg-red-500" />
          <CareerProgress name="Ing. Comercial" value={61} status="Warning" bpm="11" color="bg-orange-500" />
          <CareerProgress name="Derecho" value={55} status="Warning" bpm="13" color="bg-yellow-500" />
          <CareerProgress name="Psicología" value={34} status="Normal" bpm="14" color="bg-green-500" />
        </div>
      </section>

      {/* Sección: Franja Horaria */}
      <section className="bg-white dark:bg-[#1a2332] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-4 tracking-wider">FRANJA HORARIA MÁS CRÍTICA</h2>
        
        <div className="flex items-end justify-between h-24 gap-1 mt-6">
          {[30, 40, 80, 100, 90, 60, 40, 30].map((h, i) => (
            <div key={i} className="w-full flex flex-col items-center gap-2">
              <div 
                className={cn(
                  "w-full rounded-t-sm transition-all",
                  h > 80 ? "bg-red-500" : h > 60 ? "bg-orange-500" : h > 40 ? "bg-yellow-500" : "bg-green-500"
                )} 
                style={{ height: `${h}%` }}
              ></div>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 mt-2">
          <span>8h</span><span>10h</span><span>12h</span><span>14h</span><span>16h</span><span>18h</span>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-300 mt-4">
          Pico de estrés: <span className="font-semibold text-red-500">12:00 - 13:00 h</span>
        </p>
      </section>

      {/* Sección: Acceso Rápido */}
      <section>
        <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 tracking-wider ml-2">ACCESO RÁPIDO</h2>
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

function CareerProgress({ name, value, status, bpm, color }: { name: string, value: number, status: string, bpm: string, color: string }) {
  return (
    <div>
      <div className="flex justify-between items-end mb-1">
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{name}</span>
        <div className="text-right">
          <span className={cn("text-[10px] font-bold", status === 'Normal' ? 'text-green-500' : status === 'Warning' && value > 70 ? 'text-red-500' : 'text-orange-500')}>
            • {status}
          </span>
          <span className="block text-[10px] text-gray-400">BPM {bpm} - {value}%</span>
        </div>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
        <div className={cn("h-1.5 rounded-full", color)} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
}

function QuickAccessLink({ href, icon: Icon, label }: { href: string, icon: any, label: string }) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center p-4 bg-white dark:bg-[#1a2332] rounded-xl border border-gray-100 dark:border-gray-800 hover:border-blue-500 transition-colors gap-2 shadow-sm">
      <Icon className="w-6 h-6 text-blue-500" />
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
    </Link>
  );
}
