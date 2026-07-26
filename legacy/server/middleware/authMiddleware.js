import jwt from 'jsonwebtoken';

export default function authMiddleware(req) {
  const authHeader = req.headers.authorization; // קבלת הטוקן מה-Headers
  const token = authHeader && authHeader.split(' ')[1]; // הסרת המילה Bearer במידת הצורך

  if (!token) {
    throw new Error('No token provided'); // אין טוקן
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_CODE); // בדיקת הטוקן
    return decoded; // מחזיר את פרטי המשתמש מהטוקן
  } catch (error) {
    throw new Error('Invalid token'); // טוקן לא תקין
  }
}
