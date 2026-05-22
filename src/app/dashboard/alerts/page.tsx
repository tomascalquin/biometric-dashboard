import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AlertsPage() {
  return (
    <div className="p-4 space-y-6">
      
      <section className="bg-white dark:bg-[#1a2332] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-4 tracking-wider">ALERTAS DEL DÍA — 17 DE MAYO</h2>
        
        <div className="flex gap-4">
          <div className="flex-1 border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 rounded-xl p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Críticas</p>
            <p className="text-2xl font-bold text-red-600">3</p>
          </div>
          <div className="flex-1 border border-orange-100 dark:border-orange-900/30 bg-orange-50/50 dark:bg-orange-900/10 rounded-xl p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Warning</p>
            <p className="text-2xl font-bold text-orange-500">2</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
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
      </section>

    </div>
  );
}

function AlertCard({ type, room, subject, time, description }: { type: 'critical' | 'warning' | 'normal' | 'success', room: string, subject: string, time: string, description: string }) {
  const isCritical = type === 'critical';
  const isWarning = type === 'warning';
  const isSuccess = type === 'success';

  return (
    <div className="bg-white dark:bg-[#1a2332] rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex gap-3">
      <div className="mt-1">
        {isCritical && <AlertCircle className="w-5 h-5 text-red-500" />}
        {isWarning && <AlertTriangle className="w-5 h-5 text-orange-500" />}
        {isSuccess && <CheckCircle2 className="w-5 h-5 text-green-500" />}
        {type === 'normal' && <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-0.5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">{room}</h3>
          <span className="text-[10px] font-medium text-gray-500">{time}</span>
        </div>
        <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1.5">{subject}</p>
        <p className={cn(
          "text-xs leading-snug",
          isCritical ? "text-red-700 dark:text-red-400 font-medium" : 
          isWarning ? "text-gray-700 dark:text-gray-300" : "text-gray-600 dark:text-gray-400"
        )}>
          {description}
        </p>
      </div>
    </div>
  );
}
