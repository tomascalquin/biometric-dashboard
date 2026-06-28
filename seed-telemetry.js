import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import fs from 'fs';

// Parse .env.local manually
const envFile = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envFile.split('\n').forEach(rawLine => {
  const line = rawLine.replace('\r', '');
  if (line.includes('=')) {
    const [k, ...rest] = line.split('=');
    let v = rest.join('=');
    if (v.startsWith("'") && v.endsWith("'")) v = v.slice(1, -1);
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    env[k.trim()] = v.trim();
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseServiceKey = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  try {
    const { data: careers, error: errC } = await supabase.from('careers').select('id, name');
    if (errC || !careers || careers.length === 0) {
      console.error('No careers found in DB or error:', errC);
      return;
    }

    const logsToInsert = [];
    const now = new Date();
    
    for (let day = 30; day >= 0; day--) {
      const date = new Date(now);
      date.setDate(date.getDate() - day);
      
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const isExamsWeek = day >= 10 && day <= 14;
      const sessionsPerDay = isWeekend ? 10 : (isExamsWeek ? 80 : 30);

      for (let s = 0; s < sessionsPerDay; s++) {
        const career = careers[Math.floor(Math.random() * careers.length)];
        const hour = Math.floor(Math.random() * 16) + 8;
        const minute = Math.floor(Math.random() * 60);
        
        const logDate = new Date(date);
        logDate.setHours(hour, minute, 0, 0);

        let fatigueLevel = 'normal';
        let bpm = Math.floor(Math.random() * (20 - 15 + 1)) + 15;
        
        if (isExamsWeek) {
          const rand = Math.random();
          if (rand > 0.4) {
            fatigueLevel = 'critical';
            bpm = Math.floor(Math.random() * (10 - 5 + 1)) + 5;
          } else if (rand > 0.1) {
            fatigueLevel = 'warning';
            bpm = Math.floor(Math.random() * (14 - 11 + 1)) + 11;
          }
        } else if (!isWeekend && hour > 18) {
          if (Math.random() > 0.7) fatigueLevel = 'warning';
          if (Math.random() > 0.9) fatigueLevel = 'critical';
        }

        logsToInsert.push({
          student_anon_id: '00000000-0000-0000-0000-000000000000',
          career_id: career.id,
          device_id: 'simulated-device',
          ear_left: 0.25,
          ear_right: 0.25,
          blinks_per_minute: bpm,
          blink_count: bpm * 60,
          fatigue_level: fatigueLevel,
          blue_light_active: hour > 18,
          created_at: logDate.toISOString(),
          session_id: crypto.randomUUID(),
        });
      }
    }

    console.log(`Prepared ${logsToInsert.length} logs to insert. Inserting in chunks...`);

    const chunkSize = 1000;
    for (let i = 0; i < logsToInsert.length; i += chunkSize) {
      const chunk = logsToInsert.slice(i, i + chunkSize);
      const { error } = await supabase.from('telemetry_logs').insert(chunk);
      if (error) {
        console.error('Error inserting chunk:', error);
        return;
      }
    }

    console.log('Seed data generated successfully!');
  } catch (err) {
    console.error('Caught error:', err);
  }
}

main();
