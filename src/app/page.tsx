import Link from 'next/link';

export const metadata = {
  title: 'BiometricOS — Bienestar estudiantil en tiempo real | UAI',
  description: 'Plataforma de monitoreo biométrico para la UAI. Detecta fatiga visual sin hardware adicional y protege el rendimiento académico.',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8fafd] text-[#0a1628] overflow-x-hidden font-sans">

      {/* ── Animated background ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full bg-[#003087]/5 blur-[120px] animate-pulse" />
        <div className="absolute top-[30%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[#0066cc]/5 blur-[100px]" style={{animationDelay:'2s'}} />
        <div className="absolute bottom-[10%] left-[30%] w-[400px] h-[400px] rounded-full bg-[#e8f0fb] blur-[80px]" />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.4]"
          style={{backgroundImage:'linear-gradient(#e2e8f4 1px,transparent 1px),linear-gradient(90deg,#e2e8f4 1px,transparent 1px)',backgroundSize:'64px 64px'}} />
      </div>

      {/* ══ NAVBAR ══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 backdrop-blur-xl bg-white/80 border-b border-[#e2e8f4]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#003087] flex items-center justify-center shadow-md">
            <span className="text-sm">🧠</span>
          </div>
          <span className="font-bold text-lg tracking-tight text-[#0a1628]">
            BiometricOS
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[#7a8fb0]">
          <a href="#como-funciona" className="hover:text-[#003087] transition-colors">Cómo funciona</a>
          <a href="#para-instituciones" className="hover:text-[#003087] transition-colors">Instituciones</a>
          <a href="#estudiantes" className="hover:text-[#003087] transition-colors">Estudiantes</a>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login" className="text-sm font-semibold text-[#003087] hover:bg-[#e8f0fb] transition-colors px-4 py-2 rounded-xl">
            Iniciar sesión
          </Link>
          <Link href="/register"
            className="text-sm bg-[#003087] hover:bg-[#002070] text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md">
            Registrarse
          </Link>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section className="relative pt-36 pb-28 px-6 flex flex-col items-center text-center">

        {/* Pill badge */}
        <div className="inline-flex items-center gap-2.5 bg-white border border-[#e2e8f4] rounded-full px-5 py-2 text-xs font-bold text-[#003087] mb-8 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0066cc] animate-pulse" />
          Tecnología biométrica · Sin hardware extra
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] max-w-4xl mb-6 tracking-tight text-[#0a1628]">
          El bienestar de tus{' '}
          <span className="relative text-[#003087]">
            estudiantes
            <svg className="absolute -bottom-2 left-0 w-full" height="6" viewBox="0 0 100 6" preserveAspectRatio="none">
              <path d="M0 5 Q50 0 100 5" stroke="#0066cc" strokeWidth="3" fill="none" strokeLinecap="round"/>
            </svg>
          </span>
          {', '}en tiempo real
        </h1>

        <p className="text-lg text-[#3a4a6b] max-w-2xl mb-10 leading-relaxed font-medium">
          BiometricOS detecta fatiga visual usando la cámara del dispositivo — sin almacenar video, sin hardware adicional.
          Alertas automáticas, mapas de campus y métricas por carrera para tomar decisiones que importen.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-20">
          <Link href="/register"
            className="group flex items-center justify-center gap-2 px-8 py-4 bg-[#003087] hover:bg-[#002070] text-white font-bold rounded-2xl text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
            Comenzar gratis
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </Link>
          <a href="mailto:contacto@biometricos.cl"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-white border border-[#e2e8f4] hover:border-[#b0bdd6] text-[#3a4a6b] font-semibold rounded-2xl text-sm transition-all shadow-sm">
            📩 Contactar a ventas
          </a>
        </div>

        {/* Dashboard mockup */}
        <div className="relative w-full max-w-4xl">
          {/* Glow behind card */}
          <div className="absolute inset-0 bg-[#e8f0fb] rounded-3xl blur-2xl scale-95" />

          <div className="relative rounded-3xl border border-[#e2e8f4] bg-white overflow-hidden shadow-2xl">
            {/* Fake browser chrome */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-[#e2e8f4] bg-[#f8fafd]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 mx-4 bg-white border border-[#e2e8f4] rounded-lg px-3 py-1 text-[11px] font-medium text-[#7a8fb0] text-left">
                app.biometricos.cl/dashboard
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* Mock dashboard content */}
            <div className="p-6 grid grid-cols-3 gap-4 bg-[#f8fafd]">
              {/* Stats */}
              {[
                { label: 'Estudiantes activos', value: '847', delta: '+12%', color: 'text-[#003087]', bg: 'bg-white border-[#e2e8f4]' },
                { label: 'Nivel fatiga promedio', value: '23%', delta: 'Normal', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
                { label: 'Alertas críticas hoy', value: '3', delta: '-67%', color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
              ].map(s => (
                <div key={s.label} className={`rounded-2xl border p-4 shadow-sm ${s.bg}`}>
                  <p className="text-[10px] font-bold text-[#7a8fb0] uppercase tracking-wider mb-2">{s.label}</p>
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] font-medium text-[#b0bdd6] mt-1">{s.delta}</p>
                </div>
              ))}

              {/* Heatmap mini */}
              <div className="col-span-2 rounded-2xl border border-[#e2e8f4] bg-white p-4 shadow-sm">
                <p className="text-[10px] font-bold text-[#7a8fb0] uppercase tracking-wider mb-3">Mapa de fatiga — Campus Principal</p>
                <div className="grid grid-cols-8 gap-1">
                  {['bg-emerald-400','bg-emerald-300','bg-amber-400','bg-emerald-400','bg-red-500','bg-emerald-400','bg-amber-300','bg-emerald-400',
                    'bg-emerald-400','bg-red-400','bg-emerald-300','bg-amber-400','bg-emerald-400','bg-emerald-300','bg-red-400','bg-amber-400',
                    'bg-amber-300','bg-emerald-400','bg-emerald-400','bg-red-500','bg-emerald-300','bg-amber-400','bg-emerald-400','bg-emerald-300',
                  ].map((c, i) => (
                    <div key={i} className={`aspect-square rounded-sm ${c} opacity-90`} />
                  ))}
                </div>
              </div>

              {/* Live feed */}
              <div className="rounded-2xl border border-[#e2e8f4] bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <p className="text-[10px] font-bold text-[#7a8fb0] uppercase tracking-wider">En vivo</p>
                </div>
                <div className="space-y-2">
                  {['ICC · Bib. Central','MED · Lab. Bio.','PSI · Sala Core'].map((l, i) => (
                    <div key={l} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${i===1?'bg-red-500':i===2?'bg-amber-400':'bg-emerald-500'}`} />
                      <span className="text-[10px] font-medium text-[#3a4a6b] truncate">{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Floating badges */}
          <div className="absolute -left-6 top-1/3 bg-white border border-[#e2e8f4] rounded-2xl px-4 py-3 shadow-xl hidden md:block">
            <p className="text-[10px] text-emerald-600 font-bold">✓ Fatiga detectada</p>
            <p className="text-[10px] text-[#7a8fb0] mt-0.5">EAR: 0.28 · Normal</p>
          </div>
          <div className="absolute -right-6 bottom-1/4 bg-white border border-[#e2e8f4] rounded-2xl px-4 py-3 shadow-xl hidden md:block">
            <p className="text-[10px] text-[#003087] font-bold">📊 847 sesiones activas</p>
            <p className="text-[10px] text-[#7a8fb0] mt-0.5">Campus Peñalolén</p>
          </div>
        </div>
      </section>

      {/* ══ STATS BAR ══ */}
      <section className="py-12 px-6 border-y border-[#e2e8f4] bg-white">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '<30s', label: 'Latencia de alerta' },
            { value: '0',   label: 'Hardware adicional' },
            { value: '100%', label: 'Privacidad — sin video' },
            { value: '5+',  label: 'Universidades piloto' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-3xl font-black text-[#003087] mb-1">{s.value}</div>
              <div className="text-xs font-bold text-[#7a8fb0] uppercase">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CÓMO FUNCIONA ══ */}
      <section id="como-funciona" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold text-[#0066cc] uppercase tracking-[0.2em] mb-3">Cómo funciona</p>
          <h2 className="text-3xl md:text-4xl font-black text-center mb-4 tracking-tight text-[#0a1628]">Tecnología invisible,<br/>impacto real</h2>
          <p className="text-center font-medium text-[#7a8fb0] text-sm mb-16 max-w-lg mx-auto">Tres pasos que no requieren instalación ni configuración compleja.</p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                n: '01', icon: '📷', title: 'Cámara, no hardware',
                desc: 'El estudiante activa la sesión. BiometricOS usa MediaPipe para rastrear el EAR (Eye Aspect Ratio) en tiempo real, sin grabar ni almacenar video.',
              },
              {
                n: '02', icon: '🔬', title: 'Clasificación automática',
                desc: 'Cada 30 segundos el algoritmo clasifica el nivel de fatiga en tres estados: Normal, Advertencia o Crítico. Sin intervención humana.',
              },
              {
                n: '03', icon: '📊', title: 'Panel para la institución',
                desc: 'El admin ve métricas por carrera, campus y sala en tiempo real. Detecta patrones crónicos antes de que afecten el rendimiento académico.',
              },
            ].map(step => (
              <div key={step.n} className="relative rounded-3xl border border-[#e2e8f4] bg-white shadow-sm p-7 overflow-hidden group hover:-translate-y-1 hover:shadow-md transition-all">
                <span className="absolute top-5 right-5 text-[10px] font-mono font-bold text-[#e2e8f4]">{step.n}</span>
                <div className="w-12 h-12 rounded-2xl bg-[#e8f0fb] flex items-center justify-center text-2xl mb-5">
                  {step.icon}
                </div>
                <h3 className="font-bold text-base text-[#0a1628] mb-3">{step.title}</h3>
                <p className="text-sm font-medium text-[#7a8fb0] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PARA INSTITUCIONES ══ */}
      <section id="para-instituciones" className="py-24 px-6 bg-white border-y border-[#e2e8f4]">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold text-[#0066cc] uppercase tracking-[0.2em] mb-3">Para instituciones</p>
          <h2 className="text-3xl md:text-4xl font-black text-center mb-4 tracking-tight text-[#0a1628]">Diseñado para la<br/>gestión universitaria</h2>
          <p className="text-center font-medium text-[#7a8fb0] text-sm mb-16 max-w-lg mx-auto">Control total de bienestar estudiantil desde un único panel administrativo.</p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: '🏛️', title: 'Multi-campus',          desc: 'Gestiona Peñalolén, Viña del Mar y otras sedes desde un solo panel centralizado.' },
              { icon: '📚', title: 'Por facultad y carrera', desc: 'Fatiga segmentada: identifica qué carreras presentan mayor carga cognitiva.' },
              { icon: '📍', title: 'Por sala de estudio',   desc: 'Mapas de calor que muestran qué espacios generan mayor estrés visual.' },
              { icon: '⚠️', title: 'Alertas en tiempo real', desc: 'Notificaciones automáticas al superar umbrales configurables por la institución.' },
              { icon: '🔒', title: 'Privacidad total',       desc: 'Cero grabación de video. Datos biométricos anónimos, procesados en el dispositivo.' },
              { icon: '📈', title: 'Reportes históricos',    desc: 'Tendencias semestrales para planificación académica basada en datos reales.' },
            ].map(f => (
              <div key={f.title} className="group p-5 rounded-2xl border border-[#e2e8f4] bg-[#f8fafd] hover:bg-white hover:shadow-md transition-all flex gap-4">
                <span className="text-2xl flex-shrink-0 mt-0.5">{f.icon}</span>
                <div>
                  <h3 className="text-sm font-bold text-[#0a1628] mb-1.5">{f.title}</h3>
                  <p className="text-xs font-medium text-[#7a8fb0] leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PARA ESTUDIANTES ══ */}
      <section id="estudiantes" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl border border-[#003087] overflow-hidden bg-[#003087]">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10" style={{backgroundImage:'linear-gradient(#ffffff 1px,transparent 1px),linear-gradient(90deg,#ffffff 1px,transparent 1px)',backgroundSize:'32px 32px'}} />
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

            <div className="relative p-10 md:p-14 flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1">
                <p className="text-xs font-bold text-[#e8f0fb] uppercase tracking-[0.2em] mb-3">Para estudiantes</p>
                <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight leading-tight text-white">
                  Estudia más<br/>inteligente,<br/>
                  <span className="text-[#80b3ff]">no más duro</span>
                </h2>
                <p className="text-[#b0bdd6] text-sm leading-relaxed mb-8 max-w-md font-medium">
                  BiometricOS te avisa cuándo tu cerebro necesita un descanso — antes de que la fatiga afecte tu memoria, concentración y rendimiento en evaluaciones.
                </p>
                <Link href="/register"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-[#003087] font-bold rounded-xl text-sm hover:bg-[#f0f4fa] transition-colors shadow-lg">
                  Crear cuenta gratuita →
                </Link>
              </div>

              <div className="flex-shrink-0 grid grid-cols-2 gap-3 w-full md:w-auto">
                {[
                  { icon: '👁️', label: 'Detección visual', sub: 'Algoritmo EAR' },
                  { icon: '☕', label: 'Recordatorios', sub: 'Descansos guiados' },
                  { icon: '📊', label: 'Historial', sub: 'Tendencias' },
                  { icon: '🔵', label: 'Protección', sub: 'Salud digital' },
                ].map(f => (
                  <div key={f.label} className="p-4 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm">
                    <div className="text-2xl mb-2">{f.icon}</div>
                    <p className="text-xs font-bold text-white leading-snug">{f.label}</p>
                    <p className="text-[10px] text-[#b0bdd6] mt-0.5">{f.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS / PARTNERS ══ */}
      <section className="py-16 px-6 border-y border-[#e2e8f4] bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-[#7a8fb0] uppercase tracking-widest mb-8">Universidades piloto</p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {['UAI', 'UDP', 'UDD', 'UANDES', 'UFT'].map(uni => (
              <div key={uni} className="px-5 py-2.5 rounded-xl border border-[#e2e8f4] bg-[#f8fafd] text-sm font-bold text-[#3a4a6b] hover:text-[#003087] hover:border-[#b0bdd6] transition-all">
                {uni}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA FINAL ══ */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="absolute inset-0 bg-[#e8f0fb] rounded-3xl blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-white border border-[#e2e8f4] shadow-sm rounded-full px-4 py-1.5 text-xs text-[#0066cc] font-bold mb-6">
              ✦ Listo en 48 horas
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-5 tracking-tight leading-tight text-[#0a1628]">
              ¿Tu universidad lista<br/>para dar el salto?
            </h2>
            <p className="text-[#3a4a6b] text-base mb-10 max-w-lg mx-auto leading-relaxed font-medium">
              Integración guiada, soporte dedicado y panel administrativo operativo en 48 horas. Sin contratos a largo plazo.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="mailto:contacto@biometricos.cl"
                className="inline-flex items-center justify-center gap-2 px-9 py-4 bg-[#003087] hover:bg-[#002070] text-white font-bold rounded-2xl text-sm transition-all shadow-lg hover:-translate-y-0.5">
                📩 Hablar con el equipo
              </a>
              <Link href="/register"
                className="inline-flex items-center justify-center gap-2 px-9 py-4 bg-white border border-[#e2e8f4] hover:border-[#b0bdd6] text-[#3a4a6b] font-semibold rounded-2xl text-sm transition-all shadow-sm">
                Comenzar como estudiante
              </Link>
            </div>
            <p className="text-[#7a8fb0] font-medium text-xs mt-6">contacto@biometricos.cl · Santiago de Chile</p>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="border-t border-[#e2e8f4] bg-white py-10 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#003087] flex items-center justify-center shadow-md">
              <span className="text-xs">🧠</span>
            </div>
            <span className="text-sm font-bold text-[#0a1628]">BiometricOS</span>
          </div>
          <p className="text-xs font-medium text-[#7a8fb0]">© 2025 BiometricOS · Todos los derechos reservados</p>
          <div className="flex gap-5 text-xs font-medium text-[#3a4a6b]">
            <Link href="/login"    className="hover:text-[#003087] transition-colors">Iniciar sesión</Link>
            <Link href="/register" className="hover:text-[#003087] transition-colors">Registrarse</Link>
            <Link href="/privacidad" className="hover:text-[#003087] transition-colors">Privacidad</Link>
            <a href="mailto:contacto@biometricos.cl" className="hover:text-[#003087] transition-colors">Contacto</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
