'use client';

import { useState } from 'react';
import { ChevronRight, Download, FileText, Settings, Users, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function ConfigPage() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };
  return (
    <div className="p-4 space-y-5">

      <div>
        <h2 className="text-[10px] font-bold text-[#7a8fb0] tracking-widest uppercase mb-0.5">Configuración</h2>
        <p className="text-[10px] text-[#b0bdd6]">Parámetros globales de la institución</p>
      </div>

      <section>
        <h3 className="text-[10px] font-bold text-[#7a8fb0] tracking-widest uppercase mb-2 ml-1">Umbrales Globales</h3>
        <div className="bg-white rounded-2xl shadow-sm border border-[#e2e8f4] overflow-hidden">
          <ConfigRow title="BPM crítico institucional" description="Alerta automática al equipo de salud" value="< 9 bpm" valueColor="text-red-600" />
          <Divider />
          <ConfigRow title="Estrés máximo aula" description="Notificar director de carrera" value="80%" valueColor="text-orange-500" />
          <Divider />
          <ConfigRow title="Periodo de gracia" description="Espera antes de segunda alerta" value="10 min" />
        </div>
      </section>

      <section>
        <h3 className="text-[10px] font-bold text-[#7a8fb0] tracking-widest uppercase mb-2 ml-1">Notificaciones</h3>
        <div className="bg-white rounded-2xl shadow-sm border border-[#e2e8f4] overflow-hidden">
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
        <h3 className="text-[10px] font-bold text-[#7a8fb0] tracking-widest uppercase mb-2 ml-1">Herramientas</h3>
        <div className="bg-white rounded-2xl shadow-sm border border-[#e2e8f4] overflow-hidden">
          <ActionRow icon={FileText} title="Exportar reporte PDF" />
          <Divider />
          <ActionRow icon={Download} title="Exportar datos CSV" />
          <Divider />
          <ActionRow icon={Users} title="Gestionar usuarios" />
          <Divider />
          <ActionRow icon={Settings} title="Configurar campus" />
        </div>
      </section>

      <section>
        <h3 className="text-[10px] font-bold text-[#7a8fb0] tracking-widest uppercase mb-2 ml-1">Cuenta</h3>
        <div className="bg-white rounded-2xl shadow-sm border border-[#e2e8f4] overflow-hidden">
          <button
            onClick={handleSignOut}
            className="w-full p-4 flex items-center gap-3 hover:bg-[#f8fafd] transition-colors"
          >
            <LogOut className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-red-500">Cerrar sesión</span>
          </button>
        </div>
      </section>

    </div>
  );
}

function ConfigRow({ title, description, value, valueColor = "text-[#0a1628]" }: { title: string; description: string; value: string; valueColor?: string }) {
  return (
    <div className="p-4 flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[#0a1628]">{title}</p>
        <p className="text-[10px] text-[#7a8fb0] mt-0.5">{description}</p>
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
        <p className="text-sm font-bold text-[#0a1628]">{title}</p>
        <p className="text-[10px] text-[#7a8fb0] mt-0.5">{description}</p>
      </div>
      <button onClick={() => setActive(v => !v)} className={`w-11 h-6 rounded-full flex items-center px-1 transition-colors flex-shrink-0 ${active ? 'bg-[#003087]' : 'bg-[#e2e8f4]'}`}>
        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${active ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

function ActionRow({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <button className="w-full p-4 flex items-center justify-between hover:bg-[#f8fafd] transition-colors">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-[#003087]" />
        <span className="text-sm font-bold text-[#0a1628]">{title}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-[#b0bdd6]" />
    </button>
  );
}

function Divider() {
  return <div className="h-px bg-[#e2e8f4] mx-4" />;
}
