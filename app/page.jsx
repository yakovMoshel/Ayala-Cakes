import { connectToMongo } from '@/server/DL/connectToMongo';
import styles from "./style.module.scss"
import BelieveLine from '@/Components/BelieveLine';
import ProductItem from '@/Components/ProductItem';
import { getAllProducts, getProductsByCategory } from '@/server/BL/productService';
import Testimonial from '@/Components/Testimonial/Index';
import Link from 'next/link';
import Head from 'next/head';


const Home = async () => {
  await connectToMongo();

  const allProducts = await getAllProducts();
  const limitedProducts = allProducts.slice(0, 4);

  return (
    <div className={styles.home}>
        <Head>
        <title>אילה - קונדיטורית | עוגות מעוצבות, סדנאות ועוד בקריות</title>
        <meta name="description" content="היי, אני אילה, קונדיטורית מוסמכת שמעצבת עוגות ייחודיות וקסומות לכל אירוע. כל עוגה נבנית בהתאמה אישית כדי להפוך את האירוע שלכם לבלתי נשכח." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className={styles.top}>
        <div className={styles.image}>
          <img src="אילה אברהם.png" alt="" />
        </div>
        <div className={styles.mobileImage}>
        <img src="אילה אברהם.png" alt="" />

        </div>
        <div className={styles.headTitle}>
          עוגה שהיא פשוט ואו          <div className={styles.subtext}>
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
        <div className={styles.sideTitle}>
          העוגות הפופולריות
        </div>      <div className={styles.products}>
          {limitedProducts.map((product) => (
            <ProductItem key={product._id} product={product} />
          ))}
        </div>
      </div>
      <div className={styles.title}>
        הטעם שעושה את ההבדל  </div>
      <BelieveLine />
      <div className={styles.testimonialContainer}>
        <Testimonial />
        <div className={styles.sideTitle}>
          הלקוחות המרוצים  </div>
      </div>
    </div>
  );
}

export default Home;