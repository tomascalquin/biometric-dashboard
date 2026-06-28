import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TelemetryLog } from '@/types/telemetry';

interface FatigueAlertProps {
  log: TelemetryLog;
}

export function FatigueAlert({ log }: FatigueAlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-xl border border-red-200 bg-red-50',
        'px-5 py-4',
        'shadow-sm flex items-start gap-3'
      )}
    >
      <AlertTriangle
        className="h-5 w-5 text-red-600 mt-0.5 shrink-0"
        strokeWidth={2.5}
      />
      <div className="flex-1">
        <p className="text-sm font-bold text-red-700">
          Alerta Crítica de Fatiga
        </p>
        <p className="text-xs font-semibold text-red-600">
          Alumno <code className="font-mono">{log.device_id}</code> · BPM:{' '}
          <strong>{log.blinks_per_minute}</strong>
        </p>
        <p className="text-xs font-bold text-red-500 mt-1">
          Recomendación: Tome un descanso de 15 minutos.
        </p>
      </div>
    </div>
  );
}