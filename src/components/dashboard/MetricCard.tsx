import { cn, fatigueColors, fatigueDot } from '@/lib/utils';
import type { FatigueLevel } from '@/types/telemetry';

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  description: string;
  level: FatigueLevel;
}

export function MetricCard({ title, value, unit, description, level }: MetricCardProps) {
  return (
    <article
      className={cn(
        'rounded-xl border p-5 space-y-2 transition-shadow hover:shadow-sm',
        fatigueColors[level],
      )}
      aria-label={`${title}: ${value} ${unit}`}
    >
      <header className="flex items-center justify-between">
        <h2 className="text-sm font-medium opacity-80">{title}</h2>
        <span
          className={cn('h-2.5 w-2.5 rounded-full', fatigueDot[level])}
          aria-hidden="true"
        />
      </header>

      <p className="text-3xl font-bold tabular-nums">
        {value}
        <span className="text-base font-normal ml-1 opacity-60">{unit}</span>
      </p>

      <p className="text-xs opacity-60">{description}</p>
    </article>
  );
}