"use client"
import React, { useState } from 'react';
import styles from "./style.module.scss";
import Link from 'next/link';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import FavButton from '../FavButton';
import axios from 'axios';
import useStore from '../../useStore';
import EditProductModal from '../EditProductModal/Index';


export default function ProductItem({ product }) {
    const { _id, name, subtitle, images, slug } = product;

    const isAuthenticated = useStore((state) => state.isAuthenticated);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);

    const handleDeactivate = async () => {
        const confirmation = window.confirm("האם אתה בטוח שברצונך למחוק מוצר זה?");
        if (confirmation) {
            try {
                const response = await axios.put(`/api/product/${_id}`, { isActive: false });
                if (response.data.success) {
                    setIsDeleted(true);
                }
            } catch (error) {
            }
        }
    };

    // כל המוצרים צריכים לכם slug עכשיו
    if (!slug) {
        console.error(`Product ${name} (${_id}) doesn't have a slug`);
        return null; // או אפשר להציג הודעת שגיאה
    }
    const productLink = `/shop/products/${slug}`;

    return (
        <div className={`${styles.item} ${isDeleted ? styles.deleted : ''}`}>
            <Link href={productLink} legacyBehavior>
                <a className={styles.imageLink}>
                    <img src={images[0]} alt={name} className={styles.image} />
                </a>
            </Link>

            <div className={styles.content}>
                <div className={styles.textContainer}>
                    <div className={styles.productName}>
                        {name}
                    </div>
                    <div className={styles.details}>
                        {subtitle}
                    </div>
                </div>
                <div className={styles.favoriteIcon}>
                    <FavButton productId={product._id} />
                </div>
            </div>
            {isAuthenticated && (
                <div className={styles.buttonContainer}>
                    <button onClick={handleDeactivate} className={styles.deactivateButton}>מחק מוצר</button>
                    <button onClick={() => setIsModalOpen(true)} className={styles.editButton}>עריכת מוצר</button>
                </div>
            )}
            {isModalOpen && (
                <EditProductModal product={product} closeModal={() => setIsModalOpen(false)} />
            )}
        </div>
    );
}
