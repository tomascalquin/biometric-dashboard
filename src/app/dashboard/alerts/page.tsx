import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AlertCircle, AlertTriangle, CheckCircle2, ShieldAlert, Clock, Bell, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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
  return d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'short' });
}

function alertMessage(level: string, bpm: number | null): string {
  if (level === 'critical') return bpm !== null ? `Se detectó una tasa de parpadeo de ${bpm} bpm, indicando fatiga severa.` : 'Fatiga severa detectada durante la sesión.';
  if (level === 'warning')  return bpm !== null ? `Tasa de parpadeo anormal (${bpm} bpm). Posible fatiga temprana.` : 'Nivel de alerta disminuido.';
  return 'Niveles biométricos estabilizados dentro del rango óptimo.';
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
    <div className="min-h-screen bg-[#f8fafc] pb-28 lg:pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 space-y-6 lg:space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#003087]/10 border border-[#003087]/20 text-[#003087] text-[10px] font-black uppercase tracking-wider mb-3">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Centro de Alertas</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-[#0a1628] tracking-tight">Historial de Eventos</h1>
            <p className="text-sm text-[#7a8fb0] mt-1.5 font-medium">
              Monitoreo y registro de eventos de fatiga en los últimos 3 días.
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-[#e2e8f4] shadow-sm">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20"></span>
            <span className="text-[11px] font-bold text-[#0a1628] uppercase tracking-wider">Sistema Activo</span>
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={cn("relative overflow-hidden rounded-3xl p-5 lg:p-6 border shadow-sm transition-all", criticalToday > 0 ? "bg-red-50 border-red-200" : "bg-white border-[#e2e8f4]")}>
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", criticalToday > 0 ? "bg-red-100 text-red-600" : "bg-slate-100 text-[#7a8fb0]")}>
                <AlertCircle className="w-5 h-5" />
              </div>
              <p className={cn("text-[11px] font-bold uppercase tracking-wider", criticalToday > 0 ? "text-red-700" : "text-[#7a8fb0]")}>Críticas Hoy</p>
            </div>
            <p className={cn("text-4xl font-black tracking-tight", criticalToday > 0 ? "text-red-600" : "text-[#0a1628]")}>{criticalToday}</p>
          </div>

          <div className={cn("relative overflow-hidden rounded-3xl p-5 lg:p-6 border shadow-sm transition-all", warningToday > 0 ? "bg-amber-50 border-amber-200" : "bg-white border-[#e2e8f4]")}>
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", warningToday > 0 ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-[#7a8fb0]")}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <p className={cn("text-[11px] font-bold uppercase tracking-wider", warningToday > 0 ? "text-amber-700" : "text-[#7a8fb0]")}>Moderadas Hoy</p>
            </div>
            <p className={cn("text-4xl font-black tracking-tight", warningToday > 0 ? "text-amber-600" : "text-[#0a1628]")}>{warningToday}</p>
          </div>
          
          <div className="col-span-2 relative overflow-hidden rounded-3xl p-5 lg:p-6 bg-gradient-to-br from-[#003087] to-[#001b4c] text-white border border-[#003087] shadow-lg flex items-center justify-between group">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
            <div className="relative z-10">
              <p className="text-[11px] font-bold text-blue-200 uppercase tracking-wider mb-1">Métrica Activa</p>
              <p className="text-xl lg:text-2xl font-black">Tu bienestar es clave.</p>
              <p className="text-xs text-blue-100 mt-1 opacity-80">El sistema te notificará si necesitas un descanso.</p>
            </div>
            <Activity className="w-16 h-16 text-blue-400/20 absolute right-4 bottom-4 group-hover:scale-110 transition-transform duration-500" />
          </div>
        </div>

        {/* Events Feed */}
        <div className="bg-white rounded-3xl border border-[#e2e8f4] shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-[#e2e8f4] bg-[#f8fafc]/50 flex items-center justify-between">
            <h2 className="text-sm font-black text-[#0a1628]">Registro de Alertas</h2>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#7a8fb0] bg-white px-2.5 py-1 rounded-lg border border-[#e2e8f4]">
              <Clock className="w-3.5 h-3.5" /> Últimos 3 días
            </div>
          </div>
          
          <div className="p-4 lg:p-6">
            {allEvents.length === 0 ? (
              <div className="bg-emerald-50/50 border-2 border-dashed border-emerald-200 rounded-3xl p-10 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-black text-emerald-800 mb-1">¡Todo en orden!</h3>
                <p className="text-sm text-emerald-600/80 max-w-sm mx-auto">No se han registrado eventos de fatiga en los últimos 3 días. Tu bienestar biométrico es óptimo.</p>
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
        </div>

      </div>
    </div>
  );
}

function AlertCard({ type, time, dateLabel, description, bpm }: {
  type: 'critical' | 'warning' | 'normal'; time: string; dateLabel: string; description: string; bpm: number | null;
}) {
  const isCritical = type === 'critical';
  const isWarning  = type === 'warning';

  const borderClass = isCritical ? 'border-red-200 bg-red-50/30 hover:bg-red-50' : isWarning ? 'border-amber-200 bg-amber-50/30 hover:bg-amber-50' : 'border-[#e2e8f4] bg-white hover:bg-slate-50';
  const iconClass   = isCritical ? 'bg-red-500 text-white shadow-red-200' : isWarning ? 'bg-amber-500 text-white shadow-amber-200' : 'bg-emerald-500 text-white shadow-emerald-200';
  const titleText   = isCritical ? 'Fatiga Crítica' : isWarning ? 'Fatiga Moderada' : 'Estado Óptimo';
  const titleColor  = isCritical ? 'text-red-700' : isWarning ? 'text-amber-700' : 'text-[#0a1628]';
  const descColor   = isCritical ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-[#7a8fb0]';

  return (
    <div className={cn('group rounded-2xl p-4 lg:p-5 border flex flex-col sm:flex-row gap-4 lg:gap-5 shadow-sm transition-all duration-300', borderClass)}>
      
      {/* Date/Time (Desktop Left Side) */}
      <div className="hidden sm:flex flex-col items-end justify-center min-w-[80px] border-r border-black/5 pr-4">
        <span className="text-[10px] font-black uppercase tracking-wider text-[#7a8fb0]">{dateLabel}</span>
        <span className="text-lg font-black text-[#0a1628]">{time}</span>
      </div>

      <div className="flex gap-4 items-start flex-1 min-w-0">
        <div className={cn("w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg mt-0.5 sm:mt-0 transition-transform group-hover:scale-105", iconClass)}>
          {isCritical && <AlertCircle className="w-5 h-5 lg:w-6 lg:h-6" />}
          {isWarning  && <AlertTriangle className="w-5 h-5 lg:w-6 lg:h-6" />}
          {!isCritical && !isWarning && <CheckCircle2 className="w-5 h-5 lg:w-6 lg:h-6" />}
        </div>
        
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          {/* Mobile Date/Time inline */}
          <div className="flex sm:hidden justify-between items-center mb-1.5">
            <h3 className={cn("text-sm font-black", titleColor)}>{titleText}</h3>
            <span className="text-[10px] font-bold text-[#7a8fb0] bg-white px-2 py-0.5 rounded border border-[#e2e8f4]">{dateLabel} {time}</span>
          </div>

          <h3 className={cn("hidden sm:block text-base font-black mb-1", titleColor)}>{titleText}</h3>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <p className={cn('text-xs lg:text-sm font-medium', descColor)}>{description}</p>
            {bpm !== null && (
              <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg border", 
                isCritical ? "bg-red-100 text-red-700 border-red-200" : isWarning ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-slate-100 text-slate-700 border-slate-200"
              )}>
                <Activity className="w-3 h-3" />
                {bpm} BPM
              </span>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
}
