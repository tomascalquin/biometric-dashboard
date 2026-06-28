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
          <h1 className="text-[10px] font-bold text-[#7a8fb0] tracking-widest uppercase mb-0.5">Gestión</h1>
          <p className="text-[10px] text-[#b0bdd6]">Equipo institucional</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#003087] hover:bg-[#002070] shadow-sm text-white rounded-lg text-xs font-semibold transition-colors">
          <Plus className="w-3.5 h-3.5" />
          Invitar
        </button>
      </div>

      <section>
        <div className="bg-white rounded-2xl shadow-sm border border-[#e2e8f4] overflow-hidden divide-y divide-[#e2e8f4]">
          {teamMembers.map((member, i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#e8f0fb] text-[#003087] flex items-center justify-center font-bold text-sm">
                  {member.avatar}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0a1628] flex items-center gap-2">
                    {member.name}
                    {member.status === 'Pendiente' && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-100 text-amber-700 uppercase">Pendiente</span>
                    )}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-[#7a8fb0] font-semibold mt-0.5">
                    <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> {member.role}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[#b0bdd6] font-semibold mt-0.5">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {member.email}</span>
                  </div>
                </div>
              </div>
              <button className="p-2 text-[#7a8fb0] hover:text-[#0a1628] rounded-full hover:bg-[#f8fafd] transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="pt-4 flex justify-center">
        <Link href="/dashboard" className="text-xs text-[#003087] font-bold hover:text-[#002070] hover:underline transition-colors">
          &larr; Volver al Dashboard
        </Link>
      </div>
    </div>
  );
}
