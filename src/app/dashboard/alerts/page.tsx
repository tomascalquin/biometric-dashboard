import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'BiometricOS — Alertas | UAI',
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
    <div className="p-4 space-y-4 max-w-lg mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-[10px] font-bold text-[#7a8fb0] tracking-widest uppercase mb-0.5">Alertas del día</h1>
        <p className="text-[11px] text-[#b0bdd6] font-medium">
          {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })} · En vivo
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className={cn(
          "rounded-2xl p-4 border",
          criticalToday > 0 ? "bg-red-50 border-red-200" : "bg-white border-[#e2e8f4]"
        )}>
          <p className={cn("text-[10px] font-bold uppercase tracking-wider mb-1.5",
            criticalToday > 0 ? "text-red-600" : "text-[#7a8fb0]"
          )}>Críticas</p>
          <p className={cn("text-3xl font-bold leading-none mb-1",
            criticalToday > 0 ? "text-red-600" : "text-[#0a1628]"
          )}>{criticalToday}</p>
          <p className={cn("text-[10px] font-medium",
            criticalToday > 0 ? "text-red-400" : "text-[#b0bdd6]"
          )}>hoy</p>
        </div>
        <div className={cn(
          "rounded-2xl p-4 border",
          warningToday > 0 ? "bg-amber-50 border-amber-200" : "bg-white border-[#e2e8f4]"
        )}>
          <p className={cn("text-[10px] font-bold uppercase tracking-wider mb-1.5",
            warningToday > 0 ? "text-amber-600" : "text-[#7a8fb0]"
          )}>Warning</p>
          <p className={cn("text-3xl font-bold leading-none mb-1",
            warningToday > 0 ? "text-amber-600" : "text-[#0a1628]"
          )}>{warningToday}</p>
          <p className={cn("text-[10px] font-medium",
            warningToday > 0 ? "text-amber-400" : "text-[#b0bdd6]"
          )}>hoy</p>
        </div>
      </div>

      {/* Events list */}
      {allEvents.length === 0 ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-emerald-700">¡Sin alertas en los últimos 3 días!</p>
          <p className="text-[11px] text-emerald-600/80 mt-1">Tu bienestar biométrico está en orden.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
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

  const borderClass = isCritical ? 'border-red-200 bg-white' : isWarning ? 'border-amber-200 bg-white' : 'border-emerald-200 bg-white';
  const iconClass   = isCritical ? 'bg-red-50'   : isWarning ? 'bg-amber-50'   : 'bg-emerald-50';
  const titleText   = isCritical ? 'Fatiga Crítica' : isWarning ? 'Fatiga Moderada' : 'Estado Normal';
  const titleColor  = isCritical ? 'text-red-700' : isWarning ? 'text-amber-700' : 'text-emerald-700';
  const descColor   = isCritical ? 'text-red-600' : isWarning ? 'text-[#3a4a6b]' : 'text-[#7a8fb0]';

  return (
    <div className={cn('rounded-2xl p-4 border flex gap-3 shadow-sm', borderClass)}>
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5", iconClass)}>
        {isCritical && <AlertCircle className="w-5 h-5 text-red-500" />}
        {isWarning  && <AlertTriangle className="w-5 h-5 text-amber-500" />}
        {!isCritical && !isWarning && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1 gap-2">
          <h2 className={cn("text-sm font-bold", titleColor)}>{titleText}</h2>
          <div className="text-right flex-shrink-0">
            <span className="block text-[10px] font-medium text-[#b0bdd6]">{dateLabel}</span>
            <span className="block text-[10px] font-medium text-[#b0bdd6]">{time}</span>
          </div>
        </div>
        {bpm !== null && (
          <p className="text-[10px] text-[#7a8fb0] mb-0.5 font-medium">
            BPM: <span className="font-bold text-[#3a4a6b]">{bpm}</span>
          </p>
        )}
        <p className={cn('text-[11px] leading-snug', descColor)}>{description}</p>
      </div>
    </div>
  );
}
