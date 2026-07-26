import React from 'react';
import Link from 'next/link';
import styles from './style.module.scss';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ayacakes.biz';

export const metadata = {
  title: 'מדיניות פרטיות | Ayala Cakes',
  description:
    'מדיניות הפרטיות של Ayala Cakes: טפסי יצירת קשר והזמנות, עוגיות ושימוש בנתונים באתר.',
  openGraph: {
    title: 'מדיניות פרטיות | Ayala Cakes',
    description: 'מידע על איסוף ושימוש בנתונים באתר Ayala Cakes.',
    type: 'website',
    url: '/privacy',
    images: [
      {
        url: '/ayala-avraham.webp',
        width: 1000,
        height: 600,
        alt: 'Ayala Cakes — מדיניות פרטיות',
      },
    ],
  },
  alternates: {
    canonical: '/privacy',
  },
};

const privacyPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'מדיניות פרטיות — Ayala Cakes',
  description: 'מדיניות הפרטיות של אתר Ayala Cakes.',
  url: `${baseUrl}/privacy`,
  isPartOf: {
    '@type': 'WebSite',
    name: 'Ayala Cakes',
    url: baseUrl,
  },
};

export default function Privacy() {
  return (
    <div className={styles.privacy}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(privacyPageSchema).replace(/</g, '\\u003c'),
        }}
      />
      <div className={styles.panel}>
        <h1 className={styles.sideTitle}>מדיניות פרטיות</h1>
        <div className={styles.text}>
          <p>
            באתר Ayala Cakes (אילה קייקס) אנו מכבדים את פרטיותכם. להלן מידע קצר על השימוש
            בנתונים באתר.
          </p>

          <h2>טפסי יצירת קשר והזמנה</h2>
          <p>
            באתר ניתן לשלוח הודעה דרך{' '}
            <Link href="/contact">טופס יצירת קשר</Link> או להשאיר פרטי הזמנה בדפי המוצרים.
            הפרטים נשלחים בדוא״ל לבעלת העסק לצורך מענה והמשך טיפול בהזמנה.
          </p>

          <h2>עוגיות</h2>
          <p>
            האתר משתמש בעוגיות חיוניות לתפעול בטוח של ממשק הניהול, ובעוגיות אנליטיקה
            אופציונליות לספירת צפיות בתוכן. עוגיות האנליטיקה נשמרות רק אם אישרתם זאת
            בבאנר ההסכמה.
          </p>

          <h2>צפיות באתר</h2>
          <p>
            אם אישרתם עוגיות אנליטיקה, ייתכן שנרשום צפיות בדפי מוצרים ופוסטים לצרכים
            פנימיים של שיפור האתר. אם סירבתם — לא נאסוף מידע זה.
          </p>

          <h2>שירותים חיצוניים</h2>
          <p>
            לתפעול האתר אנו נעזרים בספקי שירות מקובלים (למשל אחסון, תמונות, דוא״ל
            ואירוח). הם משמשים להפעלת האתר ולמתן השירות — לא למעקב פרסומי אחריכם.
          </p>

          <h2>יצירת קשר</h2>
          <p>
            לשאלות בנוגע לפרטיות ניתן לפנות דרך{' '}
            <Link href="/contact">טופס יצירת הקשר</Link> או בדוא״ל{' '}
            <a href="mailto:ayalapastry@gmail.com">ayalapastry@gmail.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
