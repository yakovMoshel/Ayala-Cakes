/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'i.imgur.com' },
      { protocol: 'https', hostname: 'i.ibb.co' },
    ],
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
