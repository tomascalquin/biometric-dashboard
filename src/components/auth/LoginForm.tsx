'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export function LoginForm() {
  const supabase = createClient();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !data.user) {
      setError('Correo o contraseña incorrectos.');
      setLoading(false);
      return;
    }

    // Hard navigation: fuerza al Server Component a releer la sesión desde cookies.
    // router.push() no invalida el cache del servidor en Next.js App Router.
    window.location.href = '/dashboard';
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <div className="space-y-1.5">
        <label htmlFor="login-email" className="block text-[11px] font-bold text-[#7a8fb0] uppercase tracking-wider">
          Correo electrónico
        </label>
        <input
          id="login-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          className="w-full rounded-xl border border-[#e2e8f4] bg-white px-4 py-3 text-sm text-[#0a1628] placeholder-[#b0bdd6] focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] transition-all shadow-sm"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="login-password" className="block text-[11px] font-bold text-[#7a8fb0] uppercase tracking-wider">
          Contraseña
        </label>
        <div className="relative">
          <input
            id="login-password"
            type={showPw ? 'text' : 'password'}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-[#e2e8f4] bg-white px-4 py-3 pr-11 text-sm text-[#0a1628] placeholder-[#b0bdd6] focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] transition-all shadow-sm"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b0bdd6] hover:text-[#7a8fb0] transition-colors"
            aria-label={showPw ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 shadow-sm">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#003087] hover:bg-[#002070] active:scale-[0.98] disabled:opacity-60 text-white font-semibold text-sm px-4 py-3.5 transition-all mt-2 shadow-sm"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? 'Ingresando…' : 'Ingresar'}
      </button>

    </form>
  );
}
