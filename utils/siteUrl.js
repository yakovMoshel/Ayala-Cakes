/** Production origin. Canonicals, sitemap, robots, og:url, and first-party JSON-LD use this host. */
export const SITE_URL = 'https://ayacakes.biz';

/** Stable id for the site-wide Bakery entity in app/layout.js. */
export const SITE_ENTITY_ID = `${SITE_URL}/#bakery`;

const WWW_ORIGIN = /https?:\/\/www\.ayacakes\.biz(?=[:/?#]|$)/gi;

/** Absolute first-party URL. External http(s) URLs are returned unchanged, except www.ayacakes.biz. */
export function toAbsoluteSiteUrl(path = '/') {
  if (typeof path !== 'string' || !path.trim()) {
    return new URL('/', SITE_URL).href;
  }

  const value = path.trim();
  if (/^https?:\/\//i.test(value)) {
    return value.replace(WWW_ORIGIN, SITE_URL);
  }

  const withSlash = value.startsWith('/') ? value : `/${value}`;
  if (withSlash === '/') return SITE_URL;
  return new URL(withSlash, SITE_URL).href;
}

/**
 * Absolute URL for a stored content slug.
 * Assigning `pathname` keeps a trailing space (as %20). `new URL('/path/' + slug)` drops it,
 * which listed one published post as a different URL that 404s.
 */
export function toAbsoluteContentUrl(prefix, slug) {
  const url = new URL(SITE_URL);
  const base = prefix.startsWith('/') ? prefix : `/${prefix}`;
  const normalizedBase = base.length > 1 && base.endsWith('/') ? base.slice(0, -1) : base;
  url.pathname = `${normalizedBase}/${slug}`;
  return url.href;
}

/** Rewrite first-party www origins inside strings, arrays, and plain objects. Leaves CDN and social URLs alone. */
export function rewriteFirstPartyUrls(value) {
  if (typeof value === 'string') {
    return value.replace(WWW_ORIGIN, SITE_URL);
  }
  if (Array.isArray(value)) {
    return value.map(rewriteFirstPartyUrls);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, rewriteFirstPartyUrls(entry)])
    );
  }
  return value;
}

export function jsonLd(data) {
  const plain = JSON.parse(JSON.stringify(data ?? null));
  return JSON.stringify(rewriteFirstPartyUrls(plain)).replace(/</g, '\\u003c');
}
