import { createBrowserClient } from '@supabase/ssr';

/**
 * Cliente Supabase para usar en Client Components ('use client').
 * Usa la clave ANON (pública), nunca la SERVICE_ROLE aquí.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
