import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'BiometricOS — Mapa de Fatiga',
  description: 'Mapa de fatiga del campus',
};

type FatigueLevel = 'normal' | 'warning' | 'critical' | 'none';

// Esquema real de campus_sectors (MIGRATION_UNIVERSITIES.sql)
type Sector = { id: string; name: string; type: string; campus: string };

const TYPE_LABEL: Record<string, string> = {
  biblioteca:  '📚 Biblioteca',
  laboratorio: '🖥️ Laboratorio',
  sala:        '📖 Salas de estudio',
  espacio:     '☕ Espacios abiertos',
};

function levelColor(level: FatigueLevel): string {
  switch (level) {
    case 'critical': return 'bg-red-600';
    case 'warning':  return 'bg-orange-500';
    case 'normal':   return 'bg-green-500';
    default:         return 'bg-gray-600';
  }
}

export default async function HeatmapPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Perfil del usuario
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await supabase
    .from('profiles')
    .select('university, campus, study_room, university_id')
    .eq('id', user.id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const universityId   = (profile as any)?.university_id ?? null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userCampus     = (profile as any)?.campus        ?? null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userRoom       = (profile as any)?.study_room    ?? null;
  const universityName = profile?.university              ?? 'Tu Universidad';

  // ── Sectores reales del campus_sectors ──────────────────────────────────────
  // Schema real: { id, university_id, campus, name, type, created_at }
  let sectors: Sector[] = [];
  if (universityId) {
    let query = supabase
      .from('campus_sectors')
      .select('id, name, type, campus')
      .eq('university_id', universityId)
      .order('type')
      .order('name');

    // Filtrar por campus si el usuario tiene uno asignado
    if (userCampus) {
      query = query.eq('campus', userCampus);
    }

    const { data } = await query;
    sectors = (data ?? []) as Sector[];
  }

  // ── Telemetría reciente del usuario ─────────────────────────────────────────
  const twoHoursAgo = new Date(Date.now() - 2 * 3_600_000).toISOString();
  const { data: rawTel } = await supabase
    .from('telemetry_logs')
    .select('fatigue_level')
    .eq('student_anon_id', user.id)
    .gte('created_at', twoHoursAgo);

  const recentTel = rawTel ?? [];
  let userLevel: FatigueLevel = 'none';
  if (recentTel.length > 0) {
    const hasCritical = recentTel.some((t) => t.fatigue_level === 'critical');
    const hasWarning  = recentTel.some((t) => t.fatigue_level === 'warning');
    userLevel = hasCritical ? 'critical' : hasWarning ? 'warning' : 'normal';
  }

  // ── Agrupar por tipo (schema real) ──────────────────────────────────────────
  const typeOrder = ['biblioteca', 'laboratorio', 'sala', 'espacio'];
  const types = typeOrder.filter((t) => sectors.some((s) => s.type === t));
  // Tipos no contemplados en el orden fijo
  const extraTypes = [...new Set(sectors.map((s) => s.type))].filter((t) => !typeOrder.includes(t));
  const allTypes = [...types, ...extraTypes];

  const sectorsByType = new Map<string, Sector[]>();
  sectors.forEach((s) => {
    const arr = sectorsByType.get(s.type) ?? [];
    arr.push(s);
    sectorsByType.set(s.type, arr);
  });

  const hasRealSectors = sectors.length > 0;

  // Salas demo si no hay sectores
  const demoRooms = [
    { name: 'Sala A', level: 'critical' as FatigueLevel },
    { name: 'Sala B', level: 'warning'  as FatigueLevel },
    { name: 'Sala C', level: 'normal'   as FatigueLevel },
    { name: 'Lab 1',  level: 'critical' as FatigueLevel },
    { name: 'Lab 2',  level: 'warning'  as FatigueLevel },
    { name: 'Bib.',   level: 'normal'   as FatigueLevel },
  ];

  return (
    <div className="p-4 space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase mb-0.5">
          {userCampus ? `${userCampus} — Mapa de Fatiga` : `${universityName} — Mapa de Fatiga`}
        </h1>
        <p className="text-[10px] text-gray-400">Actualización en tiempo real</p>
      </div>

      {/* Tu estado actual */}
      {userLevel !== 'none' && (
        <div className={cn(
          'rounded-2xl p-4 border flex items-center gap-3',
          userLevel === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50'
          : userLevel === 'warning' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800/50'
          : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50',
        )}>
          <div className={cn('w-3 h-3 rounded-full animate-pulse flex-shrink-0', levelColor(userLevel))} />
          <div>
            <p className={cn('text-sm font-bold',
              userLevel === 'critical' ? 'text-red-700 dark:text-red-300'
              : userLevel === 'warning' ? 'text-orange-700 dark:text-orange-300'
              : 'text-green-700 dark:text-green-300',
            )}>
              Tu estado: {userLevel === 'critical' ? 'Fatiga Crítica' : userLevel === 'warning' ? 'Fatiga Moderada' : 'Normal'}
            </p>
            {userRoom && (
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {userRoom}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Mapa por tipo de espacio */}
      <section className="bg-white dark:bg-[#1a2332] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        {hasRealSectors ? (
          <>
            {allTypes.map((type) => (
              <div key={type} className="mb-5 last:mb-0">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {TYPE_LABEL[type] ?? type}
                  </span>
                  <span className="text-[10px] flex items-center gap-1 text-red-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
                    En vivo
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {(sectorsByType.get(type) ?? []).map((sector) => {
                    const isUserRoom = userRoom && sector.name === userRoom;
                    const roomLevel: FatigueLevel = isUserRoom && userLevel !== 'none' ? userLevel : 'normal';
                    return (
                      <div
                        key={sector.id}
                        className={cn(
                          'aspect-square rounded-md flex flex-col items-center justify-center gap-0.5 shadow-sm cursor-pointer hover:opacity-80 transition-opacity relative',
                          isUserRoom ? 'ring-2 ring-white ring-offset-1 ring-offset-blue-500' : '',
                          levelColor(roomLevel),
                        )}
                      >
                        {isUserRoom && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border border-white" />
                        )}
                        <span className="text-[7px] font-bold text-white/90 text-center leading-tight px-0.5 line-clamp-2">
                          {sector.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            {/* Sin datos: modo demo */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{universityName}</span>
              <span className="text-[10px] flex items-center gap-1 text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
                Demo
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 mb-4">
              {demoRooms.map((r) => (
                <div key={r.name} className={cn('aspect-square rounded-md flex items-center justify-center shadow-sm', levelColor(r.level))}>
                  <span className="text-[9px] font-bold text-white/90">{r.name}</span>
                </div>
              ))}
            </div>
            {/* Mensaje útil pero sin pedir ejecutar SQL */}
            {!universityId ? (
              <p className="text-[10px] text-gray-400 text-center">
                Completa tu perfil seleccionando una universidad para ver los sectores reales de tu campus.
              </p>
            ) : (
              <p className="text-[10px] text-gray-400 text-center">
                No hay sectores registrados para tu campus todavía.
              </p>
            )}
          </>
        )}

        {/* Leyenda */}
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[10px] text-gray-400">
          <span>Bajo</span>
          <div className="flex gap-0.5 items-center">
            <div className="w-4 h-2 rounded-sm bg-green-500" />
            <div className="w-4 h-2 rounded-sm bg-orange-500" />
            <div className="w-4 h-2 rounded-sm bg-red-500" />
            <div className="w-4 h-2 rounded-sm bg-red-700" />
          </div>
          <span>Crítico</span>
        </div>

        {userRoom && (
          <div className="mt-3 flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <div className="w-3 h-3 rounded-full bg-blue-500 ring-2 ring-white flex-shrink-0" />
            <span className="text-[10px] text-blue-600 dark:text-blue-400">Tu sala habitual: {userRoom}</span>
          </div>
        )}
      </section>

      {/* Nota informativa */}
      <div className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
        <p className="text-[10px] text-gray-500 leading-relaxed">
          El mapa muestra los niveles de fatiga en tiempo real. Los colores se actualizan cada 30 segundos durante las sesiones activas.
          {!userRoom && ' Configura tu sala habitual en Ajustes para verte destacado.'}
        </p>
      </div>

    </div>
  );
}
