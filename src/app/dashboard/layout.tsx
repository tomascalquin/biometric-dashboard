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

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  const role = profile?.role ?? 'student';
  const name = profile?.full_name ?? user.email?.split('@')[0] ?? 'Usuario';

  // Admin: "Director Académico · UAI Peñalolén" | Student: institución
  const subtitle = role === 'admin'
    ? 'Director Académico · UAI Peñalolén'
    : 'Ing. Civil Informática · UAI';

  // Badge de carrera solo para estudiantes
  const career = role === 'student' ? 'Ing. Civil Informático' : undefined;

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
