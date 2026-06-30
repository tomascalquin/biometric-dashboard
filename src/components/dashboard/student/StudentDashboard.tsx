'use client';

import { Activity, Clock, Bell, ArrowRight, Zap, ChevronRight, Camera, TrendingDown, TrendingUp, Minus, Brain, BarChart3, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { FatigueLevel } from '@/types/telemetry';

interface StudentDashboardProps {
  careerName:     string | null;
  avgBpm:         number | null;
  alertsToday:    number;
  dominantLevel:  FatigueLevel | null;
  sessionMin:     number | null;
  sessionSubject: string | null;
}

export function StudentDashboard({
  careerName,
  avgBpm,
  alertsToday,
  dominantLevel,
  sessionMin,
  sessionSubject,
}: StudentDashboardProps) {

  const hasData     = avgBpm !== null;
  const isActive    = sessionMin !== null;
  const currentLevel: FatigueLevel = dominantLevel ?? 'normal';

  const levelConfig: Record<FatigueLevel, {
    label: string; short: string; emoji: string; dot: string;
    badge: string; bar: string; bg: string; ring: string;
    TrendIcon: React.ElementType;
  }> = {
    normal:   { label: 'Óptimo',   short: 'Óptimo',   emoji: '🟢', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', bar: 'bg-emerald-500', bg: 'bg-emerald-50', ring: 'ring-emerald-200', TrendIcon: TrendingDown },
    warning:  { label: 'Moderado', short: 'Moderado', emoji: '🟡', dot: 'bg-amber-500',   badge: 'bg-amber-50 text-amber-700 border-amber-200',       bar: 'bg-amber-500',   bg: 'bg-amber-50',   ring: 'ring-amber-200',   TrendIcon: Minus        },
    critical: { label: 'Crítico',  short: 'Crítico',  emoji: '🔴', dot: 'bg-red-500',     badge: 'bg-red-50 text-red-700 border-red-200',             bar: 'bg-red-500',     bg: 'bg-red-50',     ring: 'ring-red-200',     TrendIcon: TrendingUp   },
  };

  const cfg = levelConfig[currentLevel];

  return (
    <div className="min-h-screen bg-[#f8fafc]">

      {/* ══════════════════════════════════════════════════════════════
          LAYOUT DE DOS COLUMNAS EN DESKTOP / SINGLE EN MOBILE
      ══════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 pb-28 lg:pb-10">

        {/* DESKTOP: 2 columnas — MOBILE: 1 columna */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

          {/* ── COLUMNA IZQUIERDA (1/3): Estado + CTA ── */}
          <div className="space-y-5">

            {/* Header */}
            <div>
              <p className="text-xs font-bold text-[#7a8fb0] uppercase tracking-widest mb-1">
                BiometricOS · {careerName ?? 'UAI'}
              </p>
              <h1 className="text-2xl lg:text-3xl font-black text-[#0a1628] leading-tight">
                {isActive
                  ? `Sesión activa`
                  : hasData ? 'Tu estado hoy' : 'Bienvenido'}
              </h1>
              {isActive && (
                <p className="text-sm text-[#7a8fb0] mt-1 font-medium">
                  {sessionSubject ?? 'Sesión en curso'} · {sessionMin} min transcurridos
                </p>
              )}
            </div>

            {/* ── CTA MONITOR — protagonista ── */}
            <Link
              href="/dashboard/monitor"
              id="btn-iniciar-monitor"
              className={cn(
                'flex items-center justify-between w-full rounded-2xl px-5 py-5 shadow-lg transition-all active:scale-[0.98] group',
                isActive
                  ? 'bg-emerald-500 shadow-emerald-500/30 hover:bg-emerald-600'
                  : 'bg-[#003087] shadow-[#003087]/30 hover:bg-[#002070]'
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                  isActive ? 'bg-white/20' : 'bg-white/15'
                )}>
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-base font-black text-white leading-tight">
                    {isActive ? 'Ver monitor activo' : 'Activar cámara biométrica'}
                  </p>
                  <p className="text-xs text-white/70 mt-0.5">
                    {isActive ? 'Grabando en tiempo real…' : 'Detecta fatiga · 1 clic para comenzar'}
                  </p>
                </div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* Guía de uso — solo si no tiene datos */}
            {!hasData && (
              <div className="bg-white rounded-2xl border border-[#e2e8f4] shadow-sm p-5">
                <p className="text-[10px] font-black text-[#7a8fb0] uppercase tracking-widest mb-4">
                  Cómo funciona en 3 pasos
                </p>
                <div className="space-y-4">
                  {[
                    { step: '1', icon: '📷', title: 'Activa la cámara', desc: 'Pulsa el botón azul de arriba' },
                    { step: '2', icon: '👁️', title: 'Estudia normalmente', desc: 'Mantén la cara frente a la pantalla' },
                    { step: '3', icon: '📊', title: 'Recibe tus métricas', desc: 'La IA detecta tu fatiga en tiempo real' },
                  ].map(({ step, icon, title, desc }) => (
                    <div key={step} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-xl bg-[#003087] flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-[11px] font-black text-white">{step}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0a1628]">{icon} {title}</p>
                        <p className="text-xs text-[#7a8fb0] mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recomendación contextual */}
            <div className="bg-[#e8f0fb] rounded-2xl p-4 border border-[#cddaf5] flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#003087] flex items-center justify-center flex-shrink-0 mt-0.5 text-base leading-none">
                💡
              </div>
              <div>
                <p className="text-[10px] font-black text-[#003087] mb-1 uppercase tracking-wider">Recomendación UAI</p>
                <p className="text-[12px] text-[#3a4a6b] leading-relaxed">
                  {!hasData
                    ? 'Activa el monitor mientras estudias para obtener tu primera lectura biométrica.'
                    : currentLevel === 'critical'
                    ? 'Tu fatiga es alta. Toma un descanso de 10 minutos antes de continuar.'
                    : currentLevel === 'warning'
                    ? 'Fatiga moderada detectada. Una pausa breve de 5 minutos te ayudará a rendir mejor.'
                    : 'Tu estado biométrico es óptimo. ¡Sigue así y mantén el rendimiento!'}
                </p>
              </div>
            </div>

            {/* Accesos rápidos */}
            <div className="space-y-2">
              {[
                { href: '/dashboard/history', label: 'Ver historial biométrico',  sub: 'Gráficos y sesiones', Icon: BarChart3,  emoji: '📊' },
                { href: '/dashboard/alerts',  label: 'Alertas y reportes',        sub: 'Episodios detectados', Icon: Bell,       emoji: '🔔' },
              ].map(({ href, label, sub, emoji }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-[#e2e8f4] shadow-sm hover:border-[#003087]/30 hover:bg-[#f8fafd] transition-all group active:scale-[0.99]"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#e8f0fb] flex items-center justify-center flex-shrink-0 text-lg">
                    {emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#0a1628] group-hover:text-[#003087] transition-colors">{label}</p>
                    <p className="text-[10px] text-[#7a8fb0]">{sub}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#b0bdd6] group-hover:text-[#003087] transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* ── COLUMNA DERECHA (2/3): Métricas + Dashboard ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* ── SIN DATOS: Pantalla de bienvenida ── */}
            {!hasData ? (
              <div className="bg-white rounded-3xl border border-[#e2e8f4] shadow-sm overflow-hidden">
                {/* Banner hero */}
                <div className="bg-gradient-to-br from-[#003087] to-[#0055cc] p-10 lg:p-16 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 right-4 w-40 h-40 rounded-full border-2 border-white" />
                    <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full border-2 border-white" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-white" />
                  </div>
                  <div className="relative z-10">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-2xl">
                      <Brain className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-white text-2xl lg:text-3xl font-black mb-2">Sistema Biométrico UAI</h2>
                    <p className="text-blue-200 text-sm lg:text-base max-w-md leading-relaxed">
                      Monitorea tu fatiga cognitiva en tiempo real usando reconocimiento facial avanzado y análisis de parpadeo EAR.
                    </p>
                  </div>
                </div>
                {/* Características */}
                <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { icon: '⚡', title: 'Tiempo real', desc: 'Detección instantánea de microsueños y fatiga aguda' },
                    { icon: '🔒', title: 'Anónimo', desc: 'Solo se procesan puntos faciales, no se graba video' },
                    { icon: '📈', title: 'Historial', desc: 'Evolución de tus métricas a lo largo del semestre' },
                  ].map(({ icon, title, desc }) => (
                    <div key={title} className="text-center p-4">
                      <div className="text-3xl mb-2">{icon}</div>
                      <p className="text-sm font-bold text-[#0a1628] mb-1">{title}</p>
                      <p className="text-xs text-[#7a8fb0] leading-relaxed">{desc}</p>
                    </div>
                  ))}
                </div>
                <div className="px-6 pb-6 text-center">
                  <Link
                    href="/dashboard/monitor"
                    className="inline-flex items-center gap-2 bg-[#003087] text-white text-sm font-bold px-8 py-3.5 rounded-xl hover:bg-[#002070] transition-all active:scale-95 shadow-lg shadow-[#003087]/20"
                  >
                    <Camera className="w-4 h-4" />
                    Comenzar ahora · Es gratis
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* ── ESTADO BIOMÉTRICO ACTUAL ── */}
                <div>
                  <h2 className="text-xs font-bold text-[#7a8fb0] mb-4 tracking-widest uppercase">
                    Estado biométrico hoy
                  </h2>

                  {/* KPI cards — 2×2 en mobile, 4 en línea en desktop */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">

                    {/* Parpadeos */}
                    <div className="bg-white rounded-2xl p-5 border border-[#e2e8f4] shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                          <Activity className="w-4 h-4 text-blue-600" />
                        </div>
                        <p className="text-[10px] font-bold text-[#7a8fb0] uppercase tracking-wider">Parpadeos</p>
                      </div>
                      <p className="text-4xl font-black text-[#0a1628] leading-none tabular-nums">
                        {avgBpm}
                      </p>
                      <p className="text-xs text-[#7a8fb0] mt-1 font-medium">por minuto</p>
                      <div className="mt-3">
                        <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border', cfg.badge)}>
                          <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
                          {cfg.label}
                        </span>
                      </div>
                    </div>

                    {/* Nivel de fatiga */}
                    <div className={cn('rounded-2xl p-5 border shadow-sm hover:shadow-md transition-shadow', cfg.bg, `border-${cfg.ring}`)}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center">
                          <Zap className="w-4 h-4 text-[#0a1628]" />
                        </div>
                        <p className="text-[10px] font-bold text-[#7a8fb0] uppercase tracking-wider">Fatiga</p>
                      </div>
                      <p className="text-4xl font-black text-[#0a1628] leading-none">
                        {cfg.emoji}
                      </p>
                      <p className="text-sm font-black text-[#0a1628] mt-1">{cfg.short}</p>
                      <p className="text-xs text-[#7a8fb0] mt-1">nivel actual</p>
                    </div>

                    {/* Sesión activa */}
                    <div className="bg-white rounded-2xl p-5 border border-[#e2e8f4] shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                          <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                        <p className="text-[10px] font-bold text-[#7a8fb0] uppercase tracking-wider">Sesión</p>
                      </div>
                      <p className="text-4xl font-black text-[#0a1628] leading-none tabular-nums">
                        {sessionMin ?? '—'}
                      </p>
                      <p className="text-xs text-[#7a8fb0] mt-1 font-medium">
                        {sessionMin !== null ? 'minutos en curso' : 'sin sesión activa'}
                      </p>
                      {sessionSubject && (
                        <p className="text-[10px] text-[#0a1628] font-bold mt-2 truncate">{sessionSubject}</p>
                      )}
                    </div>

                    {/* Alertas */}
                    {alertsToday > 0 ? (
                      <Link href="/dashboard/history" className="block">
                        <div className="bg-red-50 rounded-2xl p-5 border border-red-200 shadow-sm hover:shadow-md transition-all h-full hover:bg-red-100">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                              <Bell className="w-4 h-4 text-red-600" />
                            </div>
                            <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Alertas</p>
                          </div>
                          <p className="text-4xl font-black text-red-600 leading-none tabular-nums">{alertsToday}</p>
                          <p className="text-xs text-red-500 mt-1 font-medium">episodios hoy</p>
                          <p className="text-[10px] text-red-400 mt-2 flex items-center gap-1 font-bold">
                            Ver historial <ArrowRight className="w-3 h-3" />
                          </p>
                        </div>
                      </Link>
                    ) : (
                      <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <Bell className="w-4 h-4 text-emerald-600" />
                          </div>
                          <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Alertas</p>
                        </div>
                        <p className="text-4xl font-black text-emerald-700 leading-none">0</p>
                        <p className="text-xs text-emerald-600 mt-1 font-medium">sin episodios hoy</p>
                        <p className="text-[10px] text-emerald-500 mt-2 font-bold">✓ Todo bajo control</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── SESIÓN ACTUAL / HISTORIAL ── */}
                <div className="bg-white rounded-2xl border border-[#e2e8f4] shadow-sm overflow-hidden">
                  <div className="px-5 pt-5 pb-4 border-b border-[#f0f4fa] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#003087]" />
                      <h2 className="text-xs font-bold text-[#7a8fb0] tracking-widest uppercase">
                        Sesión activa
                      </h2>
                    </div>
                    <Link href="/dashboard/history" className="text-[10px] text-[#0066cc] font-bold hover:underline flex items-center gap-1">
                      Ver todo <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl',
                        currentLevel === 'critical' ? 'bg-red-50' : currentLevel === 'warning' ? 'bg-amber-50' : 'bg-emerald-50'
                      )}>
                        {cfg.emoji}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-black text-[#0a1628] truncate">{sessionSubject ?? 'Sesión de estudio'}</p>
                        <p className="text-xs text-[#7a8fb0] mt-0.5">
                          {avgBpm} parp/min · {cfg.label}
                          {sessionMin !== null ? ` · ${sessionMin} min` : ''}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={cn('w-3 h-3 rounded-full animate-pulse mx-auto mb-1', cfg.dot)} />
                        <p className="text-[10px] text-[#7a8fb0] font-bold">En vivo</p>
                      </div>
                    </div>

                    {/* Mini barra de nivel */}
                    <div className="mt-5">
                      <div className="flex justify-between text-[10px] text-[#b0bdd6] font-medium mb-1.5">
                        <span>Índice de fatiga</span>
                        <span>{avgBpm !== null ? Math.round(Math.max(0, Math.min(100, 100 - (avgBpm / 25) * 100))) : 0}%</span>
                      </div>
                      <div className="w-full bg-[#f0f4fa] rounded-full h-2 overflow-hidden">
                        <div
                          className={cn('h-2 rounded-full transition-all duration-700', cfg.bar)}
                          style={{ width: `${avgBpm !== null ? Math.max(2, Math.round(Math.max(0, Math.min(100, 100 - (avgBpm / 25) * 100)))) : 2}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] text-[#b0bdd6] mt-1">
                        <span>Óptimo</span>
                        <span>Moderado</span>
                        <span>Crítico</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
