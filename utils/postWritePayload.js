import { sanitizeBlogHtml, sanitizeEmbedHtml } from '@/utils/sanitizeHtml';
import { normalizePublishDateForWrite } from '@/utils/postPublishDate';

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
