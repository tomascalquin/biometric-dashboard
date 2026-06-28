import { cn, fatigueColors } from '@/lib/utils';
import type { TelemetryLog } from '@/types/telemetry';

// Actualizamos las cabeceras para que coincidan con los datos reales
const HEADERS = ['Tiempo', 'ID Alumno', 'Carrera', 'BPM', 'Fatiga', 'Luz azul'];

interface TelemetryTableProps {
  logs: TelemetryLog[];
}

export function TelemetryTable({ logs }: TelemetryTableProps) {
  return (
    <section aria-label="Registros de telemetría recientes" className="mt-8">
      <h2 className="text-sm font-bold text-[#0a1628] mb-3">
        Últimos registros de telemetría (Debug)
      </h2>
      <div className="overflow-x-auto rounded-xl border border-[#e2e8f4]">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#f8fafd] text-xs font-semibold text-[#7a8fb0] uppercase tracking-wide">
            <tr>
              {HEADERS.map((h) => (
                <th key={h} scope="col" className="px-4 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e8f4]">
            {logs.map((log) => (
              <tr
                key={log.id}
                className="hover:bg-[#f8fafd] transition-colors"
              >
                <td className="px-4 py-3 font-semibold text-[#7a8fb0] tabular-nums whitespace-nowrap">
                  {new Date(log.created_at).toLocaleTimeString('es-CL')}
                </td>
                <td className="px-4 py-3 font-mono font-bold text-xs text-[#3a4a6b]">
                  {log.device_id}
                </td>
                <td className="px-4 py-3 font-semibold text-[#3a4a6b] text-xs">
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
                  {log.session_id ? (
                    <span className="text-[#003087] font-bold text-xs">
                      {log.session_id.slice(0, 8)}...
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