import { Users, MoreVertical, Plus, Mail, Shield } from 'lucide-react';
import Link from 'next/link';

export default function TeamManagementPage() {
  const teamMembers = [
    { name: 'Dr. Roberto Sánchez', role: 'Director de Asuntos Estudiantiles', email: 'rsanchez@uai.cl', status: 'Activo', avatar: 'RS' },
    { name: 'Carolina Mella', role: 'Coordinadora de Psicología', email: 'cmella@uai.cl', status: 'Activo', avatar: 'CM' },
    { name: 'Tomás Calquín', role: 'Admin Sistema', email: 'tcalquin@uai.cl', status: 'Activo', avatar: 'TC' },
    { name: 'Dra. María Paz Orellana', role: 'Jefa de Salud Estudiantil', email: 'morellana@uai.cl', status: 'Pendiente', avatar: 'MO' },
  ];

  return (
    <div className="p-4 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase mb-0.5">Gestión</h1>
          <p className="text-[10px] text-gray-400">Equipo institucional</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors">
          <Plus className="w-3.5 h-3.5" />
          Invitar
        </button>
      </div>

      <section>
        <div className="bg-white dark:bg-[#1a2332] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
          {teamMembers.map((member, i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                  {member.avatar}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    {member.name}
                    {member.status === 'Pendiente' && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-semibold bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 uppercase">Pendiente</span>
                    )}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> {member.role}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {member.email}</span>
                  </div>
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="pt-4 flex justify-center">
        <Link href="/dashboard" className="text-xs text-blue-500 hover:text-blue-600 transition-colors">
          &larr; Volver al Dashboard
        </Link>
      </div>
    </div>
  );
}
