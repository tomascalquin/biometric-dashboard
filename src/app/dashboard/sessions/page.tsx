import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'BiometricOS — Sesiones',
  description: 'Historial y gestión de sesiones de estudio',
};

function fmtDur(start: string, end: string | null): string {
  if (!end) return 'En curso';
  const m = Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 60_000);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const diffDays = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  const t = d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 0) return `Hoy, ${t}`;
  if (diffDays === 1) return `Ayer, ${t}`;
  return `${d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}, ${t}`;
}

export default async function SessionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000).toISOString();

  const { data: rawSessions } = await supabase
    .from('study_sessions')
    .select('id, started_at, ended_at, subject_name_override, status, career_id')
    .eq('student_id', user.id)
    .gte('started_at', thirtyDaysAgo)
    .order('started_at', { ascending: false })
    .limit(30);

  const sessions = rawSessions ?? [];
  const active = sessions.filter((s) => s.status === 'active');
  const completed = sessions.filter((s) => s.status !== 'active');

  // Métricas de telemetría por sesión
  const sessionIds = sessions.map((s) => s.id);
  let telBySession = new Map<string, { avgBpm: number; level: 'normal' | 'warning' | 'critical' }>();

  if (sessionIds.length > 0) {
    const { data: tels } = await supabase
      .from('telemetry_logs')
      .select('session_id, blinks_per_minute, fatigue_level')
      .in('session_id', sessionIds);

    const grouped = new Map<string, { bpms: number[]; levels: Record<string, number> }>();
    (tels ?? []).forEach((t) => {
      if (!t.session_id) return;
      const c = grouped.get(t.session_id) ?? { bpms: [], levels: {} };
      c.bpms.push(t.blinks_per_minute);
      c.levels[t.fatigue_level] = (c.levels[t.fatigue_level] ?? 0) + 1;
      grouped.set(t.session_id, c);
    });
    grouped.forEach((v, k) => {
      const avg = v.bpms.length ? Math.round(v.bpms.reduce((a, b) => a + b, 0) / v.bpms.length) : 0;
      const level: 'normal' | 'warning' | 'critical' =
        (v.levels['critical'] ?? 0) > 0 ? 'critical' : (v.levels['warning'] ?? 0) > 0 ? 'warning' : 'normal';
      telBySession.set(k, { avgBpm: avg, level });
    });
  }

  // Totales del mes
  const totalMin = completed.reduce((acc, s) => {
    if (!s.ended_at) return acc;
    return acc + Math.floor((new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 60_000);
  }, 0);

  return (
    <div className="p-4 space-y-5">
      <div>
        <h1 className="text-[10px] font-bold text-[#7a8fb0] tracking-widest uppercase mb-0.5">
          Sesiones de Estudio
        </h1>
        <p className="text-[10px] text-[#b0bdd6]">Últimos 30 días</p>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-3 gap-2">
        <StatMini label="Sesiones" value={String(sessions.length)} color="text-blue-500" />
        <StatMini
          label="Total"
          value={totalMin > 0 ? `${Math.floor(totalMin / 60)}h ${totalMin % 60}m` : '—'}
          color="text-green-500"
        />
        <StatMini label="Activas" value={String(active.length)} color={active.length > 0 ? 'text-amber-500' : 'text-[#b0bdd6]'} />
      </div>

      {/* CTA nueva sesión */}
      <Link
        href="/dashboard/monitor"
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-[#003087] hover:bg-[#002070] active:scale-[0.98] text-white font-semibold text-sm transition-all shadow-md"
      >
        👁️ Iniciar nueva sesión
      </Link>

      {/* Sesiones activas */}
      {active.length > 0 && (
        <section className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <h2 className="text-[10px] font-bold text-amber-600 tracking-widest uppercase mb-3">
            🟠 En curso
          </h2>
          <div className="space-y-2">
            {active.map((s) => (
              <SessionCard key={s.id} session={s} meta={telBySession.get(s.id) ?? null} />
            ))}
          </div>
        </section>
      )}

      {/* Sesiones completadas */}
      <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f4]">
        <h2 className="text-[10px] font-bold text-[#7a8fb0] tracking-widest uppercase mb-4">
          Completadas
        </h2>
        {completed.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm font-semibold text-[#7a8fb0]">Sin sesiones completadas</p>
            <p className="text-[10px] text-[#b0bdd6] mt-1">Usa el monitor para comenzar a medir</p>
          </div>
        ) : (
          <div className="space-y-0">
            {completed.map((s, i) => (
              <div key={s.id}>
                {i > 0 && <div className="h-px bg-[#e2e8f4]" />}
                <SessionCard session={s} meta={telBySession.get(s.id) ?? null} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatMini({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-[#f8fafd] border border-[#e2e8f4] rounded-xl p-3 text-center">
      <p className={cn('text-xl font-black leading-none', color)}>{value}</p>
      <p className="text-[10px] font-semibold text-[#7a8fb0] mt-1">{label}</p>
    </div>
  );
}

function SessionCard({
  session, meta,
}: {
  session: { id: string; started_at: string; ended_at: string | null; subject_name_override: string | null; status: string };
  meta: { avgBpm: number; level: 'normal' | 'warning' | 'critical' } | null;
}) {
  const level = meta?.level ?? 'normal';
  const badgeClass =
    level === 'critical' ? 'bg-red-50 text-red-700'
    : level === 'warning' ? 'bg-amber-50 text-amber-700'
    : 'bg-green-50 text-green-700';
  const dotClass = level === 'critical' ? 'bg-red-500' : level === 'warning' ? 'bg-amber-500' : 'bg-green-500';
  const statusLabel = session.status === 'active' ? 'En curso' : level === 'critical' ? 'Crítico' : level === 'warning' ? 'Warning' : 'Normal';

  return (
    <div className="flex items-center justify-between py-3 gap-2">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[#0a1628] truncate">
          {session.subject_name_override ?? 'Sesión de estudio'}
        </p>
        <p className="text-[10px] font-semibold text-[#7a8fb0] mt-0.5">
          {fmtDate(session.started_at)} · {fmtDur(session.started_at, session.ended_at)}
        </p>
        {meta && (
          <p className="text-[10px] font-semibold text-[#b0bdd6] mt-0.5">BPM prom: {meta.avgBpm}</p>
        )}
      </div>
      <div className={cn('px-2.5 py-1 rounded-lg flex items-center gap-1.5 flex-shrink-0', badgeClass)}>
        <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dotClass)} />
        <span className="text-[10px] font-bold">{statusLabel}</span>
      </div>
    </div>
  );
}