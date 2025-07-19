/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://www.ayacakes.biz/',
    generateRobotsTxt: true,
    additionalPaths: async () => {
        try {
            // Only run in production build to avoid exposing DB in development
            if (process.env.NODE_ENV !== 'production') {
                console.log('Skipping dynamic sitemap generation in development');
                return [];
            }
            
            // Import functions to get all products and posts
            const { getAllProducts } = require('./server/BL/productService');
            const { getAllPosts } = require('./server/BL/postService');
            const { connectToMongo } = require('./server/DL/connectToMongo');
            
            // Connect to database
            await connectToMongo();
            
            // Get all products and posts
            const [products, posts] = await Promise.all([
                getAllProducts(),
                getAllPosts()
            ]);
            
            const paths = [];
            
            // Add product pages
            if (products && products.length > 0) {
                products.forEach(product => {
                    if (product.slug) {
                        paths.push({
                            loc: `/shop/products/${product.slug}`,
                            lastmod: product.updatedAt || product.createdAt || new Date().toISOString(),
                            priority: 0.8,
                            changefreq: 'weekly'
                        });
                    }
                });
            }
            
            // Add blog post pages
            if (posts && posts.length > 0) {
                posts.forEach(post => {
                    if (post.slug) {
                        paths.push({
                            loc: `/blog/${post.slug}`,
                            lastmod: post.updatedAt || post.createdAt || new Date().toISOString(),
                            priority: 0.7,
                            changefreq: 'weekly'
                        });
                    }
                });
            }
            
            console.log(`Generated sitemap with ${paths.length} dynamic paths`);
            return paths;
        } catch (error) {
            console.error('Error generating dynamic sitemap paths:', error);
            return [];
        }
    }
}