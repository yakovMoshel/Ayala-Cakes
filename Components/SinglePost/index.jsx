import React from 'react';
import styles from './style.module.scss';
import PostViewTracker from '@/Components/PostViewTracker';
import PostCtaBlock from '@/Components/PostCtaBlock';

export default function SinglePost({ post, ctaProducts = [] }) {
  return (
    <div className={styles.singlePost}>
      {post.status === 'published' && post.slug && (
        <PostViewTracker slug={post.slug} />
      )}
      <h1 className={styles.title}>{post.title}</h1>
      <p className={styles.summary}>{post.summary}</p>
      <p className={styles.author}>נכתב על ידי {post.author} בתאריך {new Date(post.createdAt).toLocaleDateString()}</p>
      {post.image && <img src={post.image} alt={post.title} className={styles.image} />}
      <div className={styles.content} dangerouslySetInnerHTML={{ __html: post.content }}></div>
      <PostCtaBlock cta={post.postCta} products={ctaProducts} hideAdminActions />
    </div>
  );
}