import styles from './style.module.scss';
import { connectToMongo } from '@/server/DL/connectToMongo';
import { getPost } from '@/server/BL/postService';
import SinglePost from '@/Components/SinglePost';
import { permanentRedirect } from 'next/navigation';

export async function generateMetadata({ params }) {
  await connectToMongo();
  const post = await getPost({ _id: params.id });
  
  if (!post) {
    return {
      title: 'פוסט לא נמצא',
      description: 'הפוסט שחיפשת לא נמצא במערכת'
    };
  }

  // אם יש slug, מפנה לכתובת החדשה
  if (post.slug) {
    permanentRedirect(`/blog/${post.slug}`);
  }
  
  return {
    title: post.seoTitle || post.title,
    description: post.metaDescription || post.summary,
    keywords: post.focusKeyword ? 
      [post.focusKeyword, ...(post.secondaryKeywords || [])].join(', ') 
      : undefined,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.metaDescription || post.summary,
      images: post.socialImage ? [post.socialImage] : [],
    },
  };
}

export default async function Page({ params }) {
  await connectToMongo();

  const post = await getPost({ _id: params.id });
  
  // אם יש slug, מפנה לכתובת החדשה
  if (post && post.slug) {
    permanentRedirect(`/blog/${post.slug}`);
  }
  
  return (
    <div className={styles.postPage}>
      <SinglePost post={post} />
    </div>
  );
}