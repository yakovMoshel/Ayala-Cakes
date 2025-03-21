'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from '@/utils/cookies'; // פונקציה לשליפת קוקיז
import styles from './style.module.scss';
import Link from 'next/link';
import useStore from '../../useStore';

export default function AdminWrapper() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  // const [user, setUser] = useState(null); // שמירת פרטי המשתמש אם יש בטוקן

  const { setAuthenticated, setUser, user } = useStore();


  useEffect(() => {
    const token = getCookie('sessionToken'); // שליפת הטוקן מה-Cookie

    if (!token) {
      router.push('/login'); // אם אין טוקן
      return;
    }

    fetch('/api/auth/verify-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          router.push('/login'); // אם הטוקן פג תוקף או לא תקין
        } else {
          setUser(data.user); // שמירת פרטי המשתמש
          setAuthenticated(true);
          setIsLoading(false); // טוקן תקף
        }
      })
      .catch(() => {
        router.push('/login'); // במקרה של שגיאה
      });
  }, [router]);

  const handleLogout = () => {
    document.cookie = 'sessionToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; Secure; SameSite=Strict';
    setAuthenticated(false);
    setUser(null);
    router.push('/login');
  };

  if (isLoading) {
    return <div>בודקים את ההרשאות שלך...</div>;
  }

  return (
    <div className={styles.shop}>
      <div className={styles.sidebar}>
        <h2>ממשק ניהול</h2>
        <nav>
          <ul>
            <li>
              <Link href="/admin">דף ראשי</Link>
            </li>
            <li>
              <Link href="/admin/addProduct">ניהול מוצרים</Link>
            </li>
            <li>
              <Link href="/admin/addPost">ניהול פוסטים</Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <h3>ברוך הבא לממשק הניהול</h3>
          <p>שלום, {user?.name || 'משתמש'}!</p>
          <button onClick={handleLogout} className={styles.logoutButton}>
            התנתק
          </button>
        </div>
        {/* תוכן העמוד */}
      </div>
    </div>
  );
}
