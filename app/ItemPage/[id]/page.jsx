import React from 'react';
import styles from './style.module.scss';
import { connectToMongo } from '@/server/DL/connectToMongo';
import { getProduct } from '@/server/BL/productService';
import ImageGallery from '@/Components/ImageGallery';
import OrderButton from '@/Components/OrderButton';
import Head from 'next/head';
import { redirect, permanentRedirect } from 'next/navigation';

export default async function ItemPage({ params }) {

    await connectToMongo();

    const productId = params.id;

    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
        return <div>Invalid product ID</div>;
    }

    const item = await getProduct({ _id: productId });

    if (!item) {
        return <div>Product not found</div>;
    }

    //if the product has a slug, redirect to the new address
    if (item.slug) {
        permanentRedirect(`/shop/products/${item.slug}`);
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
        <div className={styles.ItemPage}>
            <Head>
                <title>{name}</title>
                <meta name="description" content={`הזמינו  ${name} -  בעיצוב אישי במגוון טעמים וסגנונות לבחירה`} />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
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
