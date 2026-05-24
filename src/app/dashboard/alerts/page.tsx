import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AlertsPage() {
  return (
    <div className="p-4 space-y-5">

      {/* Header */}
      <div>
        <h2 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase mb-0.5">Alertas del Día</h2>
        <p className="text-[10px] text-gray-400">17 de Mayo · En vivo</p>
      </div>

      {/* Contadores */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl p-4">
          <p className="text-[10px] text-red-500 dark:text-red-400 font-semibold uppercase tracking-wider mb-1">Críticas</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400 leading-none">3</p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 rounded-2xl p-4">
          <p className="text-[10px] text-orange-500 dark:text-orange-400 font-semibold uppercase tracking-wider mb-1">Warning</p>
          <p className="text-3xl font-bold text-orange-500 dark:text-orange-400 leading-none">2</p>
        </div>
      </div>

      {/* Lista de alertas */}
      <div className="space-y-3">
        <AlertCard
          type="critical"
          room="Sala C201"
          subject="Ing. Informática"
          time="14:32"
          description="BPM crítico detectado (8 bpm). 12 estudiantes afectados."
        />
        <AlertCard
          type="critical"
          room="Sala Lab3"
          subject="Ing. Informática"
          time="13:55"
          description="Fatiga extrema. EAR < 0.2 en 8 estudiantes. Equipo notificado."
        />
        <AlertCard
          type="warning"
          room="Sala C204"
          subject="Ing. Informática"
          time="13:10"
          description="Nivel de estrés superó umbral 90%. Intervención sugerida."
        />
        <AlertCard
          type="warning"
          room="Sala E303"
          subject="Derecho"
          time="12:48"
          description="BPM warning (10 bpm) en 7 estudiantes. Monitoreo activo."
        />
        <AlertCard
          type="normal"
          room="Sala A105"
          subject="Aula general"
          time="11:30"
          description="Estrés moderado-alto (70%). Sin intervención requerida aún."
        />
        <AlertCard
          type="success"
          room="Sala B102"
          subject="Ing. Comercial"
          time="10:15"
          description="Estado normalizado tras descanso de 10 min."
        />
        <AlertCard
          type="success"
          room="Sala F301"
          subject="Psicología"
          time="09:50"
          description="Sesión iniciada. Métricas dentro de parámetros normales."
        />
      </div>

    </div>
  );
}

function AlertCard({ type, room, subject, time, description }: {
  type: 'critical' | 'warning' | 'normal' | 'success';
  room: string; subject: string; time: string; description: string;
}) {
  const isCritical = type === 'critical';
  const isWarning  = type === 'warning';
  const isSuccess  = type === 'success';

  return (
    <div className={cn(
      "bg-white dark:bg-[#1a2332] rounded-2xl p-4 border flex gap-3 shadow-sm",
      isCritical ? "border-red-200 dark:border-red-900/50" :
      isWarning  ? "border-orange-200 dark:border-orange-900/50" :
      isSuccess  ? "border-green-200 dark:border-green-900/50" :
                   "border-gray-100 dark:border-gray-800"
    )}>
      <div className="mt-0.5 flex-shrink-0">
        {isCritical && <AlertCircle className="w-5 h-5 text-red-500" />}
        {isWarning  && <AlertTriangle className="w-5 h-5 text-orange-500" />}
        {isSuccess  && <CheckCircle2 className="w-5 h-5 text-green-500" />}
        {type === 'normal' && <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 mt-0.5" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-0.5 gap-2">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{room}</h3>
          <span className="text-[10px] font-medium text-gray-400 flex-shrink-0">{time}</span>
        </div>
        <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">{subject}</p>
        <p className={cn(
          "text-xs leading-snug",
          isCritical ? "text-red-700 dark:text-red-400 font-medium" :
          isWarning  ? "text-gray-700 dark:text-gray-300" :
                       "text-gray-600 dark:text-gray-400"
        )}>
          {description}
        </p>
      </div>
    </div>
  );
}
