import { Eye } from 'lucide-react';
import Link from 'next/link';
import { AuthTabs } from '@/components/auth/AuthTabs';

export const metadata = {
  title: 'BiometricOS — Registrarse',
  description: 'Crea tu cuenta de estudiante en BiometricOS',
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#f8fafd] flex flex-col items-center justify-center p-5 relative overflow-hidden">

      {/* Subtle background pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#003087]" />
        <div className="absolute top-1 left-0 right-0 h-64 bg-gradient-to-b from-[#e8f0fb]/60 to-transparent" />
      </div>

      <div className="relative w-full max-w-sm space-y-6">

        {/* Logo + Título */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#003087] shadow-lg shadow-[#003087]/20 mx-auto">
            <Eye className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0a1628] tracking-tight">BiometricOS</h1>
            <p className="text-sm text-[#7a8fb0] mt-1 font-medium">Crea tu cuenta de estudiante</p>
          </div>
        </div>

        {/* Card del formulario */}
        <div className="bg-white rounded-3xl border border-[#e2e8f4] p-6 shadow-[0_4px_24px_rgba(0,48,135,0.08)]">
          <AuthTabs defaultTab="register" />
        </div>

        <p className="text-center text-xs text-[#b0bdd6]">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="text-[#003087] font-semibold hover:text-[#002070] transition-colors">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
