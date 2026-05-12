import { LoginForm } from '@/components/auth/LoginForm';
import { Eye } from 'lucide-react';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">

        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 mx-auto">
            <Eye className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            BiometricOS
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Plataforma de monitoreo de tecnoestrés
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <LoginForm />
        </div>

      </div>
    </main>
  );
}
