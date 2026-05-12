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
        'flex items-start gap-3 rounded-xl border border-red-200 bg-red-50',
        'dark:border-red-900 dark:bg-red-950 px-5 py-4',
      )}
    >
      <AlertTriangle
        className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0"
        aria-hidden="true"
      />
      <div className="space-y-0.5">
        <p className="text-sm font-semibold text-red-700 dark:text-red-300">
          Fatiga crítica detectada
        </p>
        <p className="text-xs text-red-600 dark:text-red-400">
          Alumno <code className="font-mono">{log.device_id}</code> · BPM:{' '}
          <strong>{log.blinks_per_minute}</strong>
        </p>
        <p className="text-xs text-red-500 dark:text-red-500">
          {new Date(log.created_at).toLocaleString('es-CL')}
        </p>
      </div>
    </div>
  );
}