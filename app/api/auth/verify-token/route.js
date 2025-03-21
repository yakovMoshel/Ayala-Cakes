import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    // קריאת ה-Authorization Header
    const authHeader = req.headers.get('authorization');
    const token = authHeader && authHeader.split(' ')[1]; // הוצאת הטוקן מה-Headers

    if (!token) {
      return new Response(JSON.stringify({ success: false, message: 'No token provided' }), { status: 401 });
    }

    // בדיקת הטוקן באמצעות SECRET_CODE
    const decoded = jwt.verify(token, process.env.SECRET_CODE);

    // מחזירים תשובה אם הטוקן תקף
    return new Response(JSON.stringify({ success: true, user: decoded }), { status: 200 });
  } catch (error) {
    // אם הטוקן לא תקין
    return new Response(
      JSON.stringify({ success: false, message: 'Invalid or expired token' }),
      { status: 403 }
    );
  }
}
