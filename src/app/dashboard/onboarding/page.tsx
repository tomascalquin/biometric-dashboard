import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { OnboardingForm } from '@/components/auth/OnboardingForm';

export const metadata = {
  title: 'BiometricOS — Completar perfil',
  description: 'Configura tu universidad, carrera y sector de estudio en 4 pasos.',
};

export default async function OnboardingPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Si ya completó el onboarding (tiene carrera) → ir al dashboard
  const { data: profile } = await supabase
    .from('profiles')
    .select('career_id, full_name')
    .eq('id', user.id)
    .single();

  if (profile?.career_id) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col items-center justify-center px-6 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-2">
          <span className="text-2xl">🧠</span>
          <span className="text-xl font-bold text-white tracking-tight">BiometricOS</span>
        </div>
        <p className="text-xs text-gray-500">Configura tu perfil en 4 pasos</p>
      </div>

      <OnboardingForm userId={user.id} />

      <p className="mt-8 text-[10px] text-gray-600 text-center max-w-xs">
        Esta información agrupa métricas por carrera, campus y sector de estudio para mostrarte estadísticas relevantes.
      </p>
    </div>
  );
}
