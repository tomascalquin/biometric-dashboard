import { Eye } from 'lucide-react';
import { InviteForm } from '@/components/auth/InviteForm';

interface Props {
  params: { token: string };
}

export default function InvitePage({ params }: Props) {
  return (
    <main className="min-h-screen bg-[#f8fafd] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">

        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#003087] mx-auto">
            <Eye className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#0a1628]">
            Acceso Universidad
          </h1>
          <p className="text-sm font-semibold text-[#7a8fb0]">
            Estás configurando tu cuenta de administrador mediante invitación.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#e2e8f4] p-6 shadow-sm">
          <InviteForm token={params.token} />
        </div>

      </div>
    </main>
  );
}
