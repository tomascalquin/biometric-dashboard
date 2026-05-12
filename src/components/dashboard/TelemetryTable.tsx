import { cn, fatigueColors } from '@/lib/utils';
import type { TelemetryLog } from '@/types/telemetry';

// Actualizamos las cabeceras para que coincidan con los datos reales
const HEADERS = ['Tiempo', 'ID Alumno', 'Carrera', 'BPM', 'Fatiga', 'Luz azul'];

interface TelemetryTableProps {
  logs: TelemetryLog[];
}

export function TelemetryTable({ logs }: TelemetryTableProps) {
  return (
    <section aria-label="Registros de telemetría recientes">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Últimos registros
      </h2>
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-gray-900 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            <tr>
              {HEADERS.map((h) => (
                <th key={h} scope="col" className="px-4 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {logs.map((log) => (
              <tr
                key={log.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 tabular-nums whitespace-nowrap">
                  {new Date(log.created_at).toLocaleTimeString('es-CL')}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">
                  {log.device_id}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                  {log.career_id}
                </td>
                <td className="px-4 py-3 font-semibold tabular-nums">
                  {log.blinks_per_minute}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                      fatigueColors[log.fatigue_level],
                    )}
                  >
                    {log.fatigue_level}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {log.blue_light_active ? (
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium text-xs">
                      Activo
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}