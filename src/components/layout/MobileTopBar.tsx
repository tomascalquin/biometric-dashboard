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
    <div className="bg-[#1a2332] text-white px-5 pt-12 pb-5 rounded-b-3xl shadow-md z-10 sticky top-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-full font-bold text-sm flex-shrink-0",
              isAdmin ? "bg-blue-600" : "bg-green-600"
            )}
          >
            {initials}
          </div>
          
          {/* User Info */}
          <div className="flex flex-col">
            <span className="font-semibold text-lg leading-tight">{name}</span>
            <span className="text-xs text-gray-300 mt-0.5">{subtitle}</span>
            {!isAdmin && career && (
              <span className="text-[10px] text-green-400 font-medium mt-0.5">
                • {career}
              </span>
            )}
          </div>
        </div>

        {/* Notifications */}
        <Link href={isAdmin ? "/dashboard/alerts" : "/dashboard/history"} className="p-2 relative rounded-full hover:bg-white/10 transition-colors flex-shrink-0">
          <Bell className="w-5 h-5 text-gray-300" />
          <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#1a2332]"></span>
        </Link>
      </div>
    </div>
  );
}
