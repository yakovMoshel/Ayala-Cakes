import React from 'react';
import BlogClient from './BlogClient';
import { getAllPosts } from '@/server/BL/postService';
import { getAllPostCategories } from '@/server/BL/postCategoryService';
import { connectToMongo } from '@/server/DL/connectToMongo';

// ISR: revalidated hourly + on demand when posts change (revalidatePath in API routes)
export const revalidate = 3600;

// מטא-דטה סטטית לדף הבלוג הראשי
export async function generateMetadata() {
  return {
    title: 'בלוג קונדיטוריה - טיפים ומתכונים לאפייה ועיצוב עוגות מאת אילה אברהם',
    description:
      'בלוג הקונדיטוריה של אילה - טיפים שימושיים, מתכונים מפתיעים, והשראה לעוגות ייחודיות. גלו איך לשדרג את העוגות שלכם עם הטיפים והמתכונים שלי.',
    keywords:
      'בלוג קונדיטוריה, טיפים לאפייה, מתכונים, עוגות מעוצבות, אילה אברהם, עיצוב עוגות',
    openGraph: {
      title: 'בלוג הקונדיטוריה של אילה - טיפים ומתכונים',
      description:
        'טיפים שימושיים, מתכונים מפתיעים, והשראה לעוגות ייחודיות מאת הקונדיטורית אילה אברהם',
      type: 'website',
    },
    alternates: {
      canonical: '/blog',
    },
  };
}

export default async function Blog() {
  await connectToMongo();
  const [posts, categories] = await Promise.all([getAllPosts(), getAllPostCategories()]);

  return <BlogClient posts={posts || []} categories={categories || []} />;
}
