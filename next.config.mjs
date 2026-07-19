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
      // Old capitalized route (was app/Contact) — preserve any indexed/bookmarked URLs
      {
        source: '/Contact',
        destination: '/contact',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
