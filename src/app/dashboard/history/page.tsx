import { cn } from '@/lib/utils';

export default function HistoryPage() {
  return (
    <div className="p-4 space-y-6">
      
      <section className="bg-white dark:bg-[#1a2332] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-4 tracking-wider">ÚLTIMAS SESIONES</h2>
        
        <div className="space-y-4">
          <SessionRow 
            name="Redes y Sistemas" 
            time="Hoy · 14:00 - 15:30" 
            status="Crítico" 
            statusColor="bg-red-50 text-red-600 dark:bg-red-900/20"
            dotColor="bg-red-500"
          />
          <Divider />
          <SessionRow 
            name="Proyecto Informática" 
            time="Hoy · 09:00 - 10:45" 
            status="Normal" 
            statusColor="bg-green-50 text-green-600 dark:bg-green-900/20"
            dotColor="bg-green-500"
          />
          <Divider />
          <SessionRow 
            name="Cálculo III" 
            time="Ayer · 16:00 - 17:20" 
            status="Warning" 
            statusColor="bg-orange-50 text-orange-600 dark:bg-orange-900/20"
            dotColor="bg-orange-500"
          />
          <Divider />
          <SessionRow 
            name="Taller de Software" 
            time="Ayer · 10:00 - 12:00" 
            status="Normal" 
            statusColor="bg-green-50 text-green-600 dark:bg-green-900/20"
            dotColor="bg-green-500"
          />
          <Divider />
          <SessionRow 
            name="Redes y Sistemas" 
            time="Lun · 08:30 - 10:00" 
            status="Crítico" 
            statusColor="bg-red-50 text-red-600 dark:bg-red-900/20"
            dotColor="bg-red-500"
          />
        </div>
      </section>

      <section className="bg-white dark:bg-[#1a2332] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-4 tracking-wider">RESUMEN SEMANA</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="border-r border-gray-100 dark:border-gray-800 pr-2">
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Sesiones totales</p>
            <p className="text-xl font-bold text-blue-600">12</p>
            <p className="text-[10px] text-gray-400 mt-1">esta semana</p>
          </div>
          <div className="pl-2">
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Horas monitoreadas</p>
            <p className="text-xl font-bold text-green-600">18.5 h</p>
            <p className="text-[10px] text-gray-400 mt-1">acumuladas</p>
          </div>
          <div className="border-t border-r border-gray-100 dark:border-gray-800 pt-4 pr-2">
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Alertas críticas</p>
            <p className="text-xl font-bold text-red-600">4</p>
            <p className="text-[10px] text-gray-400 mt-1">esta semana</p>
          </div>
          <div className="border-t border-gray-100 dark:border-gray-800 pt-4 pl-2">
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">BPM prom.</p>
            <p className="text-xl font-bold text-orange-500">11</p>
            <p className="text-[10px] text-gray-400 mt-1">semana</p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-4">Tendencia BPM — últimos 7 días</p>
          <div className="flex items-end justify-between h-20 gap-2">
            <Bar day="L" value={13} h="h-[80%]" color="bg-green-500" />
            <Bar day="M" value={11} h="h-[60%]" color="bg-orange-500" />
            <Bar day="X" value={9} h="h-[40%]" color="bg-red-500" />
            <Bar day="J" value={14} h="h-[90%]" color="bg-green-500" />
            <Bar day="V" value={12} h="h-[70%]" color="bg-orange-500" />
            <Bar day="S" value={10} h="h-[50%]" color="bg-red-500" />
            <Bar day="D" value={8} h="h-[30%]" color="bg-red-600" />
          </div>
        </div>
      </section>

    </div>
  );
}

function SessionRow({ name, time, status, statusColor, dotColor }: { name: string, time: string, status: string, statusColor: string, dotColor: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{time}</p>
      </div>
      <div className={cn("px-2 py-1 rounded flex items-center gap-1.5", statusColor)}>
        <div className={cn("w-1.5 h-1.5 rounded-full", dotColor)}></div>
        <span className="text-[10px] font-bold">{status}</span>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-gray-100 dark:bg-gray-800 w-full"></div>;
}

function Bar({ day, value, h, color }: { day: string, value: number, h: string, color: string }) {
  return (
    <div className="flex flex-col items-center gap-1 w-full">
      <span className="text-[8px] text-gray-400">{value}</span>
      <div className={cn("w-full rounded-t-sm", h, color)}></div>
      <span className="text-[10px] font-medium text-gray-500">{day}</span>
    </div>
  );
}
