import { toAbsoluteSiteUrl } from '@/utils/siteUrl';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/login', '/user/settings', '/UniquePost'],
    },
    sitemap: toAbsoluteSiteUrl('/sitemap.xml'),
  };
}
