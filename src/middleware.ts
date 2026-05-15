import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Only protect the /admin routes, but leave /admin/login open
  if (path.startsWith('/admin') && !path.startsWith('/admin/login')) {
    // Check for our simple auth cookie
    const authCookie = request.cookies.get('ea_admin_session');
    
    // If no cookie or invalid value, redirect to login
    if (!authCookie || authCookie.value !== 'authenticated') {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
