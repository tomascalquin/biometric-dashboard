import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * BiometricOS — Middleware de autenticación y control de acceso por roles.
 *
 * Rutas públicas: /login, /register/**, /unauthorized, /
 * Rutas protegidas: /dashboard/** → requieren sesión válida
 * El role-based routing lo maneja cada page/layout de Next.js.
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refrescar sesión (IMPORTANTE: no elimines este bloque)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ─── Rutas públicas: siempre permitir ────────────────────────────────────
  // Incluye /register y todas sus sub-rutas (invite/token, etc.)
  const isPublic =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/unauthorized' ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/api/');

  if (isPublic) {
    return supabaseResponse;
  }

  // ─── Sin sesión → redirigir a login ──────────────────────────────────────
  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ─── Usuario autenticado: inyectar headers útiles ─────────────────────────
  // El role-based access lo maneja cada layout/page de forma granular
  supabaseResponse.headers.set('x-user-id', user.id);

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Aplica middleware a todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image  (optimización de imágenes)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
