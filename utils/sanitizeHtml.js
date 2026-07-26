import sanitizeHtml from 'sanitize-html';

/**
 * Sanitize rich HTML from the blog editor (ReactQuill) for safe public render.
 * Uses sanitize-html (Node-safe) instead of isomorphic-dompurify/jsdom,
 * which breaks on Vercel serverless with ERR_REQUIRE_ESM.
 */
export function sanitizeBlogHtml(html) {
  if (!html || typeof html !== 'string') return '';

  return sanitizeHtml(html, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      'img',
      'h1',
      'h2',
      'span',
      'u',
      's',
      'sub',
      'sup',
      'video',
      'source',
    ],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ['href', 'name', 'target', 'rel', 'class', 'title'],
      img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading', 'class'],
      span: ['class', 'style'],
      p: ['class', 'style'],
      div: ['class', 'style'],
      h1: ['class'],
      h2: ['class'],
      h3: ['class'],
      h4: ['class'],
      ol: ['class'],
      ul: ['class'],
      li: ['class'],
      blockquote: ['class'],
      video: ['src', 'controls', 'width', 'height', 'poster'],
      source: ['src', 'type'],
      '*': ['class'],
    },
    allowedStyles: {
      '*': {
        color: [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
        'background-color': [
          /^#(0x)?[0-9a-f]+$/i,
          /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/,
        ],
        'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/],
      },
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel', 'data'],
    allowProtocolRelative: false,
  });
}

/**
 * Stricter sanitize for optional embed snippets in post CTA blocks.
 */
export function sanitizeEmbedHtml(html) {
  if (!html || typeof html !== 'string') return '';

  return sanitizeHtml(html, {
    allowedTags: ['iframe', 'div', 'p', 'span', 'a', 'img', 'blockquote'],
    allowedAttributes: {
      iframe: [
        'src',
        'title',
        'width',
        'height',
        'allow',
        'allowfullscreen',
        'frameborder',
        'scrolling',
        'loading',
        'referrerpolicy',
        'class',
      ],
      a: ['href', 'target', 'rel', 'class'],
      img: ['src', 'alt', 'width', 'height', 'class'],
      div: ['class'],
      p: ['class'],
      span: ['class'],
      blockquote: ['class'],
    },
    allowedSchemes: ['http', 'https'],
    allowProtocolRelative: false,
  });
}
