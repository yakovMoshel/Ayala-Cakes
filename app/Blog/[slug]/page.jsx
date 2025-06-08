import styles from './style.module.scss';
import { connectToMongo } from '@/server/DL/connectToMongo';
import { getPostBySlug } from '@/server/BL/postService';
import SinglePost from '@/Components/SinglePost';
import { notFound, permanentRedirect } from 'next/navigation';

// מטא-דטה דינמית לכל פוסט
export async function generateMetadata({ params }) {
  await connectToMongo();
  const decodedSlug = decodeURIComponent(params.slug);
  const post = await getPostBySlug(decodedSlug);
  
  if (!post) {
    return {
      title: 'פוסט לא נמצא',
      description: 'הפוסט שחיפשת לא נמצא במערכת'
    };
  }

  return {
    title: post.seoTitle || `${post.title} - בלוג הקונדיטוריה של אילה`,
    description: post.metaDescription || post.summary,
    keywords: post.focusKeyword ? 
      [post.focusKeyword, ...(post.secondaryKeywords || [])].join(', ') 
      : `טיפים לאפייה, קונדיטוריה, ${post.title}`,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.metaDescription || post.summary,
      images: post.socialImage ? [post.socialImage] : (post.image ? [post.image] : []),
      type: 'article',
      publishedTime: post.createdAt,
      authors: [post.author || 'אילה אברהם']
    },
    alternates: {
      canonical: `/blog/${params.slug}`
    }
  };
}

export default async function BlogPostPage({ params }) {
  await connectToMongo();

  const decodedSlug = decodeURIComponent(params.slug);
  const post = await getPostBySlug(decodedSlug);
  
  if (!post) {
    notFound();
  }

  return (
    <div className={styles.blogPostPage}>
      <SinglePost post={post} />
    </div>
  );
} 