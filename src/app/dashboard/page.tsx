import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminDashboard } from '@/components/dashboard/admin/AdminDashboard';
import { StudentDashboard } from '@/components/dashboard/student/StudentDashboard';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, career_id, careers(name)')
    .eq('id', user.id)
    .single();

  const role = profile?.role ?? 'student';

  // ── Redirect a onboarding si el estudiante no ha completado su perfil ──
  // Considera onboarding completo si tiene career_id O full_name (texto libre).
  if (role === 'student' && !profile?.career_id && !profile?.full_name) {
    redirect('/dashboard/onboarding');
  }

  if (role === 'admin') {
    return <AdminDashboard />;
  }

  // ── Datos reales para StudentDashboard ──────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const careerName = (profile?.careers as any)?.name ?? null;

  // Sesión activa del usuario
  const { data: activeSession } = await supabase
    .from('study_sessions')
    .select('id, started_at, subject_name_override')
    .eq('student_id', user.id)
    .eq('status', 'active')
    .order('started_at', { ascending: false })
    .limit(1)
    .single();

  // Telemetría de las últimas 24h
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: telemetry } = await supabase
    .from('telemetry_logs')
    .select('blinks_per_minute, fatigue_level')
    .eq('student_anon_id', user.id)
    .gte('created_at', since);

  const logs = telemetry ?? [];
  const avgBpm = logs.length
    ? Math.round(logs.reduce((acc, l) => acc + l.blinks_per_minute, 0) / logs.length)
    : null;
  const alertsToday = logs.filter((l) => l.fatigue_level !== 'normal').length;

  // Nivel dominante
  const levelCount = logs.reduce<Record<string, number>>((acc, l) => {
    acc[l.fatigue_level] = (acc[l.fatigue_level] ?? 0) + 1;
    return acc;
  }, {});
  const dominantLevel = Object.entries(levelCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  // Duración sesión activa en minutos
  let sessionMin: number | null = null;
  if (activeSession?.started_at) {
    sessionMin = Math.floor(
      (Date.now() - new Date(activeSession.started_at).getTime()) / 60_000,
    );
  }

  return (
    <StudentDashboard
      careerName={careerName}
      avgBpm={avgBpm}
      alertsToday={alertsToday}
      dominantLevel={dominantLevel as 'normal' | 'warning' | 'critical' | null}
      sessionMin={sessionMin}
      sessionSubject={activeSession?.subject_name_override ?? null}
    />
  );
}
