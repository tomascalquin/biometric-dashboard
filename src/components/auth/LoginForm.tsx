'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from '@/lib/supabase/client';

export function LoginForm() {
  const router   = useRouter();
  const supabase = createClient();

  // Escuchar el evento de login exitoso y redirigir según rol
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event !== 'SIGNED_IN' || !session) return;

        // Consultar el rol del usuario recién autenticado
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        const role = profile?.role ?? 'student';

        // Redirigir según rol
        if (role === 'admin') {
          router.push('/dashboard');
        } else {
          router.push('/dashboard/monitor');
        }

        router.refresh();
      },
    );

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  return (
    <Auth
      supabaseClient={supabase}
      appearance={{
        theme: ThemeSupa,
        variables: {
          default: {
            colors: {
              brand:       '#4f46e5', // indigo-600
              brandAccent: '#4338ca', // indigo-700
            },
            borderWidths: {
              buttonBorderWidth: '1px',
              inputBorderWidth:  '1px',
            },
            radii: {
              borderRadiusButton: '0.5rem',
              inputBorderRadius:  '0.5rem',
            },
          },
        },
        className: {
          container: 'space-y-4',
          label:     'text-sm font-medium text-gray-700 dark:text-gray-300',
          input:     'text-sm',
          button:    'text-sm font-medium',
        },
      }}
      providers={[]}        // Sin OAuth por ahora; agrega 'google' si lo necesitas
      view="sign_in"        // Solo mostrar login, no registro público
      showLinks={false}     // Ocultar "¿No tienes cuenta?" — los usuarios los crea el admin
      localization={{
        variables: {
          sign_in: {
            email_label:       'Correo electrónico',
            password_label:    'Contraseña',
            button_label:      'Ingresar',
            loading_button_label: 'Ingresando…',
            email_input_placeholder:    'tu@correo.com',
            password_input_placeholder: '••••••••',
          },
        },
      }}
    />
  );
}
