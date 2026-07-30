"use client"
import React, { useState } from 'react';
import styles from './style.module.scss';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import useStore from '@/store/useStore';
import { formatBlogDate } from '@/utils/formatBlogDate';
import AdminRowMenu from '@/Components/AdminRowMenu';
import { Edit3, Trash2 } from 'lucide-react';

export default function PostItem({ post }) {
  const { _id, title, summary, image, createdAt, slug } = post;

  const router = useRouter();
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  const [isDeleted, setIsDeleted] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const handleEdit = () => {
    router.push(`/admin/posts/${_id}/edit`);
  };

  const handleDeactivate = async () => {
    const confirmation = window.confirm("האם אתה בטוח שברצונך למחוק פוסט זה?");
    if (!confirmation) return;
    setIsBusy(true);
    try {
      const response = await axios.put(`/api/post/${_id}`, { status: 'deleted' });
      if (response.data.success) {
        setIsDeleted(true);
        router.refresh();
      }
    } catch (error) {
    } finally {
      setIsBusy(false);
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
        {isAuthenticated && (
          <div
            className={styles.adminMenu}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <AdminRowMenu
              label={`פעולות עבור ${title}`}
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
        <div className={styles.imageContainer}>
          {/* fill matches the existing absolute-positioned CSS inside the aspect-ratio container */}
          {image && (
            <Image
              src={image}
              alt={title}
              fill
              sizes="(max-width: 768px) 40vw, 200px"
              className={styles.image}
            />
          )}
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
              {formatBlogDate(createdAt)}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
