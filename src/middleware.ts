import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * BiometricOS — Middleware de autenticación y control de acceso por roles.
 *
 * Rutas protegidas:
 *  /dashboard          → solo 'admin'
 *  /dashboard/monitor  → solo 'student'
 *
 * Si el usuario no está autenticado → /login
 * Si el rol no coincide             → /unauthorized
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
  const publicPaths = ['/login', '/register', '/unauthorized', '/'];
  if (publicPaths.some((p) => pathname === p || pathname.startsWith('/api/'))) {
    return supabaseResponse;
  }

  // ─── Sin sesión → redirigir a login ──────────────────────────────────────
  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ─── Obtener rol del perfil ───────────────────────────────────────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = profile?.role ?? 'student';

  // ─── Control de acceso por ruta ──────────────────────────────────────────
  const isAdminRoute   = pathname === '/dashboard' || pathname.startsWith('/dashboard/admin');
  const isStudentRoute = pathname === '/dashboard/monitor';

  if (isAdminRoute && role !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  if (isStudentRoute && role !== 'student') {
    // Un admin que accede a /monitor → lo llevamos al panel admin
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Inyectar el rol como header para que los Server Components lo lean sin
  // hacer una segunda consulta a Supabase (opcional pero eficiente)
  supabaseResponse.headers.set('x-user-role', role);
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
