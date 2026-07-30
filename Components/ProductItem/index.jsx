"use client"
import React, { useState } from 'react';
import styles from "./style.module.scss";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import useStore from '@/store/useStore';
import AdminRowMenu from '@/Components/AdminRowMenu';
import { Edit3, Trash2 } from 'lucide-react';


export default function ProductItem({ product, hideAdminActions = false }) {
    const { _id, name, subtitle, images, slug } = product;

    const router = useRouter();
    const isAuthenticated = useStore((state) => state.isAuthenticated);

    const [isDeleted, setIsDeleted] = useState(false);
    const [isBusy, setIsBusy] = useState(false);

    const handleEdit = () => {
        router.push(`/admin/products/${_id}/edit`);
    };

    const handleDeactivate = async () => {
        const confirmation = window.confirm("האם אתה בטוח שברצונך למחוק מוצר זה?");
        if (!confirmation) return;
        setIsBusy(true);
        try {
            const response = await axios.put(`/api/product/${_id}`, { isActive: false });
            if (response.data.success) {
                setIsDeleted(true);
            }
        } catch (error) {
        } finally {
            setIsBusy(false);
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
            {isAuthenticated && !hideAdminActions && (
                <div className={styles.adminMenu}>
                    <AdminRowMenu
                        label={`פעולות עבור ${name}`}
                        disabled={isBusy}
                        items={[
                            {
                                id: 'edit',
                                label: 'עריכה',
                                icon: <Edit3 size={14} />,
                                onClick: handleEdit,
                            },
                            {
                                id: 'delete',
                                label: 'מחק',
                                icon: <Trash2 size={14} />,
                                tone: 'danger',
                                onClick: handleDeactivate,
                            },
                        ]}
                    />
                </div>
            )}
            <Link href={productLink} legacyBehavior>
                <a className={styles.imageLink}>
                    {/* CSS (.image) controls the rendered 100% x 200px box */}
                    <Image
                        src={images[0]}
                        alt={name}
                        width={500}
                        height={400}
                        sizes="250px"
                        className={styles.image}
                    />
                </a>
            </Link>

            <div className={styles.content}>
                <div className={styles.textContainer}>
                    <h3 className={styles.productName}>
                        {name}
                    </h3>
                    <div className={styles.details}>
                        {subtitle}
                    </div>
                </div>
                {/* Favorites heart on product card — uncomment when re-enabling favorites */}
                {/* <div className={styles.favoriteIcon}>
                    <FavButton productId={product._id} />
                </div> */}
            </div>
        </div>
    );
}
