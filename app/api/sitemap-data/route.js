import { connectToMongo } from '@/server/DL/connectToMongo';
import { getAllProducts } from '@/server/BL/productService';
import { getAllPosts } from '@/server/BL/postService';

export async function GET() {
  try {
    await connectToMongo();
    
    const [products, posts] = await Promise.all([
      getAllProducts(),
      getAllPosts()
    ]);
    
    const sitemapData = {
      products: products?.map(product => ({
        slug: product.slug,
        lastmod: product.updatedAt || product.createdAt || new Date().toISOString()
      })) || [],
      posts: posts?.map(post => ({
        slug: post.slug,
        lastmod: post.updatedAt || post.createdAt || new Date().toISOString()
      })) || []
    };
    
    return Response.json(sitemapData);
  } catch (error) {
    console.error('Error fetching sitemap data:', error);
    return Response.json({ products: [], posts: [] });
  }
} 