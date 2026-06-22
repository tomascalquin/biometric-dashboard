export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1923] text-gray-900 dark:text-gray-100">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Política de Privacidad</h1>
          <p className="text-gray-500 dark:text-gray-400">Vigente desde: 22 de junio de 2026</p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-gray-700 dark:text-gray-300">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Introducción</h2>
            <p className="leading-relaxed">
              BiometricOS ("el servicio") se compromete a proteger tu privacidad. Esta Política de Privacidad explica cómo recopilamos, usamos, compartimos y protegemos tu información cuando utilizas nuestra plataforma de monitoreo biométrico para estudiantes.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">2. Información que Recopilamos</h2>
            <h3 className="text-lg font-semibold mb-2 mt-4">2.1 Información que proporcionas:</h3>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Nombre completo, correo electrónico y contraseña</li>
              <li>Información de perfil: universidad, facultad, carrera, año académico</li>
              <li>Ubicación del estudio (campus, sala de estudio)</li>
              <li>Preferencias de notificaciones y configuración</li>
            </ul>

            <h3 className="text-lg font-semibold mb-2 mt-4">2.2 Información biométrica (NO grabada):</h3>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong>EAR (Eye Aspect Ratio)</strong>: Medida de apertura ocular en tiempo real</li>
              <li><strong>BPM (Blinks Per Minute)</strong>: Frecuencia de parpadeos</li>
              <li><strong>Fatiga Level</strong>: Clasificación (Normal, Advertencia, Crítico)</li>
              <li>Estos datos se procesan localmente y NO se almacena video</li>
            </ul>

            <h3 className="text-lg font-semibold mb-2 mt-4">2.3 Información técnica:</h3>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Dirección IP, tipo de navegador y dispositivo</li>
              <li>Datos de sesión y logs de actividad</li>
              <li>Timestamp de sesiones de monitoreo</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">3. Cómo Usamos tu Información</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Ejecutar y mejorar el servicio de detección de fatiga</li>
              <li>Enviar alertas cuando se detecte fatiga moderada o crítica</li>
              <li>Generar reportes de tendencias de bienestar académico</li>
              <li>Verificar identidad y prevenir fraude</li>
              <li>Cumplir con obligaciones legales y normativas</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">4. Privacidad de Video</h2>
            <p className="leading-relaxed mb-4">
              <strong>BiometricOS NO graba, almacena ni transmite video.</strong> La cámara se utiliza ÚNICAMENTE para:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2 mb-4">
              <li>Detectar puntos de referencia facial (ojos) usando MediaPipe</li>
              <li>Calcular EAR y BPM en tiempo real en tu dispositivo</li>
              <li>Clasificar el nivel de fatiga automáticamente</li>
            </ul>
            <p className="leading-relaxed">
              Todo el procesamiento ocurre localmente en tu navegador. Los datos biométricos anónimos se envían a nuestros servidores, pero <strong>nunca el video.</strong>
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">5. Compartir Información</h2>
            <p className="leading-relaxed mb-4">Compartimos información SOLO en estos casos:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong>Instituciones educativas:</strong> Datos agregados de sesiones si eres alumno en una universidad participante</li>
              <li><strong>Supabase:</strong> Proveedor de base de datos (sujeto a tratamiento de datos confidencial)</li>
              <li><strong>Requisito legal:</strong> Si una autoridad lo ordena mediante proceso legal válido</li>
            </ul>
            <p className="leading-relaxed mt-4">
              <strong>Nunca vendemos</strong> tu información a terceros para marketing o publicidad.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">6. Seguridad de Datos</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Encriptación SSL/TLS para todas las conexiones</li>
              <li>Autenticación segura con Supabase Auth</li>
              <li>Hashing de contraseñas con algoritmos modernos</li>
              <li>Control de acceso basado en roles (RBAC)</li>
              <li>Auditoría de accesos a datos sensibles</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">7. Retención de Datos</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong>Telemetría de sesiones:</strong> Conservada por 1 año desde la fecha</li>
              <li><strong>Perfil de usuario:</strong> Mientras la cuenta esté activa</li>
              <li><strong>Logs de auditoría:</strong> 90 días</li>
              <li>Puedes solicitar eliminación en settings → "Solicitar eliminación de cuenta"</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">8. Tus Derechos</h2>
            <p className="leading-relaxed mb-4">Tienes derecho a:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Acceder a todos tus datos personales (Exportar CSV)</li>
              <li>Corregir información inexacta en tu perfil</li>
              <li>Solicitar la eliminación de tu cuenta y datos</li>
              <li>Revocar consentimiento para notificaciones por correo</li>
              <li>Apelar decisiones automatizadas (si aplica)</li>
            </ul>
            <p className="leading-relaxed mt-4">
              Para ejercer estos derechos, contacta: <strong>privacy@biometricos.cl</strong>
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">9. Cookies y Rastreo</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Usamos cookies de sesión para autenticación (necesarias)</li>
              <li>NO usamos cookies de rastreo de terceros</li>
              <li>NO compartimos datos con Google Analytics u otros servicios de rastreo</li>
            </ul>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">10. Cambios a esta Política</h2>
            <p className="leading-relaxed">
              Podemos actualizar esta política ocasionalmente. Te notificaremos por correo de cambios significativos. El uso continuado del servicio implica aceptación de la política actualizada.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">11. Contacto</h2>
            <p className="leading-relaxed mb-2">
              Si tienes preguntas sobre esta Política de Privacidad, contacta a:
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg space-y-1">
              <p><strong>Email:</strong> privacy@biometricos.cl</p>
              <p><strong>Dirección:</strong> Campus Peñalolén, Santiago, Chile</p>
              <p><strong>Teléfono:</strong> +56 9 2345-6789</p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
          <p>© 2026 BiometricOS. Todos los derechos reservados.</p>
          <p className="mt-2">Última actualización: 22 de junio de 2026</p>
        </div>
      </div>
    </div>
  );
}
