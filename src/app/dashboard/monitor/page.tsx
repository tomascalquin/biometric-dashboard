'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AlertTriangle } from 'lucide-react';
import type { FatigueLevel } from '@/types/telemetry';

// ─── Índices de landmarks de MediaPipe FaceMesh para los ojos ────────────────
const RIGHT_EYE = [33, 160, 158, 133, 153, 144];
const LEFT_EYE = [362, 385, 387, 263, 373, 380];

// ─── Constantes del sistema biométrico ────────────────────────────────────────
const BLINK_CONSEC_FRAMES = 2;       // Frames consecutivos para confirmar parpadeo
const BLINK_REFRACTORY_MS = 150;     // Tiempo mínimo entre parpadeos — evita doble-detección
const BPM_CRITICAL_THRESHOLD = 8;       // < 8 bpm = fatiga crítica
const BPM_WARNING_THRESHOLD = 14;      // < 14 bpm = fatiga moderada
const EAR_MICROSLEEP_THRESH = 0.15;    // EAR < 0.15 = ojo muy cerrado
const EAR_MICROSLEEP_FRAMES = 25;      // ~1 seg con ojo cerrado = microsueño
const LOG_INTERVAL_MS = 10_000;
const BPM_WINDOW_MS = 60_000;
const CALIBRATION_FRAMES = 60;      // Primeros ~2s para calibrar EAR base
const EAR_SMOOTH_FRAMES = 5;       // Buffer de suavizado anti-jitter

interface Landmark { x: number; y: number; z: number; }

function euclidean(a: Landmark, b: Landmark): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function computeEAR(landmarks: Landmark[], indices: number[]): number {
  const [p1, p2, p3, p4, p5, p6] = indices.map((i) => landmarks[i]);
  const vertical1 = euclidean(p2, p6);
  const vertical2 = euclidean(p3, p5);
  const horizontal = euclidean(p1, p4);
  if (horizontal === 0) return 0;
  return (vertical1 + vertical2) / (2.0 * horizontal);
}

// Clasificación multi-señal: BPM + EAR promedio + microsueños
function classifyFatigue(
  bpm: number,
  avgEAR: number,
  adaptiveThreshold: number,
  microsleepCount: number,
): FatigueLevel {
  if (microsleepCount > 0) return 'critical'; // microsueño = crítico
  if (avgEAR > 0 && avgEAR < adaptiveThreshold * 0.65) return 'critical'; // ojo muy cerrado
  if (bpm > 0 && bpm < BPM_CRITICAL_THRESHOLD) return 'critical'; // BPM muy bajo
  if (avgEAR > 0 && avgEAR < adaptiveThreshold * 0.80) return 'warning';  // ojo moderadamente cerrado
  if (bpm > 0 && bpm < BPM_WARNING_THRESHOLD) return 'warning';  // BPM bajo
  return 'normal';
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function MonitorPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const faceMeshRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const blinkTimestamps = useRef<number[]>([]);
  const blinkCounter = useRef(0);
  const earBelowCount = useRef(0);
  const lastLogTime = useRef(0);
  const lastUIUpdate = useRef(0);
  const lastBlinkTime = useRef(0);           // Para refractario
  const sessionId = useRef(crypto.randomUUID());
  const animFrameRef = useRef<number>(0);
  const currentValuesRef = useRef({ earL: 0, earR: 0, bpm: 0, level: 'normal' as FatigueLevel, blueLight: false });

  // ── Calibración adaptativa del EAR ─────────────────────────────────
  const calibrationBuffer = useRef<number[]>([]);  // EAR samples durante calibración
  const adaptiveThreshold = useRef(0.25);           // Umbral adaptativo
  const isCalibrated = useRef(false);
  const frameCount = useRef(0);

  // ── Suavizado EAR anti-jitter ────────────────────────────────────
  const earSmoothBuffer = useRef<number[]>([]);

  // ── Detección de microsueños ───────────────────────────────────
  const microsleepFrames = useRef(0);   // Frames consecutivos con ojo muy cerrado
  const microsleepCount = useRef(0);   // Total de microsueños detectados

  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [earLeft, setEarLeft] = useState(0);
  const [earRight, setEarRight] = useState(0);
  const [bpm, setBpm] = useState(0);
  const [blinkCount, setBlinkCount] = useState(0);
  const [fatigueLevel, setFatigueLevel] = useState<FatigueLevel>('normal');
  const [blueLightActive, setBlueLightActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionMin, setSessionMin] = useState(0);
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoCountdown, setDemoCountdown] = useState(30);
  const [demoResult, setDemoResult] = useState<null | { bpm: number; level: FatigueLevel; ear: number; blinks: number }>(null);
  const demoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [calibProgress, setCalibProgress] = useState(0);   // 0-100 during calibration
  const [faceDetected, setFaceDetected] = useState(false);
  const [calibDone, setCalibDone] = useState(false);

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
    const now = Date.now();
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
          student_anon_id: user.id,
          session_id: dbSessionId.current,
          ear_left: Math.round(earL * 1000) / 1000,
          ear_right: Math.round(earR * 1000) / 1000,
          blinks_per_minute: currentBpm,
          blink_count: blinkCounter.current,
          fatigue_level: level,
          blue_light_active: blinkActive,
          career_id: careerIdRef.current ?? null,
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
      const video = videoRef.current;
      if (!canvas || !video) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
      if (!results.multiFaceLandmarks?.length) { setFaceDetected(false); return; }

      const landmarks: Landmark[] = results.multiFaceLandmarks[0];
      const earL = computeEAR(landmarks, LEFT_EYE);
      const earR = computeEAR(landmarks, RIGHT_EYE);
      const rawAvg = (earL + earR) / 2;

      // ── Suavizado EAR con buffer deslizante ─────────────────────────
      earSmoothBuffer.current.push(rawAvg);
      if (earSmoothBuffer.current.length > EAR_SMOOTH_FRAMES)
        earSmoothBuffer.current.shift();
      const avgEAR = earSmoothBuffer.current.reduce((a, b) => a + b, 0) / earSmoothBuffer.current.length;

      setEarLeft(Math.round(earL * 1000) / 1000);
      setEarRight(Math.round(earR * 1000) / 1000);
      setFaceDetected(true);
      frameCount.current += 1;

      // ── FASE 1: Calibración adaptativa del umbral EAR ────────────────
      if (!isCalibrated.current) {
        if (rawAvg > 0.15) calibrationBuffer.current.push(rawAvg); // Solo ojos abiertos
        const progress = Math.min(100, Math.round((calibrationBuffer.current.length / CALIBRATION_FRAMES) * 100));
        setCalibProgress(progress);
        if (calibrationBuffer.current.length >= CALIBRATION_FRAMES) {
          const sorted = [...calibrationBuffer.current].sort((a, b) => a - b);
          // Mediana del EAR en reposo
          const median = sorted[Math.floor(sorted.length / 2)];
          // Umbral = 80% de la mediana en reposo (más preciso que un valor fijo)
          adaptiveThreshold.current = median * 0.80;
          isCalibrated.current = true;
          setCalibDone(true);
        }
        // Durante calibración, no detectar parpadeos para evitar falsos positivos
        return;
      }

      const threshold = adaptiveThreshold.current;

      // ── Detección de microsueños (ojo cerrado >1s) ─────────────────
      if (avgEAR < EAR_MICROSLEEP_THRESH) {
        microsleepFrames.current += 1;
        if (microsleepFrames.current === EAR_MICROSLEEP_FRAMES) {
          microsleepCount.current += 1; // Confirmar microsueño
        }
      } else {
        microsleepFrames.current = 0;
      }

      // ── Detección de parpadeos con período refractario ───────────────
      if (avgEAR < threshold) {
        earBelowCount.current += 1;
      } else {
        const now = Date.now();
        const timeSinceLastBlink = now - lastBlinkTime.current;
        if (
          earBelowCount.current >= BLINK_CONSEC_FRAMES &&
          earBelowCount.current < EAR_MICROSLEEP_FRAMES && // No contar microsueños como parpadeos
          timeSinceLastBlink > BLINK_REFRACTORY_MS
        ) {
          blinkCounter.current += 1;
          blinkTimestamps.current.push(now);
          lastBlinkTime.current = now;
          setBlinkCount(blinkCounter.current);
        }
        earBelowCount.current = 0;
      }

      const currentBpm = computeBPM();
      const level = classifyFatigue(currentBpm, avgEAR, threshold, microsleepCount.current);
      const blueLight = level === 'critical' || level === 'warning';

      setBpm(currentBpm);
      setFatigueLevel(level);
      setBlueLightActive(level === 'critical');

      // Color de puntos según nivel de fatiga
      const eyeColor = level === 'critical' ? '#ef4444' : level === 'warning' ? '#f59e0b' : '#10b981';
      ctx.fillStyle = eyeColor;
      [...LEFT_EYE, ...RIGHT_EYE].forEach((idx) => {
        const lm = landmarks[idx];
        ctx.beginPath();
        ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 2.5, 0, 2 * Math.PI);
        ctx.fill();
      });

      const nowTs = Date.now();
      if (nowTs - lastLogTime.current >= LOG_INTERVAL_MS) {
        lastLogTime.current = nowTs;
        void sendTelemetry(earL, earR, currentBpm, level, level === 'critical');
      }
    },
    [computeBPM, sendTelemetry],
  );

  const startMonitor = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSessionMin(0);
    setCalibProgress(0);
    setFaceDetected(false);
    setCalibDone(false);
    // Reset calibraci\u00f3n y detectores para cada nueva sesi\u00f3n
    calibrationBuffer.current = [];
    adaptiveThreshold.current = 0.25;
    isCalibrated.current = false;
    frameCount.current = 0;
    earSmoothBuffer.current = [];
    microsleepFrames.current = 0;
    microsleepCount.current = 0;
    blinkCounter.current = 0;
    blinkTimestamps.current = [];
    earBelowCount.current = 0;
    lastBlinkTime.current = 0;
    try {
      // Crear sesión en DB antes de iniciar la cámara
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: newSession } = await supabase
          .from('study_sessions')
          .insert({
            student_id: user.id,
            career_id: careerIdRef.current ?? null,
            status: 'active',
          })
          .select('id')
          .single();
        if (newSession) {
          dbSessionId.current = newSession.id;
          sessionId.current = newSession.id; // sincronizar el ref legacy
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
      const { Camera } = await import('@mediapipe/camera_utils');

      const faceMesh = new FaceMesh({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });
      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      faceMesh.onResults(onFaceMeshResults);
      faceMeshRef.current = faceMesh;

      const camera = new Camera(videoRef.current!, {
        onFrame: async () => {
          if (videoRef.current) await faceMesh.send({ image: videoRef.current });
        },
        width: 640, height: 480,
      });
      cameraRef.current = camera;
      await camera.start();
      setIsRunning(true);
      lastLogTime.current = Date.now(); // <-- EVITA LOG INMEDIATO
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
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => {
        t.stop();
      });
      streamRef.current = null;
    }
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setIsRunning(false);

    // Cerrar sesión en DB de forma asincrónica (sin bloquear cierre de cámara)
    if (dbSessionId.current) {
      const sessionId = dbSessionId.current;
      const wasCritical = currentValuesRef.current.level === 'warning' || currentValuesRef.current.level === 'critical';
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

        // Activar filtro azul POST-sesión si hubo estrés (solo DESPUÉS de cerrar sesión)
        if (wasCritical) {
          setBlueLightActive(true);
          setTimeout(() => {
            setBlueLightActive(false);
          }, 5000);
        }
      })();
    }

    // Limpiar UI
    setEarLeft(0);
    setEarRight(0);
    setBpm(0);
    setBlinkCount(0);
    setFatigueLevel('normal');
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
      { t: 0, earL: 0.32, earR: 0.31, bpm: 18, blinks: 0 },
      { t: 6000, earL: 0.24, earR: 0.23, bpm: 12, blinks: 2 },   // Warning
      { t: 12000, earL: 0.16, earR: 0.15, bpm: 5, blinks: 8 },   // Critical (pico)
      { t: 18000, earL: 0.25, earR: 0.24, bpm: 13, blinks: 10 },  // Recovery
      { t: 30000, earL: 0.30, earR: 0.29, bpm: 16, blinks: 12 },  // Normal
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
      const level = classifyFatigue(interpolated.bpm, interpolated.earL, adaptiveThreshold.current, 0);
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

      // Enviar una telemetría simulada a la BD para que el historial cuadre con el demo
      const finalBpm = currentValuesRef.current.bpm > 0 ? currentValuesRef.current.bpm : 11;
      const finalEar = currentValuesRef.current.earL > 0 ? currentValuesRef.current.earL.toFixed(2) : 0.22;
      const finalLevel = currentValuesRef.current.level !== 'normal' ? currentValuesRef.current.level : 'warning';
      const finalBlinks = blinkCounter.current > 0 ? blinkCounter.current : 12;

      void sendTelemetry(Number(finalEar), Number(finalEar), finalBpm, finalLevel, finalLevel === 'critical').then(() => {
        stopMonitor();
      });

      setDemoResult({ bpm: finalBpm, level: finalLevel, ear: Number(finalEar), blinks: finalBlinks });
      setEarLeft(0); setEarRight(0); setBpm(0); setBlinkCount(0); setFatigueLevel('normal');
    }, 30000);
  }, [startMonitor, stopMonitor]);

  const closeDemo = useCallback(() => {
    setDemoResult(null);
    if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
  }, []);

  useEffect(() => () => stopMonitor(), [stopMonitor]);

  // ─── Overlay luz azul ────────────────────────────────────────────────────────
  const overlayStyle = blueLightActive
    ? { position: 'fixed' as const, inset: 0, background: 'rgba(255,150,50,0.15)', mixBlendMode: 'multiply' as const, pointerEvents: 'none' as const, zIndex: 9999, transition: 'opacity 1s ease' }
    : {};

  const fatigueBadge: Record<FatigueLevel, { label: string; cls: string; dot: string }> = {
    normal: { label: 'Normal', cls: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
    warning: { label: 'Fatiga Moderada', cls: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
    critical: { label: 'Fatiga Crítica', cls: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  };

  // Camera phase:
  // idle → loading → calibrating → running (calibDone) → stopped
  const cameraPhase =
    !isRunning && !isLoading ? 'idle' :
      isLoading ? 'loading' :
        isRunning && !calibDone ? 'calibrating' :
          'running';

  const calibSteps = [
    { done: true, label: 'Cámara activa' },
    { done: faceDetected, label: 'Cara detectada' },
    { done: calibDone, label: 'Calibración lista' },
  ];

  return (
    <>
      {blueLightActive && <div style={overlayStyle} aria-hidden="true" />}

      <div className="p-4 space-y-4">

        {/* ── HEADER ── */}
        <div>
          <h1 className="text-[10px] font-bold text-[#7a8fb0] tracking-widest uppercase mb-0.5">
            Monitor Biométrico
          </h1>
          <p className="text-[10px] text-[#b0bdd6]">
            {cameraPhase === 'idle' ? 'Listo para iniciar' :
              cameraPhase === 'loading' ? 'Cargando modelo de visión…' :
                cameraPhase === 'calibrating' ? 'Calibrando tu perfil ocular…' :
                  `Sesión activa · ${sessionMin} min`}
          </p>
        </div>

        {/* ── CAMERA AREA ── */}
        <div className="relative rounded-2xl overflow-hidden bg-[#0a1628] w-full aspect-[4/3] flex items-center justify-center shadow-xl ring-1 ring-white/5">

          {/* === IDLE STATE === */}
          {cameraPhase === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-white">
              <div className="w-20 h-20 rounded-3xl bg-white/8 border border-white/10 flex items-center justify-center">
                <span className="text-4xl">👁️</span>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-white mb-1">Monitor biométrico</p>
                <p className="text-[11px] text-white/50 leading-relaxed">
                  La cámara detectará tus parpadeos en tiempo real para medir tu nivel de fatiga
                </p>
              </div>
              {/* Quick checklist */}
              <div className="w-full bg-white/5 rounded-xl p-3 space-y-2">
                {[
                  { icon: '💡', text: 'Iluminación frontal al rostro' },
                  { icon: '📐', text: 'Cámara a la altura de los ojos' },
                  { icon: '🧍', text: 'Mantén el rostro centrado' },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-2">
                    <span className="text-sm">{icon}</span>
                    <span className="text-[11px] text-white/60 font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* === LOADING STATE === */}
          {cameraPhase === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0a1628] z-10">
              <div className="flex flex-col items-center gap-4 text-white px-6 text-center">
                <div className="relative">
                  <div className="w-14 h-14 border-2 border-[#003087]/30 border-t-[#3b82f6] rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl">👁️</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-white mb-1">Cargando MediaPipe…</p>
                  <p className="text-[10px] text-white/40">Primera carga puede tardar ~5 seg</p>
                </div>
              </div>
            </div>
          )}

          {/* === VIDEO & CANVAS (always mounted when running) === */}
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${!isRunning ? 'opacity-0 absolute' : ''}`}
            playsInline muted
            aria-label="Feed de cámara web para monitoreo biométrico"
          />
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full ${!isRunning ? 'opacity-0' : ''}`}
          />

          {/* === CALIBRATING OVERLAY === */}
          {cameraPhase === 'calibrating' && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#0a1628]/70 backdrop-blur-sm p-4">
              {/* Step checklist */}
              <div className="w-full max-w-[200px] bg-white/8 border border-white/10 rounded-2xl p-3 space-y-2">
                {calibSteps.map(({ done, label }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${done ? 'bg-emerald-500' : 'bg-white/10 border border-white/20'}`}>
                      {done ? (
                        <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                      )}
                    </div>
                    <span className={`text-[11px] font-semibold ${done ? 'text-white' : 'text-white/40'}`}>{label}</span>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              {faceDetected && !calibDone && (
                <div className="w-full max-w-[200px]">
                  <div className="flex justify-between mb-1">
                    <span className="text-[9px] text-white/40 font-semibold">Calibrando perfil ocular</span>
                    <span className="text-[9px] text-white/60 font-bold">{calibProgress}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-blue-400 transition-all duration-300"
                      style={{ width: `${calibProgress}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-white/30 mt-1.5 text-center">
                    Mantén los ojos abiertos y mira al frente
                  </p>
                </div>
              )}

              {!faceDetected && (
                <div className="text-center">
                  <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-white/20 flex items-center justify-center mx-auto mb-2 animate-pulse">
                    <span className="text-2xl opacity-40">👤</span>
                  </div>
                  <p className="text-[11px] text-white/50 font-semibold">Buscando tu cara…</p>
                  <p className="text-[9px] text-white/30 mt-1">Centra tu rostro frente a la cámara</p>
                </div>
              )}
            </div>
          )}

          {/* === RUNNING BADGES === */}
          {cameraPhase === 'running' && (
            <>
              {/* Demo countdown */}
              {demoRunning && (
                <div className="absolute top-3 left-3 bg-[#0a1628]/80 backdrop-blur-sm rounded-2xl px-3 py-2 flex items-center gap-2 z-20">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-white text-xs font-bold">Demo · {demoCountdown}s</span>
                </div>
              )}
              {/* Fatigue badge */}
              <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-[10px] font-bold z-20 flex items-center gap-1.5 ${fatigueBadge[fatigueLevel].cls}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${fatigueBadge[fatigueLevel].dot} animate-pulse`} />
                {fatigueBadge[fatigueLevel].label}
              </div>
              {/* Session timer */}
              <div className="absolute bottom-3 left-3 bg-[#0a1628]/70 backdrop-blur-sm rounded-xl px-2.5 py-1.5 z-20">
                <span className="text-white text-[10px] font-bold">{sessionMin} min</span>
              </div>
            </>
          )}
        </div>

        {/* ── CALIBRATION HINT (external, below camera) ── */}
        {cameraPhase === 'calibrating' && !calibDone && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 flex items-start gap-2.5">
            <span className="text-lg mt-0.5">ℹ️</span>
            <div>
              <p className="text-[11px] font-bold text-blue-700 mb-0.5">Calibración en curso</p>
              <p className="text-[10px] text-blue-600 leading-relaxed">
                {!faceDetected
                  ? 'Centra tu rostro frente a la cámara para comenzar la calibración.'
                  : `Tarda ~${Math.round(((100 - calibProgress) / 100) * 2)} seg más. Mantén los ojos abiertos y no te muevas.`}
              </p>
            </div>
          </div>
        )}
        {cameraPhase === 'running' && calibDone && !demoRunning && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-2.5">
            <span className="text-lg">✅</span>
            <p className="text-[11px] font-bold text-emerald-700">
              Calibración completada — midiendo en tiempo real
            </p>
          </div>
        )}

        {/* ── METRICS GRID ── */}
        <div className="grid grid-cols-2 gap-3">
          <MetricBox
            label="Parpadeos / min"
            value={isRunning ? bpm : 0}
            unit="bpm"
            highlight={fatigueLevel === 'critical' && isRunning}
            warn={fatigueLevel === 'warning' && isRunning}
          />
          <MetricBox
            label="Estado"
            value={isRunning ? fatigueBadge[fatigueLevel].label : '—'}
            isText
            highlight={fatigueLevel === 'critical' && isRunning}
            warn={fatigueLevel === 'warning' && isRunning}
          />
          <MetricBox
            label="Duración sesión"
            value={isRunning ? `${sessionMin} min` : '—'}
            isText
          />
          <MetricBox
            label="EAR promedio"
            value={isRunning ? ((earLeft + earRight) / 2).toFixed(3) : '—'}
            isText={!isRunning}
            warn={isRunning && ((earLeft + earRight) / 2) < adaptiveThreshold.current && ((earLeft + earRight) / 2) > 0}
          />
        </div>

        {/* ── ERROR ── */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 flex items-start gap-2.5">
            <span className="text-red-500 mt-0.5">⚠️</span>
            <div>
              <p className="text-xs font-bold text-red-700">Error de cámara</p>
              <p className="text-[10px] text-red-600 mt-0.5">{error}</p>
              {error.includes('denegado') && (
                <p className="text-[9px] text-red-500 mt-1 font-medium">
                  Tip: haz clic en el candado 🔒 en la barra de dirección y permite el acceso a la cámara.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── CONTROL BUTTONS ── */}
        {!isRunning ? (
          <button
            id="btn-start-monitor"
            onClick={startMonitor}
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-[#003087] hover:bg-[#002070] active:scale-[0.98] disabled:opacity-50 text-white font-bold text-sm transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-[#003087]/20"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Iniciando…
              </>
            ) : (
              <>
                <span className="text-base">👁️</span>
                Iniciar Monitor Biométrico
              </>
            )}
          </button>
        ) : (
          <button
            id="btn-stop-monitor"
            onClick={stopMonitor}
            className="w-full py-4 rounded-2xl bg-[#f0f4fa] hover:bg-[#e2e8f4] active:scale-[0.98] text-[#0a1628] font-bold text-sm transition-all shadow-sm border border-[#e2e8f4] flex items-center justify-center gap-2"
          >
            <span>⏹</span> Detener Monitor
          </button>
        )}

        {/* ── DEMO BUTTON ── */}
        {!demoRunning && !demoResult && !isRunning && (
          <button
            id="btn-demo-session"
            onClick={startDemo}
            className="w-full py-3.5 rounded-2xl border-2 border-[#003087]/30 text-[#003087] font-semibold text-sm hover:bg-[#e8f0fb] hover:border-[#003087] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>⚡</span> Demo 30 segundos
          </button>
        )}
        {demoRunning && (
          <div className="w-full py-3.5 rounded-2xl bg-[#e8f0fb] border-2 border-[#003087] flex items-center justify-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-[#003087] animate-pulse" />
            <span className="text-sm font-bold text-[#003087]">Demo en progreso — {demoCountdown}s restantes</span>
          </div>
        )}

        {/* ── SIMULATE CRITICAL (only when running and demo not active) ── */}
        {isRunning && !demoRunning && (
          <button
            id="btn-simulate-critical"
            onClick={simulateCritical}
            className="w-full py-3 rounded-2xl border border-red-200 text-red-500 font-semibold text-xs hover:bg-red-50 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
          >
            <span>🚨</span> Simular Fatiga Crítica
          </button>
        )}

        {/* ── DEMO RESULT MODAL ── */}
        {demoResult && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a1628]/70 backdrop-blur-sm"
            onClick={closeDemo}
          >
            <div
              className="relative w-full max-w-xs bg-white rounded-3xl shadow-2xl border border-[#e2e8f4]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeDemo}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#f0f4fa] flex items-center justify-center text-[#7a8fb0] hover:text-[#0a1628] transition-colors z-10 text-sm"
                aria-label="Cerrar"
              >✕</button>

              <div className="p-5 space-y-4">
                <div className="text-center pr-6">
                  <div className="text-3xl mb-1">📊</div>
                  <h2 className="text-sm font-black text-[#0a1628]">Resultado de sesión demo</h2>
                  <p className="text-[10px] text-[#7a8fb0]">Duración: 30 seg</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      label: 'Estado',
                      value: demoResult.level === 'critical' ? '🚨 Crítico' : demoResult.level === 'warning' ? '⚠️ Moderado' : '✅ Normal',
                      cls: demoResult.level === 'critical' ? 'bg-red-50 border-red-200 text-red-700' : demoResult.level === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700',
                    },
                  ].map(({ label, value, cls }) => (
                    <div key={label} className={`rounded-2xl p-3 text-center border col-span-2 ${cls}`}>
                      <p className="text-[9px] font-bold uppercase tracking-wider opacity-60 mb-1">{label}</p>
                      <p className="text-base font-black">{value}</p>
                    </div>
                  ))}
                  <div className="bg-[#e8f0fb] rounded-2xl p-3 text-center border border-[#cddaf5]">
                    <p className="text-[9px] text-[#003087] font-bold uppercase tracking-wider">Parpadeos/min</p>
                    <p className="text-2xl font-black text-[#003087] mt-1">{demoResult.bpm}</p>
                  </div>
                  <div className="bg-[#f8fafd] rounded-2xl p-3 text-center border border-[#e2e8f4]">
                    <p className="text-[9px] text-[#7a8fb0] font-bold uppercase tracking-wider">EAR prom.</p>
                    <p className="text-2xl font-black text-[#0a1628] mt-1">{demoResult.ear}</p>
                  </div>
                </div>

                <div className={`rounded-2xl p-3 border text-center ${demoResult.level === 'critical' ? 'bg-red-50 border-red-200' : demoResult.level === 'warning' ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
                  <p className={`text-[10px] leading-relaxed font-semibold ${demoResult.level === 'critical' ? 'text-red-700' : demoResult.level === 'warning' ? 'text-amber-700' : 'text-green-700'}`}>
                    {demoResult.level === 'critical'
                      ? '🚨 Fatiga severa detectada. El sistema activó luz cálida.'
                      : demoResult.level === 'warning'
                        ? '⚠️ Fatiga moderada. Se sugiere tomar una pausa breve.'
                        : '✅ Tus niveles son óptimos. ¡Seguí así!'}
                  </p>
                </div>

                <button
                  onClick={closeDemo}
                  className="w-full py-3 rounded-2xl bg-[#003087] hover:bg-[#002070] text-white font-bold text-sm transition-colors"
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
    <div className={`bg-white rounded-2xl p-4 border shadow-sm transition-all ${highlight ? 'border-red-300 bg-red-50/50' :
      warn ? 'border-amber-300 bg-amber-50/30' :
        'border-[#e2e8f4]'
      }`}>
      <p className="text-[9px] text-[#7a8fb0] mb-1.5 font-bold uppercase tracking-wider">{label}</p>
      <p className={`font-black leading-none ${isText ? 'text-base' : 'text-2xl'} ${highlight ? 'text-red-600' :
        warn ? 'text-amber-600' :
          'text-[#0a1628]'
        }`}>
        {value}
        {unit && <span className="text-xs font-semibold text-[#7a8fb0] ml-1">{unit}</span>}
      </p>
    </div>
  );
}
