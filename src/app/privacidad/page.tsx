'use client';

import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';


export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-300 font-sans selection:bg-blue-500/30">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/[0.06] bg-[#0A0A0A]/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
              <span className="text-sm">🧠</span>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              BiometricOS
            </span>
          </Link>
          <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
        </div>
      </nav>

      {/* Contenido */}
      <main className="pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Política de Privacidad</h1>
          </div>
          
          <p className="text-gray-400 mb-10 text-sm">Última actualización: 22 de junio de 2026</p>

          <div className="space-y-8 text-sm leading-relaxed text-gray-300">
            <section>
              <h2 className="text-xl font-bold text-white mb-3">1. Introducción</h2>
              <p>
                En BiometricOS, la privacidad es nuestra máxima prioridad. Esta política explica cómo recopilamos, usamos y protegemos la información cuando utilizas nuestra plataforma de monitoreo de fatiga biométrica. 
                Nuestra premisa fundamental es: <strong>Nunca grabamos, almacenamos ni transmitimos video.</strong>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">2. Qué datos recopilamos</h2>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Datos de cuenta:</strong> Nombre, correo electrónico, rol (estudiante o administrador) e institución a la que perteneces.</li>
                <li><strong>Métricas biométricas (Anonimizadas):</strong> Tasa de parpadeo (BPM), nivel de apertura ocular (EAR) y nivel de fatiga calculado.</li>
                <li><strong>Datos de sesión:</strong> Fecha, hora de inicio y fin, materia estudiada y sector del campus (opcional).</li>
              </ul>
              <div className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200">
                <strong>Importante:</strong> Todo el análisis facial se realiza localmente en tu dispositivo mediante MediaPipe. El servidor de BiometricOS solo recibe números (ej. "12 parpadeos por minuto", "Nivel de fatiga: Normal").
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">3. Cómo utilizamos la información</h2>
              <p>Los datos numéricos y anonimizados se utilizan exclusivamente para:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Proporcionarte feedback personal sobre tu bienestar visual y niveles de fatiga durante el estudio.</li>
                <li>Generar mapas de calor agregados (sin identificar personas) para que la institución pueda mejorar los espacios y recursos de estudio.</li>
                <li>Activar automáticamente filtros de luz cálida en tu dispositivo cuando se detecta fatiga visual severa.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">4. Compartir información</h2>
              <p>
                Los administradores de tu institución solo tienen acceso a datos agregados y anonimizados (mapas de calor del campus, promedios de fatiga por carrera). <strong>Nunca compartimos datos individuales identificables</strong> con la universidad ni con terceros.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">5. Seguridad de los datos</h2>
              <p>
                Utilizamos tecnologías de cifrado de extremo a extremo e infraestructura segura (Supabase/PostgreSQL) para proteger tu información. El acceso a la base de datos está restringido mediante políticas de seguridad a nivel de fila (RLS), asegurando que solo tú puedas acceder a tu historial detallado.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">6. Tus derechos</h2>
              <p>
                Tienes derecho a acceder, corregir o eliminar tus datos en cualquier momento. Si deseas eliminar tu cuenta y todo tu historial asociado, puedes solicitarlo escribiendo a <a href="mailto:privacidad@biometricos.cl" className="text-blue-400 hover:text-blue-300">privacidad@biometricos.cl</a>.
              </p>
            </section>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-10 px-6">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-gray-700">© 2026 BiometricOS · Todos los derechos reservados</p>
          <div className="flex gap-5 text-xs text-gray-600">
            <Link href="/" className="hover:text-gray-300 transition-colors">Inicio</Link>
            <a href="mailto:contacto@biometricos.cl" className="hover:text-gray-300 transition-colors">Contacto</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
