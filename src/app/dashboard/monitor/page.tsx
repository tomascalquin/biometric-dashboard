'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AlertTriangle } from 'lucide-react';
import type { FatigueLevel } from '@/types/telemetry';

// ─── Índices de landmarks de MediaPipe FaceMesh para los ojos ────────────────
const RIGHT_EYE = [33, 160, 158, 133, 153, 144];
const LEFT_EYE  = [362, 385, 387, 263, 373, 380];

// ─── Constantes de fatiga ────────────────────────────────────────────────────
const EAR_THRESHOLD          = 0.25;
const BLINK_CONSEC_FRAMES    = 3;
const BPM_CRITICAL_THRESHOLD = 10;
const BPM_WARNING_THRESHOLD  = 15;
const LOG_INTERVAL_MS        = 10_000;  // Registrar cada 10s para más datos por sesión
const BPM_WINDOW_MS          = 60_000;

interface Landmark { x: number; y: number; z: number; }

function euclidean(a: Landmark, b: Landmark): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function computeEAR(landmarks: Landmark[], indices: number[]): number {
  const [p1, p2, p3, p4, p5, p6] = indices.map((i) => landmarks[i]);
  const vertical1  = euclidean(p2, p6);
  const vertical2  = euclidean(p3, p5);
  const horizontal = euclidean(p1, p4);
  if (horizontal === 0) return 0;
  return (vertical1 + vertical2) / (2.0 * horizontal);
}

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
  const blinkTimestamps = useRef<number[]>([]);
  const blinkCounter    = useRef(0);
  const earBelowCount   = useRef(0);
  const lastLogTime     = useRef(0);
  const lastUIUpdate    = useRef(0);
  const sessionId       = useRef(crypto.randomUUID());
  const animFrameRef    = useRef<number>(0);
  const currentValuesRef = useRef({ earL: 0, earR: 0, bpm: 0, level: 'normal' as FatigueLevel, blueLight: false });

  const [isRunning,       setIsRunning]       = useState(false);
  const [isLoading,       setIsLoading]       = useState(false);
  const [earLeft,         setEarLeft]         = useState(0);
  const [earRight,        setEarRight]        = useState(0);
  const [bpm,             setBpm]             = useState(0);
  const [blinkCount,      setBlinkCount]      = useState(0);
  const [fatigueLevel,    setFatigueLevel]    = useState<FatigueLevel>('normal');
  const [blueLightActive, setBlueLightActive] = useState(false);
  const [error,           setError]           = useState<string | null>(null);
  const [sessionMin,      setSessionMin]      = useState(0);
  const [demoRunning,     setDemoRunning]     = useState(false);
  const [demoCountdown,   setDemoCountdown]   = useState(30);
  const [demoResult,      setDemoResult]      = useState<null | { bpm: number; level: FatigueLevel; ear: number; blinks: number }>(null);
  const demoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const supabase = createClient();

  // ── career_id real del perfil del usuario ──────────────────────────────────
  const careerIdRef = useRef<string | null>(null);
  const dbSessionId = useRef<string | null>(null);   // UUID de study_sessions en DB

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from('profiles')
        .select('career_id')
        .eq('id', user.id)
        .single()
        .then(({ data }) => { careerIdRef.current = data?.career_id ?? null; });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => setSessionMin(m => m + 1), 60_000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const computeBPM = useCallback((): number => {
    const now   = Date.now();
    const since = now - BPM_WINDOW_MS;
    blinkTimestamps.current = blinkTimestamps.current.filter((t) => t > since);
    return blinkTimestamps.current.length;
  }, []);

  const sendTelemetry = useCallback(
    async (earL: number, earR: number, currentBpm: number, level: FatigueLevel, blinkActive: boolean) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !dbSessionId.current) return;
        await supabase.from('telemetry_logs').insert({
          student_anon_id:   user.id,
          session_id:        dbSessionId.current,
          ear_left:          Math.round(earL * 1000) / 1000,
          ear_right:         Math.round(earR * 1000) / 1000,
          blinks_per_minute: currentBpm,
          blink_count:       blinkCounter.current,
          fatigue_level:     level,
          blue_light_active: blinkActive,
          career_id:         careerIdRef.current ?? null,
        });
      } catch (e) {
        console.error('Error de red al enviar telemetría:', e);
      }
    },
    [supabase],
  );

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
      const earL   = computeEAR(landmarks, LEFT_EYE);
      const earR   = computeEAR(landmarks, RIGHT_EYE);
      const avgEAR = (earL + earR) / 2;

      setEarLeft(Math.round(earL * 1000) / 1000);
      setEarRight(Math.round(earR * 1000) / 1000);

      if (avgEAR < EAR_THRESHOLD) {
        earBelowCount.current += 1;
      } else {
        if (earBelowCount.current >= BLINK_CONSEC_FRAMES) {
          blinkCounter.current += 1;
          blinkTimestamps.current.push(Date.now());
          setBlinkCount(blinkCounter.current);
        }
        earBelowCount.current = 0;
      }

      const currentBpm = computeBPM();
      const level      = classifyFatigue(currentBpm);
      const blueLight  = level === 'critical';

      setBpm(currentBpm);
      setFatigueLevel(level);
      setBlueLightActive(blueLight);

      const eyeColor = level === 'critical' ? '#ef4444' : level === 'warning' ? '#f59e0b' : '#10b981';
      ctx.fillStyle = eyeColor;
      [...LEFT_EYE, ...RIGHT_EYE].forEach((idx) => {
        const lm = landmarks[idx];
        ctx.beginPath();
        ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 2, 0, 2 * Math.PI);
        ctx.fill();
      });

      const now = Date.now();
      if (now - lastLogTime.current >= LOG_INTERVAL_MS) {
        lastLogTime.current = now;
        void sendTelemetry(earL, earR, currentBpm, level, blueLight);
      }
    },
    [computeBPM, sendTelemetry],
  );

  const startMonitor = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSessionMin(0);
    try {
      // Crear sesión en DB antes de iniciar la cámara
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: newSession } = await supabase
          .from('study_sessions')
          .insert({
            student_id: user.id,
            career_id:  careerIdRef.current ?? null,
            status:     'active',
          })
          .select('id')
          .single();
        if (newSession) {
          dbSessionId.current  = newSession.id;
          sessionId.current    = newSession.id; // sincronizar el ref legacy
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

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

      const camera = new Camera(videoRef.current!, {
        onFrame: async () => {
          if (videoRef.current) await faceMesh.send({ image: videoRef.current });
        },
        width: 640, height: 480,
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

  // ── Ref para capturar valores actuales sin cambiar dependencias ────────────
  useEffect(() => {
    currentValuesRef.current = { earL: earLeft, earR: earRight, bpm, level: fatigueLevel, blueLight: blueLightActive };
  }, [earLeft, earRight, bpm, fatigueLevel, blueLightActive]);

  const stopMonitor = useCallback(() => {
    // Detener stream de cámara INMEDIATAMENTE
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setIsRunning(false);

    // Cerrar sesión en DB de forma asincrónica (sin bloquear cierre de cámara)
    if (dbSessionId.current) {
      const sessionId = dbSessionId.current;
      dbSessionId.current = null;
      
      // Enviar telemetría final y cerrar sesión
      void (async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('telemetry_logs').insert({
              student_anon_id: user.id,
              session_id: sessionId,
              ear_left: Math.max(0.1, Math.min(0.35, currentValuesRef.current.earL)),
              ear_right: Math.max(0.1, Math.min(0.35, currentValuesRef.current.earR)),
              blinks_per_minute: Math.max(0, currentValuesRef.current.bpm),
              blink_count: blinkCounter.current,
              fatigue_level: currentValuesRef.current.level,
              blue_light_active: currentValuesRef.current.blueLight,
              career_id: careerIdRef.current ?? null,
            });
          }
        } catch (e) {
          console.error('Error al enviar telemetría final:', e);
        }
        
        // Cerrar sesión
        try {
          await supabase.rpc('close_study_session', { p_session_id: sessionId });
        } catch (err) {
          console.error('Error al cerrar sesión:', err);
        }
      })();
    }

    // Limpiar UI
    setEarLeft(0);
    setEarRight(0);
    setBpm(0);
    setBlinkCount(0);
    setFatigueLevel('normal');
    setBlueLightActive(false);
  }, [supabase]);

  const simulateCritical = useCallback(() => {
    setBpm(7);
    setFatigueLevel('critical');
    setBlueLightActive(true);
    setEarLeft(0.18);
    setEarRight(0.19);
  }, []);

  // ── Demo mode: activa cámara + 30 segundos con interpolación suave y ruido realista ──
  const startDemo = useCallback(async () => {
    setDemoResult(null);
    setDemoCountdown(30);
    await startMonitor();
    setDemoRunning(true);
    setBlueLightActive(false);

    // Contador regresivo
    let remaining = 30;
    const countInterval = setInterval(() => {
      remaining -= 1;
      setDemoCountdown(remaining);
      if (remaining <= 0) clearInterval(countInterval);
    }, 1000);

    // Keyframes principales: normal → warning → critical → recovery
    const keyframes = [
      { t: 0,    earL: 0.32, earR: 0.31, bpm: 18, blinks: 0 },
      { t: 6000, earL: 0.24, earR: 0.23, bpm: 12, blinks: 2 },   // Warning
      { t: 12000,earL: 0.16, earR: 0.15, bpm:  5, blinks: 8 },   // Critical (pico)
      { t: 18000,earL: 0.25, earR: 0.24, bpm: 13, blinks: 10 },  // Recovery
      { t: 30000,earL: 0.30, earR: 0.29, bpm: 16, blinks: 12 },  // Normal
    ];

    // Helper: interpolar entre dos valores
    const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

    // Helper: encontrar keyframe actual e interpolar
    const getInterpolated = (time: number) => {
      for (let i = 0; i < keyframes.length - 1; i++) {
        const kf1 = keyframes[i];
        const kf2 = keyframes[i + 1];
        if (time >= kf1.t && time <= kf2.t) {
          const duration = kf2.t - kf1.t;
          const elapsed = time - kf1.t;
          const ratio = duration > 0 ? elapsed / duration : 0;
          // Easing: ease-in-out para suavidad
          const easedRatio = ratio < 0.5 ? 2 * ratio * ratio : -1 + (4 - 2 * ratio) * ratio;
          return {
            earL: lerp(kf1.earL, kf2.earL, easedRatio),
            earR: lerp(kf1.earR, kf2.earR, easedRatio),
            bpm: lerp(kf1.bpm, kf2.bpm, easedRatio),
            blinks: lerp(kf1.blinks, kf2.blinks, easedRatio),
          };
        }
      }
      const lastKf = keyframes[keyframes.length - 1];
      return { earL: lastKf.earL, earR: lastKf.earR, bpm: lastKf.bpm, blinks: lastKf.blinks };
    };

    // Actualizar cada ~500ms con pequeñas variaciones realistas (cambio suave)
    const startTime = Date.now();
    const updateInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= 30000) {
        clearInterval(updateInterval);
        return;
      }

      const interpolated = getInterpolated(elapsed);
      // Agregar pequeño ruido aleatorio para parecer datos reales
      const noise = {
        earL: interpolated.earL + (Math.random() - 0.5) * 0.015,
        earR: interpolated.earR + (Math.random() - 0.5) * 0.015,
        bpm: Math.round(interpolated.bpm + (Math.random() - 0.5) * 1.5),
      };

      setEarLeft(Math.max(0.1, Math.min(0.35, noise.earL)));
      setEarRight(Math.max(0.1, Math.min(0.35, noise.earR)));
      setBpm(Math.max(0, noise.bpm));

      // Actualizar fatiga basada en BPM interpolado (suave, no saltos)
      const level = classifyFatigue(interpolated.bpm);
      setFatigueLevel(level);
      // Filtro azul SOLO en crítico, NO en warning
      setBlueLightActive(level === 'critical');

      // Parpadeos aumentan durante estrés crítico
      setBlinkCount(Math.round(interpolated.blinks));
    }, 500);

    // Resultado final a los 30s
    demoTimerRef.current = setTimeout(() => {
      clearInterval(countInterval);
      clearInterval(updateInterval);
      setBlueLightActive(false);
      setDemoRunning(false);
      stopMonitor();
      setDemoResult({ bpm: 11, level: 'warning', ear: 0.22, blinks: 12 });
      setEarLeft(0); setEarRight(0); setBpm(0); setBlinkCount(0); setFatigueLevel('normal');
    }, 30000);
  }, [startMonitor, stopMonitor]);

  const closeDemo = useCallback(() => {
    setDemoResult(null);
    if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
  }, []);

  useEffect(() => () => stopMonitor(), [stopMonitor]);

  // ─── Overlay luz azul ───────────────────────────────────────────────────────
  const overlayStyle = blueLightActive
    ? { position: 'fixed' as const, inset: 0, background: 'rgba(255,150,50,0.15)', mixBlendMode: 'multiply' as const, pointerEvents: 'none' as const, zIndex: 9999, transition: 'opacity 1s ease' }
    : {};

  const fatigueBadge: Record<FatigueLevel, { label: string; cls: string }> = {
    normal:   { label: 'Normal',           cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
    warning:  { label: 'Fatiga Moderada',  cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
    critical: { label: 'Fatiga Crítica',   cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  };

  return (
    <>
      {blueLightActive && <div style={overlayStyle} aria-hidden="true" />}

      <div className="p-4 space-y-4">

        {/* Header título */}
        <div>
          <h1 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase mb-0.5">
            Monitor Biométrico
          </h1>
          <p className="text-[10px] text-gray-400">
            Analizando EAR y BPM · Activo
          </p>
        </div>

        {/* Área de cámara */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-900 w-full aspect-[4/3] flex items-center justify-center shadow-lg">
          {!isRunning && !isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-3xl">👁️</span>
              </div>
              <p className="text-sm text-gray-400">Cámara inactiva</p>
            </div>
          )}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
              <div className="flex flex-col items-center gap-3 text-white">
                <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-400">Cargando MediaPipe…</p>
              </div>
            </div>
          )}
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${!isRunning ? 'opacity-0' : ''}`}
            playsInline muted
            aria-label="Feed de cámara web para monitoreo biométrico"
          />
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full ${!isRunning ? 'opacity-0' : ''}`}
          />
          {/* Contador regresivo durante demo */}
          {demoRunning && (
            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm rounded-2xl px-3 py-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-white text-xs font-bold">Demo · {demoCountdown}s</span>
            </div>
          )}
          {isRunning && (
            <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold ${fatigueBadge[fatigueLevel].cls}`}>
              {fatigueBadge[fatigueLevel].label}
            </div>
          )}
        </div>

        {/* Grid de métricas */}
        <div className="grid grid-cols-2 gap-3">
          <MetricBox label="BPM actual" value={isRunning ? bpm : 0} unit="bpm" highlight={fatigueLevel !== 'normal' && isRunning} />
          <MetricBox label="Estado" value={isRunning ? fatigueBadge[fatigueLevel].label : '—'} isText />
          <MetricBox label="Sesión" value={isRunning ? `${sessionMin} min` : '—'} isText />
          <MetricBox label="EAR promedio" value={isRunning ? ((earLeft + earRight) / 2).toFixed(2) : '—'} isText={!isRunning} warn={isRunning && ((earLeft + earRight) / 2) < EAR_THRESHOLD && ((earLeft + earRight) / 2) > 0} />
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
            <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Botones de control */}
        {!isRunning ? (
          <button
            id="btn-start-monitor"
            onClick={startMonitor}
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md"
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
            id="btn-stop-monitor"
            onClick={stopMonitor}
            className="w-full py-4 rounded-2xl bg-gray-800 hover:bg-gray-700 active:scale-[0.98] text-white font-semibold text-sm transition-all shadow-md"
          >
            ⏹ Detener Monitor
          </button>
        )}

        {/* Botón demo 30s */}
        {!demoRunning && !demoResult && (
          <button
            id="btn-demo-session"
            onClick={startDemo}
            className="w-full py-3.5 rounded-2xl border-2 border-violet-500 text-violet-600 dark:text-violet-400 font-semibold text-sm hover:bg-violet-50 dark:hover:bg-violet-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            ⚡ Demo sesión (30 seg)
          </button>
        )}
        {demoRunning && (
          <div className="w-full py-3.5 rounded-2xl bg-violet-600/10 border-2 border-violet-500 flex items-center justify-center gap-2">
            <div className="w-3 h-3 rounded-full bg-violet-500 animate-pulse" />
            <span className="text-sm font-semibold text-violet-400">Demo en progreso…</span>
          </div>
        )}

        {/* Botón simular fatiga crítica */}
        {!demoRunning && (
          <button
            id="btn-simulate-critical"
            onClick={simulateCritical}
            className="w-full py-3.5 rounded-2xl border-2 border-red-500 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            Simular Fatiga Crítica
          </button>
        )}

        {/* Resultado Demo — modal centrado, sin necesidad de scroll */}
        {demoResult && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={closeDemo}
          >
            <div
              className="relative w-full max-w-xs bg-white dark:bg-[#1a2332] rounded-3xl shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Botón cerrar — siempre visible arriba a la derecha */}
              <button
                onClick={closeDemo}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors z-10"
                aria-label="Cerrar"
              >
                ✕
              </button>

              <div className="p-5 space-y-4">
                <div className="text-center pr-6">
                  <div className="text-3xl mb-1">📊</div>
                  <h2 className="text-sm font-black text-gray-900 dark:text-white">Resultado de sesión</h2>
                  <p className="text-[10px] text-gray-400">Duración: 30 seg · Demo</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-3 text-center border border-amber-200 dark:border-amber-800">
                    <p className="text-[9px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">Estado</p>
                    <p className="text-sm font-black text-amber-700 dark:text-amber-300 mt-1">⚠️ Warning</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-3 text-center border border-blue-200 dark:border-blue-800">
                    <p className="text-[9px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">BPM prom.</p>
                    <p className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1">{demoResult.bpm}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-3 text-center border border-gray-200 dark:border-gray-700">
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">EAR prom.</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-gray-100 mt-1">{demoResult.ear}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-3 text-center border border-gray-200 dark:border-gray-700">
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Parpadeos</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-gray-100 mt-1">{demoResult.blinks}</p>
                  </div>
                </div>

                <div className="rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3">
                  <p className="text-[10px] text-amber-700 dark:text-amber-300 text-center leading-relaxed">
                    ⚠️ Fatiga moderada detectada. El sistema activó el filtro de luz cálida durante el pico crítico.
                  </p>
                </div>

                <button
                  onClick={closeDemo}
                  className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}

function MetricBox({ label, value, unit, isText, highlight, warn }: {
  label: string;
  value: number | string;
  unit?: string;
  isText?: boolean;
  highlight?: boolean;
  warn?: boolean;
}) {
  return (
    <div className={`bg-white dark:bg-[#1a2332] rounded-2xl p-4 border shadow-sm transition-colors ${
      highlight ? 'border-red-300 dark:border-red-800' :
      warn      ? 'border-amber-300 dark:border-amber-800' :
                  'border-gray-100 dark:border-gray-800'
    }`}>
      <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1.5 font-medium">{label}</p>
      <p className={`font-bold leading-none ${isText ? 'text-base' : 'text-2xl'} ${
        highlight ? 'text-red-600 dark:text-red-400' :
        warn      ? 'text-amber-600 dark:text-amber-400' :
                    'text-gray-900 dark:text-gray-100'
      }`}>
        {value}
        {unit && <span className="text-xs font-normal text-gray-500 ml-1">{unit}</span>}
      </p>
    </div>
  );
}
