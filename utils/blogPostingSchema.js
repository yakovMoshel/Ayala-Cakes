import { getPostDisplayDate } from '@/utils/postPublishDate';
import { SITE_ENTITY_ID, toAbsoluteContentUrl, toAbsoluteSiteUrl } from '@/utils/siteUrl';

const ARTICLE_TYPES = new Set(['Article', 'BlogPosting', 'NewsArticle', 'SocialMediaPosting']);

function collectTypes(node, types = []) {
  if (!node || typeof node !== 'object') return types;
  if (Array.isArray(node)) {
    node.forEach((item) => collectTypes(item, types));
    return types;
  }

  const type = node['@type'];
  if (typeof type === 'string') types.push(type);
  else if (Array.isArray(type)) types.push(...type.filter((entry) => typeof entry === 'string'));

  if (node['@graph']) collectTypes(node['@graph'], types);
  return types;
}

/** True when stored JSON-LD already describes the article, so the template must not emit a second one. */
export function isArticleStructuredData(data) {
  return collectTypes(data).some((type) => ARTICLE_TYPES.has(type));
}

function toIsoDate(value) {
  if (value == null || value === '') return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

/** Cover image only. Relative site paths become absolute; data URLs and empty values are omitted. */
function coverImageUrl(image) {
  if (typeof image !== 'string') return null;
  const value = image.trim();
  if (!value || value.startsWith('data:')) return null;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('/')) return toAbsoluteSiteUrl(value);
  return null;
}

/**
 * BlogPosting from stored article fields.
 * Omits author, dates, and image when the post does not have them.
 * Dates come only from publishDate, createdAt, or updatedAt — never the render clock.
 */
export function buildBlogPostingSchema(post) {
  const headline = typeof post?.title === 'string' ? post.title.trim() : '';
  const slug = typeof post?.slug === 'string' ? post.slug : '';
  if (!headline || !slug) return null;

  const url = toAbsoluteContentUrl('/blog', slug);
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    url,
    publisher: {
      '@type': 'Bakery',
      '@id': SITE_ENTITY_ID,
      name: 'Ayala Cakes',
      url: toAbsoluteSiteUrl('/'),
      logo: {
        '@type': 'ImageObject',
        url: toAbsoluteSiteUrl('/ayala-cakes-logo.png'),
      },
    },
  };

  const author = typeof post.author === 'string' ? post.author.trim() : '';
  if (author) {
    schema.author = { '@type': 'Person', name: author };
  }

  const datePublished = toIsoDate(getPostDisplayDate(post));
  if (datePublished) schema.datePublished = datePublished;

  const dateModified = toIsoDate(post.updatedAt);
  if (dateModified) schema.dateModified = dateModified;

  const image = coverImageUrl(post.image);
  if (image) schema.image = [image];

  return schema;
}
