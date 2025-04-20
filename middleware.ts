import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  console.log('Middleware called for URL:', request.url);
  console.log('Cookies:', request.cookies.toString());

  const hasAuthCookie = request.cookies.has('next-auth.session-token') ||
                        request.cookies.has('__Secure-next-auth.session-token');

  // console.log('Has auth cookie:', hasAuthCookie);

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/courses/:path*',
    '/api/bookmarks/:path*',
    '/api/notes/:path*',
  ],
};
