import { connectToMongo } from '@/server/DL/connectToMongo';
import styles from "./style.module.scss"
import BelieveLine from '@/Components/BelieveLine';
import ProductItem from '@/Components/ProductItem';
import { getAllProducts, getProductsByCategory } from '@/server/BL/productService';
import Testimonial from '@/Components/Testimonial/Index';
import Link from 'next/link';
import Image from 'next/image';

// ISR: refresh the featured products hourly + on demand when products change
export const revalidate = 3600;

export const metadata = {
  title: 'אילה - קונדיטורית | עוגות מעוצבות, סדנאות ועוד בקריות',
  description: 'היי, אני אילה, קונדיטורית מוסמכת שמעצבת עוגות ייחודיות וקסומות לכל אירוע. כל עוגה נבנית בהתאמה אישית כדי להפוך את האירוע שלכם לבלתי נשכח.',
  openGraph: {
    title: 'אילה - קונדיטורית | עוגות מעוצבות, סדנאות ועוד בקריות',
    description: 'עוגות ייחודיות וקסומות לכל אירוע, בהתאמה אישית - קונדיטורית מוסמכת בקריות והסביבה',
    type: 'website',
  },
  alternates: {
    canonical: '/',
  },
};

const Home = async () => {
  await connectToMongo();

  const allProducts = await getAllProducts();
  const limitedProducts = allProducts.slice(0, 4);

  return (
    <div className={styles.home}>
      <div className={styles.top}>
        <div className={styles.image}>
          <Image
            src="/ayala-avraham.webp"
            alt="אילה אברהם - קונדיטורית מוסמכת"
            width={1000}
            height={600}
            priority
            sizes="(max-width: 768px) 100vw, 40vw"
          />
        </div>
        <div className={styles.headTitle}>
          {/* font: inherit keeps the exact .headTitle typography (UA h1 styles suppressed) */}
          <h1 style={{ font: 'inherit', margin: 0 }}>עוגה שהיא פשוט ואו</h1>
          <div className={styles.subtext}>
            היי, אני אילה, קונדיטורית מוסמכת ומעצבת עוגות, עם תשוקה ליצור עוגות ייחודיות וקסומות שיהפכו כל אירוע לחגיגה בלתי נשכחת
          </div>
          <div className={styles.btn}>
            <Link href="/shop" passHref>
              <button>לצפייה בעוגות</button>
            </Link>
          </div>
        </div>
      </div>
      <div className={styles.topProducts}>
        <h2 className={styles.sideTitle}>
          העוגות הפופולריות
        </h2>      <div className={styles.products}>
          {limitedProducts.map((product) => (
            <ProductItem key={product._id} product={product} />
          ))}
        </div>
      </div>
      <h2 className={styles.title}>
        הטעם שעושה את ההבדל  </h2>
      <BelieveLine />
      <div className={styles.testimonialContainer}>
        <Testimonial />
        <h2 className={styles.sideTitle}>
          הלקוחות המרוצים  </h2>
      </div>
    </div>
  );
}

export default Home;