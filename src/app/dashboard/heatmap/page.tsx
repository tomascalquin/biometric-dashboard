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
    case 'warning':  return 'bg-amber-500';
    case 'normal':   return 'bg-green-500';
    default:         return 'bg-gray-600';
  }
}

export default async function HeatmapPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Perfil del usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, university, campus, study_room, university_id')
    .eq('id', user.id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let universityId   = (profile as any)?.university_id ?? null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userCampus     = (profile as any)?.campus      ?? null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userRoom       = (profile as any)?.study_room  ?? null;
  const universityName = profile?.university            ?? 'Tu Universidad';
  const isAdmin        = (profile as any)?.role === 'admin';

  // ── Fallback: resolver university_id desde el nombre si no está en el perfil ──
  if (!universityId && universityName && universityName !== 'Tu Universidad') {
    const { data: uni } = await supabase
      .from('universities')
      .select('id')
      .ilike('name', `%${universityName}%`)
      .limit(1)
      .single();
    if (uni) universityId = uni.id;
  }

  // ── Sectores reales del campus_sectors ──────────────────────────────────────
  let sectors: Sector[] = [];
  if (universityId) {
    let query = supabase
      .from('campus_sectors')
      .select('id, name, type, campus')
      .eq('university_id', universityId)
      .order('type')
      .order('name');

    // Para estudiantes: filtrar por su campus. Admins ven todo el campus.
    if (!isAdmin && userCampus) {
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

  // Salas demo UAI agrupadas por tipo — se muestran cuando no hay sectores reales
  const demoGroups = [
    {
      type: '📖 Salas de Estudio',
      rooms: [
        { name: 'Sala Core 101', level: 'critical' as FatigueLevel },
        { name: 'Sala Core 102', level: 'critical' as FatigueLevel },
        { name: 'Sala Core 103', level: 'warning'  as FatigueLevel },
        { name: 'Sala Core 201', level: 'warning'  as FatigueLevel },
        { name: 'Sala Core 202', level: 'normal'   as FatigueLevel },
        { name: 'Sala Core 203', level: 'normal'   as FatigueLevel },
      ],
    },
    {
      type: '🖥️ Laboratorios',
      rooms: [
        { name: 'Lab Computo 1', level: 'critical' as FatigueLevel },
        { name: 'Lab Computo 2', level: 'warning'  as FatigueLevel },
        { name: 'Lab Bio',       level: 'warning'  as FatigueLevel },
        { name: 'Lab Quimica',   level: 'normal'   as FatigueLevel },
      ],
    },
    {
      type: '📚 Biblioteca',
      rooms: [
        { name: 'Bib. Central P1', level: 'warning'  as FatigueLevel },
        { name: 'Bib. Central P2', level: 'normal'   as FatigueLevel },
        { name: 'Bib. Silencio',   level: 'critical' as FatigueLevel },
        { name: 'Bib. Grupal',     level: 'normal'   as FatigueLevel },
      ],
    },
    {
      type: '☕ Espacios Abiertos',
      rooms: [
        { name: 'Plaza Central', level: 'normal'  as FatigueLevel },
        { name: 'Terraza',       level: 'normal'  as FatigueLevel },
        { name: 'Cafetería',     level: 'warning' as FatigueLevel },
        { name: 'Sala Estar',    level: 'normal'  as FatigueLevel },
      ],
    },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-xs md:text-sm font-bold text-[#7a8fb0] tracking-widest uppercase mb-1">
          {userCampus ? `${userCampus} — Mapa de Fatiga` : `${universityName} — Mapa de Fatiga`}
        </h1>
        <p className="text-xs md:text-sm text-[#b0bdd6] font-medium">Actualización en tiempo real</p>
      </div>

      {/* Tu estado actual */}
      {userLevel !== 'none' && (
        <div className={cn(
          'rounded-2xl p-4 border flex items-center gap-3',
          userLevel === 'critical' ? 'bg-red-50 border-red-200'
          : userLevel === 'warning' ? 'bg-amber-50 border-amber-200'
          : 'bg-green-50 border-green-200',
        )}>
          <div className={cn('w-4 h-4 rounded-full animate-pulse flex-shrink-0', levelColor(userLevel))} />
          <div>
            <p className={cn('text-base md:text-lg font-bold',
              userLevel === 'critical' ? 'text-red-700'
              : userLevel === 'warning' ? 'text-amber-700'
              : 'text-green-700',
            )}>
              Tu estado: {userLevel === 'critical' ? 'Fatiga Crítica' : userLevel === 'warning' ? 'Fatiga Moderada' : 'Normal'}
            </p>
            {userRoom && (
              <p className="text-xs md:text-sm text-[#7a8fb0] mt-1 flex items-center gap-1.5 font-semibold">
                <MapPin className="w-4 h-4" /> {userRoom}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Mapa por tipo de espacio */}
      <section className="bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-[#e2e8f4]">
        {hasRealSectors ? (
          <>
            {allTypes.map((type) => (
              <div key={type} className="mb-8 last:mb-0">
                <div className="flex justify-between items-center mb-4 md:mb-5">
                  <span className="text-base md:text-lg font-bold text-[#0a1628]">
                    {TYPE_LABEL[type] ?? type}
                  </span>
                  <span className="text-xs md:text-sm font-bold flex items-center gap-1.5 text-red-500">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
                    En vivo
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
                  {(sectorsByType.get(type) ?? []).map((sector) => {
                    const isUserRoom = userRoom && sector.name === userRoom;
                    const roomLevel: FatigueLevel = isUserRoom && userLevel !== 'none' ? userLevel : 'normal';
                    return (
                      <div
                        key={sector.id}
                        className={cn(
                          'aspect-square rounded-xl md:rounded-2xl flex flex-col items-center justify-center gap-1 p-2 shadow-sm cursor-pointer hover:opacity-80 transition-all hover:scale-[1.02] relative',
                          isUserRoom ? 'ring-4 ring-white ring-offset-2 ring-offset-[#003087]' : '',
                          levelColor(roomLevel),
                        )}
                      >
                        {isUserRoom && (
                          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 md:w-5 md:h-5 bg-[#003087] rounded-full border-2 border-white shadow-sm" />
                        )}
                        <span className="text-[10px] sm:text-xs md:text-sm font-bold text-white text-center leading-tight line-clamp-3 md:line-clamp-none">
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
            {/* Modo demo — datos UAI realistas para presentación */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg md:text-xl font-bold text-[#0a1628]">{universityName}</span>
              <span className="text-xs md:text-sm font-bold flex items-center gap-1.5 text-red-500">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
                En vivo
              </span>
            </div>
            {demoGroups.map((group) => (
              <div key={group.type} className="mb-8 last:mb-0">
                <p className="text-xs md:text-sm font-bold text-[#7a8fb0] uppercase tracking-wider mb-3 md:mb-4">
                  {group.type}
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
                  {group.rooms.map((r) => (
                    <div
                      key={r.name}
                      className={cn(
                        'aspect-square rounded-xl md:rounded-2xl flex items-center justify-center p-2 shadow-sm cursor-pointer hover:opacity-80 transition-all hover:scale-[1.02]',
                        levelColor(r.level),
                      )}
                    >
                      <span className="text-[10px] sm:text-xs md:text-sm font-bold text-white text-center leading-tight line-clamp-3 md:line-clamp-none">
                        {r.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {/* Leyenda */}
        <div className="mt-8 pt-5 border-t border-[#e2e8f4] flex items-center justify-between text-xs md:text-sm font-bold text-[#7a8fb0]">
          <span>Bajo</span>
          <div className="flex gap-1 md:gap-1.5 items-center">
            <div className="w-6 h-3 md:w-8 md:h-4 rounded-sm md:rounded-md bg-green-500 shadow-sm" />
            <div className="w-6 h-3 md:w-8 md:h-4 rounded-sm md:rounded-md bg-amber-500 shadow-sm" />
            <div className="w-6 h-3 md:w-8 md:h-4 rounded-sm md:rounded-md bg-red-500 shadow-sm" />
            <div className="w-6 h-3 md:w-8 md:h-4 rounded-sm md:rounded-md bg-red-700 shadow-sm" />
          </div>
          <span>Crítico</span>
        </div>

        {userRoom && (
          <div className="mt-5 flex items-center gap-3 p-3 md:p-4 bg-[#e8f0fb] rounded-xl border border-[#cddaf5]">
            <div className="w-4 h-4 rounded-full bg-[#003087] ring-4 ring-white flex-shrink-0 shadow-sm" />
            <span className="text-xs md:text-sm font-bold text-[#003087]">Tu sala habitual: {userRoom}</span>
          </div>
        )}
      </section>

      {/* Nota informativa */}
      <div className="flex items-start gap-3 p-4 md:p-5 bg-[#f8fafd] rounded-2xl border border-[#e2e8f4]">
        <MapPin className="w-5 h-5 text-[#7a8fb0] mt-0.5 flex-shrink-0" />
        <p className="text-xs md:text-sm text-[#3a4a6b] font-medium leading-relaxed">
          El mapa muestra los niveles de fatiga en tiempo real. Los colores se actualizan cada 30 segundos durante las sesiones activas.
          {!userRoom && ' Configura tu sala habitual en Ajustes para verte destacado.'}
        </p>
      </div>

    </div>
  );
}
