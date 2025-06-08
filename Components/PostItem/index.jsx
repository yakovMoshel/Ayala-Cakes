"use client"
import React, { useState } from 'react';
import styles from './style.module.scss';
import Link from 'next/link';
import axios from 'axios';
import EditPostModal from '../EditPostModal';
import useStore from '../../useStore';

export default function PostItem({ post }) {
  const { _id, title, summary, image, createdAt, slug } = post;

  const isAuthenticated = useStore((state) => state.isAuthenticated);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const handleDeactivate = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const confirmation = window.confirm("האם אתה בטוח שברצונך למחוק פוסט זה?");
    if (confirmation) {
      try {
        const response = await axios.delete(`/api/post/${_id}`);
        if (response.data.success) {
          setIsDeleted(true);
        }
      } catch (error) {
      }
    }
  };

  // בודק אם יש slug - אם כן משתמש בניתוב החדש, אחרת בישן
  const postLink = slug ? `/blog/${slug}` : `/UniquePost/${_id}`;

  return (
    <Link href={postLink} className={styles.itemLink}>
      <div className={`${styles.item} ${isDeleted ? styles.deleted : ''}`}>
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsModalOpen(true);
                }}
                className={styles.editButton}
              >
                ערוך פוסט
              </button>
            </div>
          )}
        </div>
        {isModalOpen && (
          <EditPostModal post={post} closeModal={() => setIsModalOpen(false)} />
        )}
      </div>
    </Link>
  );
}