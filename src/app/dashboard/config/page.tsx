'use client';

import { useState } from 'react';
import { ChevronRight, Download, FileText, Settings, Users } from 'lucide-react';

export default function ConfigPage() {
  return (
    <div className="p-4 space-y-5">

      <div>
        <h2 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase mb-0.5">Configuración</h2>
        <p className="text-[10px] text-gray-400">Parámetros globales de la institución</p>
      </div>

      <section>
        <h3 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase mb-2 ml-1">Umbrales Globales</h3>
        <div className="bg-white dark:bg-[#1a2332] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <ConfigRow title="BPM crítico institucional" description="Alerta automática al equipo de salud" value="< 9 bpm" valueColor="text-red-600" />
          <Divider />
          <ConfigRow title="Estrés máximo aula" description="Notificar director de carrera" value="80%" valueColor="text-orange-500" />
          <Divider />
          <ConfigRow title="Periodo de gracia" description="Espera antes de segunda alerta" value="10 min" />
        </div>
      </section>

      <section>
        <h3 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase mb-2 ml-1">Notificaciones</h3>
        <div className="bg-white dark:bg-[#1a2332] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <ToggleRow title="Alertas críticas push" description="Envío inmediato al director" defaultActive={false} />
          <Divider />
          <ToggleRow title="Reporte diario automático" description="Resumen 18:00 h cada día hábil" defaultActive={false} />
          <Divider />
          <ToggleRow title="Alertas por correo" description="Copia a coordinadores UAI" defaultActive={false} />
          <Divider />
          <ToggleRow title="Notif. de normalización" description="Avisar cuando sala deja estado crítico" defaultActive={false} />
        </div>
      </section>

      <section>
        <h3 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase mb-2 ml-1">Herramientas</h3>
        <div className="bg-white dark:bg-[#1a2332] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <ActionRow icon={FileText} title="Exportar reporte PDF" />
          <Divider />
          <ActionRow icon={Download} title="Exportar datos CSV" />
          <Divider />
          <ActionRow icon={Users} title="Gestionar usuarios" />
          <Divider />
          <ActionRow icon={Settings} title="Configurar campus" />
        </div>
      </section>

    </div>
  );
}

function ConfigRow({ title, description, value, valueColor = "text-gray-900 dark:text-gray-100" }: { title: string; description: string; value: string; valueColor?: string }) {
  return (
    <div className="p-4 flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</p>
        <p className="text-[10px] text-gray-500 mt-0.5">{description}</p>
      </div>
      <span className={`text-sm font-bold flex-shrink-0 ${valueColor}`}>{value}</span>
    </div>
  );
}

function ToggleRow({ title, description, defaultActive }: { title: string; description: string; defaultActive: boolean }) {
  const [active, setActive] = useState(defaultActive);
  return (
    <div className="p-4 flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</p>
        <p className="text-[10px] text-gray-500 mt-0.5">{description}</p>
      </div>
      <button onClick={() => setActive(v => !v)} className={`w-11 h-6 rounded-full flex items-center px-1 transition-colors flex-shrink-0 ${active ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${active ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

function ActionRow({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-blue-600" />
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </button>
  );
}

function Divider() {
  return <div className="h-px bg-gray-100 dark:bg-gray-800 mx-4" />;
}
