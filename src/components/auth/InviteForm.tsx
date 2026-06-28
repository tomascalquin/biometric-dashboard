'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff, Loader2, ShieldCheck, ShieldX } from 'lucide-react';

interface Props {
  token: string;
}

type TokenStatus = 'checking' | 'valid' | 'invalid' | 'used';

export function InviteForm({ token }: Props) {
  const supabase = createClient();

  const [tokenStatus, setTokenStatus] = useState<TokenStatus>('checking');
  const [inviteData,  setInviteData]  = useState<{ email: string; university: string } | null>(null);

  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  // Verificar el token al montar
  useEffect(() => {
    async function checkToken() {
      const { data, error } = await supabase
        .from('admin_invites')
        .select('email, university, used_at, expires_at')
        .eq('token', token)
        .single();

      if (error || !data) {
        setTokenStatus('invalid');
        return;
      }

      if (data.used_at) {
        setTokenStatus('used');
        return;
      }

      if (new Date(data.expires_at) < new Date()) {
        setTokenStatus('invalid');
        return;
      }

      setInviteData({ email: data.email, university: data.university });
      setTokenStatus('valid');
    }

    void checkToken();
  }, [token, supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      setLoading(false);
      return;
    }

    // 1. Crear cuenta en Supabase Auth
    const { data, error: authError } = await supabase.auth.signUp({
      email:    inviteData!.email,
      password,
      options: {
        data: {
          full_name:   fullName,
          role:        'admin',
          university:  inviteData!.university,
        },
      },
    });

    if (authError || !data.user) {
      setError(authError?.message ?? 'Error al crear la cuenta.');
      setLoading(false);
      return;
    }

    // 2. Marcar el token como usado
    await supabase
      .from('admin_invites')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token);

    // 3. Asegurar que el perfil tenga role: admin
    // (el trigger lo crea con role: admin si raw_user_meta_data.role = 'admin')
    // Por seguridad, también lo escribimos explícitamente:
    await supabase
      .from('profiles')
      .update({ role: 'admin', full_name: fullName })
      .eq('id', data.user.id);

    // Hard navigation para que el Server Component lea el nuevo rol desde la sesión
    window.location.href = '/dashboard';
  }

  // ─── Estados del token ─────────────────────────────────────────────────────

  if (tokenStatus === 'checking') {
    return (
      <div className="flex items-center justify-center py-8 gap-3 text-[#7a8fb0]">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Verificando invitación…</span>
      </div>
    );
  }

  if (tokenStatus === 'invalid') {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <ShieldX className="h-10 w-10 text-red-500" />
        <p className="text-sm font-bold text-[#0a1628]">
          Invitación inválida o expirada
        </p>
        <p className="text-xs text-[#7a8fb0]">
          Este link no es válido o ya expiró. Contacta al equipo de BiometricOS.
        </p>
      </div>
    );
  }

  if (tokenStatus === 'used') {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <ShieldCheck className="h-10 w-10 text-emerald-500" />
        <p className="text-sm font-bold text-[#0a1628]">
          Esta invitación ya fue utilizada
        </p>
        <p className="text-xs text-[#7a8fb0]">
          Si eres el titular, ingresa normalmente desde{' '}
          <a href="/login" className="text-[#003087] font-semibold hover:underline">login</a>.
        </p>
      </div>
    );
  }

  // ─── Formulario válido ─────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <div className="rounded-xl bg-[#e8f0fb] border border-[#cddaf5] px-4 py-3">
        <p className="text-xs text-[#003087]">
          🏛 Universidad: <strong className="font-semibold">{inviteData?.university}</strong>
        </p>
        <p className="text-xs text-[#3a4a6b] mt-1">
          Cuenta admin para: <strong className="font-semibold">{inviteData?.email}</strong>
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="inv-name" className="block text-[11px] font-bold text-[#7a8fb0] uppercase tracking-wider">
          Tu nombre completo
        </label>
        <input
          id="inv-name"
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Dra. Ana García"
          className="w-full rounded-xl border border-[#e2e8f4] bg-white px-4 py-3 text-sm text-[#0a1628] placeholder-[#b0bdd6] focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] transition-all shadow-sm"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="inv-password" className="block text-[11px] font-bold text-[#7a8fb0] uppercase tracking-wider">
          Crear contraseña
        </label>
        <div className="relative">
          <input
            id="inv-password"
            type={showPw ? 'text' : 'password'}
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            className="w-full rounded-xl border border-[#e2e8f4] bg-white px-4 py-3 pr-11 text-sm text-[#0a1628] placeholder-[#b0bdd6] focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] transition-all shadow-sm"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b0bdd6] hover:text-[#7a8fb0] transition-colors"
            aria-label={showPw ? 'Ocultar' : 'Mostrar'}
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
        {loading ? 'Activando cuenta…' : 'Activar cuenta de administrador'}
      </button>

    </form>
  );
}
