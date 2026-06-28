'use client';

import { Bell } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface MobileTopBarProps {
  name: string;
  role: string;
  subtitle: string;
  career?: string;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

export function MobileTopBar({ name, role, subtitle, career }: MobileTopBarProps) {
  const initials = getInitials(name);
  const isAdmin = role === 'admin';

  return (
    <div className="bg-white border-b border-[#e2e8f4] px-5 pt-10 pb-4 sticky top-0 z-40 shadow-sm">
      {/* UAI accent stripe on top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#003087]" />

      <div className="flex items-center justify-between">
        {/* Logo + User */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-xl font-bold text-sm flex-shrink-0 text-white",
              isAdmin ? "bg-[#003087]" : "bg-[#0066cc]"
            )}
          >
            {initials}
          </div>

          {/* User Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[15px] text-[#0a1628] leading-tight">{name}</span>
              <span className={cn(
                "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                isAdmin
                  ? "bg-[#003087]/10 text-[#003087]"
                  : "bg-[#0066cc]/10 text-[#0066cc]"
              )}>
                {isAdmin ? 'Admin' : 'Estudiante'}
              </span>
            </div>
            <span className="text-[11px] text-[#7a8fb0] mt-0.5 truncate max-w-[200px]">{subtitle}</span>
            {!isAdmin && career && (
              <span className="text-[10px] text-[#0066cc] font-medium mt-0.5">
                {career}
              </span>
            )}
          </div>
        </div>

        {/* Notification bell */}
        <Link
          href={isAdmin ? "/dashboard/alerts" : "/dashboard/history"}
          className="relative p-2 rounded-xl hover:bg-[#f0f4fa] transition-colors flex-shrink-0"
          aria-label="Notificaciones"
        >
          <Bell className="w-5 h-5 text-[#7a8fb0]" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </Link>
      </div>
    </div>
  );
}

