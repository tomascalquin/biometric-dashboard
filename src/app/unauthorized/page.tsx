import Link from 'next/link';
import { ShieldX } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-[#f8fafd] flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-sm">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-red-50 border border-red-200 shadow-sm mx-auto">
          <ShieldX className="h-7 w-7 text-red-600" />
        </div>
        <h1 className="text-xl font-bold text-[#0a1628]">
          Acceso no autorizado
        </h1>
        <p className="text-sm text-[#7a8fb0]">
          No tienes permisos para ver esta página. Contacta al administrador si crees que es un error.
        </p>
        <Link
          href="/login"
          className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-[#003087] hover:bg-[#002070] shadow-sm text-white text-sm font-semibold transition-all"
        >
          Volver al login
        </Link>
      </div>
    </main>
  );
}
