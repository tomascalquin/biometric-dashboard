import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Combina clases Tailwind de forma segura, resolviendo conflictos. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Mapea FatigueLevel a tokens semánticos de color para cn(). */
export const fatigueColors = {
  normal:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning:  'bg-amber-50  text-amber-700  border-amber-200',
  critical: 'bg-red-50    text-red-700    border-red-200',
} as const;

export const fatigueDot = {
  normal:   'bg-emerald-500',
  warning:  'bg-amber-500',
  critical: 'bg-red-500 animate-pulse',
} as const;