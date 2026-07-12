/** Static site pages that admins can link to from the post editor and CTA blocks. */
export const STATIC_SITE_PAGES = [
  { label: 'דף הבית', value: '/', type: 'page' },
  { label: 'חנות', value: '/shop', type: 'page' },
  { label: 'בלוג', value: '/blog', type: 'page' },
  { label: 'אודות', value: '/about', type: 'page' },
  { label: 'צור קשר', value: '/contact', type: 'page' },
  { label: 'סדנת בנטו', value: '/bento-workshop', type: 'page' },
  { label: 'קיץ', value: '/summer', type: 'page' },
  { label: 'מועדפים', value: '/favorites', type: 'page' },
];

export function getStaticPages() {
  return STATIC_SITE_PAGES.map((page) => ({
    id: `page:${page.value}`,
    type: 'page',
    title: page.label,
    url: page.value,
    subtitle: page.value,
    date: null,
    views: 0,
    status: 'published',
  }));
}

export function normalizeInternalPath(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('/')) return trimmed;
  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname.includes('ayacakes.biz')) {
      return parsed.pathname || '/';
    }
  } catch {
    // not a full URL
  }
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

export function isInternalUrl(url) {
  if (!url) return true;
  const normalized = url.trim();
  if (normalized.startsWith('/')) return true;
  try {
    const parsed = new URL(normalized);
    return parsed.hostname.includes('ayacakes.biz') || parsed.hostname === 'localhost';
  } catch {
    return true;
  }
}
