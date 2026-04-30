import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth';

// 1. Specify protected and public routes
const protectedRoutes = ['/dashboard', '/admin'];
const publicRoutes = ['/login', '/register', '/'];

export async function proxy(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isPublicRoute = publicRoutes.includes(path);

  // 3. Decrypt the session from the cookie
  const cookie = req.cookies.get('session')?.value;
  let session = null;
  
  if (cookie) {
    try {
      session = await decrypt(cookie);
    } catch (e) {
      // Invalid session
    }
  }

  // 4. Redirect to /login if the user is not authenticated
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  // 5. Redirect to /dashboard if the user is authenticated
  if (
    isPublicRoute &&
    session &&
    !req.nextUrl.pathname.startsWith('/dashboard')
  ) {
    // If user is already logged in and tries to access login/register, redirect to dashboard
    if (path === '/login' || path === '/register') {
        return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
    }
  }

  // 6. Role-based access control for /admin
  if (path.startsWith('/admin') && session?.user?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }

  return NextResponse.next();
}

export default proxy;

// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
