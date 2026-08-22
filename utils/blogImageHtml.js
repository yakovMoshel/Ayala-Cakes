export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Build Quill-safe HTML for an inline blog image with optional caption.
 */
export function buildBlogImageHtml({ url, alt = '', description = '' }) {
  if (!url) return '';

  const caption = description.trim();
  const altText = (alt || caption || '').trim();
  const imgBlock = `<p class="blog-image"><img src="${escapeHtml(url)}" alt="${escapeHtml(altText)}" loading="lazy" /></p>`;

  if (!caption) return imgBlock;
  return `${imgBlock}<p class="blog-image-caption"><span class="blog-image-desc">${escapeHtml(caption)}</span></p>`;
}

export function isBlogImageParagraph(element) {
  if (!element || element.tagName !== 'P') return false;
  if (element.classList.contains('blog-image')) return true;
  if ([...element.classList].some((cls) => cls.includes('blog-image') && !cls.includes('caption'))) {
    return true;
  }
  return element.children.length === 1 && element.querySelector('img') !== null;
}

export function isBlogImageCaptionParagraph(element) {
  if (!element || element.tagName !== 'P') return false;
  if (element.classList.contains('blog-image-caption')) return true;
  return [...element.classList].some((cls) => cls.includes('blog-image-caption'));
}

export function parseBlogImageCaption(captionElement) {
  if (!captionElement) return '';
  const desc = captionElement.querySelector('.blog-image-desc, [class*="blog-image-desc"]');
  return (desc?.textContent || captionElement.textContent || '').trim();
}

export function replaceBlogImageBlock({ imageParagraph, captionParagraph, html }) {
  if (!imageParagraph?.parentNode || !html) return false;

  const parent = imageParagraph.parentNode;
  const temp = document.createElement('div');
  temp.innerHTML = html;
  const nodes = Array.from(temp.childNodes);
  nodes.forEach((node) => parent.insertBefore(node, imageParagraph));
  imageParagraph.remove();
  if (captionParagraph?.parentNode) captionParagraph.remove();
  return true;
}
