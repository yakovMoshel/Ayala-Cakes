import { NextResponse } from 'next/server';
import { login } from '@/server/functions/auth';
import { connectToMongo } from '@/server/DL/connectToMongo';

export async function POST(req) {
  await connectToMongo();

  try {
    const { email, password } = await req.json();

    const token = await login(email, password);

    // Set HttpOnly cookie for 60 days (in seconds)
    const res = NextResponse.json({ success: true, message: 'Login successful' });
    res.cookies.set('sessionToken', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 24 * 60 * 60, // 60 days
    });
    return res;
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 400 });
  }
}
