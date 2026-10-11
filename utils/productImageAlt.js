const GENERIC_ALT = /^(?:תמונת המוצר(?:\s+מוגדלת)?|תמונת מוצר(?:\s+\d+)?|תמונה(?:\s+\d+)?)$/;

function usableAlt(value) {
  if (typeof value !== 'string') return '';
  const text = value.trim();
  if (!text || GENERIC_ALT.test(text)) return '';
  return text;
}

/**
 * Alt for a product photo.
 * Uses the stored image alt when it is a real description.
 * Otherwise uses the product name. Does not invent a distinct alt per frame.
 */
export function productImageAlt({ name, altText } = {}) {
  return usableAlt(altText) || usableAlt(name);
}
