const UPLOAD_MARKER = '/upload/';

export function isCloudinaryUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return url.includes('res.cloudinary.com') && url.includes(UPLOAD_MARKER);
}

export function hasCloudinaryTransform(secureUrl) {
  if (!secureUrl) return false;
  const idx = secureUrl.indexOf(UPLOAD_MARKER);
  if (idx === -1) return false;
  const rest = secureUrl.slice(idx + UPLOAD_MARKER.length);
  return !rest.startsWith('v');
}

export function injectCloudinaryTransform(secureUrl, transform) {
  if (!secureUrl || !transform) return secureUrl;
  const idx = secureUrl.indexOf(UPLOAD_MARKER);
  if (idx === -1) return secureUrl;
  return `${secureUrl.slice(0, idx + UPLOAD_MARKER.length)}${transform}/${secureUrl.slice(
    idx + UPLOAD_MARKER.length
  )}`;
}

/** Delivery URL for inline blog content (~800px column). */
export function getOptimizedCloudinaryUrl(secureUrl, width = 800) {
  if (!isCloudinaryUrl(secureUrl) || hasCloudinaryTransform(secureUrl)) {
    return secureUrl;
  }
  return injectCloudinaryTransform(secureUrl, `f_auto,q_auto,c_limit,w_${width},dpr_auto`);
}
