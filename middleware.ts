import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(_request: NextRequest) {
  // Simple pass-through middleware
  // Can be extended to check authentication or implement rate limiting
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/courses/:path*',
    '/api/bookmarks/:path*',
    '/api/notes/:path*',
  ],
};
