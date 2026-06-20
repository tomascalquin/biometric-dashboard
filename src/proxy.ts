import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * BiometricOS — Proxy de autenticación y control de acceso por roles.
 *
 * En Next.js 16, el archivo de middleware se llama "proxy.ts" (no middleware.ts).
 *
 * Rutas públicas: /, /login, /register/**, /unauthorized
 * Rutas protegidas: /dashboard/** → requieren sesión válida
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Usar ANON KEY para leer la sesión del usuario desde las cookies.
  // NUNCA usar service_role aquí — no tiene cookies de sesión de usuario.
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

  // IMPORTANTE: getUser() refresca el token si está por vencer.
  // No mover ni eliminar este bloque.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ─── Rutas públicas: siempre permitir ──────────────────────────────────────
  const isPublic =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/unauthorized' ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/api/');

  if (isPublic) {
    // Si el usuario YA está logueado y va a /login o /register → redirigir al dashboard
    if (user && (pathname === '/login' || pathname.startsWith('/register'))) {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = '/dashboard';
      dashboardUrl.search = '';
      return NextResponse.redirect(dashboardUrl);
    }
    return supabaseResponse;
  }

  // ─── Sin sesión → redirigir a login ────────────────────────────────────────
  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ─── Usuario autenticado: inyectar headers útiles ──────────────────────────
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id',  user.id);
  requestHeaders.set('x-pathname', pathname);

  // Preservar cookies de Supabase antes de crear el nuevo response
  const supabaseCookies = supabaseResponse.cookies.getAll();

  supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Re-aplicar cookies de Supabase al nuevo response
  supabaseCookies.forEach(({ name, value, ...opts }) => {
    supabaseResponse.cookies.set(name, value, opts);
  });

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Aplica proxy a todas las rutas excepto archivos estáticos:
     * - _next/static, _next/image, favicon.ico, imágenes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
