import { Eye } from 'lucide-react';
import { AuthTabs } from '@/components/auth/AuthTabs';

export const metadata = {
  title: 'BiometricOS — Iniciar sesión',
  description: 'Plataforma de monitoreo de tecnoestrés universitario',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#0f1923] flex flex-col items-center justify-center p-5">
      
      {/* Fondo degradado sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a2332] via-[#0f1923] to-[#0a1018] pointer-events-none" />

      <div className="relative w-full max-w-sm space-y-7">

        {/* Logo + Título */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/30 mx-auto">
            <Eye className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              BiometricOS
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Monitoreo de tecnoestrés · UAI
            </p>
          </div>
        </div>

        {/* Card del formulario */}
        <div className="bg-[#1a2332] rounded-3xl border border-white/8 p-6 shadow-xl">
          <AuthTabs />
        </div>

        <p className="text-center text-xs text-gray-600">
          ¿Eres administrador?{' '}
          <span className="text-gray-500">
            Usa el link de invitación enviado por correo.
          </span>
        </p>

      </div>
    </main>
  );
}
