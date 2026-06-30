import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import fs from 'fs';

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

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  try {
    const { data: users, error: errU } = await supabase.auth.admin.listUsers();
    if (errU || !users || users.users.length === 0) {
      console.error('No users found in DB');
      return;
    }
    const my_user_id = users.users[0].id;
    console.log('Seeding for user:', my_user_id);

    const { data: profile } = await supabase.from('profiles').select('career_id').eq('id', my_user_id).single();
    let my_career_id = profile ? profile.career_id : null;
    
    if (!my_career_id) {
       const { data: careers } = await supabase.from('careers').select('id').limit(1).single();
       my_career_id = careers.id;
    }

    const logsToInsert = [];
    const sessionsToInsert = [];
    const now = new Date();
    
    for (let day = 7; day >= 0; day--) {
      const date = new Date(now);
      date.setDate(date.getDate() - day);
      
      const sId = crypto.randomUUID();
      const hour = Math.floor(Math.random() * 6) + 14;
      const started_at = new Date(date);
      started_at.setHours(hour, 0, 0, 0);
      
      const ended_at = new Date(started_at);
      ended_at.setHours(started_at.getHours() + 2, 30, 0, 0);
      
      sessionsToInsert.push({
          id: sId,
          student_id: my_user_id,
          career_id: my_career_id,
          status: 'completed',
          started_at: started_at.toISOString(),
          ended_at: ended_at.toISOString(),
          subject_name_override: ['Cálculo II', 'Algoritmos y Estructuras', 'Prueba Redes', 'Sistemas Operativos', 'Ingeniería de Software'][Math.floor(Math.random() * 5)]
      });

      for (let m = 0; m < 10; m++) {
         let fatigueLevel = 'normal';
         let bpm = 15 + Math.floor(Math.random() * 5);
         if (day === 3 || m > 7) {
             fatigueLevel = 'warning';
             bpm = 10 + Math.floor(Math.random() * 4);
         }
         if (day === 3 && m > 8) {
             fatigueLevel = 'critical';
             bpm = 5 + Math.floor(Math.random() * 4);
         }
         
         const logDate = new Date(started_at);
         logDate.setMinutes(logDate.getMinutes() + m * 15);
         
         logsToInsert.push({
          session_id: sId,
          student_anon_id: my_user_id,
          career_id: my_career_id,
          ear_left: 0.25,
          ear_right: 0.25,
          blinks_per_minute: bpm,
          blink_count: bpm * 60,
          fatigue_level: fatigueLevel,
          blue_light_active: false,
          created_at: logDate.toISOString(),
        });
      }
    }

    const { error: errS } = await supabase.from('study_sessions').insert(sessionsToInsert);
    if (errS) console.error('Error sessions:', errS);
    else console.log('Inserted sessions');

    const { error: errT } = await supabase.from('telemetry_logs').insert(logsToInsert);
    if (errT) console.error('Error telemetry:', errT);
    else console.log('Inserted telemetry');

    console.log('Seed data generated successfully!');
  } catch (err) {
    console.error('Caught error:', err);
  }
}

main();
