import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Edge protection for /admin/* — verifies the HttpOnly session JWT before the
// admin pages are even rendered. The client-side AdminWrapper check remains as
// a second layer for user info / logout handling.
export async function middleware(req) {
  const token = req.cookies.get('sessionToken')?.value;
  const loginUrl = new URL('/login', req.url);

  if (!token) {
    return NextResponse.redirect(loginUrl);
  }

  try {
    const secret = new TextEncoder().encode(process.env.SECRET_CODE);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};
