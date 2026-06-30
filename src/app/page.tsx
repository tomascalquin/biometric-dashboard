import Link from 'next/link';
import { Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'BiometricOS — Bienestar estudiantil en tiempo real | UAI',
  description: 'Plataforma de monitoreo biométrico para la UAI. Detecta fatiga visual sin hardware adicional.',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8fafd] text-[#0a1628] overflow-x-hidden font-sans selection:bg-[#003087] selection:text-white">

      {/* ── Background & Ambient Effects ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full bg-[#003087]/5 blur-[120px] animate-pulse" />
        <div className="absolute top-[30%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[#0066cc]/5 blur-[100px] transition-transform duration-[10000ms] hover:scale-110" />
        <div className="absolute bottom-[10%] left-[30%] w-[400px] h-[400px] rounded-full bg-[#e8f0fb] blur-[80px]" />
        <div className="absolute inset-0 opacity-[0.3]"
          style={{ backgroundImage: 'linear-gradient(#e2e8f4 1px,transparent 1px),linear-gradient(90deg,#e2e8f4 1px,transparent 1px)', backgroundSize: '64px 64px' }} />
      </div>

      {/* ══ NAVBAR ══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 backdrop-blur-xl bg-white/70 border-b border-[#e2e8f4]/50 animate-slide-up-fade" style={{ animationDelay: '0ms' }}>
        <div className="flex items-center gap-2.5 group cursor-pointer">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#003087] to-[#001b4c] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <span className="text-sm">🧠</span>
          </div>
          <span className="font-bold text-lg tracking-tight text-[#0a1628]">BiometricOS</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-bold text-[#003087] hover:bg-[#e8f0fb] transition-colors px-4 py-2 rounded-xl hidden sm:block">
            Iniciar sesión
          </Link>
          <Link href="/register" className="text-sm bg-[#003087] hover:bg-[#002070] text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 animate-shine">
            Comenzar
          </Link>
        </div>
      </nav>

      {/* ══ HERO SECTION ══ */}
      <section className="relative pt-40 pb-20 px-6 flex flex-col items-center text-center">
        
        <div className="animate-slide-up-fade" style={{ animationDelay: '100ms' }}>
          <div className="inline-flex items-center gap-2.5 bg-white/80 backdrop-blur border border-[#e2e8f4] rounded-full px-5 py-2 text-[11px] font-black uppercase tracking-wider text-[#003087] mb-8 shadow-sm hover:scale-105 transition-transform cursor-default animate-pulse-glow">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0066cc] animate-pulse" />
            Sin hardware adicional
          </div>
        </div>

        <h1 className="animate-slide-up-fade text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[1.05] max-w-5xl mb-6 tracking-tight text-[#0a1628]" style={{ animationDelay: '200ms' }}>
          El bienestar de tus{' '}
          <span className="relative inline-block bg-gradient-to-r from-[#003087] via-[#0066cc] to-[#003087] bg-clip-text text-transparent animate-text-gradient pb-2">
            estudiantes
            <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 100 8" preserveAspectRatio="none">
              <path d="M0 6 Q50 0 100 6" stroke="#0066cc" strokeWidth="4" fill="none" strokeLinecap="round"/>
            </svg>
          </span>
          {', '}en tiempo real.
        </h1>

        <p className="animate-slide-up-fade text-lg md:text-xl text-[#3a4a6b] max-w-2xl mb-10 leading-relaxed font-medium" style={{ animationDelay: '300ms' }}>
          Detectamos fatiga visual utilizando solo la cámara del dispositivo. 
          Protege el rendimiento académico de tu universidad con datos biométricos invisibles y privados.
        </p>

        <div className="animate-slide-up-fade flex flex-col sm:flex-row gap-4 mb-24 w-full sm:w-auto" style={{ animationDelay: '400ms' }}>
          <Link href="/register" className="animate-shine group flex items-center justify-center gap-2 px-8 py-4 bg-[#003087] hover:bg-[#002070] text-white font-bold rounded-2xl text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
            Probar demo gratis
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </Link>
          <a href="mailto:contacto@biometricos.cl" className="flex items-center justify-center gap-2 px-8 py-4 bg-white border border-[#e2e8f4] hover:border-[#003087] hover:text-[#003087] text-[#3a4a6b] font-bold rounded-2xl text-sm transition-all shadow-sm hover:shadow-md hover:-translate-y-1">
            Hablar con ventas
          </a>
        </div>

        {/* ── Mockup Animation (Floating) ── */}
        <div className="animate-slide-up-fade relative w-full max-w-4xl" style={{ animationDelay: '600ms' }}>
          <div className="animate-float">
            <div className="absolute inset-0 bg-gradient-to-b from-[#003087]/20 to-transparent rounded-[2.5rem] blur-2xl scale-105 -z-10" />
            
            <div className="relative rounded-[2rem] border-[6px] border-white/50 bg-white overflow-hidden shadow-2xl ring-1 ring-[#e2e8f4]">
              {/* Browser Header */}
              <div className="flex items-center gap-2 px-5 py-4 border-b border-[#e2e8f4] bg-[#f8fafd]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 mx-4 bg-white border border-[#e2e8f4] rounded-xl px-4 py-1.5 text-xs font-semibold text-[#7a8fb0] text-center shadow-inner">
                  app.biometricos.cl/dashboard
                </div>
              </div>

              {/* Mock Dashboard Content */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#f8fafc]">
                {[
                  { label: 'Estudiantes Activos', value: '1,248', color: 'text-[#0a1628]', icon: '👥' },
                  { label: 'Fatiga Promedio', value: 'Bajo', color: 'text-emerald-600', icon: '✅' },
                  { label: 'Alertas Críticas', value: '4', color: 'text-red-600', icon: '🚨' },
                ].map((s, i) => (
                  <div key={i} className="rounded-2xl border border-[#e2e8f4] p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] font-black text-[#7a8fb0] uppercase tracking-wider">{s.label}</p>
                      <span>{s.icon}</span>
                    </div>
                    <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                  </div>
                ))}
                
                <div className="col-span-1 md:col-span-3 rounded-2xl border border-[#e2e8f4] bg-white p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping absolute" />
                      <div className="w-3 h-3 bg-blue-600 rounded-full relative z-10" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0a1628]">Monitoreo en curso</p>
                      <p className="text-xs text-[#7a8fb0] font-medium">Campus Peñalolén · Ingeniería</p>
                    </div>
                  </div>
                  <div className="h-10 w-full sm:w-48 bg-gradient-to-r from-emerald-400 via-emerald-300 to-amber-300 rounded-full opacity-80 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CONCISE FEATURES ══ */}
      <section className="py-24 px-6 bg-white relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-slide-up-fade" style={{ animationDelay: '200ms' }}>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[#0a1628] mb-4">¿Por qué BiometricOS?</h2>
            <p className="text-[#7a8fb0] font-medium text-lg max-w-xl mx-auto">Todo lo que necesitas para cuidar a tu comunidad, condensado en una plataforma inteligente.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🎥', title: '100% Invisible', desc: 'No se requiere hardware. Utilizamos la cámara del dispositivo de forma pasiva, sin grabar video en ningún momento.' },
              { icon: '⚡', title: 'Decisiones Inmediatas', desc: 'El algoritmo EAR detecta micro-parpadeos y alerta sobre estrés cognitivo severo en menos de 30 segundos.' },
              { icon: '📊', title: 'Panel Multi-Campus', desc: 'Visualiza la salud mental por facultad, carrera y sede en un único dashboard diseñado para directores académicos.' },
            ].map((f, i) => (
              <div key={i} className="animate-slide-up-fade group p-8 rounded-[2rem] bg-[#f8fafd] border border-[#e2e8f4] hover:bg-white hover:border-[#b0bdd6] hover:shadow-xl hover:-translate-y-2 transition-all duration-500" style={{ animationDelay: `${400 + (i * 200)}ms` }}>
                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-500 origin-bottom-left">{f.icon}</div>
                <h3 className="text-xl font-black text-[#0a1628] mb-3">{f.title}</h3>
                <p className="text-sm font-medium text-[#7a8fb0] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="animate-slide-up-fade max-w-4xl mx-auto bg-gradient-to-br from-[#003087] to-[#001b4c] rounded-[3rem] p-10 md:p-16 text-center text-white shadow-2xl relative overflow-hidden" style={{ animationDelay: '300ms' }}>
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          
          <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight relative z-10">Protege el futuro<br/>de tu universidad</h2>
          <p className="text-blue-200 text-lg md:text-xl font-medium max-w-lg mx-auto mb-10 relative z-10">
            Únete al plan piloto. Configuración completa en 48 horas, sin compromisos a largo plazo.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Link href="/register" className="animate-shine px-8 py-4 bg-white text-[#003087] font-black rounded-2xl text-sm transition-all hover:scale-105 shadow-xl hover:shadow-white/20 animate-pulse-glow">
              Crear cuenta gratis
            </Link>
            <a href="mailto:contacto@biometricos.cl" className="px-8 py-4 bg-[#003087] border border-blue-400/30 hover:bg-blue-800 text-white font-bold rounded-2xl text-sm transition-all hover:border-white/50">
              Contactar ventas
            </a>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="border-t border-[#e2e8f4] bg-white py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 opacity-80 hover:opacity-100 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-[#003087] flex items-center justify-center">
              <span className="text-sm">🧠</span>
            </div>
            <span className="text-base font-black text-[#0a1628]">BiometricOS</span>
          </div>
          <div className="flex gap-6 text-sm font-bold text-[#7a8fb0]">
            <Link href="/login" className="hover:text-[#003087] transition-colors">Login</Link>
            <Link href="/register" className="hover:text-[#003087] transition-colors">Registro</Link>
            <a href="#" className="hover:text-[#003087] transition-colors">Privacidad</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
