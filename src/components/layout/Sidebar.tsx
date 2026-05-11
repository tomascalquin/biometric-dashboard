'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Activity,
  Settings,
  Menu,
  X,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard',          label: 'Panel',        icon: LayoutDashboard },
  { href: '/dashboard/sessions', label: 'Sesiones',     icon: Activity },
  { href: '/dashboard/settings', label: 'Configuración', icon: Settings },
] as const;

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
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
          // En mobile, ocultar si collapsed
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
            {collapsed ? (
              <Menu className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-3 space-y-0.5" aria-label="Navegación principal">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
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

      {/* Mobile hamburger (TopBar) */}
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