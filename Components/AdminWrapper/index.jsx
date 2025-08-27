'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
// We now rely on server HttpOnly cookie and server verification
import styles from './style.module.scss';
import Link from 'next/link';
import useStore from '../../useStore';
import Toolbar from '@/Components/Toolbar';

export default function AdminWrapper({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  // const [user, setUser] = useState(null); // שמירת פרטי המשתמש אם יש בטוקן

  const { setAuthenticated, setUser, user } = useStore();


  useEffect(() => {
    fetch('/api/auth/verify-token', { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          router.push('/login');
        } else {
          setUser(data.user);
          setAuthenticated(true);
          setIsLoading(false);
        }
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router, setAuthenticated, setUser]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
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
              <Link href="/admin/addProduct" className={`${styles.navLink} ${pathname === '/admin/addProduct' ? styles.active : ''}`}>ניהול מוצרים</Link>
            </li>
            <li>
              <Link href="/admin/categories" className={`${styles.navLink} ${pathname === '/admin/categories' ? styles.active : ''}`}>ניהול קטגוריות</Link>
            </li>
            <li>
              <Link href="/admin/addPost" className={`${styles.navLink} ${pathname === '/admin/addPost' ? styles.active : ''}`}>ניהול פוסטים</Link>
            </li>
            <li>
              <Link href="/admin/media" className={`${styles.navLink} ${pathname === '/admin/media' ? styles.active : ''}`}>ספריית מדיה</Link>
            </li>
          </ul>
        </nav>
        <div className={styles.sidebarFooter}>
          <button onClick={handleLogout} className={styles.logoutButton}>
            התנתק
          </button>
        </div>
      </div>
      <div className={styles.content}>
        {/* Mobile top bar using generic Toolbar */}
        <div className={styles.mobileBar}>
          <Toolbar
            showSearch={false}
            defaultOpen={false}
            categories={[
              { label: 'ניהול מוצרים', value: '/admin/addProduct' },
              { label: 'ניהול קטגוריות', value: '/admin/categories' },
              { label: 'ניהול פוסטים', value: '/admin/addPost' },
              { label: 'ספריית מדיה', value: '/admin/media' },
              { label: 'התנתק', value: '__logout__' },
            ]}
            onCategoryChange={(val) => {
              if (val === '__logout__') {
                handleLogout();
              } else if (typeof val === 'string') {
                router.push(val);
              }
            }}
          />
        </div>
        {/* <div className={styles.header}>
          <h3>ברוך הבא לממשק הניהול</h3>
          <p>שלום, {user?.name || 'משתמש'}!</p>
        </div> */}
        {/* Page content injected here */}
        {children}
      </div>
    </div>
  );
}
