'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './style.module.scss';
import useStore from '../../useStore';
import { 
  ShoppingBag, 
  FileText, 
  FolderTree, 
  Image as ImageIcon, 
  BarChart3, 
  PlusCircle, 
  TrendingUp, 
  Users,
  Award,
  ChevronLeft,
  Loader2
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user } = useStore();
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/analytics/metrics', { credentials: 'include' })
      .then((res) => res.json())
      .then((json) => {
        if (!json.success) throw new Error(json.error || 'Failed to load metrics');
        setMetrics(json.data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.welcomeBannerSkeleton} />
        <div className={styles.skeletonGrid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
        <div className={styles.skeletonSection} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h3>שגיאה בטעינת לוח הבקרה</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className={styles.retryBtn}>
          נסה שוב
        </button>
      </div>
    );
  }

  // Calculate totals
  const totalViews = (metrics?.posts?.summary?.totalViews || 0) + (metrics?.products?.summary?.totalViews || 0);
  const totalUniques = (metrics?.posts?.summary?.totalUniqueVisitors || 0) + (metrics?.products?.summary?.totalUniqueVisitors || 0);
  const totalProducts = metrics?.products?.summary?.itemCount || 0;
  const totalPosts = metrics?.posts?.summary?.itemCount || 0;

  // Get top items for quick highlights
  const topProducts = [...(metrics?.products?.items || [])]
    .sort((a, b) => b.views - a.views)
    .slice(0, 3);

  const topPosts = [...(metrics?.posts?.items || [])]
    .sort((a, b) => b.views - a.views)
    .slice(0, 3);

  return (
    <div className={styles.dashboard}>
      <div className={styles.welcomeBanner}>
        <div className={styles.bannerText}>
          <h2>היי {user?.name || 'אילה'}, ברוכה הבאה ללוח הבקרה! ✨</h2>
          <p>כאן תוכלי לנהל את החנות, את קטגוריות העוגות ואת הבלוג שלך, ולצפות בביצועים ובסטטיסטיקות בזמן אמת.</p>
        </div>
        <div className={styles.bannerBadge}>
          <Award size={48} />
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statsCard}>
          <div className={`${styles.statsIcon} ${styles.blue}`}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.statsInfo}>
            <span className={styles.label}>סה״כ צפיות באתר</span>
            <h3 className={styles.value}>{totalViews}</h3>
          </div>
        </div>

        <div className={styles.statsCard}>
          <div className={`${styles.statsIcon} ${styles.purple}`}>
            <Users size={24} />
          </div>
          <div className={styles.statsInfo}>
            <span className={styles.label}>מבקרים ייחודיים</span>
            <h3 className={styles.value}>{totalUniques}</h3>
          </div>
        </div>

        <div className={styles.statsCard}>
          <div className={`${styles.statsIcon} ${styles.pink}`}>
            <ShoppingBag size={24} />
          </div>
          <div className={styles.statsInfo}>
            <span className={styles.label}>מוצרים בקטלוג</span>
            <h3 className={styles.value}>{totalProducts}</h3>
          </div>
        </div>

        <div className={styles.statsCard}>
          <div className={`${styles.statsIcon} ${styles.green}`}>
            <FileText size={24} />
          </div>
          <div className={styles.statsInfo}>
            <span className={styles.label}>פוסטים בבלוג</span>
            <h3 className={styles.value}>{totalPosts}</h3>
          </div>
        </div>
      </div>

      <div className={styles.quickLinksSection}>
        <h3>קישורים מהירים ופעולות נפוצות</h3>
        <div className={styles.quickLinksGrid}>
          <Link href="/admin/products/new" className={styles.quickLinkCard}>
            <div className={styles.quickLinkIcon}>
              <PlusCircle size={24} />
            </div>
            <div className={styles.quickLinkInfo}>
              <h4>הוספת מוצר חדש</h4>
              <p>הוספת עוגה, קינוח או מאפה מעוצב לחנות</p>
            </div>
            <ChevronLeft size={18} className={styles.chevron} />
          </Link>

          <Link href="/admin/posts/new" className={styles.quickLinkCard}>
            <div className={styles.quickLinkIcon}>
              <PlusCircle size={24} />
            </div>
            <div className={styles.quickLinkInfo}>
              <h4>כתיבת פוסט חדש</h4>
              <p>כתיבת פוסט, מתכון או טיפ אפייה חדש</p>
            </div>
            <ChevronLeft size={18} className={styles.chevron} />
          </Link>

          <Link href="/admin/categories" className={styles.quickLinkCard}>
            <div className={styles.quickLinkIcon}>
              <FolderTree size={24} />
            </div>
            <div className={styles.quickLinkInfo}>
              <h4>ניהול קטגוריות</h4>
              <p>עריכה והוספת קטגוריות מוצרים</p>
            </div>
            <ChevronLeft size={18} className={styles.chevron} />
          </Link>

          <Link href="/admin/media" className={styles.quickLinkCard}>
            <div className={styles.quickLinkIcon}>
              <ImageIcon size={24} />
            </div>
            <div className={styles.quickLinkInfo}>
              <h4>ספריית מדיה</h4>
              <p>העלאה וניהול של תמונות מוצרים ופוסטים</p>
            </div>
            <ChevronLeft size={18} className={styles.chevron} />
          </Link>
        </div>
      </div>

      <div className={styles.insightsSection}>
        <div className={styles.insightColumn}>
          <div className={styles.columnHeader}>
            <h3>🔝 מוצרים הכי נצפים</h3>
            <Link href="/admin/metrics" className={styles.viewAll}>צפי בכולם</Link>
          </div>
          <div className={styles.insightList}>
            {topProducts.map((p, i) => (
              <div key={p._id} className={styles.insightRow}>
                <span className={styles.rank}>#{i + 1}</span>
                <span className={styles.title} title={p.title}>{p.title}</span>
                <span className={styles.metricValue}>{p.views} צפיות</span>
              </div>
            ))}
            {topProducts.length === 0 && <p className={styles.emptyText}>אין עדיין נתוני צפיות למוצרים.</p>}
          </div>
        </div>

        <div className={styles.insightColumn}>
          <div className={styles.columnHeader}>
            <h3>✍️ פוסטים מובילים בבלוג</h3>
            <Link href="/admin/metrics" className={styles.viewAll}>צפי בכולם</Link>
          </div>
          <div className={styles.insightList}>
            {topPosts.map((p, i) => (
              <div key={p._id} className={styles.insightRow}>
                <span className={styles.rank}>#{i + 1}</span>
                <span className={styles.title} title={p.title}>{p.title}</span>
                <span className={styles.metricValue}>{p.views} צפיות</span>
              </div>
            ))}
            {topPosts.length === 0 && <p className={styles.emptyText}>אין עדיין נתוני צפיות לפוסטים.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}