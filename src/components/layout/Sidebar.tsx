'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Activity,
  Settings,
  Menu,
  X,
  Eye,
  ScanEye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

const NAV_ITEMS = [
  {
    href:  '/dashboard',
    label: 'Panel Admin',
    icon:  LayoutDashboard,
    roles: ['admin'] as string[],
  },
  {
    href:  '/dashboard/monitor',
    label: 'Monitor Biométrico',
    icon:  ScanEye,
    roles: ['student'] as string[],
  },
  {
    href:  '/dashboard/sessions',
    label: 'Sesiones',
    icon:  Activity,
    roles: [] as string[],
  },
  {
    href:  '/dashboard/settings',
    label: 'Configuración',
    icon:  Settings,
    roles: [] as string[],
  },
] as const;

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole]           = useState<string | null>(null);
  const pathname                  = usePathname();
  const supabase                  = createClient();

  useEffect(() => {
    async function loadRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      setRole(profile?.role ?? 'student');
    }
    void loadRole();
  }, [supabase]);

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.roles.length === 0) return true;
    if (role === null) return false;
    return item.roles.includes(role);
  });

  return (
    <>
      {!collapsed && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setCollapsed(true)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex flex-col bg-white dark:bg-gray-950',
          'border-r border-gray-200 dark:border-gray-800',
          'transition-all duration-200 ease-in-out',
          collapsed ? 'w-16' : 'w-60',
          'lg:relative lg:translate-x-0',
          collapsed && '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-gray-100 dark:border-gray-800">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-indigo-600" aria-hidden="true" />
              <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                BiometricOS
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </button>
        </div>

        {/* Badge de rol */}
        {!collapsed && role && (
          <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
            <span
              className={cn(
                'inline-block text-xs font-medium px-2 py-0.5 rounded-full',
                role === 'admin'
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
              )}
            >
              {role === 'admin' ? '🛡 Administrador' : '🎓 Estudiante'}
            </span>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 py-3 space-y-0.5" aria-label="Navegación principal">
          {visibleItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-950 dark:text-indigo-300'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-100',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3">
            <p className="text-xs text-gray-400 dark:text-gray-600">v1.0.0 · B2B Dashboard</p>
          </div>
        )}
      </aside>

      <button
        className="fixed bottom-4 right-4 z-50 lg:hidden rounded-full bg-indigo-600 p-3 text-white shadow-lg"
        onClick={() => setCollapsed((c) => !c)}
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>
    </>
  );
}
