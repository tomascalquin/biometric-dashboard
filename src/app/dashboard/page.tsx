import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminDashboard } from '@/components/dashboard/admin/AdminDashboard';
import { StudentDashboard } from '@/components/dashboard/student/StudentDashboard';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = profile?.role ?? 'student';

  if (role === 'admin') {
    return <AdminDashboard />;
  }

  return <StudentDashboard />;
}
