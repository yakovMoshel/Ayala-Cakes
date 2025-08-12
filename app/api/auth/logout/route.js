import { NextResponse } from 'next/server';

// Clears the sessionToken HttpOnly cookie
export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set('sessionToken', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    expires: new Date(0),
  });
  return res;
}


