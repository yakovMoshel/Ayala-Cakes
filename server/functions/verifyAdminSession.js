import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function verifyAdminSession() {
  const jar = await cookies();
  const token = jar.get('sessionToken')?.value;
  if (!token) return { ok: false, status: 401 };

  try {
    const user = jwt.verify(token, process.env.SECRET_CODE);
    return { ok: true, user };
  } catch {
    return { ok: false, status: 403 };
  }
}
