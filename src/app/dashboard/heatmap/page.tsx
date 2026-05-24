import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HeatmapPage() {
  const floors = ['Piso 1', 'Piso 2', 'Piso 3'];
  const activeFloor = 'Piso 2';

  return (
    <div className="p-4 space-y-5">

      {/* Header */}
      <div>
        <h2 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase mb-0.5">Campus Peñalolén — Mapa de Fatiga</h2>
        <p className="text-[10px] text-gray-400">Actualización en tiempo real</p>
      </div>

      {/* Mapa */}
      <section className="bg-white dark:bg-[#1a2332] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">

        {/* Tabs de Pisos */}
        <div className="flex gap-2 mb-5">
          {floors.map(floor => (
            <button
              key={floor}
              className={cn(
                "px-4 py-1.5 text-xs font-semibold rounded-full transition-all",
                floor === activeFloor
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
            >
              {floor}
            </button>
          ))}
        </div>

        {/* Mapa oscuro de salas */}
        <div className="bg-[#0f1923] rounded-2xl p-4 text-white">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-semibold">Piso 2 — Ing. Informática</span>
            <span className="text-[10px] flex items-center gap-1 text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
              En vivo
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 mb-5">
            <RoomBox name="C201" color="bg-red-600" />
            <RoomBox name="C202" color="bg-red-600" />
            <RoomBox name="C203" color="bg-red-500" />
            <RoomBox name="C204" color="bg-red-600" />
            <RoomBox name="C205" color="bg-red-500" />
            <RoomBox name="C206" color="bg-orange-500" />
            <RoomBox name="C207" color="bg-orange-500" />
            <RoomBox name="Lab3" color="bg-red-600" />
            <RoomBox name="Lab4" color="bg-orange-500" />
            <RoomBox name="Lab5" color="bg-yellow-500" />
            <RoomBox name="Lab6" color="bg-yellow-400" />
            <RoomBox name="C210" color="bg-green-500" />
            <RoomBox name="C211" color="bg-green-500" />
            <RoomBox name="C212" color="bg-yellow-500" />
            <RoomBox name="Sala" color="bg-red-600" />
          </div>

          {/* Leyenda */}
          <div className="flex items-center justify-between text-[10px] text-gray-400">
            <span>Bajo</span>
            <div className="flex gap-0.5 items-center">
              <div className="w-4 h-2 rounded-sm bg-green-500" />
              <div className="w-4 h-2 rounded-sm bg-yellow-400" />
              <div className="w-4 h-2 rounded-sm bg-orange-500" />
              <div className="w-4 h-2 rounded-sm bg-red-500" />
              <div className="w-4 h-2 rounded-sm bg-red-700" />
            </div>
            <span>Crítico</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
          <MapPin className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
          <span className="text-xs text-gray-500">Toca una sala para ver su detalle</span>
        </div>
      </section>

      {/* Top salas críticas */}
      <section className="bg-white dark:bg-[#1a2332] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase mb-4">Top Salas Críticas — Ing. Informática</h3>
        <div className="space-y-4">
          <TopRoomRow name="Sala C201" value={97} />
          <TopRoomRow name="Sala Lab3" value={94} />
          <TopRoomRow name="Sala C204" value={90} />
          <TopRoomRow name="Sala Lab4" value={89} />
        </div>
      </section>

    </div>
  );
}

function RoomBox({ name, color }: { name: string; color: string }) {
  return (
    <div className={cn("aspect-square rounded-md flex items-center justify-center shadow-sm cursor-pointer hover:opacity-80 transition-opacity", color)}>
      <span className="text-[8px] font-bold text-white/90">{name}</span>
    </div>
  );
}

function TopRoomRow({ name, value }: { name: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-24 flex-shrink-0">{name}</span>
      <div className="flex-1 h-1.5 bg-red-100 dark:bg-red-900/30 rounded-full overflow-hidden">
        <div className="h-full bg-red-600 rounded-full" style={{ width: `${value}%` }} />
      </div>
      <span className="text-sm font-bold text-red-600 w-10 text-right flex-shrink-0">{value}%</span>
    </div>
  );
}
