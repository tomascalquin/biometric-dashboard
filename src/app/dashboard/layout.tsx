import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { BottomNavBar } from '@/components/layout/BottomNavBar';
import { MobileTopBar } from '@/components/layout/MobileTopBar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Query perfil con join a carrera y facultad
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      role,
      full_name,
      university,
      career_id,
      careers (
        name,
        faculties ( name )
      )
    `)
    .eq('id', user.id)
    .single();

  const role = profile?.role ?? 'student';
  const name = profile?.full_name ?? user.email?.split('@')[0] ?? 'Usuario';

  // ── Redirect a onboarding si el estudiante aún no tiene carrera ──
  // Evitamos loop: si ya estamos en /dashboard/onboarding no redirigimos
  const headersList = await headers();
  const pathname = headersList.get('x-invoke-path') ?? headersList.get('next-url') ?? '';
  const isOnboarding = pathname.includes('/dashboard/onboarding');

  if (role === 'student' && !profile?.career_id && !isOnboarding) {
    redirect('/dashboard/onboarding');
  }

  // ── Subtitle dinámico ──
  let subtitle: string;
  if (role === 'admin') {
    subtitle = 'Director Académico · UAI Peñalolén';
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const careerData = (profile?.careers as any);
    const careerName   = careerData?.name ?? 'Sin carrera';
    const universityName = profile?.university ?? 'Universidad';
    subtitle = `${careerName} · ${universityName}`;
  }

  // Badge de carrera solo para estudiantes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const career = role === 'student' ? (profile?.careers as any)?.name ?? undefined : undefined;

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50 dark:bg-gray-950 overflow-hidden relative">
      {/* Cabecera superior */}
      <MobileTopBar name={name} role={role} subtitle={subtitle} career={career} />
      
      {/* Contenido principal con padding-bottom para el NavBar */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Navegación inferior fija */}
      <BottomNavBar role={role} />
    </div>
  );
}
