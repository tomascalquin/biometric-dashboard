'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Map,
  AlertTriangle,
  Settings,
  Home,
  ScanEye,
  History,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavBarProps {
  role: string;
}

export function BottomNavBar({ role }: BottomNavBarProps) {
  const pathname = usePathname();
  const isAdmin = role === 'admin';

  const NAV_ITEMS = isAdmin
    ? [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/heatmap', label: 'Mapa calor', icon: Map },
        { href: '/dashboard/alerts', label: 'Alertas', icon: AlertTriangle },
        { href: '/dashboard/config', label: 'Config', icon: Settings },
      ]
    : [
        { href: '/dashboard', label: 'Inicio', icon: Home },
        { href: '/dashboard/monitor', label: 'Monitor', icon: ScanEye },
        { href: '/dashboard/history', label: 'Historial', icon: History },
        { href: '/dashboard/settings', label: 'Ajustes', icon: Settings },
      ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 z-50 px-6 py-2 pb-6 md:pb-2">
      <ul className="flex items-center justify-between">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 w-full p-2 transition-colors",
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                )}
              >
                <Icon className={cn("w-6 h-6", isActive && "stroke-[2.5px]")} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
