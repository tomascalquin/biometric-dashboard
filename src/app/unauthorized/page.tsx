import Link from 'next/link';
import { ShieldX } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-sm">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-red-100 dark:bg-red-900/30 mx-auto">
          <ShieldX className="h-7 w-7 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Acceso no autorizado
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No tienes permisos para ver esta página. Contacta al administrador si crees que es un error.
        </p>
        <Link
          href="/login"
          className="inline-block mt-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
        >
          Volver al login
        </Link>
      </div>
    </main>
  );
}
