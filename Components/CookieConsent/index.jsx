'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getCookieConsent,
  setCookieConsent,
} from '@/utils/cookieConsent';
import styles from './style.module.scss';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getCookieConsent() == null) {
      setVisible(true);
    }
  }, []);

  const choose = (value) => {
    setCookieConsent(value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className={styles.banner}
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
    >
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p id="cookie-consent-title" className={styles.title}>
            עוגיות באתר
          </p>
          <p id="cookie-consent-desc" className={styles.text}>
            אנחנו משתמשים בעוגיות חיוניות להתחברות לניהול האתר, ובעוגיות אנליטיקה
            אופציונליות לספירת צפיות במוצרים ובפוסטים. אפשר לאשר או לסרב — פרטים
            נוספים ב
            <Link href="/privacy">מדיניות הפרטיות</Link>.
          </p>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.accept}
            onClick={() => choose('accepted')}
          >
            אישור
          </button>
          <button
            type="button"
            className={styles.decline}
            onClick={() => choose('declined')}
          >
            סירוב
          </button>
        </div>
      </div>
    </div>
  );
}
