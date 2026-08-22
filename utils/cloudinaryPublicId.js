export function getPublicIdBasename(publicId) {
  if (!publicId) return '';
  const slash = publicId.lastIndexOf('/');
  return slash >= 0 ? publicId.slice(slash + 1) : publicId;
}

export function sanitizePublicIdBasename(name) {
  return String(name || '')
    .trim()
    .replace(/\.[^/.]+$/, '')
    .replace(/[^\w\u0590-\u05FF-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function buildPublicIdFromBasename(publicId, newBasename) {
  const sanitized = sanitizePublicIdBasename(newBasename);
  if (!sanitized) return null;
  const slash = publicId.lastIndexOf('/');
  const folder = slash >= 0 ? publicId.slice(0, slash) : '';
  return folder ? `${folder}/${sanitized}` : sanitized;
}

/** Extract Cloudinary public_id from a delivery or upload URL. */
export function extractPublicIdFromCloudinaryUrl(url) {
  if (!url || typeof url !== 'string') return '';

  const marker = '/upload/';
  const idx = url.indexOf(marker);
  if (idx === -1) return '';

  const segments = url.slice(idx + marker.length).split('?')[0].split('/');
  let start = 0;

  for (; start < segments.length; start += 1) {
    const segment = segments[start];
    if (/^v\d+$/.test(segment)) {
      start += 1;
      break;
    }
    if (segment.includes(',') || /^[a-z0-9]+_[a-z0-9]/i.test(segment)) {
      continue;
    }
    break;
  }

  const idParts = segments.slice(start);
  if (!idParts.length) return '';

  const lastIndex = idParts.length - 1;
  idParts[lastIndex] = idParts[lastIndex].replace(/\.[^/.]+$/, '');
  return idParts.join('/');
}
