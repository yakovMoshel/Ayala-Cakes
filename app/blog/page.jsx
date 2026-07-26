import React from 'react';
import BlogClient from './BlogClient';
import { getAllPosts } from '@/server/BL/postService';
import { getAllPostCategories } from '@/server/BL/postCategoryService';
import { connectToMongo } from '@/server/DL/connectToMongo';

// ISR: revalidated hourly + on demand when posts change (revalidatePath in API routes)
export const revalidate = 3600;

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ayacakes.biz';

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
      images: [
        {
          url: '/ayala-avraham.webp',
          width: 1000,
          height: 600,
          alt: 'בלוג הקונדיטוריה של אילה אברהם',
        },
      ],
    },
    alternates: {
      canonical: '/blog',
    },
  };
}

function buildBlogCollectionSchema(posts = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'בלוג קונדיטוריה - טיפים ומתכונים',
    description:
      'בלוג הקונדיטוריה של אילה - טיפים שימושיים, מתכונים מפתיעים, והשראה לעוגות ייחודיות.',
    url: `${baseUrl}/blog`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Ayala Cakes',
      url: baseUrl,
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: posts.length,
      itemListElement: posts.slice(0, 20).map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${baseUrl}/blog/${post.slug}`,
        name: post.title,
      })),
    },
  };
}

export default async function Blog() {
  await connectToMongo();
  const [posts, categories] = await Promise.all([getAllPosts(), getAllPostCategories()]);
  const list = posts || [];
  const schema = buildBlogCollectionSchema(list);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, '\\u003c'),
        }}
      />
      <BlogClient posts={list} categories={categories || []} />
    </>
  );
}
