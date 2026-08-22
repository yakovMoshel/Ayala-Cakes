export function getAltFromCloudinaryResource(resource) {
  const custom = resource?.context?.custom;
  if (!custom) return '';
  return String(custom.alt || custom.caption || '').trim();
}

export function buildCloudinaryContext(alt) {
  const trimmed = String(alt || '').trim();
  if (!trimmed) return undefined;
  return { alt: trimmed };
}
