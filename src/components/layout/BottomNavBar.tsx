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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#e2e8f4] px-4 py-2 pb-6 md:pb-2 shadow-[0_-1px_12px_rgba(0,48,135,0.06)]">
      <ul className="flex items-center justify-between">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 w-full py-1.5 px-1 rounded-xl transition-all",
                  isActive
                    ? "text-[#003087]"
                    : "text-[#b0bdd6] hover:text-[#7a8fb0]"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg transition-all",
                  isActive ? "bg-[#003087]/10" : ""
                )}>
                  <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
                </div>
                <span className={cn(
                  "text-[10px] font-medium",
                  isActive ? "text-[#003087] font-semibold" : "text-[#b0bdd6]"
                )}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

