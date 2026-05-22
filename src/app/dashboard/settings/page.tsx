'use client';

import { Download, Shield, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="p-4 space-y-6">
      
      <section>
        <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 tracking-wider ml-2">MONITOREO</h2>
        <div className="bg-white dark:bg-[#1a2332] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <ToggleRow 
            title="Cámara activa" 
            description="Detección facial EAR/BPM" 
            active={true}
          />
          <Divider />
          <ToggleRow 
            title="Filtro de luz azul automático" 
            description="Activar al detectar fatiga crítica" 
            active={false}
          />
          <Divider />
          <ToggleRow 
            title="Alertas al equipo UAI" 
            description="Notificar en estado crítico" 
            active={true}
          />
          <Divider />
          <ToggleRow 
            title="Notificaciones push" 
            description="Recordatorios de descanso" 
            active={false}
          />
        </div>
      </section>

      <section>
        <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 tracking-wider ml-2">UMBRALES DE ALERTA</h2>
        <div className="bg-white dark:bg-[#1a2332] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <ConfigRow 
            title="BPM crítico" 
            description="Alertar cuando BPM esté bajo" 
            value="< 9 bpm"
            valueColor="text-red-600"
          />
          <Divider />
          <ConfigRow 
            title="Estrés máximo" 
            description="Umbral de advertencia" 
            value="75%"
            valueColor="text-orange-500"
          />
        </div>
      </section>

      <section>
        <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 tracking-wider ml-2">CUENTA</h2>
        <div className="bg-white dark:bg-[#1a2332] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <ActionRow icon={Download} title="Exportar mis datos" />
          <Divider />
          <ActionRow icon={Shield} title="Política de privacidad" />
          <Divider />
          <button 
            onClick={handleSignOut}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-600">Cerrar sesión</span>
            </div>
          </button>
        </div>
      </section>

    </div>
  );
}

function ToggleRow({ title, description, active }: { title: string, description: string, active: boolean }) {
  return (
    <div className="p-4 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</p>
        <p className="text-[10px] text-gray-500">{description}</p>
      </div>
      <div className={`w-11 h-6 rounded-full flex items-center px-1 transition-colors ${active ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${active ? 'translate-x-5' : 'translate-x-0'}`}></div>
      </div>
    </div>
  );
}

function ConfigRow({ title, description, value, valueColor = "text-gray-900 dark:text-gray-100" }: { title: string, description: string, value: string, valueColor?: string }) {
  return (
    <div className="p-4 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</p>
        <p className="text-[10px] text-gray-500">{description}</p>
      </div>
      <span className={`text-sm font-bold ${valueColor}`}>{value}</span>
    </div>
  );
}

function ActionRow({ icon: Icon, title }: { icon: any, title: string }) {
  return (
    <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</span>
      </div>
      <Download className="w-4 h-4 text-gray-400 opacity-0" /> {/* Solo para balancear el flex si fuera necesario, o simplemente se usa otra flecha */}
    </button>
  );
}

function Divider() {
  return <div className="h-px bg-gray-100 dark:bg-gray-800 mx-4"></div>;
}