import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Verifies the session token stored in HttpOnly cookies on the server
export async function POST() {
  try {
    const jar = await cookies();
    const token = jar.get('sessionToken')?.value;

    if (!token) {
      return new Response(JSON.stringify({ success: false, message: 'No token provided' }), { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.SECRET_CODE);
    return new Response(JSON.stringify({ success: true, user: decoded }), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: 'Invalid or expired token' }),
      { status: 403 }
    );
  }
}
