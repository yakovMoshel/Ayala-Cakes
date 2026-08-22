/**
 * Parse YYYY-MM-DD (or ISO) as local calendar date — avoids UTC off-by-one shifts.
 */
export function parsePublishDateInput(value) {
  if (value == null || value === '') return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const str = String(value).trim();
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
      12,
      0,
      0,
      0
    );
  }

  const parsed = new Date(str);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Format for `<input type="date">` (local calendar). */
export function formatPublishDateInput(value) {
  const date = parsePublishDateInput(value);
  if (!date) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Public-facing date: custom publish date wins over record creation time. */
export function getPostDisplayDate(post) {
  if (!post) return null;
  return post.publishDate || post.createdAt || null;
}

export function normalizePublishDateForWrite(value) {
  return parsePublishDateInput(value);
}

export function getPublishDateInputWithOffset(dayOffset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  return formatPublishDateInput(date);
}
