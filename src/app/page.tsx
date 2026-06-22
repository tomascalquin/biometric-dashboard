import Link from 'next/link';

export const metadata = {
  title: 'BiometricOS — Bienestar estudiantil en tiempo real',
  description: 'Plataforma de monitoreo biométrico para universidades. Detecta fatiga visual sin hardware adicional y protege el rendimiento académico.',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020817] text-white overflow-x-hidden font-sans">

      {/* ── Animated background ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full bg-blue-600/8 blur-[140px] animate-pulse" />
        <div className="absolute top-[30%] right-[-5%] w-[500px] h-[500px] rounded-full bg-cyan-500/6 blur-[120px]" style={{animationDelay:'2s'}} />
        <div className="absolute bottom-[10%] left-[30%] w-[400px] h-[400px] rounded-full bg-violet-600/5 blur-[100px]" />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{backgroundImage:'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)',backgroundSize:'64px 64px'}} />
      </div>

      {/* ══ NAVBAR ══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 backdrop-blur-xl bg-[#020817]/70 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <span className="text-sm">🧠</span>
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            BiometricOS
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
          <a href="#como-funciona" className="hover:text-white transition-colors">Cómo funciona</a>
          <a href="#para-instituciones" className="hover:text-white transition-colors">Instituciones</a>
          <a href="#estudiantes" className="hover:text-white transition-colors">Estudiantes</a>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-xl hover:bg-white/5">
            Iniciar sesión
          </Link>
          <Link href="/register"
            className="text-sm bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/20">
            Registrarse
          </Link>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section className="relative pt-36 pb-28 px-6 flex flex-col items-center text-center">

        {/* Pill badge */}
        <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-blue-600/15 to-cyan-600/10 border border-blue-500/20 rounded-full px-5 py-2 text-xs font-semibold text-blue-300 mb-8 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          Tecnología biométrica · Sin hardware extra
          <span className="ml-1 text-blue-400/60">✦</span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] max-w-4xl mb-6 tracking-tight">
          El bienestar de tus{' '}
          <span className="relative">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
              estudiantes
            </span>
            <svg className="absolute -bottom-2 left-0 w-full" height="6" viewBox="0 0 100 6" preserveAspectRatio="none">
              <path d="M0 5 Q50 0 100 5" stroke="url(#ul)" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <defs><linearGradient id="ul" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#60a5fa"/><stop offset="100%" stopColor="#2dd4bf"/></linearGradient></defs>
            </svg>
          </span>
          {', '}en tiempo real
        </h1>

        <p className="text-lg text-gray-400 max-w-2xl mb-10 leading-relaxed">
          BiometricOS detecta fatiga visual usando la cámara del dispositivo — sin almacenar video, sin hardware adicional.
          Alertas automáticas, mapas de campus y métricas por carrera para tomar decisiones que importen.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-20">
          <Link href="/register"
            className="group flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-2xl text-sm transition-all shadow-2xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-0.5">
            Comenzar gratis
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </Link>
          <a href="mailto:contacto@biometricos.cl"
            className="flex items-center justify-center gap-2 px-8 py-4 border border-white/10 hover:border-white/20 hover:bg-white/5 text-gray-300 font-semibold rounded-2xl text-sm transition-all backdrop-blur-sm">
            📩 Contactar a ventas
          </a>
        </div>

        {/* Dashboard mockup */}
        <div className="relative w-full max-w-4xl">
          {/* Glow behind card */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/10 rounded-3xl blur-2xl scale-95" />

          <div className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] backdrop-blur-xl overflow-hidden shadow-2xl">
            {/* Fake browser chrome */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06] bg-white/[0.03]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 mx-4 bg-white/5 rounded-lg px-3 py-1 text-[11px] text-gray-500 text-left">
                app.biometricos.cl/dashboard
              </div>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </div>

            {/* Mock dashboard content */}
            <div className="p-6 grid grid-cols-3 gap-4">
              {/* Stats */}
              {[
                { label: 'Estudiantes activos', value: '847', delta: '+12%', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
                { label: 'Nivel fatiga promedio', value: '23%', delta: 'Normal', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
                { label: 'Alertas críticas hoy', value: '3', delta: '-67%', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
              ].map(s => (
                <div key={s.label} className={`rounded-2xl border p-4 ${s.bg}`}>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">{s.label}</p>
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{s.delta}</p>
                </div>
              ))}

              {/* Heatmap mini */}
              <div className="col-span-2 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-3">Mapa de fatiga — Campus Principal</p>
                <div className="grid grid-cols-8 gap-1">
                  {['bg-green-500','bg-green-400','bg-orange-500','bg-green-500','bg-red-600','bg-green-500','bg-orange-400','bg-green-500',
                    'bg-green-500','bg-red-500','bg-green-400','bg-orange-500','bg-green-500','bg-green-400','bg-red-500','bg-orange-500',
                    'bg-orange-400','bg-green-500','bg-green-500','bg-red-600','bg-green-400','bg-orange-500','bg-green-500','bg-green-400',
                  ].map((c, i) => (
                    <div key={i} className={`aspect-square rounded-sm ${c} opacity-80`} />
                  ))}
                </div>
              </div>

              {/* Live feed */}
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">En vivo</p>
                </div>
                <div className="space-y-2">
                  {['ICC · Bib. Central','MED · Lab. Bio.','PSI · Sala Core'].map((l, i) => (
                    <div key={l} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${i===1?'bg-red-500':i===2?'bg-orange-400':'bg-green-400'}`} />
                      <span className="text-[10px] text-gray-400 truncate">{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Floating badges */}
          <div className="absolute -left-6 top-1/3 bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 backdrop-blur-xl rounded-2xl px-4 py-3 shadow-xl hidden md:block">
            <p className="text-[10px] text-green-400 font-semibold">✓ Fatiga detectada</p>
            <p className="text-[10px] text-gray-500 mt-0.5">EAR: 0.28 · Normal</p>
          </div>
          <div className="absolute -right-6 bottom-1/4 bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 backdrop-blur-xl rounded-2xl px-4 py-3 shadow-xl hidden md:block">
            <p className="text-[10px] text-blue-400 font-semibold">📊 847 sesiones activas</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Campus Peñalolén</p>
          </div>
        </div>
      </section>

      {/* ══ STATS BAR ══ */}
      <section className="py-12 px-6 border-y border-white/[0.05] bg-white/[0.02]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '<30s', label: 'Latencia de alerta' },
            { value: '0',   label: 'Hardware adicional' },
            { value: '100%', label: 'Privacidad — sin video' },
            { value: '5+',  label: 'Universidades piloto' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-1">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CÓMO FUNCIONA ══ */}
      <section id="como-funciona" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mb-3">Cómo funciona</p>
          <h2 className="text-3xl md:text-4xl font-black text-center mb-4 tracking-tight">Tecnología invisible,<br/>impacto real</h2>
          <p className="text-center text-gray-500 text-sm mb-16 max-w-lg mx-auto">Tres pasos que no requieren instalación ni configuración compleja.</p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                n: '01', icon: '📷', title: 'Cámara, no hardware',
                desc: 'El estudiante activa la sesión. BiometricOS usa MediaPipe para rastrear el EAR (Eye Aspect Ratio) en tiempo real, sin grabar ni almacenar video.',
                gradient: 'from-blue-600/20 to-blue-600/5',
                border: 'border-blue-500/20',
              },
              {
                n: '02', icon: '🔬', title: 'Clasificación automática',
                desc: 'Cada 30 segundos el algoritmo clasifica el nivel de fatiga en tres estados: Normal, Advertencia o Crítico. Sin intervención humana.',
                gradient: 'from-cyan-600/20 to-cyan-600/5',
                border: 'border-cyan-500/20',
              },
              {
                n: '03', icon: '📊', title: 'Panel para la institución',
                desc: 'El admin ve métricas por carrera, campus y sala en tiempo real. Detecta patrones crónicos antes de que afecten el rendimiento académico.',
                gradient: 'from-violet-600/20 to-violet-600/5',
                border: 'border-violet-500/20',
              },
            ].map(step => (
              <div key={step.n} className={`relative rounded-3xl border ${step.border} bg-gradient-to-b ${step.gradient} p-7 overflow-hidden group hover:-translate-y-1 transition-transform`}>
                <span className="absolute top-5 right-5 text-[10px] font-mono text-gray-600">{step.n}</span>
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl mb-5">
                  {step.icon}
                </div>
                <h3 className="font-bold text-base text-white mb-3">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PARA INSTITUCIONES ══ */}
      <section id="para-instituciones" className="py-24 px-6 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold text-cyan-400 uppercase tracking-[0.2em] mb-3">Para instituciones</p>
          <h2 className="text-3xl md:text-4xl font-black text-center mb-4 tracking-tight">Diseñado para la<br/>gestión universitaria</h2>
          <p className="text-center text-gray-500 text-sm mb-16 max-w-lg mx-auto">Control total de bienestar estudiantil desde un único panel administrativo.</p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: '🏛️', title: 'Multi-campus',          desc: 'Gestiona Peñalolén, Viña del Mar y otras sedes desde un solo panel centralizado.' },
              { icon: '📚', title: 'Por facultad y carrera', desc: 'Fatiga segmentada: identifica qué carreras presentan mayor carga cognitiva.' },
              { icon: '📍', title: 'Por sala de estudio',   desc: 'Mapas de calor que muestran qué espacios generan mayor estrés visual.' },
              { icon: '⚠️', title: 'Alertas en tiempo real', desc: 'Notificaciones automáticas al superar umbrales configurables por la institución.' },
              { icon: '🔒', title: 'Privacidad total',       desc: 'Cero grabación de video. Datos biométricos anónimos, procesados en el dispositivo.' },
              { icon: '📈', title: 'Reportes históricos',    desc: 'Tendencias semestrales para planificación académica basada en datos reales.' },
            ].map(f => (
              <div key={f.title} className="group p-5 rounded-2xl border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all flex gap-4">
                <span className="text-2xl flex-shrink-0 mt-0.5">{f.icon}</span>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1.5">{f.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PARA ESTUDIANTES ══ */}
      <section id="estudiantes" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl border border-white/10 overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-[#020817] to-violet-900/20" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />

            <div className="relative p-10 md:p-14 flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1">
                <p className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mb-3">Para estudiantes</p>
                <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight leading-tight">
                  Estudia más<br/>inteligente,<br/>
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">no más duro</span>
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-md">
                  BiometricOS te avisa cuándo tu cerebro necesita un descanso — antes de que la fatiga afecte tu memoria, concentración y rendimiento en evaluaciones.
                </p>
                <Link href="/register"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-gray-900 font-bold rounded-xl text-sm hover:bg-gray-100 transition-colors shadow-lg shadow-white/10">
                  Crear cuenta gratuita →
                </Link>
              </div>

              <div className="flex-shrink-0 grid grid-cols-2 gap-3 w-full md:w-auto">
                {[
                  { icon: '👁️', label: 'Detección de fatiga visual', sub: 'Algoritmo EAR en tiempo real' },
                  { icon: '☕', label: 'Recordatorios de descanso', sub: 'Alertas personalizadas' },
                  { icon: '📊', label: 'Historial de sesiones', sub: 'Tendencias por semana' },
                  { icon: '🔵', label: 'Filtro de luz azul', sub: 'Protección automática' },
                ].map(f => (
                  <div key={f.label} className="p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                    <div className="text-2xl mb-2">{f.icon}</div>
                    <p className="text-xs font-semibold text-white leading-snug">{f.label}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{f.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS / PARTNERS ══ */}
      <section className="py-16 px-6 border-y border-white/[0.05]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-gray-600 uppercase tracking-widest mb-8">Universidades piloto</p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {['UAI', 'UDP', 'UDD', 'UANDES', 'UFT'].map(uni => (
              <div key={uni} className="px-5 py-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03] text-sm font-bold text-gray-500 hover:text-gray-300 hover:border-white/15 transition-all">
                {uni}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA FINAL ══ */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 rounded-3xl blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-xs text-blue-400 font-semibold mb-6">
              ✦ Listo en 48 horas
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-5 tracking-tight leading-tight">
              ¿Tu universidad lista<br/>para dar el salto?
            </h2>
            <p className="text-gray-400 text-base mb-10 max-w-lg mx-auto leading-relaxed">
              Integración guiada, soporte dedicado y panel administrativo operativo en 48 horas. Sin contratos a largo plazo.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="mailto:contacto@biometricos.cl"
                className="inline-flex items-center justify-center gap-2 px-9 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-2xl text-sm transition-all shadow-2xl shadow-blue-600/30 hover:-translate-y-0.5">
                📩 Hablar con el equipo
              </a>
              <Link href="/register"
                className="inline-flex items-center justify-center gap-2 px-9 py-4 border border-white/10 hover:border-white/20 hover:bg-white/5 text-gray-300 font-semibold rounded-2xl text-sm transition-all">
                Comenzar como estudiante
              </Link>
            </div>
            <p className="text-gray-700 text-xs mt-6">contacto@biometricos.cl · Santiago de Chile</p>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="border-t border-white/[0.06] py-10 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-xs">🧠</span>
            </div>
            <span className="text-sm font-bold text-gray-400">BiometricOS</span>
          </div>
          <p className="text-xs text-gray-700">© 2025 BiometricOS · Todos los derechos reservados</p>
          <div className="flex gap-5 text-xs text-gray-600">
            <Link href="/login"    className="hover:text-gray-300 transition-colors">Iniciar sesión</Link>
            <Link href="/register" className="hover:text-gray-300 transition-colors">Registrarse</Link>
            <Link href="/privacidad" className="hover:text-gray-300 transition-colors">Privacidad</Link>
            <a href="mailto:contacto@biometricos.cl" className="hover:text-gray-300 transition-colors">Contacto</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
