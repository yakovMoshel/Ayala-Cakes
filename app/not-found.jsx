import Link from 'next/link';
import styles from './not-found.module.scss';

export const metadata = {
  title: 'העמוד לא נמצא',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className={styles.page}>
      <h1>העמוד לא נמצא</h1>
      <p>הכתובת הזו לא קיימת באתר.</p>
      <Link href="/">חזרה לדף הבית</Link>
    </main>
  );
}
