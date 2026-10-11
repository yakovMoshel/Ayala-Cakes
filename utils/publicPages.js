export const STATIC_PAGES = [
  { path: '/', title: 'בית' },
  { path: '/about', title: 'אודות' },
  { path: '/shop', title: 'חנות' },
  { path: '/blog', title: 'בלוג' },
  { path: '/bento-workshop', title: 'סדנת בנטו' },
  { path: '/summer', title: 'קורס קיץ' },
  { path: '/favorites', title: 'מועדפים' },
  { path: '/privacy', title: 'מדיניות פרטיות' },
  { path: '/terms', title: 'תקנון' },
];

const STATIC_TITLES = new Map(STATIC_PAGES.map((page) => [page.path, page.title]));

const BLOCKED_PREFIX = /^\/(admin|api|login|_next)(\/|$)/;

/** Public pathname safe to store. Returns null when the path should not be tracked. */
export function normalizePublicPath(input) {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return null;
  if (/[?#\\]/.test(trimmed) || trimmed.includes('..')) return null;

  let path;
  try {
    path = decodeURIComponent(trimmed);
  } catch {
    return null;
  }

  if (path.includes('..') || path.includes('\\') || path.includes('\0')) return null;
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
  if (!path.startsWith('/') || path.length > 180) return null;
  if (BLOCKED_PREFIX.test(path)) return null;

  if (path !== '/' && path.split('/').some((segment, index) => index > 0 && !segment)) return null;
  if (path !== '/' && !/^\/[\p{L}\p{N}\-._~/]+$/u.test(path)) return null;

  return path;
}

export function titleForPublicPath(path, { posts = [], products = [] } = {}) {
  const known = STATIC_TITLES.get(path);
  if (known) return known;

  if (path.startsWith('/blog/')) {
    const slug = path.slice('/blog/'.length);
    return posts.find((post) => post.slug === slug)?.title || slug;
  }

  if (path.startsWith('/shop/products/')) {
    const slug = path.slice('/shop/products/'.length);
    return products.find((product) => product.slug === slug)?.name || slug;
  }

  return path;
}
