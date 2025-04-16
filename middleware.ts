import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  console.log('Middleware called for URL:', request.url);
  console.log('Cookies:', request.cookies.toString());
  
  // Check for auth cookie
  const hasAuthCookie = request.cookies.has('next-auth.session-token') || 
                        request.cookies.has('__Secure-next-auth.session-token');
  
  console.log('Has auth cookie:', hasAuthCookie);
  
  // Continue to the requested resource
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/api/courses/:path*',
    '/api/bookmarks/:path*',
    '/api/notes/:path*',
  ],
};
