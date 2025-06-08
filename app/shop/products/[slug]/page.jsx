import React from 'react';
import styles from './style.module.scss';
import { connectToMongo } from '@/server/DL/connectToMongo';
import { getProductBySlug } from '@/server/BL/productService';
import ImageGallery from '@/Components/ImageGallery';
import OrderButton from '@/Components/OrderButton';
import { notFound } from 'next/navigation';

// מטא-דטה דינמית לכל מוצר
export async function generateMetadata({ params }) {
  await connectToMongo();
  const product = await getProductBySlug(params.slug);
  
  if (!product) {
    return {
      title: 'מוצר לא נמצא',
      description: 'המוצר שחיפשת לא נמצא במערכת'
    };
  }

  return {
    title: product.seoTitle || `${product.name} - עוגות מעוצבות של אילה`,
    description: product.metaDescription || `הזמינו ${product.name} - עוגה מעוצבת בהתאמה אישית במגוון טעמים וסגנונות לבחירה`,
    keywords: product.focusKeyword ? 
      [product.focusKeyword, ...(product.secondaryKeywords || [])].join(', ') 
      : `עוגה מעוצבת, ${product.name}, עוגות בהזמנה, קונדיטוריה`,
    openGraph: {
      title: product.seoTitle || product.name,
      description: product.metaDescription || `הזמינו ${product.name} - עוגה מעוצבת בהתאמה אישית`,
      images: product.images?.length > 0 ? [product.images[0]] : [],
      type: 'website',
    },
    alternates: {
      canonical: `/shop/products/${params.slug}`
    }
  };
}

export default async function ProductPage({ params }) {
    await connectToMongo();

    const item = await getProductBySlug(params.slug);

    if (!item) {
        notFound();
    }

    const plainItem = JSON.parse(JSON.stringify(item));

    const {
        name,
        description,
        price,
        images,
        colors,
        flavors,
        glutenFreeOption,
        notDairyOption,
        diameter,
        height,
        filling,
    } = item;

    const colorMap = {
        'ורוד': '#FFB6C1',
        'לבן': '#fafafa',
        'ירוק': '#98FB98',
        'צהוב': '#FFFFE0',
        'אדום': '#de3737',
        'קרם': '#FFFDD0',
        'כחול': '#ADD8E6',
        'שחור': '#000000',
        'תכלת': '#E0FFFF',
        'כתום': '#FFDAB9',
        'אפרסק': '#FFE5B4',
        'סגול': '#ce52ff',
        'חום': '#452c22',
        'זהב': '#c78a4a',
    };

    const formattedDescription = description.split('\n').map((line, index) => {
        if (index === 0) {
            return <p key={index} className={styles.firstLine}>{line}</p>;
        } else if (line.trim() === '') {
            return null;
        } else {
            return (
                <ul key={index} className={styles.bulletPoint}>
                    <li>{line}</li>
                </ul>
            );
        }
    });

    return (
        <div className={styles.productPage}>
            <div className={styles.leftSide}>
                <ImageGallery images={images} />
            </div>
            <div className={styles.rightSide}>
                <div className={styles.name}>
                    {name}
                </div>
                <div className={styles.details}>
                    <div>{formattedDescription}</div>
                </div>
                <div className={styles.colorsContainer}>
                    אופציות צבעים:
                    {colors.map((color, index) => {
                        const backgroundColor = colorMap[color] || '#ffffff';
                        return (
                            <div key={index} className={styles.colorCircle} style={{ backgroundColor }}></div>
                        );
                    })}
                </div>
                <div className={styles.infoAndOrder}>
                    <div className={styles.additionalInfo}>
                        <div className={styles.infoItem}>
                            קוטר: {diameter} ס"מ
                        </div>
                        <div className={styles.separator}></div>

                        <div className={styles.infoItem}>
                            גובה: {height} ס"מ
                        </div>
                        <div className={styles.separator}></div>

                        <div className={styles.infoItem}>
                            טעמים: {flavors.join(', ')}
                        </div>
                        <div className={styles.separator}></div>

                        <div className={styles.infoItem}>
                            {glutenFreeOption === true ? 'אופציה ללא גלוטן' : ''}
                        </div>

                        <div className={styles.separator}></div>
                        <div className={styles.price}>
                            {price} ₪
                        </div>
                    </div>

                    <OrderButton item={plainItem} />
                </div>
                <div className={styles.customization}> ניתן לבחור צבע כיתוב, צבע עיטוף, צבע עוגה, שם, גיל
                    שתפו אותי בחלומות שלכם בשדה ההערות, ואני אעצב עבורכם {name} מושלמת
                </div>
            </div>
        </div>
    );
} 