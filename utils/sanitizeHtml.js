import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize rich HTML from the blog editor (ReactQuill) for safe public render.
 * Keeps common formatting tags; strips scripts/handlers/unknown markup.
 */
export function sanitizeBlogHtml(html) {
  if (!html || typeof html !== 'string') return '';

  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target', 'rel', 'class'],
    ALLOWED_URI_REGEXP:
      /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
}

/**
 * Stricter sanitize for optional embed snippets in post CTA blocks.
 */
export function sanitizeEmbedHtml(html) {
  if (!html || typeof html !== 'string') return '';

  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_TAGS: ['iframe'],
    ADD_ATTR: [
      'allow',
      'allowfullscreen',
      'frameborder',
      'scrolling',
      'src',
      'title',
      'width',
      'height',
      'loading',
      'referrerpolicy',
    ],
    ALLOWED_URI_REGEXP: /^(?:https?:)/i,
  });
}
