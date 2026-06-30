import { AuthTabs } from '@/components/auth/AuthTabs';
import { LoginBackground } from '@/components/auth/LoginBackground';

export const metadata = {
  title: 'BiometricOS — Iniciar sesión | UAI',
  description: 'Plataforma de monitoreo de tecnoestrés universitario',
};

export default function LoginPage() {
  return (
    <main className="login-root">

      {/* ── Left Panel: Branding ── */}
      <div className="login-panel-left">
        <LoginBackground />

        <div className="login-brand-content">
          {/* Orbs decorativos */}
          <div className="login-orb login-orb-1" />
          <div className="login-orb login-orb-2" />
          <div className="login-orb login-orb-3" />

          {/* Brand block */}
          <div className="login-brand-block">
            <div className="login-logo-ring">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="login-eye-svg">
                <circle cx="18" cy="18" r="16" stroke="white" strokeWidth="2" strokeDasharray="4 2" className="login-eye-ring-dash"/>
                <ellipse cx="18" cy="18" rx="10" ry="7" stroke="white" strokeWidth="1.5" fill="none"/>
                <circle cx="18" cy="18" r="4" fill="white" fillOpacity="0.9"/>
                <circle cx="20" cy="16.5" r="1.2" fill="white"/>
              </svg>
            </div>

            <h1 className="login-brand-title">BiometricOS</h1>
            <p className="login-brand-sub">Plataforma de monitoreo de tecnoestrés</p>

            {/* Stats decorativos */}
            <div className="login-stats-row">
              <div className="login-stat-pill">
                <span className="login-stat-dot login-dot-green" />
                <span>Detección en tiempo real</span>
              </div>
              <div className="login-stat-pill">
                <span className="login-stat-dot login-dot-blue" />
                <span>Análisis biométrico</span>
              </div>
            </div>

            {/* Waveform decorativo */}
            <div className="login-waveform">
              {[4,7,12,9,15,11,8,14,10,6,13,9,16,7,11,8,14,10,6,12].map((h, i) => (
                <div
                  key={i}
                  className="login-wave-bar"
                  style={{
                    height: `${h * 3}px`,
                    animationDelay: `${i * 0.08}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Footer UAI */}
          <p className="login-uai-footer">Universidad Abierta Interamericana</p>
        </div>
      </div>

      {/* ── Right Panel: Form ── */}
      <div className="login-panel-right">
        <div className="login-form-wrapper">

          {/* Mobile-only logo */}
          <div className="login-mobile-logo">
            <div className="login-mobile-icon">
              <svg width="22" height="22" viewBox="0 0 36 36" fill="none">
                <ellipse cx="18" cy="18" rx="10" ry="7" stroke="white" strokeWidth="1.5" fill="none"/>
                <circle cx="18" cy="18" r="4" fill="white" fillOpacity="0.9"/>
              </svg>
            </div>
            <span className="login-mobile-brand">BiometricOS</span>
          </div>

          <div className="login-card">
            <div className="login-card-header">
              <h2 className="login-card-title">Bienvenido de vuelta</h2>
              <p className="login-card-desc">Ingresá tus credenciales para continuar</p>
            </div>

            <AuthTabs />

            <p className="login-admin-note">
              ¿Sos administrador?{' '}
              <span>Usá el link de invitación enviado por correo.</span>
            </p>
          </div>

          <p className="login-footer-copy">
            © 2025 BiometricOS · UAI · Todos los derechos reservados
          </p>
        </div>
      </div>

    </main>
  );
}
