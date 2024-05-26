import React from 'react';
import styles from "./style.module.scss";
import Link from 'next/link';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

export default function ProductItem({ product }) {
    const { _id, name, price, image } = product;


    return (
        <div className={styles.item}>
            <Link href={`/ItemPage/${_id}`} legacyBehavior>
                <a className={styles.imageLink}>
                    <img src={image} alt={name} className={styles.image} />
                </a>
            </Link>
            <div className={styles.content}>
                <div className={styles.productName}>
                    {name}
                </div>
                <div className={styles.details}>
                    עוגה מדהימה במיוחד בטעם שוקולד
                </div>
                <div
                >
                    {<FaHeart />}
                </div>
            </div>
            {/* <div className={styles.footer}>
                <div className={styles.price}>{price} ₪</div>
                <Link href={`/Order/${_id}`} legacyBehavior>
                    <a className={styles.orderButton}>הזמנה</a>
                </Link>
            </div> */}
        </div>
    );
}
