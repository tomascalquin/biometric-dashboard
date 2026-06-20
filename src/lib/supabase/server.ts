import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Cliente Supabase para Server Components, Server Actions y Route Handlers.
 *
 * IMPORTANTE: usa ANON KEY + cookies de sesión del usuario, NO service_role.
 * Esto permite que Supabase Auth verifique correctamente la sesión mediante
 * las cookies enviadas por el browser.
 *
 * Si necesitas bypassear RLS en una operación específica, crea un cliente
 * separado con SUPABASE_SERVICE_ROLE_KEY solo para esa operación.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,   // ← ANON, nunca service_role aquí
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Ignorar en Server Components (solo Route Handlers pueden setear cookies)
          }
        },
      },
    },
  );
}

/**
 * Cliente Supabase con privilegios de administrador (bypassea RLS).
 * SOLO para operaciones del servidor que necesiten acceso sin restricciones.
 * NUNCA exponer al cliente.
 */
export async function createAdminClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Ignorar en Server Components
          }
        },
      },
    },
  );
}