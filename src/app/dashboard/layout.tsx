import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
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

  // Query perfil con join a carrera, facultad y universidad
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      role,
      full_name,
      university,
      campus,
      academic_year,
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

  // ── El redirect a /dashboard/onboarding se hace en dashboard/page.tsx ──
  // (no desde aquí, para evitar loops con el header x-pathname)


  // ── Subtitle dinámico ──
  let subtitle: string;
  if (role === 'admin') {
    subtitle = 'Administrador';
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const careerData     = (profile?.careers as any);
    const careerName     = careerData?.name ?? 'Sin carrera';
    const universityName = profile?.university ?? 'Universidad';
    const campusStr      = (profile as any)?.campus ? ` · ${(profile as any).campus}` : '';
    const yearStr        = (profile as any)?.academic_year ? ` · ${(profile as any).academic_year}° año` : '';
    subtitle = `${careerName} · ${universityName}${campusStr}${yearStr}`;
  }

  // Badge de carrera solo para estudiantes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const career = role === 'student' ? (profile?.careers as any)?.name ?? undefined : undefined;

  return (
    <div className="flex flex-col h-[100dvh] bg-[#f8fafd] overflow-hidden relative">
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
