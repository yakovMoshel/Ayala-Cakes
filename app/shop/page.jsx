import { connectToMongo } from '@/server/DL/connectToMongo';
import { getAllProducts } from '@/server/BL/productService';
import ShopClient from './ShopClient';

// ISR: pages are also revalidated on demand when products change (see API routes)
export const revalidate = 3600;

export const metadata = {
    title: 'מגוון עוגות מעוצבות - עוגות בנטו, עוגות לימי הולדת, ומארזים להזמנה בקריות והסביבה',
    description: 'העוגות המעוצבות של אילה. עוגות בנטו, עוגות לימי הולדת, מארזים, והכל בהתאמה אישית בקריות והסביבה. הזמינו עכשיו',
    openGraph: {
        title: 'מגוון עוגות מעוצבות להזמנה בקריות והסביבה',
        description: 'עוגות בנטו, עוגות לימי הולדת, מארזים, והכל בהתאמה אישית. הזמינו עכשיו',
        type: 'website',
    },
    alternates: {
        canonical: '/shop',
    },
};

export default async function Shop() {
    await connectToMongo();
    const products = await getAllProducts();

    return <ShopClient products={products || []} />;
}
