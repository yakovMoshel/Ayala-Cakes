import React from 'react';
import styles from './style.module.scss';
import Image from 'next/image';
import PostViewTracker from '@/Components/PostViewTracker';
import PostCtaBlock from '@/Components/PostCtaBlock';
import { sanitizeBlogHtml } from '@/utils/sanitizeHtml';
import { formatBlogDate } from '@/utils/formatBlogDate';

export default function SinglePost({ post, ctaProducts = [] }) {
  const safeContent = sanitizeBlogHtml(post.content);

  return (
    <div className={styles.singlePost}>
      {post.status === 'published' && post.slug && (
        <PostViewTracker slug={post.slug} />
      )}
      <h1 className={styles.title}>{post.title}</h1>
      <p className={styles.summary}>{post.summary}</p>
      <p className={styles.author}>נכתב על ידי {post.author} בתאריך {formatBlogDate(post.createdAt)}</p>
      {/* CSS (.image) sets width 100% + 3/2 aspect ratio; attrs only reserve space */}
      {post.image && (
        <Image
          src={post.image}
          alt={post.title}
          width={800}
          height={533}
          sizes="(max-width: 850px) 100vw, 800px"
          priority
          className={styles.image}
        />
      )}
      <div className={styles.content} dangerouslySetInnerHTML={{ __html: safeContent }}></div>
      <PostCtaBlock cta={post.postCta} products={ctaProducts} hideAdminActions />
    </div>
  );
}
