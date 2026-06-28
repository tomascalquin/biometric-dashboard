import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const key = url.searchParams.get('key');
    if (key !== 'generate123') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Obtener algunas carreras reales para asignarles datos
    const { data: careers } = await supabase.from('careers').select('id, name');
    if (!careers || careers.length === 0) {
      return NextResponse.json({ error: 'No careers found in DB' }, { status: 400 });
    }

    const logsToInsert = [];
    const now = new Date();
    
    // Generaremos datos para los últimos 30 días
    for (let day = 30; day >= 0; day--) {
      const date = new Date(now);
      date.setDate(date.getDate() - day);
      
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      // Simulamos una "semana de solemnes" (pico de estrés) hace 10 a 14 días
      const isExamsWeek = day >= 10 && day <= 14;

      // Por cada día, generaremos X sesiones
      const sessionsPerDay = isWeekend ? 5 : (isExamsWeek ? 40 : 15);

      for (let s = 0; s < sessionsPerDay; s++) {
        // Elegimos una carrera al azar
        const career = careers[Math.floor(Math.random() * careers.length)];
        
        // Asignamos una hora al azar entre las 8:00 y las 23:00
        const hour = Math.floor(Math.random() * 16) + 8;
        const minute = Math.floor(Math.random() * 60);
        
        const logDate = new Date(date);
        logDate.setHours(hour, minute, 0, 0);

        // Lógica de fatiga base
        let fatigueLevel = 'normal';
        let bpm = Math.floor(Math.random() * (20 - 15 + 1)) + 15; // normal 15-20
        
        if (isExamsWeek) {
          // En semana de exámenes, más probabilidad de warning y critical
          const rand = Math.random();
          if (rand > 0.4) {
            fatigueLevel = 'critical';
            bpm = Math.floor(Math.random() * (10 - 5 + 1)) + 5; // bajo 5-10
          } else if (rand > 0.1) {
            fatigueLevel = 'warning';
            bpm = Math.floor(Math.random() * (14 - 11 + 1)) + 11;
          }
        } else if (!isWeekend && hour > 18) {
          // Tarde en la noche también hay algo de fatiga
          if (Math.random() > 0.7) fatigueLevel = 'warning';
          if (Math.random() > 0.9) fatigueLevel = 'critical';
        }

        logsToInsert.push({
          student_anon_id: '00000000-0000-0000-0000-000000000000', // Un UUID genérico para los fakes
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

    // Insertar en lotes de 1000
    const chunkSize = 1000;
    for (let i = 0; i < logsToInsert.length; i += chunkSize) {
      const chunk = logsToInsert.slice(i, i + chunkSize);
      const { error } = await supabase.from('telemetry_logs').insert(chunk);
      if (error) {
        console.error('Error inserting chunk', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      success: true, 
      inserted: logsToInsert.length,
      message: 'Seed data generated successfully!'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
