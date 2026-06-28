'use client';

import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f8fafd] text-[#0a1628] font-sans selection:bg-[#e8f0fb]">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-[#e2e8f4] bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-[#003087] flex items-center justify-center shadow-md">
              <span className="text-sm">🧠</span>
            </div>
            <span className="text-lg font-bold text-[#0a1628]">
              BiometricOS
            </span>
          </Link>
          <button onClick={() => router.back()} className="text-sm font-medium text-[#7a8fb0] hover:text-[#003087] transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
        </div>
      </nav>

      {/* Contenido */}
      <main className="pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#e8f0fb] flex items-center justify-center border border-[#cddaf5] shadow-sm">
              <Shield className="w-5 h-5 text-[#003087]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#0a1628]">Política de Privacidad</h1>
          </div>
          
          <p className="text-[#7a8fb0] mb-10 text-sm font-medium">Última actualización: 22 de junio de 2026</p>

          <div className="space-y-8 text-sm leading-relaxed text-[#3a4a6b] font-medium">
            <section>
              <h2 className="text-xl font-bold text-[#0a1628] mb-3">1. Introducción</h2>
              <p>
                En BiometricOS, la privacidad es nuestra máxima prioridad. Esta política explica cómo recopilamos, usamos y protegemos la información cuando utilizas nuestra plataforma de monitoreo de fatiga biométrica. 
                Nuestra premisa fundamental es: <strong className="text-[#0a1628]">Nunca grabamos, almacenamos ni transmitimos video.</strong>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0a1628] mb-3">2. Qué datos recopilamos</h2>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong className="text-[#0a1628]">Datos de cuenta:</strong> Nombre, correo electrónico, rol (estudiante o administrador) e institución a la que perteneces.</li>
                <li><strong className="text-[#0a1628]">Métricas biométricas (Anonimizadas):</strong> Tasa de parpadeo (BPM), nivel de apertura ocular (EAR) y nivel de fatiga calculado.</li>
                <li><strong className="text-[#0a1628]">Datos de sesión:</strong> Fecha, hora de inicio y fin, materia estudiada y sector del campus (opcional).</li>
              </ul>
              <div className="mt-4 p-4 rounded-xl bg-[#e8f0fb] border border-[#cddaf5] text-[#003087]">
                <strong className="font-bold">Importante:</strong> Todo el análisis facial se realiza localmente en tu dispositivo mediante MediaPipe. El servidor de BiometricOS solo recibe números (ej. "12 parpadeos por minuto", "Nivel de fatiga: Normal").
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0a1628] mb-3">3. Cómo utilizamos la información</h2>
              <p>Los datos numéricos y anonimizados se utilizan exclusivamente para:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Proporcionarte feedback personal sobre tu bienestar visual y niveles de fatiga durante el estudio.</li>
                <li>Generar mapas de calor agregados (sin identificar personas) para que la institución pueda mejorar los espacios y recursos de estudio.</li>
                <li>Activar automáticamente filtros de luz cálida en tu dispositivo cuando se detecta fatiga visual severa.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0a1628] mb-3">4. Compartir información</h2>
              <p>
                Los administradores de tu institución solo tienen acceso a datos agregados y anonimizados (mapas de calor del campus, promedios de fatiga por carrera). <strong className="text-[#0a1628]">Nunca compartimos datos individuales identificables</strong> con la universidad ni con terceros.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0a1628] mb-3">5. Seguridad de los datos</h2>
              <p>
                Utilizamos tecnologías de cifrado de extremo a extremo e infraestructura segura (Supabase/PostgreSQL) para proteger tu información. El acceso a la base de datos está restringido mediante políticas de seguridad a nivel de fila (RLS), asegurando que solo tú puedas acceder a tu historial detallado.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0a1628] mb-3">6. Tus derechos</h2>
              <p>
                Tienes derecho a acceder, corregir o eliminar tus datos en cualquier momento. Si deseas eliminar tu cuenta y todo tu historial asociado, puedes solicitarlo escribiendo a <a href="mailto:privacidad@biometricos.cl" className="text-[#003087] font-semibold hover:underline">privacidad@biometricos.cl</a>.
              </p>
            </section>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e2e8f4] bg-white py-10 px-6">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs font-medium text-[#7a8fb0]">© 2026 BiometricOS · Todos los derechos reservados</p>
          <div className="flex gap-5 text-xs font-medium text-[#3a4a6b]">
            <Link href="/" className="hover:text-[#003087] transition-colors">Inicio</Link>
            <a href="mailto:contacto@biometricos.cl" className="hover:text-[#003087] transition-colors">Contacto</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
