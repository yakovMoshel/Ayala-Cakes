/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'i.imgur.com' },
      { protocol: 'https', hostname: 'i.ibb.co' },
    ],
  },
  // Bundle Gemini context .md files into serverless functions (Vercel).
  // Without this, fs.readFileSync fails with ENOENT under /var/task.
  webpack(config) {
    config.module.rules.push({
      test: /\.md$/,
      type: 'asset/source',
    });
    return config;
  },
  async redirects() {
    return [
      // Host redirect: www → apex. Preserves path and query string. 308 is permanent.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.ayacakes.biz' }],
        destination: 'https://ayacakes.biz/:path*',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/sitemap.xml',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
    ];
  },
};

export default nextConfig;
