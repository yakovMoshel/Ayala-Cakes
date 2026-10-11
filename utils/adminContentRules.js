import { formatPublishDateInput } from '@/utils/postPublishDate';

export const SLUG_HELP = 'כתובת קצרה וברורה, למשל עוגת-בנטו-לב. הפרידו מילים במקפים.';
export const ALT_HELP = 'תארו בקצרה מה רואים בתמונה. אין צורך לכתוב \'תמונה של\'.';
export const DIMENSION_HELP = 'הזינו מספר בס״מ בלבד. שדה ריק לא יוצג באתר.';
export const DIMENSION_REPEAT_NOTE = 'אין צורך לחזור על הקוטר או הגובה במשפט הפתיחה או בתבליטים.';
export const EDITOR_IMAGE_HELP = 'העלו את התמונה כדי לשמור אותה כקובץ, במקום להטמיע אותה בתוך הטקסט.';
export const HEADING_HELP = 'לסעיפים ראשיים השתמשו בכותרת 2, ולתתי־סעיפים בכותרת 3.';
export const SEO_DESCRIPTION_HELP = 'סכמו את העמוד במשפט קצר ומדויק, על בסיס המידע הקיים.';
export const EMBEDDED_IMAGE_ERROR = 'יש תמונה מוטמעת בתוכן. העלו אותה מחדש כקובץ — השמירה נעצרה והטקסט נשאר בעורך.';
export const SLUG_CHANGE_WARNING = 'הכתובת הזו כבר פורסמה. שינוי שלה ישבור קישורים קיימים, ולא תיווצר הפניה אוטומטית.';

const ROUTE_BREAKING = /[/?#\\]/;

export const PRODUCT_CONTENT_KEYS = [
  'name',
  'subtitle',
  'description',
  'price',
  'categoryId',
  'images',
  'imageAlts',
  'colors',
  'flavors',
  'glutenFreeOption',
  'notDairyOption',
  'height',
  'diameter',
  'slug',
  'seoTitle',
  'metaDescription',
  'focusKeyword',
  'secondaryKeywords',
  'altText',
  'imageTitle',
  'tags',
  'canonicalUrl',
  'ogImage',
  'twitterCard',
];

export const POST_CONTENT_KEYS = [
  'title',
  'summary',
  'content',
  'author',
  'image',
  'slug',
  'focusKeyword',
  'secondaryKeywords',
  'longtailKeywords',
  'seoTitle',
  'metaDescription',
  'callToAction',
  'socialImage',
  'categoryId',
  'postCta',
  'publishDate',
];

function lowerEnglish(value) {
  return String(value || '').replace(/[A-Z]/g, (char) => char.toLowerCase());
}

/** Newly generated slugs: keep Hebrew, lowercase English, hyphenate spaces. */
export function slugFromTitle(text) {
  if (!text) return '';
  return lowerEnglish(String(text).trim())
    .replace(/[^\u0590-\u05FF\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Typed slugs: trim and lowercase English. Do not rewrite internal spaces. */
export function normalizeTypedSlug(slug) {
  return lowerEnglish(String(slug || '').trim());
}

export function validateSlug(slug) {
  if (!slug) return 'יש להזין כתובת.';
  if (ROUTE_BREAKING.test(slug) || /\s/.test(slug)) {
    return 'הפרידו מילים במקפים. בלי רווחים ובלי התווים / ? # או \\.';
  }
  return '';
}

export function parseDimensionField(value) {
  if (value === '' || value === null || value === undefined) {
    return { value: null, error: '' };
  }
  const text = String(value).trim();
  if (!text) return { value: null, error: '' };
  if (!/^\d+(\.\d+)?$/.test(text)) {
    return { value: null, error: 'הזינו מספר גדול מאפס, או השאירו את השדה ריק.' };
  }
  const number = Number(text);
  if (!Number.isFinite(number) || number <= 0) {
    return { value: null, error: 'הזינו מספר גדול מאפס, או השאירו את השדה ריק.' };
  }
  return { value: number, error: '' };
}

export function hasEmbeddedDataImage(html) {
  return typeof html === 'string' && html.includes('data:image/');
}

export function resolveImageAlts(images, imageAlts, legacyAlt = '') {
  const urls = Array.isArray(images) ? images : [];
  const shared = String(legacyAlt || '').trim();
  if (Array.isArray(imageAlts) && imageAlts.length) {
    return urls.map((_, index) => ({
      alt: String(imageAlts[index]?.alt || '').trim(),
      decorative: Boolean(imageAlts[index]?.decorative),
    }));
  }
  return urls.map(() => ({ alt: shared, decorative: false }));
}

export function validateImageAltsForPublish(items) {
  const errors = {};
  (items || []).forEach((item, index) => {
    if (item?.decorative) return;
    if (!String(item?.alt || '').trim()) {
      errors[`imageAlt-${index}`] = 'לפני פרסום יש להזין טקסט חלופי, או לסמן את התמונה כדקורטיבית.';
    }
  });
  return errors;
}

export function seoDescriptionWarnings({ text, siblingTexts = [] }) {
  const warnings = [];
  const value = String(text || '').trim();
  if (!value) {
    warnings.push('חסר תיאור למנועי חיפוש. באתר יוצג תיאור ברירת מחדל.');
    return warnings;
  }
  if (value.length > 155) {
    warnings.push('התיאור ארוך מהמומלץ. אפשר לשמור גם כך.');
  }
  const duplicate = siblingTexts.some((item) => {
    const other = String(item || '').trim();
    return other && other === value;
  });
  if (duplicate) {
    warnings.push('התיאור זהה לטקסט אחר בטופס. כדאי לנסח תיאור נפרד, אבל השמירה לא נחסמת.');
  }
  return warnings;
}

function stableValue(key, value) {
  if (value == null || value === '') return '';
  if (key === 'publishDate') return formatPublishDateInput(value);
  if (key === 'categoryId') {
    if (typeof value === 'object') return String(value._id || value);
    return String(value);
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value).trim();
}

/** True when a submitted key actually differs from the stored document. */
export function contentChanged(previous, next, keys) {
  if (!previous || !next) return false;
  return keys.some((key) => {
    if (!Object.prototype.hasOwnProperty.call(next, key)) return false;
    return stableValue(key, previous[key]) !== stableValue(key, next[key]);
  });
}

export function firstFieldKey(errors, order) {
  return order.find((key) => errors[key]) || Object.keys(errors)[0] || '';
}
