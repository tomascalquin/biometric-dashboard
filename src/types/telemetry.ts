export type FatigueLevel = 'normal' | 'warning' | 'critical';

export interface TelemetryLog {
  id: string;
  created_at: string;
  device_id: string;
  session_id: string;
  ear_left: number;
  ear_right: number;
  ear_average: number;
  blinks_per_minute: number;
  blink_count: number;
  fatigue_level: FatigueLevel;
  blue_light_active: boolean;
}

export interface TelemetrySummary {
  total_logs: number;
  avg_blinks_per_minute: number;
  critical_count: number;
  warning_count: number;
  normal_count: number;
  latest_log: TelemetryLog | null;
  recent_logs: TelemetryLog[];
}