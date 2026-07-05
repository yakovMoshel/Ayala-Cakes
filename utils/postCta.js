export const MAX_CTA_BUTTONS = 2;
export const MAX_CTA_PRODUCTS = 2;

export const INTERNAL_LINK_OPTIONS = [
  { label: 'דף הבית', value: '/' },
  { label: 'חנות', value: '/shop' },
  { label: 'בלוג', value: '/blog' },
  { label: 'אודות', value: '/about' },
  { label: 'צור קשר', value: '/contact' },
  { label: 'סדנת בנטו', value: '/bento-workshop' },
];

/** Preset external destinations (same WhatsApp link as site footer) */
export const EXTERNAL_LINK_OPTIONS = [
  {
    label: 'WhatsApp — שליחת הודעה',
    value:
      'https://api.whatsapp.com/send?phone=972587995083&text=%D7%94%D7%99%D7%99%20%D7%90%D7%A0%D7%99%20%D7%94%D7%92%D7%A2%D7%AA%D7%99%20%D7%9E%D7%94%D7%90%D7%99%D7%A0%D7%A1%D7%98%D7%92%D7%A8%D7%9D%20%D7%95%D7%A8%D7%95%D7%A6%D7%94%20%D7%9C%D7%94%D7%AA%D7%A2%D7%A0%D7%99%D7%99%D7%9F%20%D7%91%D7%A7%D7%A9%D7%A8%20%D7%9C',
  },
];

export const DEFAULT_POST_CTA = {
  enabled: false,
  title: '',
  description: '',
  buttons: [],
  productIds: [],
  image: '',
  embedHtml: '',
};

export function createEmptyCtaButton() {
  return { label: '', url: '', openInNewTab: false, linkType: 'internal' };
}

/**
 * @param {object} raw
 * @param {{ trimValues?: boolean, completeButtonsOnly?: boolean }} [options]
 * - trimValues: false while typing in the editor (preserves spaces between words)
 * - completeButtonsOnly: false keeps in-progress buttons until URL + label are set
 */
export function normalizePostCta(raw, options = {}) {
  const { trimValues = true, completeButtonsOnly = true } = options;

  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_POST_CTA, buttons: [] };
  }

  const trim = (value) => {
    const text = value ?? '';
    return trimValues ? String(text).trim() : String(text);
  };

  const buttons = (Array.isArray(raw.buttons) ? raw.buttons : [])
    .slice(0, MAX_CTA_BUTTONS)
    .map((btn) => ({
      label: trim(btn?.label),
      url: trim(btn?.url),
      openInNewTab: Boolean(btn?.openInNewTab),
      linkType: btn?.linkType === 'external' ? 'external' : 'internal',
    }));

  const normalizedButtons = completeButtonsOnly
    ? buttons.filter((btn) => btn.label && btn.url)
    : buttons;

  const productIds = (Array.isArray(raw.productIds) ? raw.productIds : [])
    .map((id) => String(id))
    .filter(Boolean)
    .slice(0, MAX_CTA_PRODUCTS);

  return {
    enabled: Boolean(raw.enabled),
    title: trim(raw.title),
    description: trim(raw.description),
    buttons: normalizedButtons,
    productIds,
    image: trim(raw.image),
    embedHtml: trim(raw.embedHtml),
  };
}

/** Editor state: do not trim or drop in-progress fields while the merchant types */
export function normalizePostCtaForEditor(raw) {
  return normalizePostCta(raw, {
    trimValues: false,
    completeButtonsOnly: false,
  });
}

export function isCtaEnabled(cta) {
  const n = normalizePostCta(cta);
  if (!n.enabled) return false;
  return Boolean(
    n.title ||
      n.description ||
      n.buttons.length ||
      n.productIds.length ||
      n.image ||
      n.embedHtml
  );
}

export function normalizePostCtaForDb(cta) {
  const n = normalizePostCta(cta);
  if (!n.enabled) {
    return { ...DEFAULT_POST_CTA, enabled: false, buttons: [], productIds: [] };
  }
  return n;
}

export function mapPostCtaFromPost(post) {
  if (!post?.postCta) {
    return {
      ...DEFAULT_POST_CTA,
      buttons: [],
      productIds: [],
    };
  }
  const normalized = normalizePostCta(post.postCta);
  return {
    ...normalized,
    productIds: (post.postCta.productIds || []).map((id) => String(id)),
  };
}
