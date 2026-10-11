import { STATIC_SITE_PAGES } from './siteLinks';
import { GENERAL_WHATSAPP_URL } from './whatsapp';

export const MAX_CTA_BUTTONS = 2;
export const MAX_CTA_PRODUCTS = 2;

export const INTERNAL_LINK_OPTIONS = STATIC_SITE_PAGES.map(({ label, value }) => ({
  label,
  value,
}));

/** Preset external destinations (same WhatsApp link as site footer) */
export const EXTERNAL_LINK_OPTIONS = [
  {
    label: 'WhatsApp — שליחת הודעה',
    value: GENERAL_WHATSAPP_URL,
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
