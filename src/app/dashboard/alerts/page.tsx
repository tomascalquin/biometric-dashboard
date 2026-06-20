import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'BiometricOS — Alertas',
  description: 'Alertas de fatiga del día',
};

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
}

function fmtDateHeader(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  return d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
}

function alertMessage(level: string, bpm: number | null): string {
  if (level === 'critical') return bpm !== null ? `BPM crítico detectado (${bpm} bpm). Considerá tomar un descanso inmediato.` : 'Fatiga crítica detectada.';
  if (level === 'warning')  return bpm !== null ? `Fatiga moderada (${bpm} bpm). Se recomienda una pausa breve.` : 'Nivel de estrés elevado.';
  return 'Estado normalizado.';
}

export default async function AlertsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const threeDaysAgo = new Date(Date.now() - 3 * 86_400_000).toISOString();
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);

  const { data: rawAlerts } = await supabase
    .from('telemetry_logs')
    .select('id, fatigue_level, blinks_per_minute, created_at')
    .eq('student_anon_id', user.id)
    .in('fatigue_level', ['critical', 'warning'])
    .gte('created_at', threeDaysAgo)
    .order('created_at', { ascending: false })
    .limit(50);

  const alerts = rawAlerts ?? [];
  const todayAlerts = alerts.filter((a) => new Date(a.created_at) >= todayStart);
  const criticalToday = todayAlerts.filter((a) => a.fatigue_level === 'critical').length;
  const warningToday  = todayAlerts.filter((a) => a.fatigue_level === 'warning').length;

  const { data: rawNormal } = await supabase
    .from('telemetry_logs')
    .select('id, fatigue_level, blinks_per_minute, created_at')
    .eq('student_anon_id', user.id)
    .eq('fatigue_level', 'normal')
    .gte('created_at', todayStart.toISOString())
    .order('created_at', { ascending: false })
    .limit(3);

  const allEvents = [...alerts, ...(rawNormal ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div className="p-4 space-y-5">
      <div>
        <h1 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase mb-0.5">Alertas del Día</h1>
        <p className="text-[10px] text-gray-400">
          {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })} · En vivo
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl p-4">
          <p className="text-[10px] text-red-500 dark:text-red-400 font-semibold uppercase tracking-wider mb-1">Críticas</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400 leading-none">{criticalToday}</p>
          <p className="text-[10px] text-red-400/70 mt-1">hoy</p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 rounded-2xl p-4">
          <p className="text-[10px] text-orange-500 dark:text-orange-400 font-semibold uppercase tracking-wider mb-1">Warning</p>
          <p className="text-3xl font-bold text-orange-500 dark:text-orange-400 leading-none">{warningToday}</p>
          <p className="text-[10px] text-orange-400/70 mt-1">hoy</p>
        </div>
      </div>

      {allEvents.length === 0 ? (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-2xl p-6 text-center">
          <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-green-700 dark:text-green-300">¡Sin alertas en los últimos 3 días!</p>
          <p className="text-[10px] text-green-600/80 dark:text-green-400/70 mt-1">Tu bienestar biométrico está en orden.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {allEvents.map((a) => (
            <AlertCard
              key={a.id}
              type={a.fatigue_level as 'critical' | 'warning' | 'normal'}
              time={fmtTime(a.created_at)}
              dateLabel={fmtDateHeader(a.created_at)}
              description={alertMessage(a.fatigue_level, a.blinks_per_minute)}
              bpm={a.blinks_per_minute}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AlertCard({ type, time, dateLabel, description, bpm }: {
  type: 'critical' | 'warning' | 'normal'; time: string; dateLabel: string; description: string; bpm: number | null;
}) {
  const isCritical = type === 'critical';
  const isWarning  = type === 'warning';
  return (
    <div className={cn(
      'bg-white dark:bg-[#1a2332] rounded-2xl p-4 border flex gap-3 shadow-sm',
      isCritical ? 'border-red-200 dark:border-red-900/50' : isWarning ? 'border-orange-200 dark:border-orange-900/50' : 'border-green-200 dark:border-green-900/50',
    )}>
      <div className="mt-0.5 flex-shrink-0">
        {isCritical && <AlertCircle className="w-5 h-5 text-red-500" />}
        {isWarning  && <AlertTriangle className="w-5 h-5 text-orange-500" />}
        {!isCritical && !isWarning && <CheckCircle2 className="w-5 h-5 text-green-500" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-0.5 gap-2">
          <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {isCritical ? 'Fatiga Crítica' : isWarning ? 'Fatiga Moderada' : 'Estado Normal'}
          </h2>
          <div className="text-right flex-shrink-0">
            <span className="block text-[10px] font-medium text-gray-400">{dateLabel}</span>
            <span className="block text-[10px] font-medium text-gray-400">{time}</span>
          </div>
        </div>
        {bpm !== null && <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">BPM: {bpm}</p>}
        <p className={cn('text-xs leading-snug', isCritical ? 'text-red-700 dark:text-red-400 font-medium' : isWarning ? 'text-gray-700 dark:text-gray-300' : 'text-gray-600 dark:text-gray-400')}>
          {description}
        </p>
      </div>
    </div>
  );
}
