'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
// We now rely on server HttpOnly cookie and server verification
import styles from './style.module.scss';
import Link from 'next/link';
import useStore from '../../useStore';
import Toolbar from '@/Components/Toolbar';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  FolderTree, 
  FileText, 
  Image as ImageIcon, 
  BarChart3, 
  LogOut, 
  Globe,
  Loader2
} from 'lucide-react';

export default function AdminWrapper({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

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
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loaderCard}>
          <Loader2 className={styles.spinner} size={48} />
          <p>בודקים את ההרשאות שלך...</p>
        </div>
      </div>
    );
  }

  const isPostsActive =
    pathname.startsWith('/admin/posts') || pathname === '/admin/addPost';

  const isProductsActive =
    pathname.startsWith('/admin/products') || pathname === '/admin/addProduct';

  const isDashboardActive = pathname === '/admin';

  return (
    <div className={styles.shop}>
      <div className={styles.sidebar}>
        <div className={styles.logoContainer}>
          <img src="/AYALA CAKES LOGO.png" alt="AYALA CAKES LOGO" />
          <span className={styles.logoText}>ממשק ניהול</span>
        </div>

        <div className={styles.userProfile}>
          <div className={styles.avatar}>
            {user?.name ? user.name[0].toUpperCase() : 'A'}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>שלום, {user?.name || 'אילה'}</span>
            <span className={styles.userRole}>מנהלת מערכת</span>
          </div>
        </div>

        <nav>
          <ul>
            <li>
              <Link
                href="/admin"
                className={`${styles.navLink} ${isDashboardActive ? styles.active : ''}`}
              >
                <LayoutDashboard size={18} />
                <span>לוח בקרה</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/products"
                className={`${styles.navLink} ${isProductsActive ? styles.active : ''}`}
              >
                <ShoppingBag size={18} />
                <span>ניהול מוצרים</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/categories" 
                className={`${styles.navLink} ${pathname === '/admin/categories' ? styles.active : ''}`}
              >
                <FolderTree size={18} />
                <span>ניהול קטגוריות</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/posts"
                className={`${styles.navLink} ${isPostsActive ? styles.active : ''}`}
              >
                <FileText size={18} />
                <span>ניהול פוסטים</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/media" 
                className={`${styles.navLink} ${pathname === '/admin/media' ? styles.active : ''}`}
              >
                <ImageIcon size={18} />
                <span>ספריית מדיה</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/metrics" 
                className={`${styles.navLink} ${pathname === '/admin/metrics' ? styles.active : ''}`}
              >
                <BarChart3 size={18} />
                <span>מדדים ואנליטיקה</span>
              </Link>
            </li>
            <li className={styles.divider}></li>
            <li>
              <Link 
                href="/" 
                className={styles.navLinkOut}
                target="_blank"
              >
                <Globe size={18} />
                <span>חזרה לאתר</span>
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className={styles.sidebarFooter}>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <LogOut size={16} />
            <span>התנתק</span>
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
              { label: 'לוח בקרה', value: '/admin' },
              { label: 'ניהול מוצרים', value: '/admin/products' },
              { label: 'ניהול קטגוריות', value: '/admin/categories' },
              { label: 'ניהול פוסטים', value: '/admin/posts' },
              { label: 'ספריית מדיה', value: '/admin/media' },
              { label: 'מדדים', value: '/admin/metrics' },
              { label: 'חזרה לאתר', value: '/' },
              { label: 'התנתק', value: '__logout__' },
            ]}
            onCategoryChange={(val) => {
              if (val === '__logout__') {
                handleLogout();
              } else if (typeof val === 'string') {
                if (val === '/') {
                  window.open('/', '_blank');
                } else {
                  router.push(val);
                }
              }
            }}
          />
        </div>
        {/* Page content injected here */}
        <div className={styles.contentInner}>
          {children}
        </div>
      </div>
    </div>
  );
}