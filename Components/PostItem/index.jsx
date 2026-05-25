"use client"
import React, { useState } from 'react';
import styles from './style.module.scss';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import useStore from '../../useStore';

export default function PostItem({ post }) {
  const { _id, title, summary, image, createdAt, slug } = post;

  const router = useRouter();
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  const [isDeleted, setIsDeleted] = useState(false);

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/admin/posts/${_id}/edit`);
  };

  const handleDeactivate = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const confirmation = window.confirm("האם אתה בטוח שברצונך למחוק פוסט זה?");
    if (confirmation) {
      try {
        const response = await axios.put(`/api/post/${_id}`, { status: 'deleted' });
        if (response.data.success) {
          setIsDeleted(true);
          router.refresh();
        }
      } catch (error) {
      }
    }
  };

  if (isDeleted) {
    return null;
  }

  // בודק אם יש slug - אם כן משתמש בניתוב החדש, אחרת בישן
  const postLink = slug ? `/blog/${slug}` : `/UniquePost/${_id}`;

  return (
    <Link href={postLink} className={styles.itemLink}>
      <div className={styles.item}>
        <div className={styles.imageContainer}>
          {image && <img src={image} alt={title} className={styles.image} />}
        </div>
        <div className={styles.content}>
          <div className={styles.textContainer}>
            <div className={styles.title}>
              {title}
            </div>
            <div className={styles.summary}>
              {summary}
            </div>
            <div className={styles.createdAt}>
  {createdAt ? new Date(createdAt).toISOString().split('T')[0].replace(/-/g, '.') : ''}
</div>
          </div>
          {isAuthenticated && (
            <div className={styles.buttonContainer}>
              <button
                onClick={handleDeactivate}
                className={styles.deactivateButton}
              >
                מחק פוסט
              </button>
              <button
                onClick={handleEdit}
                className={styles.editButton}
              >
                ערוך פוסט
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}