import { createClient } from '@/lib/supabase/server';
import type { TelemetryLog, TelemetrySummary } from '@/types/telemetry';
import { MetricCard }    from '@/components/dashboard/MetricCard';
import { FatigueAlert }  from '@/components/dashboard/FatigueAlert';
import { TelemetryTable } from '@/components/dashboard/TelemetryTable';

async function fetchSummary(): Promise<TelemetrySummary> {
  const supabase = createClient();

  const { data: recent, error } = await supabase
    .from('telemetry_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw new Error(`Supabase error: ${error.message}`);

  const logs = (recent ?? []) as TelemetryLog[];
  const avg_bpm =
    logs.length > 0
      ? logs.reduce((acc, l) => acc + l.blinks_per_minute, 0) / logs.length
      : 0;

  return {
    total_logs:            logs.length,
    avg_blinks_per_minute: Math.round(avg_bpm * 10) / 10,
    critical_count:        logs.filter((l) => l.fatigue_level === 'critical').length,
    warning_count:         logs.filter((l) => l.fatigue_level === 'warning').length,
    normal_count:          logs.filter((l) => l.fatigue_level === 'normal').length,
    latest_log:            logs[0] ?? null,
    recent_logs:           logs,
  };
}

export default async function DashboardPage() {
  const summary = await fetchSummary();

  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Panel de Telemetría
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Últimas {summary.total_logs} lecturas biométricas
        </p>
      </header>

      {/* KPI Grid — Mobile first */}
      <section
        aria-label="Métricas clave"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <MetricCard
          title="Promedio BPM"
          value={summary.avg_blinks_per_minute}
          unit="bpm"
          description="Parpadeos por minuto · ventana 50 lecturas"
          level={
            summary.avg_blinks_per_minute < 10
              ? 'critical'
              : summary.avg_blinks_per_minute < 15
                ? 'warning'
                : 'normal'
          }
        />
        <MetricCard
          title="Eventos Críticos"
          value={summary.critical_count}
          unit="eventos"
          description="Fatiga severa detectada"
          level={summary.critical_count > 0 ? 'critical' : 'normal'}
        />
        <MetricCard
          title="Alertas de Advertencia"
          value={summary.warning_count}
          unit="alertas"
          description="Fatiga moderada detectada"
          level={summary.warning_count > 5 ? 'warning' : 'normal'}
        />
      </section>

      {/* Alerta en tiempo real si el último log es crítico */}
      {summary.latest_log?.fatigue_level === 'critical' && (
        <FatigueAlert log={summary.latest_log} />
      )}

      {/* Tabla de telemetría reciente */}
      <TelemetryTable logs={summary.recent_logs} />
    </main>
  );
}