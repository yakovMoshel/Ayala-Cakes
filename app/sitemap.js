import fs from 'fs';
import { connectToMongo } from '@/server/DL/connectToMongo';
import { getAllProducts } from '@/server/BL/productService';
import { getAllPosts } from '@/server/BL/postService';
import { toAbsoluteContentUrl, toAbsoluteSiteUrl } from '@/utils/siteUrl';

// Rebuild from the database on each request, and again when content is revalidated.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const STATIC_PAGES = [
  { path: '/', file: './page.jsx', changeFrequency: 'daily', priority: 1 },
  { path: '/about', file: './about/page.jsx', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/privacy', file: './privacy/page.jsx', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/terms', file: './terms/page.jsx', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/shop', file: './shop/page.jsx', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/blog', file: './blog/page.jsx', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/bento-workshop', file: './bento-workshop/page.jsx', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/paint-cake-workshop', file: './paint-cake-workshop/page.jsx', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/summer', file: './summer/page.jsx', changeFrequency: 'monthly', priority: 0.7 },
];

function fileModified(relativeFile) {
  try {
    return fs.statSync(new URL(relativeFile, import.meta.url)).mtime;
  } catch (error) {
    console.error('Sitemap file date failed:', relativeFile, error);
    return undefined;
  }
}

function asDate(value) {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function latestDate(dates) {
  const valid = dates.filter(Boolean);
  if (!valid.length) return undefined;
  return new Date(Math.max(...valid.map((date) => date.getTime())));
}

function contentModified(doc) {
  return asDate(doc?.updatedAt) || asDate(doc?.createdAt);
}

/** Slugs we still list when the live page returns 200, but should be cleaned up later. */
function malformedSlugReason(slug) {
  if (typeof slug !== 'string' || slug.length === 0) return 'missing slug';
  if (slug !== slug.trim()) return 'leading or trailing whitespace';
  if (/\s/.test(slug)) return 'whitespace inside slug';
  if (slug.includes('/') || /[?#\\]/.test(slug)) return 'reserved character in slug';
  return null;
}

function canListSlug(slug) {
  return typeof slug === 'string'
    && slug.length > 0
    && !slug.includes('/')
    && !/[?#\\]/.test(slug);
}

function entry(url, lastModified, changeFrequency, priority) {
  const item = { url, changeFrequency, priority };
  if (lastModified) item.lastModified = lastModified;
  return item;
}

export default async function sitemap() {
  const productDates = [];
  const postDates = [];
  const productPages = [];
  const blogPages = [];
  const malformed = [];

  try {
    await connectToMongo();
    const [products, posts] = await Promise.all([
      getAllProducts(),
      getAllPosts(),
    ]);

    for (const product of products || []) {
      const reason = malformedSlugReason(product.slug);
      if (reason) malformed.push({ type: 'product', slug: product.slug, name: product.name, reason });
      if (!canListSlug(product.slug)) continue;
      const modified = contentModified(product);
      if (modified) productDates.push(modified);
      productPages.push(entry(
        toAbsoluteContentUrl('/shop/products', product.slug),
        modified,
        'weekly',
        0.8,
      ));
    }

    for (const post of posts || []) {
      const reason = malformedSlugReason(post.slug);
      if (reason) malformed.push({ type: 'post', slug: post.slug, name: post.title, reason });
      if (!canListSlug(post.slug)) continue;
      const modified = contentModified(post);
      if (modified) postDates.push(modified);
      blogPages.push(entry(
        toAbsoluteContentUrl('/blog', post.slug),
        modified,
        'weekly',
        0.7,
      ));
    }
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  if (malformed.length) {
    console.warn('Sitemap skipped or flagged malformed slugs (not renamed):', malformed);
  }

  const newestProduct = latestDate(productDates);
  const newestPost = latestDate(postDates);

  const staticPages = STATIC_PAGES.map((page) => {
    const fileDate = fileModified(page.file);
    let lastModified = fileDate;
    if (page.path === '/' || page.path === '/shop') {
      lastModified = latestDate([fileDate, newestProduct]);
    }
    if (page.path === '/blog') {
      lastModified = latestDate([fileDate, newestPost]);
    }
    if (page.path === '/summer') {
      lastModified = latestDate([fileDate, fileModified('./summer/SummerClient.jsx')]);
    }
    const workshopContent = {
      '/bento-workshop': '../content/workshops/bento.js',
      '/paint-cake-workshop': '../content/workshops/paintCake.js',
    };
    if (workshopContent[page.path]) {
      lastModified = latestDate([fileDate, fileModified(workshopContent[page.path])]);
    }
    return entry(toAbsoluteSiteUrl(page.path), lastModified, page.changeFrequency, page.priority);
  });

  return [...staticPages, ...productPages, ...blogPages];
}
