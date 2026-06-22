'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';

export function RegisterForm() {
  const supabase = createClient();

  const [fullName, setFullName] = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [done,     setDone]     = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      setLoading(false);
      return;
    }

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'student',
        },
        // Forza a que el correo te redirija a la misma URL de donde estás registrándote
        emailRedirectTo: `${window.location.origin}/dashboard/onboarding`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Si Supabase requiere confirmación de email
    if (data.user && !data.session) {
      setDone(true);
      setLoading(false);
      return;
    }

    // Sin confirmación de email → redirigir al dashboard con hard navigation
    window.location.href = '/dashboard';
  }

  // Estado: email enviado
  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="w-14 h-14 rounded-full bg-green-900/30 border border-green-700/50 flex items-center justify-center">
          <CheckCircle className="h-7 w-7 text-green-400" />
        </div>
        <div>
          <p className="text-base font-semibold text-white">
            ¡Revisa tu correo!
          </p>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            Enviamos un link de confirmación a{' '}
            <strong className="text-gray-200">{email}</strong>.
            <br />Una vez confirmado podrás ingresar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Info banner */}
      <div className="rounded-xl bg-blue-900/30 border border-blue-700/40 px-4 py-3">
        <p className="text-xs text-blue-300">
          🎓 El registro público es exclusivo para <strong>estudiantes</strong>.
          Las cuentas de universidad se crean por invitación.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="reg-name" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Nombre completo
        </label>
        <input
          id="reg-name"
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Juan Pérez"
          className="w-full rounded-xl border border-white/10 bg-[#0f1923] px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="reg-email" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Correo electrónico
        </label>
        <input
          id="reg-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          className="w-full rounded-xl border border-white/10 bg-[#0f1923] px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="reg-password" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Contraseña
        </label>
        <div className="relative">
          <input
            id="reg-password"
            type={showPw ? 'text' : 'password'}
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            className="w-full rounded-xl border border-white/10 bg-[#0f1923] px-4 py-3 pr-11 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            aria-label={showPw ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-900/30 border border-red-800/50 px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 text-white font-semibold text-sm px-4 py-3.5 transition-all mt-2"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? 'Creando cuenta…' : 'Crear cuenta de estudiante'}
      </button>

    </form>
  );
}
