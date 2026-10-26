import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { MAINTENANCE_MODE } from '@/lib/maintenance';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // This will refresh the session if it's expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Protect /admin routes
  if (path.startsWith('/admin') && !path.startsWith('/admin/login')) {
    if (!user) {
      // no user, redirect to login
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
  }
  
  // If user is logged in and tries to go to login, redirect to admin
  if (path.startsWith('/admin/login') && user) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
  }

  // --- MODO MANTENIMIENTO ---
  if (MAINTENANCE_MODE) {
    // Permitir acceso a la administración, APIs (webhooks), archivos estáticos y /maintenance
    const isExempt = 
      path.startsWith('/admin') ||
      path.startsWith('/api') ||
      path.startsWith('/maintenance') ||
      path.startsWith('/_next') ||
      path.includes('.');

    if (!isExempt) {
      const url = request.nextUrl.clone();
      url.pathname = '/maintenance';
      return NextResponse.rewrite(url);
    }
  }

  return supabaseResponse;
}
