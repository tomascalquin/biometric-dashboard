'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { FatigueLevel } from '@/types/telemetry';

// ─── Índices de landmarks de MediaPipe FaceMesh para los ojos ────────────────
// Ojo derecho (desde perspectiva de la cámara)
const RIGHT_EYE = [33, 160, 158, 133, 153, 144];
// Ojo izquierdo (desde perspectiva de la cámara)
const LEFT_EYE  = [362, 385, 387, 263, 373, 380];

// ─── Constantes de fatiga (equivalentes a tu lógica Python) ──────────────────
const EAR_THRESHOLD         = 0.25;   // Por debajo → parpadeo detectado
const BLINK_CONSEC_FRAMES   = 3;      // Frames consecutivos bajo el umbral
const BPM_CRITICAL_THRESHOLD = 10;   // Parpadeos/min → crítico
const BPM_WARNING_THRESHOLD  = 15;   // Parpadeos/min → advertencia
const LOG_INTERVAL_MS        = 30_000; // Enviar a Supabase cada 30 segundos
const BPM_WINDOW_MS          = 60_000; // Ventana de 60s para calcular BPM

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Landmark {
  x: number;
  y: number;
  z: number;
}

// ─── Utilidades de cálculo ────────────────────────────────────────────────────

/** Distancia euclidiana 2D entre dos landmarks */
function euclidean(a: Landmark, b: Landmark): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/**
 * Eye Aspect Ratio (EAR) — Soukupová & Čech (2016)
 * EAR = (|p2-p6| + |p3-p5|) / (2 * |p1-p4|)
 * landmarks: [p1, p2, p3, p4, p5, p6] según los índices de FaceMesh
 */
function computeEAR(landmarks: Landmark[], indices: number[]): number {
  const [p1, p2, p3, p4, p5, p6] = indices.map((i) => landmarks[i]);
  const vertical1  = euclidean(p2, p6);
  const vertical2  = euclidean(p3, p5);
  const horizontal = euclidean(p1, p4);
  if (horizontal === 0) return 0;
  return (vertical1 + vertical2) / (2.0 * horizontal);
}

/** Determina el nivel de fatiga basado en BPM */
function classifyFatigue(bpm: number): FatigueLevel {
  if (bpm < BPM_CRITICAL_THRESHOLD) return 'critical';
  if (bpm < BPM_WARNING_THRESHOLD)  return 'warning';
  return 'normal';
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function MonitorPage() {
  const videoRef        = useRef<HTMLVideoElement>(null);
  const canvasRef       = useRef<HTMLCanvasElement>(null);
  const streamRef       = useRef<MediaStream | null>(null);
  const faceMeshRef     = useRef<any>(null);
  const blinkTimestamps = useRef<number[]>([]); // marcas de tiempo de cada parpadeo
  const blinkCounter    = useRef(0);
  const earBelowCount   = useRef(0);
  const lastLogTime     = useRef(0);
  const sessionId       = useRef(crypto.randomUUID());
  const animFrameRef    = useRef<number>(0);

  const [isRunning,     setIsRunning]     = useState(false);
  const [isLoading,     setIsLoading]     = useState(false);
  const [earLeft,       setEarLeft]       = useState(0);
  const [earRight,      setEarRight]      = useState(0);
  const [bpm,           setBpm]           = useState(0);
  const [blinkCount,    setBlinkCount]    = useState(0);
  const [fatigueLevel,  setFatigueLevel]  = useState<FatigueLevel>('normal');
  const [blueLightActive, setBlueLightActive] = useState(false);
  const [lastLogStatus, setLastLogStatus] = useState<'idle' | 'ok' | 'error'>('idle');
  const [error,         setError]         = useState<string | null>(null);

  const supabase = createClient();

  // ─── Calcular BPM sobre la ventana de 60s ──────────────────────────────────
  const computeBPM = useCallback((): number => {
    const now   = Date.now();
    const since = now - BPM_WINDOW_MS;
    blinkTimestamps.current = blinkTimestamps.current.filter((t) => t > since);
    return blinkTimestamps.current.length; // parpadeos en el último minuto
  }, []);

  // ─── Enviar telemetría a Supabase ──────────────────────────────────────────
  const sendTelemetry = useCallback(
    async (earL: number, earR: number, currentBpm: number, level: FatigueLevel, blinkActive: boolean) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error: insertError } = await supabase.from('telemetry_logs').insert({
          student_anon_id:   user.id,
          session_id:        sessionId.current,
          ear_left:          Math.round(earL * 1000) / 1000,
          ear_right:         Math.round(earR * 1000) / 1000,
          blinks_per_minute: currentBpm,
          blink_count:       blinkCounter.current,
          fatigue_level:     level,
          blue_light_active: blinkActive,
          career_id:         'unknown', // Actualiza cuando tengas el perfil cargado
        });

        setLastLogStatus(insertError ? 'error' : 'ok');
        if (insertError) console.error('Error al insertar telemetría:', insertError);
      } catch (e) {
        setLastLogStatus('error');
        console.error('Error de red al enviar telemetría:', e);
      }
    },
    [supabase],
  );

  // ─── Callback de resultados de MediaPipe FaceMesh ─────────────────────────
  const onFaceMeshResults = useCallback(
    (results: any) => {
      const canvas = canvasRef.current;
      const video  = videoRef.current;
      if (!canvas || !video) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

      if (!results.multiFaceLandmarks?.length) return;

      const landmarks: Landmark[] = results.multiFaceLandmarks[0];

      // Calcular EAR para ambos ojos
      const earL = computeEAR(landmarks, LEFT_EYE);
      const earR = computeEAR(landmarks, RIGHT_EYE);
      const avgEAR = (earL + earR) / 2;

      setEarLeft(Math.round(earL * 1000) / 1000);
      setEarRight(Math.round(earR * 1000) / 1000);

      // ─── Detección de parpadeo ──────────────────────────────────────────
      if (avgEAR < EAR_THRESHOLD) {
        earBelowCount.current += 1;
      } else {
        if (earBelowCount.current >= BLINK_CONSEC_FRAMES) {
          // ¡Parpadeo registrado!
          blinkCounter.current += 1;
          blinkTimestamps.current.push(Date.now());
          setBlinkCount(blinkCounter.current);
        }
        earBelowCount.current = 0;
      }

      // ─── Actualizar BPM y nivel de fatiga ──────────────────────────────
      const currentBpm   = computeBPM();
      const level        = classifyFatigue(currentBpm);
      const blueLight    = level === 'critical';

      setBpm(currentBpm);
      setFatigueLevel(level);
      setBlueLightActive(blueLight);

      // ─── Dibujar puntos de los ojos en el canvas ────────────────────────
      const eyeColor = level === 'critical' ? '#ef4444' : level === 'warning' ? '#f59e0b' : '#10b981';
      ctx.fillStyle = eyeColor;
      [...LEFT_EYE, ...RIGHT_EYE].forEach((idx) => {
        const lm = landmarks[idx];
        ctx.beginPath();
        ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 2, 0, 2 * Math.PI);
        ctx.fill();
      });

      // ─── Log periódico a Supabase ───────────────────────────────────────
      const now = Date.now();
      if (now - lastLogTime.current >= LOG_INTERVAL_MS) {
        lastLogTime.current = now;
        void sendTelemetry(earL, earR, currentBpm, level, blueLight);
      }
    },
    [computeBPM, sendTelemetry],
  );

  // ─── Iniciar cámara y MediaPipe ────────────────────────────────────────────
  const startMonitor = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Solicitar permiso de cámara
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Cargar MediaPipe FaceMesh dinámicamente (evita SSR issues)
      const { FaceMesh } = await import('@mediapipe/face_mesh');
      const { Camera }   = await import('@mediapipe/camera_utils');

      const faceMesh = new FaceMesh({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      faceMesh.setOptions({
        maxNumFaces:            1,
        refineLandmarks:        true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence:  0.5,
      });

      faceMesh.onResults(onFaceMeshResults);
      faceMeshRef.current = faceMesh;

      // MediaPipe Camera utility para el loop de frames
      const camera = new Camera(videoRef.current!, {
        onFrame: async () => {
          if (videoRef.current) {
            await faceMesh.send({ image: videoRef.current });
          }
        },
        width:  640,
        height: 480,
      });

      await camera.start();
      setIsRunning(true);
    } catch (err: any) {
      setError(
        err.name === 'NotAllowedError'
          ? 'Permiso de cámara denegado. Actívalo en la configuración del navegador.'
          : `Error al iniciar cámara: ${err.message}`,
      );
    } finally {
      setIsLoading(false);
    }
  }, [onFaceMeshResults]);

  // ─── Detener monitor ───────────────────────────────────────────────────────
  const stopMonitor = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setIsRunning(false);
    setEarLeft(0);
    setEarRight(0);
    setBpm(0);
    setFatigueLevel('normal');
    setBlueLightActive(false);
  }, []);

  // Limpiar al desmontar
  useEffect(() => () => stopMonitor(), [stopMonitor]);

  // ─── Estilos dinámicos de luz azul ────────────────────────────────────────
  const overlayStyle = blueLightActive
    ? {
        position: 'fixed' as const,
        inset: 0,
        background: 'rgba(255, 150, 50, 0.15)',
        mixBlendMode: 'multiply' as const,
        pointerEvents: 'none' as const,
        zIndex: 9999,
        transition: 'opacity 1s ease',
      }
    : {};

  const fatigueColors: Record<FatigueLevel, string> = {
    normal:   'bg-emerald-100 text-emerald-800 border-emerald-300',
    warning:  'bg-amber-100 text-amber-800 border-amber-300',
    critical: 'bg-red-100 text-red-800 border-red-300',
  };

  const fatigueLabels: Record<FatigueLevel, string> = {
    normal:   '✅ Estado Normal',
    warning:  '⚠️ Fatiga Moderada',
    critical: '🚨 Fatiga Crítica',
  };

  return (
    <>
      {/* Overlay de atenuación de luz azul */}
      {blueLightActive && <div style={overlayStyle} aria-hidden="true" />}

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Monitor Biométrico
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Análisis en tiempo real de fatiga ocular — Sesión {sessionId.current.slice(0, 8)}
          </p>
        </header>

        {/* Nivel de fatiga */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-medium text-sm ${fatigueColors[fatigueLevel]}`}
        >
          {fatigueLabels[fatigueLevel]}
          {blueLightActive && (
            <span className="ml-2 text-xs font-normal opacity-75">
              🔆 Atenuación de luz azul activa
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Área de video */}
          <div className="relative rounded-xl overflow-hidden bg-gray-900 aspect-video flex items-center justify-center">
            {!isRunning && !isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white">
                <div className="text-5xl">👁️</div>
                <p className="text-sm text-gray-400">Cámara inactiva</p>
              </div>
            )}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                <div className="flex flex-col items-center gap-3 text-white">
                  <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm">Cargando MediaPipe…</p>
                </div>
              </div>
            )}
            <video
              ref={videoRef}
              className={`w-full h-full object-cover ${!isRunning ? 'opacity-0' : ''}`}
              playsInline
              muted
              aria-label="Feed de cámara web para monitoreo biométrico"
            />
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 w-full h-full ${!isRunning ? 'opacity-0' : ''}`}
            />
          </div>

          {/* Panel de métricas en tiempo real */}
          <div className="space-y-4">
            {/* Métricas EAR y BPM */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'EAR Ojo Izquierdo', value: earLeft.toFixed(3),  unit: '',    warn: earLeft > 0 && earLeft < EAR_THRESHOLD },
                { label: 'EAR Ojo Derecho',   value: earRight.toFixed(3), unit: '',    warn: earRight > 0 && earRight < EAR_THRESHOLD },
                { label: 'Parpadeos / min',   value: bpm,                 unit: 'bpm', warn: bpm > 0 && bpm < BPM_WARNING_THRESHOLD },
                { label: 'Total Parpadeos',   value: blinkCount,          unit: '',    warn: false },
              ].map(({ label, value, unit, warn }) => (
                <div
                  key={label}
                  className={`rounded-lg border p-3 transition-colors ${
                    warn
                      ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                  <p className="text-2xl font-mono font-semibold text-gray-900 dark:text-gray-100">
                    {value}
                    {unit && <span className="text-sm font-normal ml-1 text-gray-500">{unit}</span>}
                  </p>
                </div>
              ))}
            </div>

            {/* Advertencia de luz azul */}
            {blueLightActive && (
              <div className="rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-4">
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  🔆 Atenuación de luz azul activada
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">
                  Tu frecuencia de parpadeo es demasiado baja. Toma un descanso de 20 segundos
                  mirando algo a 6 metros de distancia.
                </p>
              </div>
            )}

            {/* Estado del último log */}
            {lastLogStatus !== 'idle' && (
              <div
                className={`text-xs px-3 py-2 rounded-md ${
                  lastLogStatus === 'ok'
                    ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                    : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                }`}
              >
                {lastLogStatus === 'ok'
                  ? '✓ Telemetría enviada a Supabase'
                  : '✗ Error al enviar telemetría — revisa la consola'}
              </div>
            )}

            {/* Error de cámara */}
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 p-4">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Controles */}
            <div className="flex gap-3">
              {!isRunning ? (
                <button
                  onClick={startMonitor}
                  disabled={isLoading}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-4 py-3 transition-colors"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Iniciando…
                    </>
                  ) : (
                    <>👁️ Iniciar Monitor</>
                  )}
                </button>
              ) : (
                <button
                  onClick={stopMonitor}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-3 transition-colors"
                >
                  ⏹ Detener Monitor
                </button>
              )}
            </div>

            {/* Leyenda técnica */}
            <details className="text-xs text-gray-500 dark:text-gray-400">
              <summary className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                ℹ️ Cómo funciona el sensor
              </summary>
              <div className="mt-2 space-y-1 pl-3 border-l border-gray-200 dark:border-gray-700">
                <p>• <strong>EAR</strong>: Eye Aspect Ratio — mide la apertura ocular (umbral: {EAR_THRESHOLD})</p>
                <p>• Un parpadeo se detecta cuando EAR {'<'} {EAR_THRESHOLD} por {BLINK_CONSEC_FRAMES} frames consecutivos</p>
                <p>• <strong>BPM normal</strong>: ≥{BPM_WARNING_THRESHOLD} · <strong>Advertencia</strong>: {'<'}{BPM_WARNING_THRESHOLD} · <strong>Crítico</strong>: {'<'}{BPM_CRITICAL_THRESHOLD}</p>
                <p>• Los datos se envían a Supabase cada {LOG_INTERVAL_MS / 1000}s</p>
                <p>• La ventana de BPM es de {BPM_WINDOW_MS / 1000}s deslizante</p>
              </div>
            </details>
          </div>
        </div>
      </main>
    </>
  );
}
