'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AlertTriangle } from 'lucide-react';
import type { FatigueLevel } from '@/types/telemetry';

// â”€â”€â”€ Ãndices de landmarks de MediaPipe FaceMesh para los ojos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const RIGHT_EYE = [33, 160, 158, 133, 153, 144];
const LEFT_EYE = [362, 385, 387, 263, 373, 380];

// â”€â”€â”€ Constantes del sistema biomÃ©trico â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const BLINK_CONSEC_FRAMES = 2;       // Frames consecutivos para confirmar parpadeo
const BLINK_REFRACTORY_MS = 150;     // Tiempo mÃ­nimo entre parpadeos â€” evita doble-detecciÃ³n
const BPM_CRITICAL_THRESHOLD = 8;       // < 8 bpm = fatiga crÃ­tica
const BPM_WARNING_THRESHOLD = 14;      // < 14 bpm = fatiga moderada
const EAR_MICROSLEEP_THRESH = 0.15;    // EAR < 0.15 = ojo muy cerrado
const EAR_MICROSLEEP_FRAMES = 25;      // ~1 seg con ojo cerrado = microsueÃ±o
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

// ClasificaciÃ³n multi-seÃ±al: BPM + EAR promedio + microsueÃ±os
function classifyFatigue(
  bpm: number,
  avgEAR: number,
  adaptiveThreshold: number,
  microsleepCount: number,
): FatigueLevel {
  if (microsleepCount > 0) return 'critical'; // microsueÃ±o = crÃ­tico
  if (avgEAR > 0 && avgEAR < adaptiveThreshold * 0.65) return 'critical'; // ojo muy cerrado
  if (bpm > 0 && bpm < BPM_CRITICAL_THRESHOLD) return 'critical'; // BPM muy bajo
  if (avgEAR > 0 && avgEAR < adaptiveThreshold * 0.80) return 'warning';  // ojo moderadamente cerrado
  if (bpm > 0 && bpm < BPM_WARNING_THRESHOLD) return 'warning';  // BPM bajo
  return 'normal';
}

// â”€â”€â”€ Componente principal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ CalibraciÃ³n adaptativa del EAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const calibrationBuffer = useRef<number[]>([]);  // EAR samples durante calibraciÃ³n
  const adaptiveThreshold = useRef(0.25);           // Umbral adaptativo
  const isCalibrated = useRef(false);
  const frameCount = useRef(0);

  // â”€â”€ Suavizado EAR anti-jitter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const earSmoothBuffer = useRef<number[]>([]);

  // â”€â”€ DetecciÃ³n de microsueÃ±os â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const microsleepFrames = useRef(0);   // Frames consecutivos con ojo muy cerrado
  const microsleepCount = useRef(0);   // Total de microsueÃ±os detectados

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

  // â”€â”€ career_id real del perfil del usuario â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
        console.error('Error de red al enviar telemetrÃ­a:', e);
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
      if (canvas.width === 0 || canvas.height === 0) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
      if (!results.multiFaceLandmarks?.length) { setFaceDetected(false); return; }

      const landmarks: Landmark[] = results.multiFaceLandmarks[0];
      const earL = computeEAR(landmarks, LEFT_EYE);
      const earR = computeEAR(landmarks, RIGHT_EYE);
      const rawAvg = (earL + earR) / 2;

      // â”€â”€ Suavizado EAR con buffer deslizante â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      earSmoothBuffer.current.push(rawAvg);
      if (earSmoothBuffer.current.length > EAR_SMOOTH_FRAMES)
        earSmoothBuffer.current.shift();
      const avgEAR = earSmoothBuffer.current.reduce((a, b) => a + b, 0) / earSmoothBuffer.current.length;

      setEarLeft(Math.round(earL * 1000) / 1000);
      setEarRight(Math.round(earR * 1000) / 1000);
      setFaceDetected(true);
      frameCount.current += 1;

      // â”€â”€ FASE 1: CalibraciÃ³n adaptativa del umbral EAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      if (!isCalibrated.current) {
        if (rawAvg > 0.15) calibrationBuffer.current.push(rawAvg); // Solo ojos abiertos
        const progress = Math.min(100, Math.round((calibrationBuffer.current.length / CALIBRATION_FRAMES) * 100));
        setCalibProgress(progress);
        if (calibrationBuffer.current.length >= CALIBRATION_FRAMES) {
          const sorted = [...calibrationBuffer.current].sort((a, b) => a - b);
          // Mediana del EAR en reposo
          const median = sorted[Math.floor(sorted.length / 2)];
          // Umbral = 80% de la mediana en reposo (mÃ¡s preciso que un valor fijo)
          adaptiveThreshold.current = median * 0.80;
          isCalibrated.current = true;
          setCalibDone(true);
        }
        // Durante calibraciÃ³n, no detectar parpadeos para evitar falsos positivos
        return;
      }

      const threshold = adaptiveThreshold.current;

      // â”€â”€ DetecciÃ³n de microsueÃ±os (ojo cerrado >1s) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      if (avgEAR < EAR_MICROSLEEP_THRESH) {
        microsleepFrames.current += 1;
        if (microsleepFrames.current === EAR_MICROSLEEP_FRAMES) {
          microsleepCount.current += 1; // Confirmar microsueÃ±o
        }
      } else {
        microsleepFrames.current = 0;
      }

      // â”€â”€ DetecciÃ³n de parpadeos con perÃ­odo refractario â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      if (avgEAR < threshold) {
        earBelowCount.current += 1;
      } else {
        const now = Date.now();
        const timeSinceLastBlink = now - lastBlinkTime.current;
        if (
          earBelowCount.current >= BLINK_CONSEC_FRAMES &&
          earBelowCount.current < EAR_MICROSLEEP_FRAMES && // No contar microsueÃ±os como parpadeos
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

      // Color de puntos segÃºn nivel de fatiga
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
      // Crear sesiÃ³n en DB antes de iniciar la cÃ¡mara
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
          ? 'Permiso de cÃ¡mara denegado. ActÃ­valo en la configuraciÃ³n del navegador.'
          : `Error al iniciar cÃ¡mara: ${err.message}`,
      );
    } finally {
      setIsLoading(false);
    }
  }, [onFaceMeshResults]);

  // â”€â”€ Ref para capturar valores actuales sin cambiar dependencias â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    currentValuesRef.current = { earL: earLeft, earR: earRight, bpm, level: fatigueLevel, blueLight: blueLightActive };
  }, [earLeft, earRight, bpm, fatigueLevel, blueLightActive]);

  const stopMonitor = useCallback(() => {
    // Detener stream de cÃ¡mara INMEDIATAMENTE
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

    // Cerrar sesiÃ³n en DB de forma asincrÃ³nica (sin bloquear cierre de cÃ¡mara)
    if (dbSessionId.current) {
      const sessionId = dbSessionId.current;
      const wasCritical = currentValuesRef.current.level === 'warning' || currentValuesRef.current.level === 'critical';
      dbSessionId.current = null;

      // Enviar telemetrÃ­a final y cerrar sesiÃ³n
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
          console.error('Error al enviar telemetrÃ­a final:', e);
        }

        // Cerrar sesiÃ³n
        try {
          await supabase.rpc('close_study_session', { p_session_id: sessionId });
        } catch (err) {
          console.error('Error al cerrar sesiÃ³n:', err);
        }

        // Activar filtro azul POST-sesiÃ³n si hubo estrÃ©s (solo DESPUÃ‰S de cerrar sesiÃ³n)
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

  // â”€â”€ Demo mode: activa cÃ¡mara + 30 segundos con interpolaciÃ³n suave y ruido realista â”€â”€
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

    // Keyframes principales: normal â†’ warning â†’ critical â†’ recovery
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

    // Actualizar cada ~500ms con pequeÃ±as variaciones realistas (cambio suave)
    const startTime = Date.now();
    const updateInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= 30000) {
        clearInterval(updateInterval);
        return;
      }

      const interpolated = getInterpolated(elapsed);
      // Agregar pequeÃ±o ruido aleatorio para parecer datos reales
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
      // Filtro azul SOLO en crÃ­tico, NO en warning
      setBlueLightActive(level === 'critical');

      // Parpadeos aumentan durante estrÃ©s crÃ­tico
      setBlinkCount(Math.round(interpolated.blinks));
    }, 500);

    // Resultado final a los 30s
    demoTimerRef.current = setTimeout(() => {
      clearInterval(countInterval);
      clearInterval(updateInterval);
      setBlueLightActive(false);
      setDemoRunning(false);

      // Enviar una telemetrÃ­a simulada a la BD para que el historial cuadre con el demo
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

  // â”€â”€â”€ Overlay luz azul â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const overlayStyle = blueLightActive
    ? { position: 'fixed' as const, inset: 0, background: 'rgba(255,150,50,0.15)', mixBlendMode: 'multiply' as const, pointerEvents: 'none' as const, zIndex: 9999, transition: 'opacity 1s ease' }
    : {};

  const fatigueBadge: Record<FatigueLevel, { label: string; cls: string; dot: string }> = {
    normal: { label: 'Normal', cls: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
    warning: { label: 'Fatiga Moderada', cls: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
    critical: { label: 'Fatiga CrÃ­tica', cls: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  };

  // Camera phase:
  // idle â†’ loading â†’ calibrating â†’ running (calibDone) â†’ stopped
  const cameraPhase =
    !isRunning && !isLoading ? 'idle' :
      isLoading ? 'loading' :
        isRunning && !calibDone ? 'calibrating' :
          'running';

  const calibSteps = [
    { done: true, label: 'CÃ¡mara activa' },
    { done: faceDetected, label: 'Cara detectada' },
    { done: calibDone, label: 'CalibraciÃ³n lista' },
  ];


  return (
    <>
      {blueLightActive && <div style={overlayStyle} aria-hidden="true" />}
      <div className="min-h-screen bg-[#f8fafc] pb-28 lg:pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
          <div className="mb-6">
            <h1 className="text-xl lg:text-2xl font-black text-[#0a1628] tracking-tight">Monitor Biometrico</h1>
            <p className="text-sm text-[#7a8fb0] mt-0.5">
              {cameraPhase === "idle" ? "Listo para iniciar" : cameraPhase === "loading" ? "Cargando..." : cameraPhase === "calibrating" ? "Calibrando..." : `Sesion activa - ${sessionMin} min`}
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
            <div className="lg:col-span-3 space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-[#0a1628] w-full aspect-[4/3] flex items-center justify-center shadow-xl ring-1 ring-white/5">
                {cameraPhase === "idle" && (<div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-white"><div className="w-20 h-20 rounded-3xl bg-white/10 border border-white/10 flex items-center justify-center"><span className="text-4xl">ojos</span></div><p className="text-sm font-bold text-white">Monitor biometrico</p></div>)}
                {cameraPhase === "loading" && (<div className="absolute inset-0 flex items-center justify-center bg-[#0a1628] z-10"><div className="w-14 h-14 border-2 border-t-blue-400 rounded-full animate-spin" /></div>)}
                <video ref={videoRef} className={`w-full h-full object-cover ${!isRunning ? "opacity-0 absolute" : ""}`} playsInline muted />
                <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full ${!isRunning ? "opacity-0" : ""}`} />
                {cameraPhase === "running" && (<div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold z-20 ${fatigueBadge[fatigueLevel].cls}`}>{fatigueBadge[fatigueLevel].label}</div>)}
              </div>
              {cameraPhase === "running" && calibDone && !demoRunning && (<div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-2.5"><span>ok</span><p className="text-xs font-bold text-emerald-700">Midiendo en tiempo real</p></div>)}
            </div>
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <MetricBox label="Parpadeos/min" value={isRunning ? bpm : 0} unit="bpm" highlight={fatigueLevel === "critical" && isRunning} warn={fatigueLevel === "warning" && isRunning} />
                <MetricBox label="Estado" value={isRunning ? fatigueBadge[fatigueLevel].label : "-"} isText highlight={fatigueLevel === "critical" && isRunning} warn={fatigueLevel === "warning" && isRunning} />
                <MetricBox label="Duracion" value={isRunning ? `${sessionMin} min` : "-"} isText />
                <MetricBox label="EAR" value={isRunning ? ((earLeft + earRight) / 2).toFixed(3) : "-"} isText={!isRunning} warn={isRunning && ((earLeft + earRight) / 2) < adaptiveThreshold.current && ((earLeft + earRight) / 2) > 0} />
              </div>
              {!isRunning ? (
                <button id="btn-start-monitor" onClick={startMonitor} disabled={isLoading} className="w-full py-4 rounded-2xl bg-[#003087] hover:bg-[#002070] disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2.5">
                  {isLoading ? "Iniciando..." : "Iniciar Monitor"}
                </button>
              ) : (
                <button id="btn-stop-monitor" onClick={stopMonitor} className="w-full py-4 rounded-2xl bg-[#f0f4fa] text-[#0a1628] font-bold text-sm flex items-center justify-center gap-2">Detener</button>
              )}
              {!demoRunning && !demoResult && !isRunning && (<button id="btn-demo-session" onClick={startDemo} className="w-full py-3.5 rounded-2xl border-2 border-[#003087]/30 text-[#003087] font-semibold text-sm hover:bg-[#e8f0fb] flex items-center justify-center gap-2">Demo 30s</button>)}
              {demoRunning && (<div className="w-full py-3.5 rounded-2xl bg-[#e8f0fb] border-2 border-[#003087] flex items-center justify-center gap-2.5"><div className="w-3 h-3 rounded-full bg-[#003087] animate-pulse" /><span className="text-sm font-bold text-[#003087]">Demo - {demoCountdown}s</span></div>)}
              {isRunning && !demoRunning && (<button id="btn-simulate-critical" onClick={simulateCritical} className="w-full py-3 rounded-2xl border border-red-200 text-red-500 text-xs hover:bg-red-50 flex items-center justify-center gap-1.5">Simular Fatiga</button>)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function MetricBox({ label, value, unit, isText, highlight, warn }: { label: string; value: number | string; unit?: string; isText?: boolean; highlight?: boolean; warn?: boolean; }) {
  return (
    <div className={`bg-white rounded-2xl p-4 border shadow-sm ${highlight ? "border-red-300 bg-red-50/50" : warn ? "border-amber-300 bg-amber-50/30" : "border-[#e2e8f4]"}`}>
      <p className="text-[9px] text-[#7a8fb0] mb-1.5 font-bold uppercase tracking-wider">{label}</p>
      <p className={`font-black leading-none ${isText ? "text-base" : "text-2xl"} ${highlight ? "text-red-600" : warn ? "text-amber-600" : "text-[#0a1628]"}`}>
        {value}{unit && <span className="text-xs font-semibold text-[#7a8fb0] ml-1">{unit}</span>}
      </p>
    </div>
  );
}
