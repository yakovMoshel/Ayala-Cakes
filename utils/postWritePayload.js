import { sanitizeBlogHtml, sanitizeEmbedHtml } from '@/utils/sanitizeHtml';
import { normalizePublishDateForWrite } from '@/utils/postPublishDate';
import { replaceEmbeddedDataImages } from '@/server/functions/replaceEmbeddedDataImages';
import { EMBEDDED_IMAGE_ERROR, hasEmbeddedDataImage } from '@/utils/adminContentRules';

export async function preparePostWritePayload(data) {
  if (!data || typeof data !== 'object') return data;
  if (typeof data.content !== 'string' || !hasEmbeddedDataImage(data.content)) {
    return sanitizePostWritePayload(data);
  }

  let content = data.content;
  try {
    content = await replaceEmbeddedDataImages(content);
  } catch (error) {
    console.error('Embedded image upload failed:', error);
    const blocked = new Error(EMBEDDED_IMAGE_ERROR);
    blocked.fields = { content: EMBEDDED_IMAGE_ERROR };
    throw blocked;
  }

  if (hasEmbeddedDataImage(content)) {
    const blocked = new Error(EMBEDDED_IMAGE_ERROR);
    blocked.fields = { content: EMBEDDED_IMAGE_ERROR };
    throw blocked;
  }

  return sanitizePostWritePayload({ ...data, content });
}

export function sanitizePostWritePayload(data) {
  if (!data || typeof data !== 'object') return data;
  const next = { ...data };

  if (typeof next.content === 'string') {
    next.content = sanitizeBlogHtml(next.content);
  }

  if (next.postCta && typeof next.postCta === 'object') {
    next.postCta = { ...next.postCta };
    if (typeof next.postCta.embedHtml === 'string') {
      next.postCta.embedHtml = sanitizeEmbedHtml(next.postCta.embedHtml);
    }
  }

  if (typeof next.slug === 'string') {
    next.slug = next.slug.trim();
  }

  if (next.publishDate !== undefined) {
    const parsed = normalizePublishDateForWrite(next.publishDate);
    if (parsed) {
      next.publishDate = parsed;
    } else {
      delete next.publishDate;
    }
  }

  return next;
}
