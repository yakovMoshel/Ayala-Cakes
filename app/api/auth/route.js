import { NextResponse } from 'next/server';
import { login } from '@/server/functions/auth';
import { connectToMongo } from '@/server/DL/connectToMongo';

export async function POST(req) {
  await connectToMongo();

  try {
    const { email, password } = await req.json();

    const token = await login(email, password);

    return NextResponse.json({ success: true, token, message: 'Login successful' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 400 });
  }
}
