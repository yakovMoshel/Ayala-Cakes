import { connectToMongo } from '@/server/DL/connectToMongo';
import { getAllProducts } from '@/server/BL/productService';
import { getAllPosts } from '@/server/BL/postService';

export default async function sitemap() {
  const baseUrl = 'https://www.ayacakes.biz';

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/bento-workshop`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/summer`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  try {
    // Connect to database
    await connectToMongo();
    
    // Get all products and posts
    const [products, posts] = await Promise.all([
      getAllProducts(),
      getAllPosts()
    ]);

    // Generate product pages
    const productPages = products?.map((product) => ({
      url: `${baseUrl}/shop/products/${product.slug}`,
      lastModified: product.updatedAt || product.createdAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })) || [];

    // Generate blog post pages
    const blogPages = posts?.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt || post.createdAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    })) || [];

    return [...staticPages, ...productPages, ...blogPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return only static pages if database connection fails
    return staticPages;
  }
} 