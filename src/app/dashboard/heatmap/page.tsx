import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HeatmapPage() {
  return (
    <div className="p-4 space-y-6">
      
      <section className="bg-white dark:bg-[#1a2332] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-wider">CAMPUS PEÑALOLÉN — MAPA DE FATIGA</h2>
        </div>

        {/* Tabs de Pisos */}
        <div className="flex gap-2 mb-6">
          <button className="px-4 py-1.5 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-800">Piso 1</button>
          <button className="px-4 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800">Piso 2</button>
          <button className="px-4 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800">Piso 3</button>
        </div>

        {/* Mapa / Grid de salas */}
        <div className="bg-[#1a2332] rounded-xl p-4 text-white">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-semibold">Piso 2 — Ing. Informática</span>
            <span className="text-[10px] flex items-center text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1 animate-pulse"></span>
              En vivo
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 mb-6">
            <RoomBox name="C201" color="bg-red-600" />
            <RoomBox name="C202" color="bg-red-600" />
            <RoomBox name="C203" color="bg-red-600" />
            <RoomBox name="C204" color="bg-red-600" />
            <RoomBox name="C205" color="bg-red-600" />
            <RoomBox name="C206" color="bg-orange-500" />
            <RoomBox name="C207" color="bg-orange-500" />
            <RoomBox name="Lab3" color="bg-red-600" />
            <RoomBox name="Lab4" color="bg-orange-500" />
            <RoomBox name="Lab5" color="bg-yellow-500" />
            <RoomBox name="Lab6" color="bg-yellow-500" />
            <RoomBox name="C210" color="bg-green-500" />
            <RoomBox name="C211" color="bg-green-500" />
            <RoomBox name="C212" color="bg-yellow-500" />
            <RoomBox name="Sala" color="bg-red-600" />
          </div>

          {/* Leyenda */}
          <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2">
            <span>Bajo</span>
            <div className="flex gap-0.5">
              <div className="w-3 h-1 bg-green-500"></div>
              <div className="w-3 h-1 bg-yellow-500"></div>
              <div className="w-3 h-1 bg-orange-500"></div>
              <div className="w-3 h-1 bg-red-500"></div>
              <div className="w-3 h-1 bg-red-600"></div>
              <div className="w-3 h-1 bg-red-700"></div>
            </div>
            <span>Crítico</span>
          </div>
        </div>
        
        <div className="mt-3 flex items-center justify-center p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
          <MapPin className="w-4 h-4 text-gray-400 mr-2" />
          <span className="text-xs text-gray-500">Toca una sala para ver su detalle</span>
        </div>
      </section>

      {/* Top salas críticas */}
      <section className="bg-white dark:bg-[#1a2332] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-4">Top salas críticas — Ing. Informática</h3>
        
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

function RoomBox({ name, color }: { name: string, color: string }) {
  return (
    <div className={cn("aspect-square rounded-sm flex items-center justify-center shadow-sm", color)}>
      <span className="text-[8px] font-bold text-white/90">{name}</span>
    </div>
  );
}

function TopRoomRow({ name, value }: { name: string, value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-24">{name}</span>
      <div className="flex-1 mx-4">
        <div className="h-1.5 bg-red-100 dark:bg-red-900/30 rounded-full w-full flex justify-end">
          <div className="h-full bg-red-700 rounded-full" style={{ width: `${value}%` }}></div>
        </div>
      </div>
      <span className="text-sm font-bold text-red-600 w-8 text-right">{value}%</span>
    </div>
  );
}
